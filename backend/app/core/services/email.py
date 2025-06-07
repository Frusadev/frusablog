import smtplib
import ssl
from email.message import EmailMessage
from typing import Any

from jinja2.exceptions import TemplateNotFound

from app.core.config import env
from app.core.logging.log import log_error
from app.core.services.templating import render_template

APP_EMAIL_ADDRESS = env.get_env("APP_EMAIL_ADDRESS", "")
GOOGLE_APP_PASSWORD = env.get_env("EMAIL_APP_PASSWORD", "")


def send_email(email: str, subject: str, message: str, html: bool = False):
    email_message = EmailMessage()
    email_message["From"] = APP_EMAIL_ADDRESS
    email_message["To"] = email
    email_message["Subject"] = subject
    email_message.set_content(message)

    if html:
        email_message.add_alternative(message, subtype="html")
    else:
        email_message.set_content(message)

    ssl_context = ssl.create_default_context()

    if not APP_EMAIL_ADDRESS or not GOOGLE_APP_PASSWORD:
        raise ValueError("Origin email and password not set")

    with smtplib.SMTP_SSL(
        "smtp.gmail.com", 465, context=ssl_context
    ) as server:
        server.login(APP_EMAIL_ADDRESS, GOOGLE_APP_PASSWORD)
        try:
            server.send_message(email_message)
        except Exception as e:
            print(e)
            raise Exception("Email not sent")


def send_templated_email(
    email: str,
    subject: str,
    template_name: str,
    context: dict[Any, Any],
    fallback_template: str | None = None,
    fallback_message: str = "We're sorry, something went wrong.",
):
    try:
        message = render_template(name=template_name, context=context)
    except TemplateNotFound as e:
        log_error(e)
        if fallback_template:
            try:
                message = fallback_template.format(**context)
            except KeyError as ke:
                message = "We're sorry, something went wrong."
                log_error(ke)
        else:
            message = fallback_message

    send_email(email=email, subject=subject, message=message, html=True)

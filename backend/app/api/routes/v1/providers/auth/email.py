from datetime import datetime
from datetime import timezone as tz
from typing import Annotated

from fastapi import BackgroundTasks, Cookie, Depends, Response
from sqlmodel import Session, select
from starlette.status import HTTP_401_UNAUTHORIZED

from app.api.routes.v1.dto.auth import LoginRequestDTO, RegisterRequestDTO
from app.api.routes.v1.dto.message import MessageResponse
from app.api.routes.v1.providers.auth.config import LOGIN_SESSION_COOKIE_NAME
from app.core.config.env import get_env
from app.core.db.models import AuthSession, LoginSession, Role, User
from app.core.db.setup import create_db_session
from app.core.security.checkers import (
    check_conditions,
    check_existence,
    check_non_existence,
)
from app.core.services.email import send_templated_email
from app.utils.date import utc


async def get_current_user(
    db_session: Annotated[Session, Depends(create_db_session)],
    login_session_id: Annotated[
        str | None, Cookie(alias=LOGIN_SESSION_COOKIE_NAME)
    ] = None,
) -> User:
    check_existence(
        login_session_id,
        detail="Unauthorized.",
        status_code=HTTP_401_UNAUTHORIZED,
    )
    login_session = check_existence(
        db_session.get(LoginSession, login_session_id),
        detail="Unauthorized.",
        status_code=HTTP_401_UNAUTHORIZED,
    )
    check_conditions(
        [
            not login_session.expired,
            datetime.now(tz.utc) < utc(login_session.expires_at),
        ],
        detail="Expired",
    )
    return login_session.user


async def register(
    db_session: Session, data: RegisterRequestDTO, bt: BackgroundTasks
):
    check_non_existence(
        db_session.exec(select(User).where(User.email == data.email)).first(),
        detail="Email already registered.",
    )
    check_non_existence(
        db_session.exec(
            select(User).where(User.username == data.username)
        ).first(),
        detail="Username already taken.",
    )
    user = User(
        email=data.email.lower(), username=data.username, name=data.name
    )
    auth_session = AuthSession(user_id=user.id)
    main_role = Role(name=user.id, users=[user])
    db_session.add(user)
    db_session.add(auth_session)
    db_session.add(main_role)
    db_session.commit()
    db_session.refresh(auth_session)
    db_session.refresh(user)

    def send_registration_mail():
        login_url = (
            get_env("BACKEND_URL")
            + "/v1/auth/email/authenticate/"
            + auth_session.id
        )
        unsubscribe_url = get_env("FRONTEND_URL") + "/account/unsubscribe"
        my_name = "Daniel Ametsowou"
        send_templated_email(
            email=user.email,
            subject="Thank you for siging up.",
            template_name="register",
            context={
                "user": user,
                "author_name": my_name,
                "login_url": login_url,
                "unsubscribe_url": unsubscribe_url,
            },
        )

    bt.add_task(send_registration_mail)
    return MessageResponse(
        message="Registration successful ! Please check your email."
    )


async def login(
    db_session: Session, data: LoginRequestDTO, bt: BackgroundTasks
):
    user = check_existence(
        db_session.exec(
            select(User).where(User.email == data.email.lower())
        ).first(),
        detail="User not found.",
    )
    auth_session = AuthSession(user_id=user.id)
    db_session.add(auth_session)
    db_session.commit()
    db_session.refresh(user)
    db_session.refresh(auth_session)

    def send_login_mail():
        my_name = "Daniel Ametsowou"
        login_url = (
            get_env("BACKEND_URL")
            + "/v1/auth/email/authenticate/"
            + auth_session.id
        )
        unsubscribe_url = get_env("FRONTEND_URL") + "/account/unsubscribe"
        send_templated_email(
            email=user.email,
            subject="Login Request 🔐",
            template_name="login",
            context={
                "user": user,
                "author_name": my_name,
                "login_url": login_url,
                "unsubscribe_url": unsubscribe_url,
            },
        )

    bt.add_task(send_login_mail)
    return MessageResponse(
        message="Registration successful ! Please check your email."
    )


async def authenticate(
    db_session: Session, auth_session_id: str, response: Response
) -> MessageResponse:
    auth_session = check_existence(
        db_session.get(AuthSession, auth_session_id),
        detail="Unauthorized.",
        status_code=HTTP_401_UNAUTHORIZED,
    )
    check_conditions(
        [
            not auth_session.expired,
            datetime.now(tz.utc) < utc(auth_session.expires_at),
        ]
    )
    auth_session.expired = True
    login_session = LoginSession(user_id=auth_session.user_id)
    db_session.add(login_session)
    db_session.add(auth_session)
    db_session.commit()
    db_session.refresh(login_session)
    response.set_cookie(
        key=LOGIN_SESSION_COOKIE_NAME,
        value=login_session.id,
        expires=utc(login_session.expires_at),
    )
    return MessageResponse(message="Logged in successfully!")


async def unsubscribe(
    db_session: Session,
    current_user: User,
    response: Response,
    bt: BackgroundTasks,
) -> MessageResponse:
    db_session.delete(current_user)
    db_session.commit()
    response.delete_cookie(key=LOGIN_SESSION_COOKIE_NAME)

    def send_unsubscribe_mail(current_user: User):
        my_name = "Daniel Ametsowou"
        resubscribe_url = get_env("FRONTEND_URL") + "/auth/login"
        send_templated_email(
            email=current_user.email,
            subject="You're Unsubscribed.",
            template_name="login",
            context={
                "user": current_user,
                "author_name": my_name,
                "resubscribe_url": resubscribe_url,
            },
        )

    bt.add_task(send_unsubscribe_mail, current_user=current_user)
    return MessageResponse(message="Unsubscribed successfully.")

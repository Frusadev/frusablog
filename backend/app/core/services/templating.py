from typing import Union

from jinja2 import Environment, FileSystemLoader

from app.core.config import env
from app.core.logging.log import log_info

jinja_env = Environment(
    loader=FileSystemLoader(env.get_env("EMAIL_TEMPLATES_PATH"))
)


def render_template(
    name: str, context: dict[str, Union[str, int]] | None = None
):
    """
    Renders a template with the given name and context.

    Args:
        name (str): The name of the template file.
        context (dict): The context to render the template with.

    Returns:
        str: The rendered template as a string.
    """
    template = jinja_env.get_template(f"{name}.html")
    log_info(template.filename)
    return template.render(context)

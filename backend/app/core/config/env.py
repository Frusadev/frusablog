import os
from typing import Literal

from dotenv import load_dotenv

_ = load_dotenv()

EnvKey = Literal[
    "DB_STRING",
    "FRONTEND_URL",
    "BACKEND_URL",
    "EMAIL_TEMPLATES_PATH",
    "EMAIL_APP_PASSWORD",
    "DEBUG",
    "ALEMBIC_DB_URL",
    "DB_STRING",
    "ADMIN_EMAIL",
    "GEMINI_API_KEY"
]


def get_env(name: EnvKey | str, default: str = ""):
    return os.getenv(name) or default

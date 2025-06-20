from sqlite3 import OperationalError

from sqlalchemy import Engine
from sqlmodel import create_engine

from app.core.config.env import get_env
from app.core.logging.log import log_error, log_success

engine: Engine = create_engine(get_env("DB_STRING"))


def setup_db():
    try:
        with engine.connect():
            log_success("Connected to database!")
    except OperationalError as e:
        log_error(f"Error connecting to DB: {e}")


def create_db_session():
    from sqlmodel import Session

    with Session(engine) as session:
        yield session

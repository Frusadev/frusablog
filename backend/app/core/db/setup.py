from sqlmodel import SQLModel, create_engine

from app.core.config.env import get_env
from app.core.logging.log import log_error, log_info, log_success

engine = create_engine(get_env("DB_STRING"))


def setup_db():
    log_info("Connecting to database...")
    try:
        SQLModel.metadata.create_all(engine)
        log_success("Connected to database !")
    except Exception as e:
        log_error("An error happened while connecting to database...")
        log_error(e)


def create_db_session():
    from sqlmodel import Session

    with Session(engine) as session:
        yield session

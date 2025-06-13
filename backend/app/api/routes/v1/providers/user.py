from typing import Annotated

from fastapi import Cookie, Depends
from sqlmodel import Session

from app.api.routes.v1.providers.auth.config import LOGIN_SESSION_COOKIE_NAME
from app.core.db.models import LoginSession, User
from app.core.db.setup import create_db_session
from app.core.security.permissions import (
    ACTION_READWRITE,
    POST_RESOURCE,
    GlobalPermissionCheckModel,
    PermissionChecker,
)

DBSessionDependency = Annotated[Session, Depends(create_db_session)]


async def me(current_user: User):
    return current_user.to_dto()


async def can_post(db_session: Session, current_user: User):
    return PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READWRITE]
            )
        ],
    ).check()


async def get_optional_current_user(
    db_session: Annotated[Session, Depends(create_db_session)],
    login_session_id: Annotated[
        str | None, Cookie(alias=LOGIN_SESSION_COOKIE_NAME)
    ] = None,
) -> User | None:
    login_session = db_session.get(LoginSession, login_session_id)

    if login_session is not None:
        return login_session.user

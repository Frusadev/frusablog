from sqlmodel import Session

from app.core.db.models import User
from app.core.security.permissions import (
    ACTION_READWRITE,
    POST_RESOURCE,
    GlobalPermissionCheckModel,
    PermissionChecker,
)


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

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.api.routes.v1.dto.user import UserDTO
from app.api.routes.v1.providers import user as user_provider
from app.api.routes.v1.providers.auth.email import get_current_user
from app.core.db.models import User
from app.core.db.setup import create_db_session

DBSessionDependency = Annotated[Session, Depends(create_db_session)]
CurrentUserDependency = Annotated[User, Depends(get_current_user)]


user_router = APIRouter(prefix="/v1")


@user_router.get("/users/me", response_model=UserDTO)
async def me(current_user: CurrentUserDependency):
    return await user_provider.me(current_user)


@user_router.get("/users/me/can-post", response_model=bool)
async def can_post(
    db_session: DBSessionDependency, current_user: CurrentUserDependency
):
    return await user_provider.can_post(
        db_session=db_session, current_user=current_user
    )

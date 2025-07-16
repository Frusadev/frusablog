from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlmodel import Session

from app.api.routes.v1.dto.message import MessageResponse
from app.api.routes.v1.dto.user import (
    BanUserRequest,
    BroadcastData,
    UserDTO,
    UserListResponse,
    UserMessageSendDTO,
)
from app.api.routes.v1.providers import user as user_provider
from app.api.routes.v1.providers.auth.email import get_current_user
from app.core.db.models import User
from app.core.db.setup import create_db_session

DBSessionDependency = Annotated[Session, Depends(create_db_session)]
CurrentUserDependency = Annotated[User, Depends(get_current_user)]


user_router = APIRouter(prefix="/v1", tags=["User management"])


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


@user_router.get("/users/me/banned", response_model=bool)
async def banned(current_user: CurrentUserDependency):
    return await user_provider.banned(current_user)


@user_router.get("/users", response_model=UserListResponse)
async def get_users(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    return await user_provider.get_users(
        db_session=db_session,
        current_user=current_user,
        skip=skip,
        limit=limit,
    )


@user_router.get("/users/banned", response_model=UserListResponse)
async def get_banned_users(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    return await user_provider.get_banned_users(
        db_session=db_session,
        current_user=current_user,
        skip=skip,
        limit=limit,
    )


@user_router.post("/users/{user_id}/ban")
async def ban_user(
    user_id: str,
    request: BanUserRequest,
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    bt: BackgroundTasks,
):
    return await user_provider.ban_user(
        db_session=db_session,
        current_user=current_user,
        user_id=user_id,
        bt=bt,
        motive=request.motive,
    )


@user_router.post("/users/mail", response_model=MessageResponse)
async def mail_user(
    data: UserMessageSendDTO,
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    bt: BackgroundTasks,
):
    return await user_provider.mail_user(
        db_session=db_session,
        current_user=current_user,
        data=data,
        bt=bt,
    )


@user_router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: str,
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
):
    return await user_provider.delete_user(
        db_session=db_session,
        current_user=current_user,
        user_id=user_id,
    )


@user_router.post("/users/broadcast", response_model=MessageResponse)
async def send_broadcast(
    data: BroadcastData,
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    bt: BackgroundTasks,
):
    return await user_provider.send_broadcast(
        db_session=db_session,
        current_user=current_user,
        data=data,
        bt=bt,
    )


@user_router.get("/users/search")
async def search_user(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    query: str = Query(..., min_length=1, description="Search query for users"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    return await user_provider.search_user(
        db_session=db_session,
        current_user=current_user,
        query=query,
        skip=skip,
        limit=limit,
    )

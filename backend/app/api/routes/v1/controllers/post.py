from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.api.routes.v1.dto.message import MessageResponse
from app.api.routes.v1.dto.post import (
    PostCreationDTO,
    PostDTO,
    PostMutationDTO,
)
from app.api.routes.v1.providers import post as post_provider
from app.api.routes.v1.providers.auth.email import get_current_user
from app.api.routes.v1.providers.user import get_optional_current_user
from app.api.routes.v1.providers.user_action import (
    view_dependency,
    visit_dependency,
)
from app.core.db.models import User, ViewAction, VisitAction
from app.core.db.setup import create_db_session

post_router = APIRouter(prefix="/v1")

DBSessionDependency = Annotated[Session, Depends(create_db_session)]
CurrentUserDependency = Annotated[User, Depends(get_current_user)]


@post_router.get("/post/{post_id}", response_model=PostDTO)
async def get_post(
    db_session: DBSessionDependency,
    post_id: UUID,
    current_user: Annotated[User | None, Depends(get_optional_current_user)],
    _: Annotated[ViewAction, Depends(view_dependency)],
):
    return await post_provider.get_post(
        db_session=db_session, id=post_id, current_user=current_user
    )


@post_router.get("/posts", response_model=list[PostDTO])
async def get_posts(
    db_session: DBSessionDependency,
    _: Annotated[VisitAction, Depends(visit_dependency)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=100)] = 10,
):
    return await post_provider.get_posts(
        db_session=db_session, skip=skip, limit=limit
    )


@post_router.get("/posts/featured", response_model=list[PostDTO])
async def get_featured_posts(
    db_session: DBSessionDependency,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=20)] = 10,
):
    return await post_provider.get_featured_posts(
        db_session=db_session, skip=skip, limit=limit
    )


@post_router.get("/posts/drafts", response_model=list[PostDTO])
async def get_draft_posts(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=20)] = 10,
):
    return await post_provider.get_draft_posts(
        db_session=db_session,
        current_user=current_user,
        skip=skip,
        limit=limit,
    )


@post_router.get("/posts/archived", response_model=list[PostDTO])
async def get_archived_posts(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=20)] = 10,
):
    return await post_provider.get_archived_posts(
        db_session=db_session,
        current_user=current_user,
        skip=skip,
        limit=limit,
    )


@post_router.get("/posts/search", response_model=list[PostDTO])
async def search_posts(
    db_session: DBSessionDependency,
    query: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=50)] = 50,
):
    return await post_provider.search_posts(
        db_session=db_session, query=query, skip=skip, limit=limit
    )


@post_router.get("/posts/all", response_model=list[PostDTO])
async def get_all_posts(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=100)] = 10,
):
    return await post_provider.get_all_posts(
        db_session=db_session,
        current_user=current_user,
        skip=skip,
        limit=limit,
    )


@post_router.get("/posts/search/all", response_model=list[PostDTO])
async def search_all_posts(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    query: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=50)] = 50,
):
    return await post_provider.search_all_posts(
        db_session=db_session,
        current_user=current_user,
        query=query,
        skip=skip,
        limit=limit,
    )


@post_router.post("/post", response_model=PostDTO)
async def create_post(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    data: PostCreationDTO,
):
    return await post_provider.create_post(
        db_session=db_session, current_user=current_user, data=data
    )


@post_router.delete("/post/{post_id}", response_model=MessageResponse)
async def delete_post(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    post_id: UUID,
):
    return await post_provider.delete_post(
        db_session=db_session, current_user=current_user, post_id=post_id
    )


@post_router.put("/post", response_model=PostDTO)
async def edit_post(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    data: PostMutationDTO,
):
    return await post_provider.edit_post(
        db_session=db_session, current_user=current_user, data=data
    )


@post_router.put("/post/like", response_model=PostDTO)
async def like_post(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    post_id: UUID,
):
    return await post_provider.like_post(
        db_session=db_session, current_user=current_user, post_id=post_id
    )

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.api.routes.v1.dto.comments import (
    CommentCreationDTO,
    CommentDTO,
    CommentMutationDTO,
)
from app.api.routes.v1.dto.message import MessageResponse
from app.api.routes.v1.providers import comment as comment_provider
from app.api.routes.v1.providers.auth.email import get_current_user
from app.core.db.models import User
from app.core.db.setup import create_db_session

comment_router = APIRouter(prefix="/v1")


DBSessionDependency = Annotated[Session, Depends(create_db_session)]
CurrentUserDependency = Annotated[User, Depends(get_current_user)]


@comment_router.get("/comment/{comment_id}", response_model=CommentDTO)
async def get_comment(db_session: DBSessionDependency, comment_id: UUID):
    return await comment_provider.get_comment(
        db_session=db_session, comment_id=comment_id
    )


@comment_router.get("/comments/{post_id}", response_model=list[CommentDTO])
async def get_comments(
    db_session: DBSessionDependency,
    post_id: UUID,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=50)] = 10,
):
    return await comment_provider.get_comments(
        db_session=db_session, post_id=post_id, skip=skip, limit=limit
    )


@comment_router.post("/comment", response_model=CommentDTO)
async def create_comment(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    data: CommentCreationDTO,
):
    return await comment_provider.create_comment(
        db_session=db_session, current_user=current_user, data=data
    )


@comment_router.put("/comment", response_model=CommentDTO)
async def edit_comment(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    data: CommentMutationDTO,
):
    return await comment_provider.edit_comment(
        db_session=db_session, current_user=current_user, data=data
    )


@comment_router.put("/comment/like", response_model=CommentDTO)
async def like_comment(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    comment_id: UUID,
):
    return await comment_provider.like_comment(
        db_session=db_session, current_user=current_user, comment_id=comment_id
    )


@comment_router.delete("/comment/{comment_id}", response_model=MessageResponse)
async def delete_comment(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    comment_id: UUID,
):
    return await comment_provider.delete_comment(
        db_session=db_session, current_user=current_user, comment_id=comment_id
    )

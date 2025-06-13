from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.api.routes.v1.dto.post import PostDTO
import app.api.routes.v1.providers.tag as tag_provider
from app.api.routes.v1.dto.message import MessageResponse
from app.api.routes.v1.dto.tag import TagCreationDTO, TagDTO
from app.api.routes.v1.providers.auth.email import get_current_user
from app.core.db.models import User
from app.core.db.setup import create_db_session

tag_router = APIRouter(prefix="/v1")

DBSessionDependency = Annotated[Session, Depends(create_db_session)]
CurrentUserDependency = Annotated[User, Depends(get_current_user)]


@tag_router.get("/tags", response_model=list[TagDTO])
async def get_tags(
    db_session: DBSessionDependency,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=200)] = 10,
):
    return await tag_provider.get_tags(
        db_session=db_session,
        skip=skip,
        limit=limit,
    )


@tag_router.post("/tag", response_model=TagDTO)
async def create_tag(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    data: TagCreationDTO,
):
    return await tag_provider.create_tag(
        db_session=db_session, current_user=current_user, data=data
    )


@tag_router.delete("/tag/{tag_id}", response_model=MessageResponse)
async def delete_tag(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    tag_id: str,
):
    return await tag_provider.delete_tag(
        db_session=db_session, current_user=current_user, tag_id=tag_id
    )


@tag_router.get("/tag/{tag_id}/related-posts", response_model=list[PostDTO])
async def get_related_posts(
    db_session: DBSessionDependency,
    tag_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=20)] = 10,
):
    return await tag_provider.get_related_posts(
        db_session=db_session, skip=skip, limit=limit, tag_id=tag_id
    )

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.api.routes.v1.dto.message import MessageResponse
from app.api.routes.v1.dto.post_series import (
    PostSeriesCreationDTO,
    PostSeriesDTO,
    PostSeriesMutationDTO,
)
from app.api.routes.v1.dto.post import PostDTO
from app.api.routes.v1.providers import post_series as post_series_provider
from app.api.routes.v1.providers.auth.email import get_current_user
from app.core.db.models import User
from app.core.db.setup import create_db_session

post_series_router = APIRouter(prefix="/v1", tags=["Post Series management"])

DBSessionDependency = Annotated[Session, Depends(create_db_session)]
CurrentUserDependency = Annotated[User, Depends(get_current_user)]


@post_series_router.post("/post-series", response_model=PostSeriesDTO)
async def create_post_series(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    data: PostSeriesCreationDTO,
):
    """Create a new post series."""
    return await post_series_provider.create_post_series(
        db_session=db_session,
        current_user=current_user,
        data=data,
    )


@post_series_router.get("/post-series/{series_id}", response_model=PostSeriesDTO)
async def get_post_series(
    db_session: DBSessionDependency,
    series_id: UUID,
):
    """Get a specific post series by ID."""
    return await post_series_provider.get_post_series(
        db_session=db_session, series_id=series_id
    )


@post_series_router.get("/post-series", response_model=list[PostSeriesDTO])
async def get_all_post_series(
    db_session: DBSessionDependency,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=100)] = 10,
):
    """Get all post series with pagination."""
    return await post_series_provider.get_all_post_series(
        db_session=db_session, skip=skip, limit=limit
    )


@post_series_router.put("/post-series", response_model=PostSeriesDTO)
async def update_post_series(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    data: PostSeriesMutationDTO,
):
    """Update an existing post series."""
    return await post_series_provider.update_post_series(
        db_session=db_session,
        current_user=current_user,
        data=data,
    )


@post_series_router.delete("/post-series/{series_id}", response_model=MessageResponse)
async def delete_post_series(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    series_id: UUID,
):
    """Delete a post series."""
    return await post_series_provider.delete_post_series(
        db_session=db_session,
        current_user=current_user,
        series_id=series_id,
    )


@post_series_router.get(
    "/post-series/{series_id}/posts", response_model=list[PostDTO]
)
async def get_post_series_posts(
    db_session: DBSessionDependency,
    series_id: UUID,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(le=100)] = 10,
):
    """Get posts that belong to a specific series (published, non-archived)."""
    return await post_series_provider.get_post_series_posts(
        db_session=db_session, series_id=series_id, skip=skip, limit=limit
    )

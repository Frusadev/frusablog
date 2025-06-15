from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.api.routes.v1.dto.stats import GeneralStats
from app.api.routes.v1.providers import stats as stats_provider
from app.api.routes.v1.providers.auth.email import get_current_user
from app.core.db.models import User
from app.core.db.setup import create_db_session

stats_router = APIRouter(prefix="/v1")

DBSessionDependency = Annotated[Session, Depends(create_db_session)]
CurrentUserDependency = Annotated[User, Depends(get_current_user)]


@stats_router.get("/stats/general", response_model=GeneralStats)
async def get_general_stats(
    db_session: DBSessionDependency, current_user: CurrentUserDependency
):
    """Get general blog statistics including total articles, comments, and likes."""
    return await stats_provider.get_general_stats(
        db_session=db_session, current_user=current_user
    )


@stats_router.get("/stats/views/global", response_model=int)
async def get_global_views(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    start: datetime = Query(..., description="Start date for the time range"),
    end: datetime = Query(..., description="End date for the time range"),
):
    """Get global view count within a date range (admin only)."""
    return await stats_provider.get_global_views(
        db_session=db_session, current_user=current_user, start=start, end=end
    )


@stats_router.get("/stats/views", response_model=list[int])
async def get_views(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    start: datetime = Query(..., description="Start date for the time range"),
    end: datetime = Query(..., description="End date for the time range"),
):
    """Get daily view counts within a date range."""
    return await stats_provider.get_views(
        db_session=db_session, current_user=current_user, start=start, end=end
    )


@stats_router.get("/stats/visits/global", response_model=int)
async def get_global_visits(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    start: datetime = Query(..., description="Start date for the time range"),
    end: datetime = Query(..., description="End date for the time range"),
):
    """Get global visit count within a date range (admin only)."""
    return await stats_provider.get_global_visits(
        db_session=db_session, current_user=current_user, start=start, end=end
    )


@stats_router.get("/stats/visits", response_model=list[int])
async def get_visits(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    start: datetime = Query(..., description="Start date for the time range"),
    end: datetime = Query(..., description="End date for the time range"),
):
    """Get daily visit counts within a date range."""
    return await stats_provider.get_visits(
        db_session=db_session, current_user=current_user, start=start, end=end
    )


@stats_router.get("/stats/average-visit-time", response_model=list[int])
async def get_average_visit_time(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    start: datetime = Query(..., description="Start date for the time range"),
    end: datetime = Query(..., description="End date for the time range"),
):
    """Get daily average visit time within a date range."""
    return await stats_provider.get_average_visit_time(
        db_session=db_session, current_user=current_user, start=start, end=end
    )


@stats_router.get("/stats/average-view-time", response_model=list[int])
async def get_average_view_time(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    start: datetime = Query(..., description="Start date for the time range"),
    end: datetime = Query(..., description="End date for the time range"),
):
    """Get daily average view time within a date range."""
    return await stats_provider.get_average_view_time(
        db_session=db_session, current_user=current_user, start=start, end=end
    )
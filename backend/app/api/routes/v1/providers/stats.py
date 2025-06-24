from datetime import datetime, timedelta
from statistics import mean

from sqlmodel import Session, func, select

from app.api.routes.v1.dto.stats import GeneralStats, PublicStats
from app.core.db.models import Comment, Post, User, ViewAction, VisitAction
from app.core.security.checkers import check_conditions
from app.core.security.permissions import (
    ACTION_READ,
    STAT_RESOURCE,
    GlobalPermissionCheckModel,
    PermissionChecker,
)


async def get_public_stats(db_session: Session):
    total_articles = db_session.exec(
        select(func.count())
        .select_from(Post)
        .where(Post.published == True, Post.archived != False)
    ).one()
    featured_articles = db_session.exec(
        select(func.count())
        .select_from(Post)
        .where(
            Post.featured == True,
            Post.published == True,
            Post.archived == False,
        )
    ).one()
    total_comments = db_session.exec(
        select(func.count()).select_from(Comment)
    ).one()

    total_likes = db_session.exec(select(func.sum(Post.likes))).one()
    return PublicStats(
        total_likes=total_likes,
        total_articles=total_articles,
        total_comments=total_comments,
        featured=featured_articles,
    )


async def get_general_stats(db_session: Session, current_user: User):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=STAT_RESOURCE, action_names=[ACTION_READ]
            )
        ],
    ).check()

    total_articles = db_session.exec(
        select(func.count()).select_from(Post)
    ).one()
    total_comments = db_session.exec(
        select(func.count()).select_from(Comment)
    ).one()

    total_likes = db_session.exec(select(func.sum(Post.likes))).one()
    return GeneralStats(
        total_likes=total_likes,
        total_articles=total_articles,
        total_comments=total_comments,
    )


async def get_global_views(
    db_session: Session, current_user: User, start: datetime, end: datetime
):
    check_conditions([end > start])
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=STAT_RESOURCE, action_names=[ACTION_READ]
            )
        ],
    ).check()
    views_count = (
        db_session.exec(
            select(func.count())
            .select_from(ViewAction)
            .where(
                ViewAction.created_at <= end,
                ViewAction.created_at >= start,
                ViewAction.view_time > 15,
            )
        ).first()
        or 0
    )
    return views_count


async def get_views(
    db_session: Session, current_user: User, start: datetime, end: datetime
):
    s = start.replace(hour=0, minute=0, second=0, microsecond=0)
    e = end.replace(hour=0, minute=0, second=0, microsecond=0)
    check_conditions([e > s])
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=STAT_RESOURCE, action_names=[ACTION_READ]
            )
        ],
    ).check()

    views: list[int] = []
    for d in range((e - s).days + 1):
        day = s + timedelta(days=d)
        day_end = day + timedelta(hours=24)
        view_count = (
            db_session.exec(
                select(func.count())
                .select_from(ViewAction)
                .where(
                    ViewAction.created_at >= day,
                    ViewAction.created_at < day_end,
                    ViewAction.view_time > 15,
                )
            ).first()
            or 0
        )
        views.append(view_count)
    return views


async def get_global_visits(
    db_session: Session, current_user: User, start: datetime, end: datetime
):
    check_conditions([end > start])
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=STAT_RESOURCE, action_names=[ACTION_READ]
            )
        ],
    ).check()
    views_count = (
        db_session.exec(
            select(func.count())
            .select_from(VisitAction)
            .where(
                VisitAction.created_at <= end,
                VisitAction.created_at >= start,
            )
        ).first()
        or 0
    )
    return views_count


async def get_visits(
    db_session: Session, current_user: User, start: datetime, end: datetime
):
    s = start.replace(hour=0, minute=0, second=0, microsecond=0)
    e = end.replace(
        hour=23,
        minute=59,
    )
    check_conditions([e > s])
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=STAT_RESOURCE, action_names=[ACTION_READ]
            )
        ],
    ).check()

    views: list[int] = []
    for d in range((e - s).days + 1):
        day = s + timedelta(days=d)
        day_end = day + timedelta(hours=24)
        view_count = (
            db_session.exec(
                select(func.count())
                .select_from(VisitAction)
                .where(
                    VisitAction.created_at >= day,
                    VisitAction.created_at <= day_end,
                )
            ).first()
            or 0
        )
        views.append(view_count)
    return views


async def get_average_visit_time(
    db_session: Session, current_user: User, start: datetime, end: datetime
):
    s = start.replace(hour=0, minute=0, second=0, microsecond=0)
    e = end.replace(hour=0, minute=0, second=0, microsecond=0)
    check_conditions([e > s])
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=STAT_RESOURCE, action_names=[ACTION_READ]
            )
        ],
    ).check()

    avg_visits: list[int] = []
    for d in range((e - s).days + 1):
        day = s + timedelta(days=d)
        day_end = day + timedelta(hours=24)
        visits = db_session.exec(
            select(VisitAction).where(
                VisitAction.created_at >= day,
                VisitAction.created_at <= day_end,
            )
        ).all()
        if visits:
            avg_visits.append(
                mean([visit.visit_time for visit in visits]).__round__()
            )
        else:
            avg_visits.append(0)
    return avg_visits


async def get_average_view_time(
    db_session: Session, current_user: User, start: datetime, end: datetime
):
    s = start.replace(hour=0, minute=0, second=0, microsecond=0)
    e = end.replace(hour=0, minute=0, second=0, microsecond=0)
    check_conditions([e > s])
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=STAT_RESOURCE, action_names=[ACTION_READ]
            )
        ],
    ).check()

    avg_views: list[int] = []
    for d in range((e - s).days + 1):
        day = s + timedelta(days=d)
        day_end = day + timedelta(hours=24)
        views = db_session.exec(
            select(ViewAction).where(
                ViewAction.created_at >= day,
                ViewAction.created_at <= day_end,
            )
        ).all()
        if views:
            avg_views.append(
                mean([view.view_time for view in views]).__round__()
            )
        else:
            avg_views.append(0)
    return avg_views

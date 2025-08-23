from datetime import datetime, timezone
from uuid import UUID

from sqlmodel import Session, desc, select

from app.api.routes.v1.dto.message import MessageResponse
from app.api.routes.v1.dto.post_series import (
    PostSeriesCreationDTO,
    PostSeriesMutationDTO,
)
from app.core.db.models import Post, PostSeries, User
from app.core.security.checkers import check_existence
from app.core.security.permissions import (
    ACTION_READWRITE,
    POST_RESOURCE,
    GlobalPermissionCheckModel,
    PermissionChecker,
)


async def create_post_series(
    db_session: Session,
    current_user: User,
    data: PostSeriesCreationDTO,
):
    """Create a new post series."""
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READWRITE]
            )
        ],
    ).check()

    post_series = PostSeries(
        title=data.title,
        description=data.description,
        cover=data.cover,
    )

    db_session.add(post_series)
    db_session.commit()
    db_session.refresh(post_series)

    return post_series.to_dto()


async def get_post_series(db_session: Session, series_id: UUID):
    """Get a specific post series by ID."""
    post_series = check_existence(db_session.get(PostSeries, series_id))
    return post_series.to_dto()


async def get_all_post_series(
    db_session: Session, skip: int = 0, limit: int = 10
):
    """Get all post series with pagination."""
    post_series_list = db_session.exec(
        select(PostSeries)
        .offset(skip)
        .limit(limit)
        .order_by(desc(PostSeries.last_updated))
    ).all()

    return [series.to_dto() for series in post_series_list]


async def get_post_series_posts(
    db_session: Session,
    series_id: UUID,
    skip: int = 0,
    limit: int = 10,
):
    posts = db_session.exec(
        select(Post)
        .where(
            Post.series == series_id,
            Post.published == True,
            Post.archived == False,
        )
        .offset(skip)
        .limit(limit)
        .order_by(desc(Post.created_at))
    )
    return [post.to_dto() for post in posts.all()]


async def update_post_series(
    db_session: Session,
    current_user: User,
    data: PostSeriesMutationDTO,
):
    """Update an existing post series."""
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READWRITE]
            )
        ],
    ).check()

    post_series = check_existence(db_session.get(PostSeries, data.id))

    post_series.title = data.title
    post_series.description = data.description
    post_series.cover = data.cover
    post_series.last_updated = datetime.now(timezone.utc)

    db_session.add(post_series)
    db_session.commit()
    db_session.refresh(post_series)

    return post_series.to_dto()


async def delete_post_series(
    db_session: Session,
    current_user: User,
    series_id: UUID,
):
    """Delete a post series."""
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READWRITE]
            )
        ],
    ).check()

    post_series = check_existence(db_session.get(PostSeries, series_id))

    db_session.delete(post_series)
    db_session.commit()

    return MessageResponse(message="Post series deleted successfully!")

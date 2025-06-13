from sqlmodel import Session, func, select

from app.api.routes.v1.dto.stats import GeneralStats
from app.core.db.models import Comment, Post, User


async def get_general_stats(db_session: Session):
    total_articles = db_session.exec(
        select(func.count()).select_from(Post)
    ).first()
    total_comments = db_session.exec(
        select(func.count()).select_from(Comment)
    ).first()

    total_likes = sum(db_session.exec(select(Post.likes)).all())
    return GeneralStats(
        total_likes=total_likes,
        total_articles=total_articles or 0,
        total_comments=total_comments or 0,
    )


async def get_detailed_stats(db_session: Session, current_user: User):...

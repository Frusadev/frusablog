from uuid import UUID

from fastapi.exceptions import HTTPException
from sqlmodel import Session, desc, select
from starlette.status import HTTP_403_FORBIDDEN

from app.api.routes.v1.dto.comments import (
    CommentCreationDTO,
    CommentMutationDTO,
)
from app.api.routes.v1.dto.message import MessageResponse
from app.core.db.builders.permission import PermissionBuilder
from app.core.db.models import Comment, Post, Role, User
from app.core.security.checkers import check_existence
from app.core.security.permissions import (
    ACTION_READWRITE,
    COMMENT_RESOURCE,
    PermissionChecker,
    PermissionCheckModel,
)


async def create_comment(
    db_session: Session, current_user: User, data: CommentCreationDTO
):
    post = check_existence(db_session.get(Post, data.post_id))

    comment = Comment(
        content=data.content,
        post_id=post.id,
        user_id=current_user.id,
    )
    if data.parent_id is not None:
        parent_comment: Comment | None = db_session.get(
            Comment, data.parent_id
        )

        if parent_comment is not None:
            if parent_comment.level > 0:
                raise HTTPException(
                    status_code=HTTP_403_FORBIDDEN,
                    detail="Comment level too high.",
                )
            comment.parent_id = parent_comment.id
    rw_role = Role(users=[current_user])
    rw_permission = (
        PermissionBuilder()
        .forRole(rw_role)
        .withActionName(ACTION_READWRITE)
        .withResourceName(str(comment.id))
        .withResourceName(COMMENT_RESOURCE)
        .make()
    )
    db_session.add(comment)
    db_session.add(rw_role)
    db_session.add(rw_permission)
    db_session.commit()
    db_session.refresh(comment)
    return comment.to_dto()


async def edit_comment(
    db_session: Session, current_user: User, data: CommentMutationDTO
):
    comment = check_existence(db_session.get(Comment, data.id))
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        pcheck_models=[
            PermissionCheckModel(
                resource_name=COMMENT_RESOURCE,
                resource_id=comment.id,
                action_names=[ACTION_READWRITE],
            )
        ],
    ).check()
    comment.content = data.content
    db_session.add(comment)
    db_session.commit()
    db_session.refresh(comment)
    return comment.to_dto()


async def like_comment(
    db_session: Session, current_user: User, comment_id: UUID
):
    comment = check_existence(db_session.get(Comment, comment_id))
    inc = 1 if current_user not in comment.liked_by else -1
    comment.likes += inc
    db_session.add(comment)
    db_session.commit()
    db_session.refresh(comment)
    return comment.to_dto()


async def delete_comment(
    db_session: Session, current_user: User, comment_id: UUID
):
    comment = check_existence(db_session.get(Comment, comment_id))
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        pcheck_models=[
            PermissionCheckModel(
                resource_name=COMMENT_RESOURCE,
                resource_id=comment.id,
                action_names=[ACTION_READWRITE],
            )
        ],
    ).check()
    db_session.delete(comment)
    db_session.commit()
    return MessageResponse(message="Comment deleted successfully.")


async def get_comments(
    db_session: Session, post_id: UUID, skip: int, limit: int
):
    comments = db_session.exec(
        select(Comment)
        .where(Comment.post_id == post_id)
        .order_by(desc(Comment.created_at))
        .offset(skip)
        .limit(limit)
    )
    return [comment.to_dto() for comment in comments]


async def get_comment(db_session: Session, comment_id: UUID):
    comment = check_existence(db_session.get(Comment, comment_id))
    return comment.to_dto()

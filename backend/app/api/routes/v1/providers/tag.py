from sqlmodel import Session, select

from app.api.routes.v1.dto.message import MessageResponse
from app.api.routes.v1.dto.tag import TagCreationDTO
from app.core.db.models import Tag, User
from app.core.security.checkers import check_existence, check_non_existence
from app.core.security.permissions import (
    ACTION_CREATE,
    ACTION_DELETE,
    ACTION_READWRITE,
    TAG_RESOURCE,
    GlobalPermissionCheckModel,
    PermissionChecker,
    PermissionCheckModel,
)


async def create_tag(
    db_session: Session, current_user: User, data: TagCreationDTO
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=TAG_RESOURCE, action_names=[ACTION_CREATE]
            ),
            GlobalPermissionCheckModel(
                resource_name=TAG_RESOURCE, action_names=[ACTION_READWRITE]
            ),
        ],
    ).check(either=True)

    check_non_existence(
        db_session.exec(select(Tag).where(Tag.name == data.name)).first(),
        detail="A tag with this name already exists.",
    )

    tag = Tag(name=data.name.lower())
    db_session.add(tag)
    db_session.commit()
    return tag.to_dto()


async def get_tags(db_session: Session, skip: int, limit: int):
    tags = db_session.exec(select(Tag).offset(skip).limit(limit))
    return [tag.to_dto() for tag in tags]


async def get_related_posts(
    db_session: Session, tag_id: str, skip: int, limit: int
):
    tag = check_existence(db_session.get(Tag, tag_id), detail="Tag not found.")
    posts = [post.to_dto() for post in tag.posts]
    start = skip if len(posts) > skip * limit - 1 else len(posts) - 1
    end = (
        skip * limit + limit
        if len(posts) > skip * limit + limit - 1
        else len(posts) - 1
    )
    return posts[start:end]


async def delete_tag(db_session: Session, current_user: User, tag_id: str):
    tag = check_existence(db_session.get(Tag, tag_id), detail="Tag not found.")
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        pcheck_models=[
            PermissionCheckModel(
                resource_name=TAG_RESOURCE,
                resource_id=tag.id,
                action_names=[ACTION_DELETE],
            ),
            PermissionCheckModel(
                resource_name=TAG_RESOURCE,
                resource_id=tag.id,
                action_names=[ACTION_READWRITE],
            ),
        ],
    ).check(either=True)
    db_session.delete(tag)
    db_session.commit()
    return MessageResponse(message="Tag {tag.name} has been deleted.")

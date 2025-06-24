from uuid import UUID

from sqlmodel import Session, col, desc, or_, select

from app.api.routes.v1.dto.message import MessageResponse
from app.api.routes.v1.dto.post import (
    PostCreationDTO,
    PostMutationDTO,
    PostTranslationResult,
)
from app.core.db.builders.permission import PermissionBuilder
from app.core.db.models import Post, Role, Tag, User
from app.core.security.checkers import check_existence
from app.core.security.permissions import (
    ACTION_READ,
    ACTION_READWRITE,
    POST_RESOURCE,
    GlobalPermissionCheckModel,
    PermissionChecker,
    PermissionCheckModel,
)
from app.core.services.ai import translation as translation_service
from app.core.services.ai.translation import SupportedLanguages


async def create_post(
    db_session: Session, current_user: User, data: PostCreationDTO
):
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
    post = Post(
        content=data.content,
        published=data.published,
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        cover=data.cover,
    )
    tags = [
        tag
        for tag in [db_session.get(Tag, tag.id) for tag in data.tags]
        if tag is not None
    ]
    post.tags = tags
    write_role = Role(users=[current_user])
    write_permission = (
        PermissionBuilder()
        .withActionName(ACTION_READWRITE)
        .withResourceName(POST_RESOURCE)
        .withResourceId(str(post.id))
        .forRole(write_role)
    ).make()
    db_session.add_all([post, write_role, write_permission])
    db_session.commit()
    return post.to_dto()


async def translate_post(
    db_session: Session, post_id: UUID, language: SupportedLanguages
):
    post = check_existence(db_session.get(Post, post_id))
    translated_title = await translation_service.translate(
        text=post.title, language=language
    )
    translated_description = await translation_service.translate(
        text=post.description, language=language
    )
    translated_content = await translation_service.translate(
        text=post.content, language=language
    )
    return PostTranslationResult(
        title=translated_title,
        description=translated_description,
        content=translated_content,
    )


async def delete_post(db_session: Session, current_user: User, post_id: UUID):
    post = check_existence(db_session.get(Post, post_id))
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        pcheck_models=[
            PermissionCheckModel(
                resource_name=POST_RESOURCE,
                resource_id=post.id,
                action_names=[ACTION_READWRITE],
            )
        ],
    ).check()
    db_session.delete(post)
    db_session.commit()
    return MessageResponse(message="Post deleted !")


async def edit_post(
    db_session: Session, current_user: User, data: PostMutationDTO
):
    post = check_existence(db_session.get(Post, data.id))
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        pcheck_models=[
            PermissionCheckModel(
                resource_name=POST_RESOURCE,
                resource_id=post.id,
                action_names=[ACTION_READWRITE],
            )
        ],
    ).check()
    tags = [
        check_existence(
            db_session.get(Tag, tag_id), detail=f"Tag {tag_id} not found."
        )
        for tag_id in data.tag_ids
    ]
    post.title = data.title
    post.description = data.description
    post.cover = data.cover
    post.content = data.content
    post.published = data.published
    post.archived = data.archived
    post.featured = data.featured
    post.tags = tags
    db_session.add(post)
    db_session.commit()
    return post.to_dto()


async def like_post(db_session: Session, current_user: User, post_id: UUID):
    post = check_existence(db_session.get(Post, post_id))
    inc = (
        1 if current_user.id not in [user.id for user in post.liked_by] else -1
    )

    if inc == -1:
        post.liked_by.remove(current_user)
    else:
        post.liked_by.append(current_user)

    post.likes = post.likes + inc
    db_session.add(post)
    db_session.commit()
    db_session.refresh(post)
    return post.to_dto()


async def get_post(db_session: Session, id: UUID, current_user: User | None):
    post = check_existence(db_session.get(Post, id))
    if post.archived is True or post.published is False:
        user = check_existence(current_user)
        PermissionChecker(
            db_session=db_session,
            roles=user.roles,
            pcheck_models=[
                PermissionCheckModel(
                    resource_name=POST_RESOURCE,
                    resource_id=id,
                    action_names=[ACTION_READ],
                ),
                PermissionCheckModel(
                    resource_name=POST_RESOURCE,
                    resource_id=id,
                    action_names=[ACTION_READWRITE],
                ),
            ],
            bypass_role="admin",
        ).check(either=True)
    return post.to_dto()


async def get_posts(db_session: Session, skip: int, limit: int):
    posts = db_session.exec(
        select(Post)
        .where(Post.archived == False, Post.published == True)
        .offset(skip)
        .limit(limit)
        .order_by(desc(Post.created_at))
    ).all()
    return [post.to_dto() for post in posts]


async def get_all_posts(
    db_session: Session, current_user: User, skip: int, limit: int
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READWRITE]
            ),
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READ]
            ),
        ],
    ).check(either=True)
    posts = db_session.exec(
        select(Post).offset(skip).limit(limit).order_by(desc(Post.created_at))
    ).all()
    return [post.to_dto() for post in posts]


async def get_draft_posts(
    db_session: Session, current_user: User, skip: int, limit: int
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READWRITE]
            ),
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READ]
            ),
        ],
    ).check(either=True)
    draft_posts = db_session.exec(
        select(Post).where(Post.published == False).offset(skip).limit(limit)
    )
    return [post.to_dto() for post in draft_posts]


async def get_archived_posts(
    db_session: Session, current_user: User, skip: int, limit: int
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READWRITE]
            ),
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READ]
            ),
        ],
    ).check(either=True)
    archived_posts = db_session.exec(
        select(Post).where(Post.archived == True).offset(skip).limit(limit)
    )
    return [post.to_dto() for post in archived_posts]


async def search_posts(db_session: Session, query: str, skip: int, limit: int):
    posts = db_session.exec(
        select(Post)
        .where(
            or_(
                col(Post.title).ilike(f"%{query}%"),
                col(Post.description).ilike(f"%{query}%"),
                col(Post.content).ilike(f"%{query}%"),
            ),
            Post.archived == False,
            Post.published == True,
        )
        .offset(skip)
        .limit(limit)
    ).all()
    return [post.to_dto() for post in posts]


async def search_all_posts(
    db_session: Session, current_user: User, query: str, skip: int, limit: int
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READWRITE]
            ),
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READ]
            ),
        ],
    ).check(either=True)
    posts = db_session.exec(
        select(Post)
        .where(
            or_(
                col(Post.title).ilike(f"%{query}%"),
                col(Post.description).ilike(f"%{query}%"),
                col(Post.content).ilike(f"%{query}%"),
            ),
        )
        .offset(skip)
        .limit(limit)
    ).all()
    return [post.to_dto() for post in posts]


async def get_featured_posts(db_session: Session, skip: int, limit: int):
    posts = db_session.exec(
        select(Post).where(Post.featured == True).offset(skip).limit(limit)
    ).all()
    return [post.to_dto() for post in posts]

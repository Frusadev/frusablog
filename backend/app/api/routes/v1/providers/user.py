from datetime import datetime
from typing import Annotated

from fastapi import BackgroundTasks, Cookie, Depends
from pydantic import Field
from sqlmodel import Session, col, func, or_, select

from app.api.routes.v1.dto.message import MessageResponse
from app.api.routes.v1.dto.user import (
    BroadcastData,
    UserListResponse,
    UserMessageSendDTO,
)
from app.api.routes.v1.providers.auth.config import LOGIN_SESSION_COOKIE_NAME

from app.core.config.env import get_env
from app.core.db.models import LoginSession, User
from app.core.db.setup import create_db_session
from app.core.security.checkers import check_existence
from app.core.security.permissions import (
    ACTION_CREATE,
    ACTION_READ,
    ACTION_READWRITE,
    MAIL_RESOURCE,
    POST_RESOURCE,
    USER_RESOURCE,
    GlobalPermissionCheckModel,
    PermissionChecker,
)
from app.core.services.email import send_templated_email

DBSessionDependency = Annotated[Session, Depends(create_db_session)]


async def me(current_user: User):
    return current_user.to_dto()


async def detailed_me(current_user: User):
    return current_user.detailed_dto()


async def banned(current_user: User):
    return current_user.banned


async def can_post(db_session: Session, current_user: User):
    return PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=POST_RESOURCE, action_names=[ACTION_READWRITE]
            )
        ],
    ).check()


async def get_optional_current_user(
    db_session: Annotated[Session, Depends(create_db_session)],
    login_session_id: Annotated[
        str | None, Cookie(alias=LOGIN_SESSION_COOKIE_NAME)
    ] = None,
) -> User | None:
    login_session = db_session.get(LoginSession, login_session_id)

    if login_session is not None:
        return login_session.user


async def get_users(
    db_session: Session, current_user: User, skip: int, limit: int
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=USER_RESOURCE, action_names=[ACTION_READ]
            ),
            GlobalPermissionCheckModel(
                resource_name=USER_RESOURCE, action_names=[ACTION_READWRITE]
            ),
        ],
    ).check(either=True)
    users_count = (
        db_session.exec(select(func.count()).select_from(User)).first() or 0
    )
    users = db_session.exec(select(User).offset(skip).limit(limit)).all()
    return UserListResponse(
        length=users_count, users=[user.detailed_dto() for user in users]
    )


async def get_banned_users(
    db_session: Session, current_user: User, skip: int, limit: int
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=USER_RESOURCE, action_names=[ACTION_READ]
            ),
            GlobalPermissionCheckModel(
                resource_name=USER_RESOURCE, action_names=[ACTION_READWRITE]
            ),
        ],
    ).check(either=True)
    banned_users = db_session.exec(
        select(User).where(User.banned == True).offset(skip).limit(limit)
    ).all()
    users_count = (
        db_session.exec(select(func.count()).select_from(User)).first() or 0
    )
    return UserListResponse(
        length=users_count,
        users=[user.detailed_dto() for user in banned_users],
    )


async def ban_user(
    db_session: Session,
    current_user: User,
    user_id: str,
    bt: BackgroundTasks,
    motive: str = Field(min_length=100),
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=USER_RESOURCE, action_names=[ACTION_READWRITE]
            )
        ],
    ).check()
    user_to_ban = check_existence(db_session.get(User, user_id))
    user_to_ban.banned = True
    user_to_ban.last_ban_motive = motive
    db_session.add(user_to_ban)
    db_session.commit()
    db_session.refresh(user_to_ban)

    def send_ban_notification():
        send_templated_email(
            email=user_to_ban.email,
            subject="Your account has been suspended.",
            template_name="ban",
            context={
                "user": user_to_ban,
                "ban_date": datetime.now().strftime("%Y-%m-%d"),
                "ban_reason": user_to_ban.last_ban_motive,
                "appeal_url": f"mailto:{get_env('ADMIN_EMAIL')}",
            },
        )

    bt.add_task(send_ban_notification)

    return user_to_ban.detailed_dto()


async def mail_user(
    db_session: Session,
    current_user: User,
    data: UserMessageSendDTO,
    bt: BackgroundTasks,
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=MAIL_RESOURCE, action_names=[ACTION_CREATE]
            )
        ],
    ).check()
    recipient = check_existence(db_session.get(User, data.recipient_id))

    def send_message():
        send_templated_email(
            email=recipient.email,
            subject=data.mail_subject,
            template_name="message",
            context={"message_content": data.mail_content},
        )

    bt.add_task(send_message)
    return MessageResponse(message="Message successfully sent !")


async def delete_user(db_session: Session, current_user: User, user_id: str):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=USER_RESOURCE, action_names=[ACTION_READWRITE]
            )
        ],
    ).check()
    user_to_delete = check_existence(db_session.get(User, user_id))
    db_session.delete(user_to_delete)
    db_session.commit()
    return MessageResponse(message="User deleted successfully !")


async def send_broadcast(
    db_session: Session,
    current_user: User,
    data: BroadcastData,
    bt: BackgroundTasks,
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=MAIL_RESOURCE, action_names=[ACTION_CREATE]
            )
        ],
    ).check()
    recipients_emails = (
        [
            check_existence(db_session.get(User, recipient_id)).email
            for recipient_id in data.recipients_ids.split(",")
        ]
        if data.recipients_ids != "all"
        else list(db_session.exec(select(User.email)).all())
    )

    def send_message(recipients_emails: list[str]):
        for email in recipients_emails:
            send_templated_email(
                email=email,
                subject=data.mail_subject,
                template_name="message",
                context={"message_content": data.mail_content},
            )

    bt.add_task(send_message, recipients_emails=recipients_emails)
    return MessageResponse(message="Broadcast successfully sent !")


async def search_user(
    db_session: Session, current_user: User, query: str, skip: int, limit: int
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name=USER_RESOURCE, action_names=[ACTION_READ]
            ),
            GlobalPermissionCheckModel(
                resource_name=USER_RESOURCE, action_names=[ACTION_READWRITE]
            ),
        ],
    ).check(either=True)
    users = db_session.exec(
        select(User)
        .where(
            or_(
                col(User.name).ilike(f"%{query}%"),
                col(User.username).ilike(f"%{query}%"),
                col(User.email).ilike(f"%{query}%"),
            )
        )
        .offset(skip)
        .limit(limit)
    ).all()
    return [user.detailed_dto() for user in users]


async def join_newsletter(db_session: Session, current_user: User):
    if not current_user.in_newsletter:
        current_user.in_newsletter = True
        db_session.add(current_user)
        db_session.commit()
        db_session.refresh(current_user)
        return MessageResponse(message="Successfully joined the newsletter!")
    return MessageResponse(
        message="You are already subscribed to the newsletter!"
    )


async def leave_newsletter(db_session: Session, current_user: User):
    if current_user.in_newsletter:
        current_user.in_newsletter = False
        db_session.add(current_user)
        db_session.commit()
        db_session.refresh(current_user)
        return MessageResponse(message="Successfully left the newsletter!")
    return MessageResponse(message="You are not subscribed to the newsletter!")

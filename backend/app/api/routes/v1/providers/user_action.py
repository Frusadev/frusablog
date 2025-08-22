import asyncio
from typing import Annotated
from uuid import UUID

from fastapi import Cookie, Depends, Response, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select

from app.api.routes.v1.dto.user_action import UserMessageCreationDTO
from app.api.routes.v1.providers.user import get_optional_current_user
from app.core.config.env import get_env
from app.core.db.models import User, UserMessage, ViewAction, VisitAction
from app.core.db.setup import create_db_session
from app.core.security.checkers import check_existence
from app.core.security.permissions import (
    ACTION_READWRITE,
    GlobalPermissionCheckModel,
    PermissionChecker,
)
from app.core.services.email import send_templated_email

DBSessionDependency = Annotated[Session, Depends(create_db_session)]
CurrentUserDependency = Annotated[
    User | None, Depends(get_optional_current_user)
]

view_cookie_name = "upost_view"
visit_cookie_name = "uvisit"


async def get_current_view(
    db_session: DBSessionDependency,
    view_cookie: Annotated[str | None, Cookie(alias=view_cookie_name)] = None,
):
    view_id = check_existence(view_cookie, is_ws=True)
    view = check_existence(db_session.get(ViewAction, view_id), is_ws=True)
    return view


async def get_current_visit(
    db_session: DBSessionDependency,
    visit_cookie: Annotated[
        str | None, Cookie(alias=visit_cookie_name)
    ] = None,
):
    visit_id = check_existence(visit_cookie)
    visit = check_existence(db_session.get(VisitAction, visit_id), is_ws=True)
    return visit


async def view_dependency(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    post_id: UUID,
    response: Response,
):
    view = ViewAction(user=current_user, post_id=post_id)
    db_session.add(view)
    db_session.commit()
    db_session.refresh(view)
    response.set_cookie(key=view_cookie_name, value=view.id)
    return view


async def visit_dependency(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    response: Response,
):
    visit = VisitAction(user=current_user)
    db_session.add(visit)
    db_session.commit()
    db_session.refresh(visit)
    response.set_cookie(key=visit_cookie_name, value=visit.id)
    return visit


async def listen_to_view(
    websocket: WebSocket, db_session: Session, view: ViewAction
):
    await websocket.accept()
    view_time = 0
    try:
        while True:
            await asyncio.sleep(1)
            view_time += 1
            try:
                await websocket.send_bytes(bytes(0))
            except WebSocketDisconnect:
                break
    finally:
        view.view_time = view_time
        db_session.add(view)
        db_session.commit()


async def listen_to_visit(
    websocket: WebSocket, db_session: Session, visit: VisitAction
):
    await websocket.accept()
    visit_time = 0
    try:
        while True:
            await asyncio.sleep(1)
            visit_time += 1
            try:
                await websocket.send_bytes(bytes(0))
            except WebSocketDisconnect:
                break
    finally:
        visit.visit_time = visit_time
        db_session.add(visit)
        db_session.commit()


async def send_admin_message(
    db_session: Session, current_user: User, data: UserMessageCreationDTO
):
    message = UserMessage(
        user_id=current_user.id,
        subject=data.subject,
        content=data.content,
    )
    db_session.add(message)
    db_session.commit()
    # Send email to admin
    try:
        admin_email = get_env("ADMIN_EMAIL")
        admin_url = (
            get_env("FRONTEND_URL") + "/admin"
            if get_env("FRONTEND_URL")
            else ""
        )
        send_templated_email(
            email=admin_email,
            subject=f"[Admin Alert] New User Message: {data.subject}",
            template_name="admin_alert_message",
            context={
                "user": current_user,
                "message": message,
                "admin_url": admin_url,
                "reply_email": current_user.email,
                "year": 2025,
                "site_name": get_env("SITE_NAME", "ametsowou.me"),
            },
        )
    except Exception:
        pass


async def get_user_messages(
    db_session: Session, current_user: User, skip: int, limit: int, all=False
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name="user_message", action_names=[ACTION_READWRITE]
            )
        ],
    ).check()
    query = select(UserMessage)
    if not all:
        query = query.where(UserMessage.viewed == False)
    messages = db_session.exec(query.offset(skip).limit(limit)).all()
    return [message.to_dto() for message in messages]


async def get_user_message(
    db_session: Session, current_user: User, message_id: UUID
):
    PermissionChecker(
        db_session=db_session,
        roles=current_user.roles,
        bypass_role="admin",
        pcheck_models=[
            GlobalPermissionCheckModel(
                resource_name="user_message", action_names=[ACTION_READWRITE]
            )
        ],
    ).check()
    message = check_existence(db_session.get(UserMessage, message_id))
    message.viewed = True
    db_session.add(message)
    db_session.commit()
    db_session.refresh(message)
    return message.to_dto()

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, WebSocket
from sqlmodel import Session

import app.api.routes.v1.providers.user_action as user_action_provider
from app.api.routes.v1.dto.user_action import UserMessageCreationDTO
from app.api.routes.v1.providers.auth.email import get_current_user
from app.api.routes.v1.providers.user import (
    get_optional_current_user,
)
from app.api.routes.v1.providers.user_action import (
    get_current_view,
    get_current_visit,
)
from app.core.db.models import User, ViewAction, VisitAction
from app.core.db.setup import create_db_session

DBSessionDependency = Annotated[Session, Depends(create_db_session)]
CurrentUserDependency = Annotated[
    User | None, Depends(get_optional_current_user)
]
AuthenticatedUserDependency = Annotated[User, Depends(get_current_user)]
ViewDependency = Annotated[ViewAction, Depends(get_current_view)]
VisitDependency = Annotated[VisitAction, Depends(get_current_visit)]


router = APIRouter(prefix="/v1/ua", tags=["User actions"])


@router.websocket("/view")
async def view(
    ws: WebSocket, db_session: DBSessionDependency, view: ViewDependency
):
    return await user_action_provider.listen_to_view(
        websocket=ws, db_session=db_session, view=view
    )


@router.websocket("/visit")
async def visit(
    ws: WebSocket, db_session: DBSessionDependency, visit: VisitDependency
):
    return await user_action_provider.listen_to_visit(
        websocket=ws, db_session=db_session, visit=visit
    )


@router.post("/messages")
async def send_user_message(
    data: UserMessageCreationDTO,
    db_session: DBSessionDependency,
    current_user: AuthenticatedUserDependency,
):
    """Send a message to admin (used for contact form, unsubscribe reasons, etc.)"""
    return await user_action_provider.send_admin_message(
        db_session=db_session, current_user=current_user, data=data
    )


@router.get("/messages")
async def get_user_messages(
    db_session: DBSessionDependency,
    current_user: AuthenticatedUserDependency,
    skip: int = 0,
    limit: int = 20,
    all: bool = False,
):
    """Get user messages (admin only)"""
    return await user_action_provider.get_user_messages(
        db_session=db_session,
        current_user=current_user,
        skip=skip,
        limit=limit,
        all=all,
    )


@router.get("/messages/{message_id}")
async def get_user_message(
    message_id: UUID,
    db_session: DBSessionDependency,
    current_user: AuthenticatedUserDependency,
):
    """Get a specific user message and mark as viewed (admin only)"""
    return await user_action_provider.get_user_message(
        db_session=db_session, current_user=current_user, message_id=message_id
    )

from typing import Annotated

from fastapi import APIRouter, Depends, WebSocket
from sqlmodel import Session

import app.api.routes.v1.providers.user_action as user_action_provider
from app.api.routes.v1.providers.user import get_optional_current_user
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
ViewDependency = Annotated[ViewAction, Depends(get_current_view)]
VisitDependency = Annotated[VisitAction, Depends(get_current_visit)]


user_action_router = APIRouter(prefix="/v1/ua")


@user_action_router.websocket("/view")
async def view(
    ws: WebSocket, db_session: DBSessionDependency, view: ViewDependency
):
    return await user_action_provider.listen_to_view(
        websocket=ws, db_session=db_session, view=view
    )


@user_action_router.websocket("/visit")
async def visit(
    ws: WebSocket, db_session: DBSessionDependency, visit: VisitDependency
):
    return await user_action_provider.listen_to_visit(
        websocket=ws, db_session=db_session, visit=visit
    )

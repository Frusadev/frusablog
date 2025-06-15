import asyncio
from typing import Annotated
from uuid import UUID

from fastapi import Cookie, Depends, Response, WebSocket, WebSocketDisconnect
from sqlmodel import Session

from app.api.routes.v1.providers.user import get_optional_current_user
from app.core.db.models import User, ViewAction, VisitAction
from app.core.db.setup import create_db_session
from app.core.security.checkers import check_existence

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
    db_session: DBSessionDependency, post_id: UUID, response: Response
):
    view = ViewAction(post_id=post_id)
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

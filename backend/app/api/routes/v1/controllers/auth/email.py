from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Response
from sqlmodel import Session

from app.api.routes.v1.dto.auth import LoginRequestDTO, RegisterRequestDTO
from app.api.routes.v1.dto.message import MessageResponse
from app.api.routes.v1.providers.auth import email as email_auth_provider
from app.core.db.models import User
from app.core.db.setup import create_db_session

email_auth_router = APIRouter(prefix="/email")


DBSessionDependency = Annotated[Session, Depends(create_db_session)]
CurrentUserDependency = Annotated[
    User, Depends(email_auth_provider.get_current_user)
]


@email_auth_router.post("/register", response_model=MessageResponse)
async def register(
    db_session: DBSessionDependency,
    bt: BackgroundTasks,
    data: RegisterRequestDTO,
):
    return await email_auth_provider.register(
        db_session=db_session, bt=bt, data=data
    )


@email_auth_router.post("/login", response_model=MessageResponse)
async def login(
    db_session: DBSessionDependency,
    bt: BackgroundTasks,
    data: LoginRequestDTO,
):
    return await email_auth_provider.login(
        db_session=db_session, data=data, bt=bt
    )


@email_auth_router.get("/authenticate/{auth_session_id}")
async def authenticate(
    db_session: DBSessionDependency, auth_session_id: str, response: Response
):
    return await email_auth_provider.authenticate(
        db_session=db_session,
        auth_session_id=auth_session_id,
        response=response,
    )


@email_auth_router.post("/unsubscribe", response_model=MessageResponse)
async def unsubscribe(
    db_session: DBSessionDependency,
    current_user: CurrentUserDependency,
    response: Response,
    bt: BackgroundTasks,
):
    return await email_auth_provider.unsubscribe(
        db_session=db_session,
        current_user=current_user,
        response=response,
        bt=bt,
    )

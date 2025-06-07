from fastapi import APIRouter

from app.api.routes.v1.controllers.auth.email import email_auth_router

auth_router = APIRouter(prefix="/v1/auth")
auth_router.include_router(email_auth_router)

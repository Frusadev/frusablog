import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.status import HTTP_404_NOT_FOUND

from app.api.routes.v1.controllers.auth.auth import (
    auth_router as v1_auth_router,
)
from app.api.routes.v1.controllers.comment import (
    comment_router as v1_comment_router,
)
from app.api.routes.v1.controllers.file import (
    resource_router as v1_resource_controller,
)
from app.api.routes.v1.controllers.post import post_router as v1_post_router
from app.api.routes.v1.controllers.stats import stats_router as v1_stats_router
from app.api.routes.v1.controllers.tag import tag_router as v1_tag_router
from app.api.routes.v1.controllers.user import user_router as v1_user_router
from app.api.routes.v1.controllers.user_action import (
    user_action_router as v1_user_action_router,
)
from app.core.config.env import get_env
from app.core.db.setup import setup_db

app = FastAPI()

app.include_router(v1_auth_router)
app.include_router(v1_post_router)
app.include_router(v1_user_router)
app.include_router(v1_comment_router)
app.include_router(v1_tag_router)
app.include_router(v1_stats_router)
app.include_router(v1_resource_controller)
app.include_router(v1_user_action_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],  # Or ["http://localhost:3000"] for stricter control
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEBUG = get_env("DEBUG", "True") == "False"
PORT = int(get_env("PORT", "8000")) or 8000


@app.get("/redoc")
async def redoc():
    if not DEBUG:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND)


@app.get("/docs")
async def openapidocs():
    if not DEBUG:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND)


def run_app():
    setup_db()
    uvicorn.run("app:app", reload=DEBUG, port=PORT, host="0.0.0.0")

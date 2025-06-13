from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

from app.api.routes.v1.dto.user import UserDTO


class CommentCreationDTO(BaseModel):
    content: str
    parent_id: UUID | None
    post_id: UUID


class CommentDTO(BaseModel):
    id: UUID
    likes: int
    content: str
    created_at: datetime
    author: UserDTO
    children: list["CommentDTO"]
    parent: "CommentDTO"
    level: int


class CommentMutationDTO(BaseModel):
    id: UUID
    content: str

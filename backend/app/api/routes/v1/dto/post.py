from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.api.routes.v1.dto.tag import TagDTO
from app.api.routes.v1.dto.user import UserDTO


class PostCreationDTO(BaseModel):
    title: str = Field(max_length=100)
    description: str = Field(max_length=400)
    cover: UUID | None = None
    content: str
    tags: list[TagDTO]
    published: bool


class PostDTO(BaseModel):
    id: UUID | None = None
    title: str = Field(max_length=100)
    description: str = Field(max_length=400)
    cover: UUID | None = None
    likes: int
    content: str
    published: bool
    archived: bool
    featured: bool
    created_at: datetime
    author: UserDTO
    tags: list[TagDTO]


class PostMutationDTO(BaseModel):
    id: UUID
    title: str = Field(max_length=100)
    description: str = Field(max_length=400)
    cover: UUID | None = None
    content: str
    published: bool
    archived: bool

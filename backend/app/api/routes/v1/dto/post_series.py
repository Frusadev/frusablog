from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PostSeriesDTO(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    cover: UUID | None = None
    created_at: datetime
    last_updated: datetime


class PostSeriesCreationDTO(BaseModel):
    title: str
    description: str | None = None
    cover: UUID | None = None


class PostSeriesMutationDTO(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    cover: UUID | None = None

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ViewData(BaseModel):
    id: str
    started_at: datetime
    time: int


class VisitData(BaseModel):
    id: str
    started_at: datetime
    time: int


class UserMessageCreationDTO(BaseModel):
    subject: str
    content: str

class UserMessageDTO(BaseModel):
    id: UUID
    user_id: str
    subject: str
    content: str
    created_at: datetime
    viewed: bool = False

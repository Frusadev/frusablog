from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.api.routes.v1.dto.user import UserDTO


class ResourceDTO(BaseModel):
    id: UUID
    owner: UserDTO
    protected: bool
    name: str
    created_at: datetime

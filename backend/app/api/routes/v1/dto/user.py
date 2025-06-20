from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserDTO(BaseModel):
    id: str
    username: str
    name: str


class DetailedUserInfo(BaseModel):
    id: str
    username: str
    name: str
    email: EmailStr
    joined_at: datetime
    banned: bool
    last_ban_motive: str | None


class UserListResponse(BaseModel):
    length: int
    users: list[DetailedUserInfo]


class UserMessageSendDTO(BaseModel):
    recipient_id: str
    mail_content: str
    mail_subject: str


class BroadcastData(BaseModel):
    recipients_ids: str | Literal["all"]
    mail_content: str
    mail_subject: str


class BanUserRequest(BaseModel):
    motive: str = Field(min_length=100)

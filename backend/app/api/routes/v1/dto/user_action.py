from datetime import datetime
from pydantic import BaseModel


class ViewData(BaseModel):
    id: str
    started_at: datetime
    time: int


class VisitData(BaseModel):
    id: str
    started_at: datetime
    time: int

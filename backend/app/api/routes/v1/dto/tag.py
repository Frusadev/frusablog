from pydantic import BaseModel


class TagDTO(BaseModel):
    id: str
    name: str


class TagCreationDTO(BaseModel):
    name: str

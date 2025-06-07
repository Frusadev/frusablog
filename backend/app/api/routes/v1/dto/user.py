from pydantic import BaseModel


class UserDTO(BaseModel):
    id: str
    username: str
    name: str

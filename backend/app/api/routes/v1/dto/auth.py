from pydantic import BaseModel, EmailStr


class RegisterRequestDTO(BaseModel):
    email: EmailStr
    username: str
    name: str


class LoginRequestDTO(BaseModel):
    email: EmailStr

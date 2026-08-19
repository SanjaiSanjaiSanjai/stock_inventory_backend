"""Authentication request and response schemas."""

from datetime import datetime

from pydantic import BaseModel

from app.models import UserRole


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    token: str


class AuthResponse(TokenResponse):
    data: UserResponse

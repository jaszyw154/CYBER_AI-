from datetime import datetime

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=6, max_length=128)
    display_name: str = Field("", max_length=64)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str
    role: str
    created_at: datetime


class ErrorDetail(BaseModel):
    detail: str

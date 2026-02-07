"""Pydantic schemas for authentication endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    first_name: str | None = None
    last_name: str | None = None
    full_name: str | None = None
    phone: str | None = None
    role: str = "user"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(min_length=6, max_length=6)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=6, max_length=128)


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class UserRead(BaseModel):
    id: uuid.UUID
    email: str
    first_name: str | None = None
    last_name: str | None = None
    role: str
    roles: list[str] = []
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    success: bool = True
    access_token: str
    refresh_token: str
    csrf_token: str
    token_type: str = "bearer"
    user: UserRead


class VerifyEmailResponse(BaseModel):
    success: bool = True
    already_verified: bool = False
    message: str = ""
    email: str = ""


class ResetPasswordResponse(BaseModel):
    success: bool = True


class LogoutResponse(BaseModel):
    success: bool = True


# ---------------------------------------------------------------------------
# Update schemas
# ---------------------------------------------------------------------------


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    # NOTE: role is intentionally excluded — users cannot self-escalate.

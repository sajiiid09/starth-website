from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import DisputeStatus


class DisputeCreateIn(BaseModel):
    reason: str = Field(min_length=1, max_length=255)
    details: str | None = None


class DisputeOut(BaseModel):
    id: str
    booking_id: str
    opened_by_user_id: str
    status: DisputeStatus
    reason: str
    details: str | None = None
    resolution_note: str | None = None


class DisputeAdminSetStatusIn(BaseModel):
    status: DisputeStatus
    resolution_note: str | None = None

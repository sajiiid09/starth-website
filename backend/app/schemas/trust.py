from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import ModerationEventKind


class ModerationEventCreateIn(BaseModel):
    booking_id: UUID | None = None
    kind: ModerationEventKind
    reason: str = Field(min_length=1, max_length=255)
    excerpt: str | None = Field(default=None, max_length=500)

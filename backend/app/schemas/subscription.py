from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.models.enums import SubscriptionProvider, SubscriptionStatus


class SubscriptionResponse(BaseModel):
    status: SubscriptionStatus
    provider: SubscriptionProvider
    current_period_end: datetime | None = None


class AdminSubscriptionUpdate(BaseModel):
    status: SubscriptionStatus

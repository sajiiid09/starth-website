from __future__ import annotations

from pydantic import BaseModel

from app.models.enums import PayoutMilestone, PayoutStatus


class PayoutOut(BaseModel):
    id: str
    booking_id: str
    booking_vendor_id: str
    vendor_id: str
    milestone: PayoutMilestone
    amount_cents: int
    status: PayoutStatus
    admin_approved_by: str | None = None

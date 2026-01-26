from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class BookingPaymentCreateIn(BaseModel):
    mode: Literal["deposit", "full"]
    idempotency_key: str = Field(min_length=1)


class BookingPaymentOut(BaseModel):
    provider: str
    client_secret: str
    payment_id: str
    amount_cents: int
    currency: str

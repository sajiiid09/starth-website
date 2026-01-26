from __future__ import annotations

from typing import Protocol


class PaymentService(Protocol):
    def create_payment_intent(
        self,
        booking_id: str,
        amount_cents: int,
        currency: str,
        idempotency_key: str,
        metadata: dict[str, str],
    ) -> dict:
        ...

    def parse_webhook(self, payload: bytes, sig_header: str) -> object:
        ...

    def verify_webhook_signature(self, payload: bytes, sig_header: str) -> bool:
        ...

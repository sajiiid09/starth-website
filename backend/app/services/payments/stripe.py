from __future__ import annotations

from typing import Any

import stripe

from app.core.config import get_settings
from app.services.payments.base import PaymentService


class StripePaymentService(PaymentService):
    def __init__(self) -> None:
        settings = get_settings()
        stripe.api_key = settings.stripe_secret_key
        self._webhook_secret = settings.stripe_webhook_secret

    def create_payment_intent(
        self,
        booking_id: str,
        amount_cents: int,
        currency: str,
        idempotency_key: str,
        metadata: dict[str, str],
    ) -> dict[str, Any]:
        return stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=currency,
            metadata={"booking_id": booking_id, **metadata},
            idempotency_key=idempotency_key,
        )

    def parse_webhook(self, payload: bytes, sig_header: str) -> stripe.Event:
        return stripe.Webhook.construct_event(payload, sig_header, self._webhook_secret)

    def verify_webhook_signature(self, payload: bytes, sig_header: str) -> bool:
        try:
            stripe.Webhook.construct_event(payload, sig_header, self._webhook_secret)
        except stripe.error.SignatureVerificationError:
            return False
        return True

    def retrieve_payment_intent(self, intent_id: str) -> dict[str, Any]:
        return stripe.PaymentIntent.retrieve(intent_id)

"""Tests for Stripe webhook signature verification and processing."""

import uuid
import sys
import types
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock, patch

import stripe
from fastapi import HTTPException

# Prevent DB engine initialization during module import in unit tests.
mock_engine_module = types.ModuleType("app.db.engine")


async def _fake_get_db():
    return None


mock_engine_module.get_db = _fake_get_db
sys.modules["app.db.engine"] = mock_engine_module

from app.api.routes import webhooks


def _result(value):
    result = Mock()
    result.scalar_one_or_none.return_value = value
    return result


class DummyRequest:
    def __init__(self, payload: bytes) -> None:
        self._payload = payload

    async def body(self) -> bytes:
        return self._payload


class StripeWebhookTests(IsolatedAsyncioTestCase):
    async def test_webhook_rejects_when_secret_missing_in_production(self) -> None:
        request = DummyRequest(b'{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_123"}}}')
        db = AsyncMock()

        with (
            patch.object(webhooks.settings, "ENVIRONMENT", "production"),
            patch.object(webhooks.settings, "STRIPE_WEBHOOK_SECRET", ""),
            patch.object(webhooks.stripe.WebhookSignature, "verify_header") as mock_verify,
        ):
            with self.assertRaises(HTTPException) as exc:
                await webhooks.stripe_webhook(request=request, db=db, stripe_signature=None)

        self.assertEqual(exc.exception.status_code, 403)
        self.assertIn("not configured", str(exc.exception.detail).lower())
        mock_verify.assert_not_called()

    async def test_webhook_rejects_invalid_signature(self) -> None:
        request = DummyRequest(b'{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_123"}}}')
        db = AsyncMock()

        with (
            patch.object(webhooks.settings, "ENVIRONMENT", "production"),
            patch.object(webhooks.settings, "STRIPE_WEBHOOK_SECRET", "whsec_test"),
            patch.object(
                webhooks.stripe.WebhookSignature,
                "verify_header",
                side_effect=stripe.SignatureVerificationError("bad sig", "t=1,v1=bad"),
            ),
        ):
            with self.assertRaises(HTTPException) as exc:
                await webhooks.stripe_webhook(
                    request=request,
                    db=db,
                    stripe_signature="t=1,v1=bad",
                )

        self.assertEqual(exc.exception.status_code, 403)
        self.assertIn("invalid stripe webhook signature", str(exc.exception.detail).lower())

    async def test_webhook_rejects_missing_signature_when_secret_is_set(self) -> None:
        request = DummyRequest(b'{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_123"}}}')
        db = AsyncMock()

        with (
            patch.object(webhooks.settings, "ENVIRONMENT", "production"),
            patch.object(webhooks.settings, "STRIPE_WEBHOOK_SECRET", "whsec_test"),
            patch.object(webhooks.stripe.WebhookSignature, "verify_header") as mock_verify,
        ):
            with self.assertRaises(HTTPException) as exc:
                await webhooks.stripe_webhook(request=request, db=db, stripe_signature=None)

        self.assertEqual(exc.exception.status_code, 403)
        self.assertIn("missing stripe-signature", str(exc.exception.detail).lower())
        mock_verify.assert_not_called()

    async def test_valid_signature_processes_payment_intent_succeeded(self) -> None:
        payment_intent_id = "pi_valid_123"
        payment = SimpleNamespace(
            id=uuid.uuid4(),
            event_id=uuid.uuid4(),
            payment_type="event_total",
            status="pending",
        )
        event = SimpleNamespace(
            id=payment.event_id,
            status="planning",
        )

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=[_result(payment), _result(event)])

        request = DummyRequest(
            (
                '{"type":"payment_intent.succeeded","data":{"object":{"id":"'
                + payment_intent_id
                + '"}}}'
            ).encode("utf-8")
        )

        with (
            patch.object(webhooks.settings, "ENVIRONMENT", "production"),
            patch.object(webhooks.settings, "STRIPE_WEBHOOK_SECRET", "whsec_test"),
            patch.object(webhooks.stripe.WebhookSignature, "verify_header") as mock_verify,
        ):
            result = await webhooks.stripe_webhook(
                request=request,
                db=db,
                stripe_signature="t=1,v1=valid",
            )

        self.assertEqual(result, {"received": True})
        self.assertEqual(payment.status, "completed")
        self.assertEqual(event.status, "confirmed")
        mock_verify.assert_called_once_with(
            payload=request._payload,
            header="t=1,v1=valid",
            secret="whsec_test",
        )

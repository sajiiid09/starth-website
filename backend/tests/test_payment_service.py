"""Tests for payment release Stripe destination account handling."""

import uuid
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock, patch

from app.services import payment_service


def _result(value):
    result = Mock()
    result.scalar_one_or_none.return_value = value
    return result


class ReleasePaymentTests(IsolatedAsyncioTestCase):
    async def test_release_payment_uses_provider_stripe_account_id(self) -> None:
        event_service_id = uuid.uuid4()
        provider_id = uuid.uuid4()
        provider_user_id = uuid.uuid4()

        event_service = SimpleNamespace(
            id=event_service_id,
            status="completed",
            agreed_price=100.00,
            service_provider_id=provider_id,
            event_id=uuid.uuid4(),
            approved_at=None,
        )
        provider = SimpleNamespace(
            id=provider_id,
            user_id=provider_user_id,
            stripe_account_id="acct_1TestConnectedAccount",
        )

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=[_result(event_service), _result(provider)])
        db.add = Mock()

        with (
            patch.object(payment_service.settings, "STRIPE_SECRET_KEY", "sk_test_123"),
            patch.object(payment_service.settings, "STRIPE_PLATFORM_COMMISSION", 0.10),
            patch.object(
                payment_service.stripe.Transfer,
                "create",
                return_value=SimpleNamespace(id="tr_test_123"),
            ) as mock_transfer_create,
        ):
            result = await payment_service.release_payment(
                db=db,
                event_service_id=event_service_id,
                approver_id=uuid.uuid4(),
            )

        self.assertTrue(result["success"])
        self.assertEqual(result["transfer_id"], "tr_test_123")
        self.assertEqual(mock_transfer_create.call_count, 1)
        self.assertEqual(
            mock_transfer_create.call_args.kwargs["destination"],
            provider.stripe_account_id,
        )
        self.assertEqual(event_service.status, "paid")
        self.assertIsNotNone(event_service.approved_at)

        created_payment = db.add.call_args.args[0]
        self.assertEqual(created_payment.payee_id, provider_user_id)
        self.assertEqual(created_payment.stripe_transfer_id, "tr_test_123")

    async def test_release_payment_errors_when_provider_missing_stripe_account_id(self) -> None:
        event_service_id = uuid.uuid4()
        provider_id = uuid.uuid4()

        event_service = SimpleNamespace(
            id=event_service_id,
            status="completed",
            agreed_price=100.00,
            service_provider_id=provider_id,
            event_id=uuid.uuid4(),
            approved_at=None,
        )
        provider = SimpleNamespace(
            id=provider_id,
            user_id=uuid.uuid4(),
            stripe_account_id=None,
        )

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=[_result(event_service), _result(provider)])
        db.add = Mock()

        with (
            patch.object(payment_service.settings, "STRIPE_SECRET_KEY", "sk_test_123"),
            patch.object(payment_service.settings, "STRIPE_PLATFORM_COMMISSION", 0.10),
            patch.object(payment_service.stripe.Transfer, "create") as mock_transfer_create,
        ):
            result = await payment_service.release_payment(
                db=db,
                event_service_id=event_service_id,
                approver_id=uuid.uuid4(),
            )

        self.assertFalse(result["success"])
        self.assertTrue(result["onboarding_required"])
        self.assertIn("onboarding", result["error"].lower())
        mock_transfer_create.assert_not_called()
        db.add.assert_not_called()
        self.assertEqual(event_service.status, "completed")

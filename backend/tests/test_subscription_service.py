"""Tests for Stripe subscription billing service."""

import uuid
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock, patch

from app.services.subscription import stripe as subscription_service
from app.utils.exceptions import ConfigurationError


def _result(value):
    result = Mock()
    result.scalar_one_or_none.return_value = value
    result.scalars.return_value.first.return_value = value
    return result


class SubscriptionServiceTests(IsolatedAsyncioTestCase):
    async def test_start_subscription_creates_customer_and_subscription(self) -> None:
        user_id = uuid.uuid4()
        user = SimpleNamespace(
            id=user_id,
            email="billing@example.com",
            stripe_customer_id=None,
        )

        db = Mock()
        db.execute = AsyncMock(side_effect=[_result(user)])
        db.add = Mock()
        db.flush = AsyncMock()

        stripe_sub = {
            "id": "sub_123",
            "status": "incomplete",
            "current_period_start": 1735689600,  # 2025-01-01 UTC
            "current_period_end": 1738368000,  # 2025-02-01 UTC
            "latest_invoice": {"payment_intent": {"client_secret": "pi_secret_123"}},
        }

        with (
            patch.object(subscription_service.settings, "STRIPE_SECRET_KEY", "sk_test_123"),
            patch.object(
                subscription_service,
                "_SUBSCRIPTION_PLANS",
                {"basic": {"price_id": "price_basic_123", "iteration_limit": 25}},
            ),
            patch.object(
                subscription_service.stripe.Customer,
                "create",
                return_value=SimpleNamespace(id="cus_123"),
            ),
            patch.object(
                subscription_service.stripe.Subscription,
                "create",
                return_value=stripe_sub,
            ) as mock_sub_create,
            patch.object(subscription_service, "log_audit_event", AsyncMock()) as mock_audit,
        ):
            result = await subscription_service.start_subscription(
                db=db,
                user_id=user_id,
                plan_type="basic",
            )

        self.assertTrue(result["success"])
        self.assertEqual(result["stripe_subscription_id"], "sub_123")
        self.assertEqual(result["client_secret"], "pi_secret_123")
        self.assertEqual(user.stripe_customer_id, "cus_123")
        self.assertEqual(mock_sub_create.call_args.kwargs["customer"], "cus_123")
        db.add.assert_called_once()
        mock_audit.assert_awaited_once()

    async def test_start_subscription_requires_stripe_configuration(self) -> None:
        with patch.object(subscription_service.settings, "STRIPE_SECRET_KEY", ""):
            with self.assertRaises(ConfigurationError):
                await subscription_service.start_subscription(
                    db=Mock(),
                    user_id=uuid.uuid4(),
                    plan_type="basic",
                )

    async def test_cancel_subscription_sets_cancel_at_period_end(self) -> None:
        user_id = uuid.uuid4()
        subscription = SimpleNamespace(
            id=uuid.uuid4(),
            user_id=user_id,
            stripe_subscription_id="sub_cancel_123",
            status="active",
        )

        db = Mock()
        db.execute = AsyncMock(side_effect=[_result(subscription)])

        with (
            patch.object(subscription_service.settings, "STRIPE_SECRET_KEY", "sk_test_123"),
            patch.object(
                subscription_service.stripe.Subscription,
                "modify",
                return_value={"cancel_at_period_end": True, "status": "active"},
            ),
            patch.object(subscription_service, "log_audit_event", AsyncMock()) as mock_audit,
        ):
            result = await subscription_service.cancel_subscription(
                db=db,
                user_id=user_id,
                subscription_id=subscription.id,
            )

        self.assertTrue(result["success"])
        self.assertEqual(result["status"], "cancel_at_period_end")
        self.assertTrue(result["cancel_at_period_end"])
        mock_audit.assert_awaited_once()

    async def test_sync_subscription_updates_local_status(self) -> None:
        subscription = SimpleNamespace(
            id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            stripe_subscription_id="sub_sync_123",
            status="incomplete",
            start_date=None,
            end_date=None,
        )
        db = Mock()
        db.execute = AsyncMock(side_effect=[_result(subscription)])

        with (
            patch.object(subscription_service.settings, "STRIPE_SECRET_KEY", "sk_test_123"),
            patch.object(
                subscription_service.stripe.Subscription,
                "retrieve",
                return_value={
                    "status": "active",
                    "current_period_start": 1735689600,
                    "current_period_end": 1738368000,
                },
            ),
            patch.object(subscription_service, "log_audit_event", AsyncMock()) as mock_audit,
        ):
            result = await subscription_service.sync_subscription(
                db=db,
                stripe_subscription_id="sub_sync_123",
            )

        self.assertTrue(result["success"])
        self.assertEqual(subscription.status, "active")
        self.assertEqual(result["status"], "active")
        mock_audit.assert_awaited_once()

"""Tests for payment release destination and concurrency safety."""

import asyncio
import uuid
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock, patch

import stripe

from app.models.event import EventService
from app.models.payment import Payment
from app.models.service_provider import ServiceProvider
from app.services import payment_service


def _result(value):
    result = Mock()
    result.scalar_one_or_none.return_value = value
    return result


class _NoopTransaction:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False


class _ConcurrentTransaction:
    def __init__(self, db):
        self.db = db
        self.snapshot = None

    async def __aenter__(self):
        await self.db.lock.acquire()
        self.snapshot = (
            self.db.payout_record,
            self.db.event_service.status,
            self.db.event_service.approved_at,
        )
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if exc_type:
            self.db.payout_record = self.snapshot[0]
            self.db.event_service.status = self.snapshot[1]
            self.db.event_service.approved_at = self.snapshot[2]
        self.db.lock.release()
        return False


class _ConcurrentFakeDB:
    def __init__(self, event_service, provider):
        self.event_service = event_service
        self.provider = provider
        self.payout_record = None
        self.lock = asyncio.Lock()
        self.add = Mock(side_effect=self._track_add)

    def begin_nested(self):
        return _ConcurrentTransaction(self)

    async def execute(self, statement):
        entity = statement.column_descriptions[0].get("entity")
        if entity is EventService:
            return _result(self.event_service)
        if entity is Payment:
            return _result(self.payout_record)
        if entity is ServiceProvider:
            return _result(self.provider)
        raise AssertionError(f"Unexpected entity in statement: {entity}")

    async def flush(self):
        await asyncio.sleep(0.01)

    def _track_add(self, obj):
        if isinstance(obj, Payment) and obj.payment_type == "service_payment":
            self.payout_record = obj


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

        db = Mock()
        db.execute = AsyncMock(
            side_effect=[_result(event_service), _result(None), _result(provider)]
        )
        db.begin_nested = Mock(return_value=_NoopTransaction())
        db.add = Mock()
        db.flush = AsyncMock()

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
        self.assertEqual(
            mock_transfer_create.call_args.kwargs["idempotency_key"],
            f"release_payment:{event_service_id}",
        )
        self.assertEqual(event_service.status, "paid")
        self.assertIsNotNone(event_service.approved_at)

        created_payment = db.add.call_args.args[0]
        self.assertEqual(created_payment.event_service_id, event_service_id)
        self.assertEqual(created_payment.payee_id, provider_user_id)
        self.assertEqual(created_payment.stripe_transfer_id, "tr_test_123")
        self.assertEqual(created_payment.status, "released")

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

        db = Mock()
        db.execute = AsyncMock(
            side_effect=[_result(event_service), _result(None), _result(provider)]
        )
        db.begin_nested = Mock(return_value=_NoopTransaction())
        db.add = Mock()
        db.flush = AsyncMock()

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

    async def test_release_payment_is_idempotent_when_already_released(self) -> None:
        event_service_id = uuid.uuid4()
        event_service = SimpleNamespace(
            id=event_service_id,
            status="paid",
            agreed_price=100.00,
            service_provider_id=uuid.uuid4(),
            event_id=uuid.uuid4(),
            approved_at=None,
        )
        existing_payout = SimpleNamespace(
            status="released",
            net_amount=90.00,
            platform_commission=10.00,
            stripe_transfer_id="tr_existing_123",
        )

        db = Mock()
        db.execute = AsyncMock(side_effect=[_result(event_service), _result(existing_payout)])
        db.begin_nested = Mock(return_value=_NoopTransaction())
        db.add = Mock()
        db.flush = AsyncMock()

        with patch.object(payment_service.stripe.Transfer, "create") as mock_transfer_create:
            result = await payment_service.release_payment(
                db=db,
                event_service_id=event_service_id,
                approver_id=uuid.uuid4(),
            )

        self.assertTrue(result["success"])
        self.assertTrue(result["already_released"])
        self.assertEqual(result["transfer_id"], "tr_existing_123")
        mock_transfer_create.assert_not_called()
        db.add.assert_not_called()

    async def test_release_payment_blocks_when_payout_already_processing(self) -> None:
        event_service_id = uuid.uuid4()
        event_service = SimpleNamespace(
            id=event_service_id,
            status="completed",
            agreed_price=100.00,
            service_provider_id=uuid.uuid4(),
            event_id=uuid.uuid4(),
            approved_at=None,
        )
        existing_payout = SimpleNamespace(
            status="payout_started",
            net_amount=90.00,
            platform_commission=10.00,
            stripe_transfer_id=None,
        )

        db = Mock()
        db.execute = AsyncMock(side_effect=[_result(event_service), _result(existing_payout)])
        db.begin_nested = Mock(return_value=_NoopTransaction())
        db.add = Mock()
        db.flush = AsyncMock()

        with patch.object(payment_service.stripe.Transfer, "create") as mock_transfer_create:
            result = await payment_service.release_payment(
                db=db,
                event_service_id=event_service_id,
                approver_id=uuid.uuid4(),
            )

        self.assertFalse(result["success"])
        self.assertTrue(result["already_processing"])
        self.assertIn("already being processed", result["error"].lower())
        mock_transfer_create.assert_not_called()
        db.add.assert_not_called()

    async def test_release_payment_concurrent_calls_only_transfer_once(self) -> None:
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
            stripe_account_id="acct_1ConcurrentProvider",
        )
        db = _ConcurrentFakeDB(event_service=event_service, provider=provider)

        with (
            patch.object(payment_service.settings, "STRIPE_SECRET_KEY", "sk_test_123"),
            patch.object(payment_service.settings, "STRIPE_PLATFORM_COMMISSION", 0.10),
            patch.object(
                payment_service.stripe.Transfer,
                "create",
                return_value=SimpleNamespace(id="tr_concurrent_123"),
            ) as mock_transfer_create,
        ):
            results = await asyncio.gather(
                payment_service.release_payment(db, event_service_id, uuid.uuid4()),
                payment_service.release_payment(db, event_service_id, uuid.uuid4()),
            )

        self.assertEqual(mock_transfer_create.call_count, 1)
        self.assertEqual(sum(1 for r in results if r["success"]), 2)
        self.assertTrue(any(r.get("already_released") for r in results))
        self.assertEqual(event_service.status, "paid")
        self.assertEqual(db.payout_record.status, "released")

    async def test_release_payment_rolls_back_when_transfer_fails(self) -> None:
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
            stripe_account_id="acct_1RollbackProvider",
        )
        db = _ConcurrentFakeDB(event_service=event_service, provider=provider)

        with (
            patch.object(payment_service.settings, "STRIPE_SECRET_KEY", "sk_test_123"),
            patch.object(payment_service.settings, "STRIPE_PLATFORM_COMMISSION", 0.10),
            patch.object(
                payment_service.stripe.Transfer,
                "create",
                side_effect=stripe.APIError("transfer failed"),
            ),
        ):
            result = await payment_service.release_payment(
                db=db,
                event_service_id=event_service_id,
                approver_id=uuid.uuid4(),
            )

        self.assertFalse(result["success"])
        self.assertIn("transfer failed", result["error"].lower())
        self.assertEqual(event_service.status, "completed")
        self.assertIsNone(event_service.approved_at)
        self.assertIsNone(db.payout_record)

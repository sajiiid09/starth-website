"""Payment service — Stripe Connect integration for escrow-style payments.

Flow:
1. User pays total event cost → Stripe PaymentIntent (funds held on platform)
2. On service completion approval → Stripe Transfer sends 90% to provider
3. Platform keeps 10% commission
4. Cancellation: 90% refund to user, platform keeps 10%
"""

import logging
import uuid
from datetime import datetime, timezone

import stripe
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.event import Event, EventService
from app.models.payment import Payment
from app.models.service_provider import ServiceProvider
from app.utils.exceptions import ConfigurationError

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


def _ensure_stripe_configured_for_production(action: str) -> None:
    """Fail fast in production when Stripe is required but not configured."""
    if settings.STRIPE_SECRET_KEY:
        return
    if settings.ENVIRONMENT.lower() == "production":
        raise ConfigurationError(f"Stripe secret key is required to {action} in production")


async def create_payment_intent(
    db: AsyncSession,
    event_id: uuid.UUID,
    payer_id: uuid.UUID,
    amount: float,
) -> dict:
    """Create a Stripe PaymentIntent for an event's total cost.

    Returns:
        Dict with payment_intent_id, client_secret, and payment record id.
    """
    amount_cents = int(amount * 100)

    if not settings.STRIPE_SECRET_KEY:
        _ensure_stripe_configured_for_production("create payment intents")
        logger.warning("Stripe not configured — creating mock payment")
        return await _create_mock_payment(db, event_id, payer_id, amount)

    intent = stripe.PaymentIntent.create(
        amount=amount_cents,
        currency="usd",
        metadata={
            "event_id": str(event_id),
            "payer_id": str(payer_id),
            "platform": "strathwell",
        },
    )

    commission = round(amount * settings.STRIPE_PLATFORM_COMMISSION, 2)
    net = round(amount - commission, 2)

    payment = Payment(
        event_id=event_id,
        payer_id=payer_id,
        amount=amount,
        platform_commission=commission,
        net_amount=net,
        payment_type="event_total",
        stripe_payment_intent_id=intent.id,
        status="pending",
    )
    db.add(payment)
    await db.flush()

    return {
        "payment_intent_id": intent.id,
        "client_secret": intent.client_secret,
        "payment_id": str(payment.id),
    }


async def confirm_payment(
    db: AsyncSession,
    payment_intent_id: str,
) -> dict:
    """Confirm that a payment has been completed (called after Stripe webhook or client confirms).

    Updates the payment record status to 'completed'.
    """
    result = await db.execute(
        select(Payment).where(Payment.stripe_payment_intent_id == payment_intent_id)
    )
    payment = result.scalar_one_or_none()

    if payment is None:
        return {"success": False, "error": "Payment not found"}

    payment.status = "completed"

    # Update event status
    event_result = await db.execute(
        select(Event).where(Event.id == payment.event_id)
    )
    event = event_result.scalar_one_or_none()
    if event and event.status == "planning":
        event.status = "confirmed"

    return {"success": True, "payment_id": str(payment.id)}


async def release_payment(
    db: AsyncSession,
    event_service_id: uuid.UUID,
    approver_id: uuid.UUID,
) -> dict:
    """Release payment to a service provider after task completion approval.

    Transfers 90% of the agreed price to the provider's connected account.
    """
    _ensure_stripe_configured_for_production("release provider payouts")
    idempotency_key = f"release_payment:{event_service_id}"

    try:
        async with db.begin_nested():
            result = await db.execute(
                select(EventService)
                .where(EventService.id == event_service_id)
                .with_for_update()
            )
            es = result.scalar_one_or_none()
            if es is None:
                return {"success": False, "error": "Event service not found"}

            existing_payout_result = await db.execute(
                select(Payment)
                .where(
                    Payment.event_service_id == event_service_id,
                    Payment.payment_type == "service_payment",
                )
                .with_for_update()
            )
            existing_payout = existing_payout_result.scalar_one_or_none()
            if existing_payout:
                if existing_payout.status == "released":
                    return {
                        "success": True,
                        "payout_amount": float(existing_payout.net_amount or 0),
                        "commission": float(existing_payout.platform_commission or 0),
                        "transfer_id": existing_payout.stripe_transfer_id,
                        "already_released": True,
                    }
                return {
                    "success": False,
                    "error": "Payout is already being processed for this service",
                    "already_processing": True,
                }

            if es.status != "completed":
                return {"success": False, "error": "Service must be completed before payment release"}

            if not es.service_provider_id:
                return {"success": False, "error": "No service provider assigned to this event service"}

            provider_result = await db.execute(
                select(ServiceProvider).where(ServiceProvider.id == es.service_provider_id)
            )
            provider = provider_result.scalar_one_or_none()
            if provider is None:
                return {"success": False, "error": "Service provider not found"}

            if settings.STRIPE_SECRET_KEY and not provider.stripe_account_id:
                return {
                    "success": False,
                    "error": "Provider onboarding required: missing Stripe account ID",
                    "onboarding_required": True,
                }

            agreed_price = float(es.agreed_price)
            commission = round(agreed_price * settings.STRIPE_PLATFORM_COMMISSION, 2)
            payout_amount = round(agreed_price - commission, 2)
            payout_cents = int(payout_amount * 100)
            now = datetime.now(timezone.utc)

            payout_payment = Payment(
                event_id=es.event_id,
                event_service_id=es.id,
                payee_id=provider.user_id,
                amount=agreed_price,
                platform_commission=commission,
                net_amount=payout_amount,
                payment_type="service_payment",
                status="payout_started",
            )
            db.add(payout_payment)
            await db.flush()

            transfer_id = None
            if settings.STRIPE_SECRET_KEY:
                transfer = stripe.Transfer.create(
                    amount=payout_cents,
                    currency="usd",
                    destination=provider.stripe_account_id,
                    metadata={
                        "event_service_id": str(event_service_id),
                        "event_id": str(es.event_id),
                        "approver_id": str(approver_id),
                    },
                    idempotency_key=idempotency_key,
                )
                transfer_id = transfer.id

            payout_payment.stripe_transfer_id = transfer_id
            payout_payment.status = "released"
            payout_payment.released_at = now

            es.approved_at = now
            es.status = "paid"

            return {
                "success": True,
                "payout_amount": payout_amount,
                "commission": commission,
                "transfer_id": transfer_id,
            }
    except stripe.StripeError as e:
        logger.error("Stripe transfer failed: %s", e)
        return {"success": False, "error": f"Payment transfer failed: {str(e)}"}
    except ConfigurationError:
        raise
    except Exception as e:
        logger.exception("Unexpected error during payment release")
        return {"success": False, "error": f"Payment release failed: {str(e)}"}


async def process_cancellation(
    db: AsyncSession,
    event_id: uuid.UUID,
    user_id: uuid.UUID,
    reason: str = "",
) -> dict:
    """Cancel an event and process refund (90% to user, 10% kept as fee).

    Returns:
        Dict with refund details.
    """
    result = await db.execute(
        select(Event).where(Event.id == event_id, Event.user_id == user_id)
    )
    event = result.scalar_one_or_none()
    if event is None:
        return {"success": False, "error": "Event not found"}

    if event.status in ("completed", "cancelled"):
        return {"success": False, "error": f"Cannot cancel event in {event.status} status"}

    # Find the original payment
    payment_result = await db.execute(
        select(Payment).where(
            Payment.event_id == event_id,
            Payment.payment_type == "event_total",
            Payment.status == "completed",
        )
    )
    original_payment = payment_result.scalar_one_or_none()

    refund_amount = 0.0
    platform_fee = 0.0

    if original_payment:
        _ensure_stripe_configured_for_production("process payment refunds")
        total_paid = float(original_payment.amount)
        platform_fee = round(total_paid * settings.STRIPE_PLATFORM_COMMISSION, 2)
        refund_amount = round(total_paid - platform_fee, 2)

        if settings.STRIPE_SECRET_KEY and original_payment.stripe_payment_intent_id:
            try:
                stripe.Refund.create(
                    payment_intent=original_payment.stripe_payment_intent_id,
                    amount=int(refund_amount * 100),
                    metadata={"reason": reason, "event_id": str(event_id)},
                )
            except stripe.StripeError as e:
                logger.error("Stripe refund failed: %s", e)
                return {"success": False, "error": f"Refund failed: {str(e)}"}

        # Record refund payment
        refund_record = Payment(
            event_id=event_id,
            payer_id=original_payment.payer_id,
            amount=refund_amount,
            platform_commission=platform_fee,
            payment_type="refund",
            status="refunded",
        )
        db.add(refund_record)

    # Update event
    event.status = "cancelled"
    event.cancelled_at = datetime.now(timezone.utc)
    event.cancellation_reason = reason

    # Cancel all pending event services
    for es in event.event_services:
        if es.status in ("pending", "confirmed"):
            es.status = "cancelled"

    return {
        "success": True,
        "refund_amount": refund_amount,
        "platform_fee": platform_fee,
    }


async def get_event_payments(
    db: AsyncSession,
    event_id: uuid.UUID,
) -> list[dict]:
    """Get all payments for an event."""
    result = await db.execute(
        select(Payment).where(Payment.event_id == event_id).order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()

    return [
        {
            "id": str(p.id),
            "event_id": str(p.event_id),
            "payer_id": str(p.payer_id) if p.payer_id else None,
            "payee_id": str(p.payee_id) if p.payee_id else None,
            "amount": float(p.amount),
            "platform_commission": float(p.platform_commission) if p.platform_commission else None,
            "net_amount": float(p.net_amount) if p.net_amount else None,
            "payment_type": p.payment_type,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "released_at": p.released_at.isoformat() if p.released_at else None,
        }
        for p in payments
    ]


async def _create_mock_payment(
    db: AsyncSession,
    event_id: uuid.UUID,
    payer_id: uuid.UUID,
    amount: float,
) -> dict:
    """Create a mock payment when Stripe is not configured."""
    commission = round(amount * settings.STRIPE_PLATFORM_COMMISSION, 2)
    net = round(amount - commission, 2)

    payment = Payment(
        event_id=event_id,
        payer_id=payer_id,
        amount=amount,
        platform_commission=commission,
        net_amount=net,
        payment_type="event_total",
        stripe_payment_intent_id=f"mock_pi_{uuid.uuid4().hex[:16]}",
        status="pending",
    )
    db.add(payment)
    await db.flush()

    return {
        "payment_intent_id": payment.stripe_payment_intent_id,
        "client_secret": f"mock_secret_{uuid.uuid4().hex[:16]}",
        "payment_id": str(payment.id),
        "mock": True,
    }

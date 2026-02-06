"""Stripe webhook handler for real-time payment event processing."""

import logging

import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.engine import get_db
from app.models.event import Event
from app.models.payment import Payment

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    stripe_signature: str | None = Header(None, alias="Stripe-Signature"),
) -> dict:
    """Handle Stripe webhook events.

    Processes:
    - payment_intent.succeeded — marks payment as completed, upgrades event status
    - payment_intent.payment_failed — marks payment as failed
    - charge.refunded — marks payment as refunded
    - transfer.created — logs transfer confirmation
    """
    payload = await request.body()

    if not settings.STRIPE_WEBHOOK_SECRET:
        logger.warning("Stripe webhook secret not configured — skipping signature verification")
        event = stripe.Event.construct_from(
            values=stripe.util.json.loads(payload),
            key=settings.STRIPE_SECRET_KEY or "",
        )
    else:
        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=stripe_signature or "",
                secret=settings.STRIPE_WEBHOOK_SECRET,
            )
        except stripe.SignatureVerificationError:
            logger.error("Stripe webhook signature verification failed")
            raise HTTPException(status_code=400, detail="Invalid signature")
        except ValueError:
            logger.error("Stripe webhook payload invalid")
            raise HTTPException(status_code=400, detail="Invalid payload")

    event_type = event.get("type", "")
    data_object = event.get("data", {}).get("object", {})

    logger.info("Stripe webhook received: %s", event_type)

    if event_type == "payment_intent.succeeded":
        await _handle_payment_succeeded(db, data_object)
    elif event_type == "payment_intent.payment_failed":
        await _handle_payment_failed(db, data_object)
    elif event_type == "charge.refunded":
        await _handle_charge_refunded(db, data_object)
    elif event_type == "transfer.created":
        await _handle_transfer_created(db, data_object)
    else:
        logger.info("Unhandled Stripe event type: %s", event_type)

    return {"received": True}


async def _handle_payment_succeeded(db: AsyncSession, data: dict) -> None:
    """PaymentIntent succeeded — mark payment completed, update event status."""
    payment_intent_id = data.get("id", "")

    result = await db.execute(
        select(Payment).where(Payment.stripe_payment_intent_id == payment_intent_id)
    )
    payment = result.scalar_one_or_none()

    if payment is None:
        logger.warning("Payment not found for intent %s", payment_intent_id)
        return

    payment.status = "completed"

    # If this is the event total payment, upgrade event from planning to confirmed
    if payment.payment_type == "event_total":
        event_result = await db.execute(
            select(Event).where(Event.id == payment.event_id)
        )
        event = event_result.scalar_one_or_none()
        if event and event.status == "planning":
            event.status = "confirmed"
            logger.info("Event %s confirmed via payment %s", event.id, payment_intent_id)

    logger.info("Payment %s marked as completed", payment_intent_id)


async def _handle_payment_failed(db: AsyncSession, data: dict) -> None:
    """PaymentIntent failed — mark payment as failed."""
    payment_intent_id = data.get("id", "")

    result = await db.execute(
        select(Payment).where(Payment.stripe_payment_intent_id == payment_intent_id)
    )
    payment = result.scalar_one_or_none()

    if payment is None:
        logger.warning("Payment not found for failed intent %s", payment_intent_id)
        return

    payment.status = "failed"

    failure_message = data.get("last_payment_error", {}).get("message", "Unknown error")
    logger.info("Payment %s failed: %s", payment_intent_id, failure_message)


async def _handle_charge_refunded(db: AsyncSession, data: dict) -> None:
    """Charge refunded — update payment status if a full refund."""
    payment_intent_id = data.get("payment_intent", "")
    if not payment_intent_id:
        return

    result = await db.execute(
        select(Payment).where(Payment.stripe_payment_intent_id == payment_intent_id)
    )
    payment = result.scalar_one_or_none()

    if payment is None:
        logger.warning("Payment not found for refunded charge (intent %s)", payment_intent_id)
        return

    refunded = data.get("refunded", False)
    if refunded:
        payment.status = "refunded"
        logger.info("Payment %s fully refunded", payment_intent_id)


async def _handle_transfer_created(db: AsyncSession, data: dict) -> None:
    """Transfer created — log for audit purposes."""
    transfer_id = data.get("id", "")
    amount = data.get("amount", 0) / 100  # cents → dollars
    destination = data.get("destination", "")

    logger.info(
        "Transfer %s created: $%.2f to %s",
        transfer_id,
        amount,
        destination,
    )

"""Stripe Billing subscription service."""

import logging
import uuid
from datetime import UTC, date, datetime
from types import SimpleNamespace

import stripe
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.subscription import Subscription
from app.models.user import User
from app.services.audit_service import log_audit_event
from app.utils.exceptions import BadRequestError, ConfigurationError, NotFoundError

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

_SUBSCRIPTION_PLANS: dict[str, dict[str, object]] = {
    "basic": {"price_id": settings.STRIPE_PRICE_BASIC_ID, "iteration_limit": 25},
    "pro": {"price_id": settings.STRIPE_PRICE_PRO_ID, "iteration_limit": 100},
    "premium": {"price_id": settings.STRIPE_PRICE_PREMIUM_ID, "iteration_limit": 300},
}


def _require_stripe_billing_configured() -> None:
    if not settings.STRIPE_SECRET_KEY:
        raise ConfigurationError("Stripe secret key is required for subscription billing")


def _resolve_plan(plan_type: str) -> dict[str, object]:
    normalized = plan_type.strip().lower()
    plan = _SUBSCRIPTION_PLANS.get(normalized)
    if not plan:
        raise BadRequestError(f"Unsupported subscription plan: {plan_type}")
    if not plan["price_id"]:
        raise ConfigurationError(f"Stripe price id is not configured for plan: {normalized}")
    return plan


def _to_date(ts: int | None) -> date:
    if ts is None:
        return datetime.now(UTC).date()
    return datetime.fromtimestamp(ts, tz=UTC).date()


def _extract_subscription_period(stripe_subscription: object) -> tuple[date, date]:
    if isinstance(stripe_subscription, dict):
        period_start = stripe_subscription.get("current_period_start")
        period_end = stripe_subscription.get("current_period_end")
    else:
        period_start = getattr(stripe_subscription, "current_period_start", None)
        period_end = getattr(stripe_subscription, "current_period_end", None)
    return _to_date(period_start), _to_date(period_end)


async def _get_user(db: AsyncSession, user_id: uuid.UUID) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise NotFoundError("User not found")
    return user


async def _find_or_create_customer(user: User) -> str:
    if user.stripe_customer_id:
        return user.stripe_customer_id

    customer = stripe.Customer.create(
        email=user.email,
        metadata={"user_id": str(user.id), "platform": "strathwell"},
    )
    user.stripe_customer_id = customer.id
    return customer.id


async def list_user_subscriptions(db: AsyncSession, user_id: uuid.UUID) -> list[Subscription]:
    result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == user_id)
        .order_by(desc(Subscription.created_at))
    )
    return list(result.scalars().all())


async def start_subscription(
    db: AsyncSession,
    user_id: uuid.UUID,
    plan_type: str,
) -> dict:
    _require_stripe_billing_configured()
    plan = _resolve_plan(plan_type)
    user = await _get_user(db, user_id)

    customer_id = await _find_or_create_customer(user)

    stripe_subscription = stripe.Subscription.create(
        customer=customer_id,
        items=[{"price": str(plan["price_id"])}],
        payment_behavior="default_incomplete",
        expand=["latest_invoice.payment_intent"],
        metadata={"user_id": str(user.id), "plan_type": plan_type.lower()},
    )

    start_date, end_date = _extract_subscription_period(stripe_subscription)
    status = stripe_subscription.get("status", "incomplete")
    stripe_subscription_id = stripe_subscription.get("id")

    subscription = Subscription(
        user_id=user.id,
        plan_type=plan_type.lower(),
        iteration_limit=int(plan["iteration_limit"]),
        iterations_remaining=int(plan["iteration_limit"]),
        start_date=start_date,
        end_date=end_date,
        status=status,
        stripe_subscription_id=stripe_subscription_id,
    )
    db.add(subscription)
    await db.flush()

    await log_audit_event(
        db,
        action="subscription_start",
        actor_user_id=user.id,
        target_user_id=user.id,
        resource_type="subscription",
        resource_id=subscription.id,
        details={"plan_type": subscription.plan_type, "stripe_subscription_id": stripe_subscription_id},
    )

    latest_invoice = stripe_subscription.get("latest_invoice", {})
    if isinstance(latest_invoice, SimpleNamespace):
        payment_intent = getattr(latest_invoice, "payment_intent", None)
    elif isinstance(latest_invoice, dict):
        payment_intent = latest_invoice.get("payment_intent")
    else:
        payment_intent = getattr(latest_invoice, "payment_intent", None)
    client_secret = None
    if isinstance(payment_intent, dict):
        client_secret = payment_intent.get("client_secret")
    else:
        client_secret = getattr(payment_intent, "client_secret", None)

    logger.info(
        "Subscription started",
        extra={
            "user_id": str(user.id),
            "subscription_id": str(subscription.id),
            "plan_type": subscription.plan_type,
            "stripe_subscription_id": stripe_subscription_id,
        },
    )

    return {
        "success": True,
        "subscription_id": str(subscription.id),
        "stripe_subscription_id": stripe_subscription_id,
        "status": status,
        "client_secret": client_secret,
    }


async def cancel_subscription(
    db: AsyncSession,
    user_id: uuid.UUID,
    subscription_id: uuid.UUID | None = None,
) -> dict:
    _require_stripe_billing_configured()

    stmt = select(Subscription).where(Subscription.user_id == user_id)
    if subscription_id:
        stmt = stmt.where(Subscription.id == subscription_id)
    stmt = stmt.order_by(desc(Subscription.created_at))

    result = await db.execute(stmt)
    subscription = result.scalars().first()
    if subscription is None:
        raise NotFoundError("Subscription not found")

    if not subscription.stripe_subscription_id:
        raise BadRequestError("Subscription is missing Stripe subscription id")

    stripe_sub = stripe.Subscription.modify(
        subscription.stripe_subscription_id,
        cancel_at_period_end=True,
    )

    subscription.status = "cancel_at_period_end" if stripe_sub.get("cancel_at_period_end") else stripe_sub.get("status", "canceled")

    await log_audit_event(
        db,
        action="subscription_cancel",
        actor_user_id=user_id,
        target_user_id=user_id,
        resource_type="subscription",
        resource_id=subscription.id,
        details={"stripe_subscription_id": subscription.stripe_subscription_id, "status": subscription.status},
    )

    logger.info(
        "Subscription cancel requested",
        extra={
            "user_id": str(user_id),
            "subscription_id": str(subscription.id),
            "stripe_subscription_id": subscription.stripe_subscription_id,
        },
    )

    return {
        "success": True,
        "subscription_id": str(subscription.id),
        "status": subscription.status,
        "cancel_at_period_end": bool(stripe_sub.get("cancel_at_period_end")),
    }


async def sync_subscription(
    db: AsyncSession,
    stripe_subscription_id: str,
) -> dict:
    _require_stripe_billing_configured()

    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == stripe_subscription_id)
    )
    subscription = result.scalar_one_or_none()
    if subscription is None:
        raise NotFoundError("Subscription not found for Stripe id")

    stripe_sub = stripe.Subscription.retrieve(stripe_subscription_id)
    start_date, end_date = _extract_subscription_period(stripe_sub)
    subscription.status = stripe_sub.get("status", subscription.status)
    subscription.start_date = start_date
    subscription.end_date = end_date

    await log_audit_event(
        db,
        action="subscription_sync",
        actor_user_id=None,
        target_user_id=subscription.user_id,
        resource_type="subscription",
        resource_id=subscription.id,
        details={"stripe_subscription_id": stripe_subscription_id, "status": subscription.status},
    )

    logger.info(
        "Subscription synced from Stripe",
        extra={
            "subscription_id": str(subscription.id),
            "stripe_subscription_id": stripe_subscription_id,
            "status": subscription.status,
        },
    )

    return {
        "success": True,
        "subscription_id": str(subscription.id),
        "status": subscription.status,
        "stripe_subscription_id": stripe_subscription_id,
    }

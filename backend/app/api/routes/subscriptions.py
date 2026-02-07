"""Subscription billing routes."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.db.engine import get_db
from app.models.user import User
from app.services.subscription import stripe as stripe_subscription_service

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


class StartSubscriptionRequest(BaseModel):
    plan_type: str = Field(min_length=1)


class CancelSubscriptionRequest(BaseModel):
    subscription_id: uuid.UUID | None = None


@router.get("/me")
async def list_my_subscriptions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    subscriptions = await stripe_subscription_service.list_user_subscriptions(db, user.id)
    return {
        "success": True,
        "data": [
            {
                "id": str(s.id),
                "plan_type": s.plan_type,
                "status": s.status,
                "start_date": s.start_date.isoformat(),
                "end_date": s.end_date.isoformat(),
                "iteration_limit": s.iteration_limit,
                "iterations_remaining": s.iterations_remaining,
                "stripe_subscription_id": s.stripe_subscription_id,
            }
            for s in subscriptions
        ],
    }


@router.post("/start")
async def start_subscription(
    body: StartSubscriptionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await stripe_subscription_service.start_subscription(
        db=db,
        user_id=user.id,
        plan_type=body.plan_type,
    )


@router.post("/cancel")
async def cancel_subscription(
    body: CancelSubscriptionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await stripe_subscription_service.cancel_subscription(
        db=db,
        user_id=user.id,
        subscription_id=body.subscription_id,
    )


@router.post("/sync/{stripe_subscription_id}")
async def sync_subscription(
    stripe_subscription_id: str,
    _admin: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await stripe_subscription_service.sync_subscription(
        db=db,
        stripe_subscription_id=stripe_subscription_id,
    )

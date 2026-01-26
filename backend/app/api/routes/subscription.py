from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_authenticated
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import SubscriptionResponse
from app.services.subscription.manual import ManualSubscriptionService

router = APIRouter(tags=["subscription"])
manual_service = ManualSubscriptionService()


@router.get("/me/subscription", response_model=SubscriptionResponse)
def get_my_subscription(
    user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
) -> SubscriptionResponse:
    subscription = db.execute(
        select(Subscription).where(Subscription.user_id == user.id)
    ).scalar_one_or_none()
    if not subscription:
        subscription = manual_service.sync_subscription(db, user.id)

    return SubscriptionResponse(
        status=subscription.status,
        provider=subscription.provider,
        current_period_end=subscription.current_period_end,
    )


@router.post("/subscription/start", response_model=SubscriptionResponse)
def start_subscription(
    user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
) -> SubscriptionResponse:
    subscription = manual_service.start_subscription(db, user.id)
    return SubscriptionResponse(
        status=subscription.status,
        provider=subscription.provider,
        current_period_end=subscription.current_period_end,
    )


@router.post("/subscription/cancel", response_model=SubscriptionResponse)
def cancel_subscription(
    user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
) -> SubscriptionResponse:
    subscription = manual_service.cancel_subscription(db, user.id)
    return SubscriptionResponse(
        status=subscription.status,
        provider=subscription.provider,
        current_period_end=subscription.current_period_end,
    )

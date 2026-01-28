from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.core.errors import not_found
from app.models.enums import SubscriptionProvider, UserRole
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import AdminSubscriptionUpdate, SubscriptionResponse
from app.services.audit import log_admin_action
from app.utils.serialization import model_to_dict

router = APIRouter(prefix="/admin", tags=["admin-subscriptions"])


@router.post("/users/{user_id}/subscription/set", response_model=SubscriptionResponse)
def set_subscription_status(
    user_id: UUID,
    payload: AdminSubscriptionUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> SubscriptionResponse:
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        raise not_found("User not found")

    subscription = db.execute(
        select(Subscription).where(Subscription.user_id == user_id)
    ).scalar_one_or_none()

    before = {
        "user": model_to_dict(user),
        "subscription": model_to_dict(subscription),
    }

    if subscription is None:
        subscription = Subscription(
            user_id=user_id,
            provider=SubscriptionProvider.MANUAL,
            status=payload.status,
        )
        db.add(subscription)
    else:
        subscription.status = payload.status
        subscription.provider = SubscriptionProvider.MANUAL

    user.subscription_status = payload.status

    after = {
        "user": model_to_dict(user),
        "subscription": model_to_dict(subscription),
    }

    db.add(user)
    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_subscription_set",
        entity_type="user",
        entity_id=str(user_id),
        before_obj=before,
        after_obj=after,
    )
    db.commit()
    db.refresh(subscription)

    return SubscriptionResponse(
        status=subscription.status,
        provider=subscription.provider,
        current_period_end=subscription.current_period_end,
    )

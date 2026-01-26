from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.models.audit_log import AuditLog
from app.models.enums import SubscriptionProvider, UserRole
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import AdminSubscriptionUpdate, SubscriptionResponse

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    subscription = db.execute(
        select(Subscription).where(Subscription.user_id == user_id)
    ).scalar_one_or_none()

    before = {
        "subscription_status": user.subscription_status.value,
        "provider": subscription.provider.value if subscription else None,
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

    audit_log = AuditLog(
        actor_user_id=admin_user.id,
        action="admin_subscription_set",
        entity_type="user",
        entity_id=str(user_id),
        before_json=before,
        after_json={
            "subscription_status": payload.status.value,
            "provider": subscription.provider.value,
        },
    )

    db.add(user)
    db.add(audit_log)
    db.commit()
    db.refresh(subscription)

    return SubscriptionResponse(
        status=subscription.status,
        provider=subscription.provider,
        current_period_end=subscription.current_period_end,
    )

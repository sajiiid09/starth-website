from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import SubscriptionProvider, SubscriptionStatus
from app.models.subscription import Subscription
from app.models.user import User
from app.services.subscription.base import SubscriptionService


class ManualSubscriptionService(SubscriptionService):
    def start_subscription(self, db: Session, user_id: UUID) -> Subscription:
        subscription = self._get_or_create(db, user_id)
        subscription.provider = SubscriptionProvider.MANUAL
        subscription.status = SubscriptionStatus.ACTIVE
        subscription.current_period_end = datetime.now(timezone.utc) + timedelta(days=30)
        self._sync_user_status(db, user_id, subscription.status)
        db.commit()
        db.refresh(subscription)
        return subscription

    def cancel_subscription(self, db: Session, user_id: UUID) -> Subscription:
        subscription = self._get_or_create(db, user_id)
        subscription.status = SubscriptionStatus.CANCELED
        subscription.current_period_end = datetime.now(timezone.utc)
        self._sync_user_status(db, user_id, subscription.status)
        db.commit()
        db.refresh(subscription)
        return subscription

    def sync_subscription(self, db: Session, user_id: UUID) -> Subscription:
        subscription = self._get_or_create(db, user_id)
        self._sync_user_status(db, user_id, subscription.status)
        db.commit()
        db.refresh(subscription)
        return subscription

    def _get_or_create(self, db: Session, user_id: UUID) -> Subscription:
        subscription = db.execute(
            select(Subscription).where(Subscription.user_id == user_id)
        ).scalar_one_or_none()
        if subscription:
            return subscription

        subscription = Subscription(
            user_id=user_id,
            provider=SubscriptionProvider.MANUAL,
            status=SubscriptionStatus.TRIAL,
        )
        db.add(subscription)
        return subscription

    def _sync_user_status(
        self, db: Session, user_id: UUID, status: SubscriptionStatus
    ) -> None:
        user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
        if user:
            user.subscription_status = status
            db.add(user)

from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.subscription import Subscription
from app.services.subscription.base import SubscriptionService


class StripeSubscriptionService(SubscriptionService):
    def start_subscription(self, db: Session, user_id: UUID) -> Subscription:
        raise NotImplementedError("Stripe Billing integration not implemented yet")

    def cancel_subscription(self, db: Session, user_id: UUID) -> Subscription:
        raise NotImplementedError("Stripe Billing integration not implemented yet")

    def sync_subscription(self, db: Session, user_id: UUID) -> Subscription:
        raise NotImplementedError("Stripe Billing integration not implemented yet")

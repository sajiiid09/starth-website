from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.subscription import Subscription


class SubscriptionService(ABC):
    @abstractmethod
    def start_subscription(self, db: Session, user_id: UUID) -> Subscription:
        raise NotImplementedError

    @abstractmethod
    def cancel_subscription(self, db: Session, user_id: UUID) -> Subscription:
        raise NotImplementedError

    @abstractmethod
    def sync_subscription(self, db: Session, user_id: UUID) -> Subscription:
        raise NotImplementedError

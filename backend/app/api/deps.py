from __future__ import annotations

from typing import Generator
from uuid import UUID

from fastapi import Depends, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import APIError, forbidden
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.user import User
from app.models.enums import SubscriptionStatus, UserRole

bearer_scheme = HTTPBearer()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_access_token(credentials.credentials)
    except JWTError as exc:
        raise APIError(
            error_code="invalid_credentials",
            message="Invalid authentication credentials",
            status_code=status.HTTP_401_UNAUTHORIZED,
        ) from exc

    user_id = payload.get("sub")
    if not user_id:
        raise APIError(
            error_code="invalid_credentials",
            message="Invalid authentication credentials",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        user_uuid = UUID(str(user_id))
    except ValueError as exc:
        raise APIError(
            error_code="invalid_credentials",
            message="Invalid authentication credentials",
            status_code=status.HTTP_401_UNAUTHORIZED,
        ) from exc

    user = db.execute(select(User).where(User.id == user_uuid)).scalar_one_or_none()
    if not user or not user.is_active:
        raise APIError(
            error_code="invalid_credentials",
            message="Invalid authentication credentials",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    request.state.user = user
    return user


def require_authenticated(user: User = Depends(get_current_user)) -> User:
    return user


def require_role(role: UserRole):
    def _require_role(user: User = Depends(get_current_user)) -> User:
        if user.role != role:
            raise forbidden("Insufficient permissions")
        return user

    return _require_role


def require_subscription_active(
    user: User = Depends(get_current_user),
) -> User:
    allowed_statuses = {SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL}
    if user.subscription_status not in allowed_statuses:
        raise APIError(
            error_code="subscription_required",
            message="Active subscription required.",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    return user

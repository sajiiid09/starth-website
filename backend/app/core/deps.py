"""FastAPI dependencies for authentication and authorization."""

import secrets
import uuid

import jwt
from fastapi import Depends, Header, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_token
from app.db.engine import get_db
from app.models.user import User
from app.utils.exceptions import ForbiddenError, UnauthorizedError

SAFE_HTTP_METHODS = {"GET", "HEAD", "OPTIONS", "TRACE"}


def _allowed_browser_origins() -> set[str]:
    origins = {settings.FRONTEND_URL.rstrip("/")}
    if settings.ENVIRONMENT.lower() == "development":
        for port in ("3000", "5173", "5174"):
            origins.add(f"http://localhost:{port}")
    return origins


def _validate_csrf_for_browser_request(
    request: Request,
    payload: dict,
    csrf_header: str | None,
) -> None:
    """Enforce CSRF token checks for unsafe browser requests."""
    if request.method.upper() in SAFE_HTTP_METHODS:
        return

    request_origin = request.headers.get("origin")
    if not request_origin:
        # Non-browser clients generally don't send Origin.
        return

    if request_origin.rstrip("/") not in _allowed_browser_origins():
        raise ForbiddenError("Invalid request origin")

    csrf_claim = payload.get("csrf")
    if not isinstance(csrf_claim, str) or not csrf_claim:
        raise ForbiddenError("Missing CSRF claim in token")
    if not csrf_header:
        raise ForbiddenError("Missing X-CSRF-Token header")
    if not secrets.compare_digest(csrf_claim, csrf_header):
        raise ForbiddenError("Invalid CSRF token")


async def get_current_user(
    authorization: str | None = Header(None, alias="Authorization"),
    csrf_token: str | None = Header(None, alias="X-CSRF-Token"),
    request: Request | None = None,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and verify JWT from Authorization header, return the User."""
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedError("Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Token has expired")
    except jwt.PyJWTError:
        raise UnauthorizedError("Invalid token")

    if request is not None:
        _validate_csrf_for_browser_request(request, payload, csrf_token)

    user_id_str: str | None = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedError("Invalid token payload")

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedError("Invalid token subject")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise UnauthorizedError("User not found")

    return user


async def get_current_user_optional(
    authorization: str | None = Header(None, alias="Authorization"),
    csrf_token: str | None = Header(None, alias="X-CSRF-Token"),
    request: Request | None = None,
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Same as get_current_user but returns None if no token provided."""
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = decode_token(token)
    except jwt.PyJWTError:
        return None

    if request is not None:
        _validate_csrf_for_browser_request(request, payload, csrf_token)

    user_id_str: str | None = payload.get("sub")
    if not user_id_str:
        return None

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        return None

    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


def require_role(role: str):
    """Factory that returns a dependency requiring the user to have a specific role."""

    async def _check_role(user: User = Depends(get_current_user)) -> User:
        if user.role != role:
            raise ForbiddenError(f"Requires role: {role}")
        return user

    return _check_role

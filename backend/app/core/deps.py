"""FastAPI dependencies for authentication and authorization."""

import uuid

import jwt
from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_token
from app.db.engine import get_db
from app.models.user import User
from app.utils.exceptions import ForbiddenError, UnauthorizedError


async def get_current_user(
    authorization: str | None = Header(None, alias="Authorization"),
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

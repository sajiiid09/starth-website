"""Simple in-memory rate limiting helpers."""

import asyncio
import time
from collections import defaultdict, deque
from collections.abc import Awaitable, Callable

from fastapi import HTTPException, Request, status

from app.core.config import settings


class InMemoryRateLimiter:
    """Sliding-window in-memory limiter.

    For multi-instance production deployments, replace with Redis-based limiter.
    """

    def __init__(self) -> None:
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    async def hit(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        now = time.monotonic()

        async with self._lock:
            events = self._events[key]
            cutoff = now - window_seconds
            while events and events[0] <= cutoff:
                events.popleft()

            if len(events) >= limit:
                retry_after = max(1, int(window_seconds - (now - events[0])))
                return False, retry_after

            events.append(now)
            return True, 0


rate_limiter = InMemoryRateLimiter()


def build_rate_limit_dependency(
    *,
    scope: str,
    limit: int,
    window_seconds: int,
) -> Callable[[Request], Awaitable[None]]:
    """Create a reusable FastAPI dependency for path-specific rate limiting."""

    async def _dependency(request: Request) -> None:
        if not settings.RATE_LIMIT_ENABLED:
            return

        forwarded = request.headers.get("x-forwarded-for", "")
        forwarded_ip = forwarded.split(",")[0].strip() if forwarded else ""
        client_ip = forwarded_ip or (request.client.host if request.client else "unknown")

        identity = client_ip
        if request.method.upper() == "POST":
            try:
                body = await request.json()
                email = str(body.get("email", "")).strip().lower()
                if email:
                    identity = f"{identity}:{email}"
            except Exception:
                # Ignore body parse errors here; endpoint validation handles payload shape.
                pass

        key = f"{scope}:{request.url.path}:{identity}"
        allowed, retry_after = await rate_limiter.hit(
            key=key,
            limit=limit,
            window_seconds=window_seconds,
        )
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please retry later.",
                headers={"Retry-After": str(retry_after)},
            )

    return _dependency


auth_rate_limit = build_rate_limit_dependency(
    scope="auth",
    limit=settings.AUTH_RATE_LIMIT_REQUESTS,
    window_seconds=settings.AUTH_RATE_LIMIT_WINDOW_SECONDS,
)

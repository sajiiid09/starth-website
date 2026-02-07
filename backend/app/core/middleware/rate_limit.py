"""Path-rule-based rate limiting middleware."""

from dataclasses import dataclass

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.rate_limit import InMemoryRateLimiter


@dataclass(frozen=True)
class RateLimitRule:
    name: str
    path_prefixes: tuple[str, ...]
    methods: tuple[str, ...]
    limit: int
    window_seconds: int

    def matches(self, request: Request) -> bool:
        if request.method.upper() not in {m.upper() for m in self.methods}:
            return False
        path = request.url.path
        return any(path.startswith(prefix) for prefix in self.path_prefixes)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Apply rule-based rate limits to incoming HTTP requests."""

    def __init__(self, app, rules: list[RateLimitRule] | None = None) -> None:
        super().__init__(app)
        self.rules = rules or []
        self.limiter = InMemoryRateLimiter()

    async def dispatch(self, request: Request, call_next):
        if not settings.RATE_LIMIT_ENABLED or not self.rules:
            return await call_next(request)

        forwarded = request.headers.get("x-forwarded-for", "")
        forwarded_ip = forwarded.split(",")[0].strip() if forwarded else ""
        client_ip = forwarded_ip or (request.client.host if request.client else "unknown")

        for rule in self.rules:
            if not rule.matches(request):
                continue

            key = f"{rule.name}:{request.url.path}:{client_ip}"
            allowed, retry_after = await self.limiter.hit(
                key=key,
                limit=rule.limit,
                window_seconds=rule.window_seconds,
            )
            if not allowed:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please retry later."},
                    headers={"Retry-After": str(retry_after)},
                )

        return await call_next(request)

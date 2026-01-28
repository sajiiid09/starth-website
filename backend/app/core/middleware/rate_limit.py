from __future__ import annotations

import math
import time
from dataclasses import dataclass
from threading import Lock
from typing import Callable

from fastapi import Request
from fastapi.responses import JSONResponse
from jose import JWTError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.security import decode_access_token


@dataclass(frozen=True)
class RateLimitRule:
    method: str
    path_prefix: str
    path_suffix: str | None
    limit: int
    window_seconds: int
    identifier: str


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rules: list[RateLimitRule]) -> None:
        super().__init__(app)
        self.rules = rules
        self._lock = Lock()
        self._counters: dict[tuple[str, str], list[float]] = {}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        matched_rule = self._match_rule(request)
        if matched_rule:
            identifier = self._resolve_identifier(request, matched_rule.identifier)
            if self._is_rate_limited(matched_rule, identifier):
                retry_after = self._retry_after_seconds(matched_rule, identifier)
                return JSONResponse(
                    status_code=429,
                    headers={"Retry-After": str(retry_after)},
                    content={
                        "error": "rate_limited",
                        "message": "Too many requests.",
                        "details": {"retry_after_seconds": retry_after},
                    },
                )

        return await call_next(request)

    def _match_rule(self, request: Request) -> RateLimitRule | None:
        request_path = request.url.path
        request_method = request.method.upper()
        for rule in self.rules:
            if request_method != rule.method:
                continue
            if not request_path.startswith(rule.path_prefix):
                continue
            if rule.path_suffix and not request_path.endswith(rule.path_suffix):
                continue
            return rule
        return None

    def _resolve_identifier(self, request: Request, identifier_type: str) -> str:
        if identifier_type == "user_or_ip":
            return self._get_user_id(request) or self._get_client_ip(request)
        if identifier_type == "user":
            return self._get_user_id(request) or self._get_client_ip(request)
        return self._get_client_ip(request)

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client:
            return request.client.host
        return "unknown"

    def _get_user_id(self, request: Request) -> str | None:
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return None
        try:
            payload = decode_access_token(token)
        except JWTError:
            return None
        user_id = payload.get("sub")
        return str(user_id) if user_id else None

    def _is_rate_limited(self, rule: RateLimitRule, identifier: str) -> bool:
        now = time.time()
        suffix = rule.path_suffix or ""
        key = (f"{rule.method}:{rule.path_prefix}{suffix}", identifier)
        window_start = now - rule.window_seconds
        with self._lock:
            timestamps = self._counters.get(key, [])
            timestamps = [ts for ts in timestamps if ts >= window_start]
            if len(timestamps) >= rule.limit:
                self._counters[key] = timestamps
                return True
            timestamps.append(now)
            self._counters[key] = timestamps
        return False

    def _retry_after_seconds(self, rule: RateLimitRule, identifier: str) -> int:
        suffix = rule.path_suffix or ""
        key = (f"{rule.method}:{rule.path_prefix}{suffix}", identifier)
        now = time.time()
        with self._lock:
            timestamps = self._counters.get(key, [])
            if not timestamps:
                return rule.window_seconds
            oldest = min(timestamps)
        return max(1, math.ceil(rule.window_seconds - (now - oldest)))


def default_rate_limit_rules() -> list[RateLimitRule]:
    return [
        RateLimitRule("POST", "/auth/login", None, limit=5, window_seconds=60, identifier="ip"),
        RateLimitRule("POST", "/auth/signup", None, limit=3, window_seconds=60, identifier="ip"),
        RateLimitRule("POST", "/auth/refresh", None, limit=10, window_seconds=60, identifier="ip"),
        RateLimitRule("POST", "/bookings/", "/pay", limit=5, window_seconds=60, identifier="user_or_ip"),
        RateLimitRule("GET", "/planner", None, limit=20, window_seconds=60, identifier="user"),
    ]

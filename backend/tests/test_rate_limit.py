"""Rate limiting tests for auth request protection."""

import json
import uuid
from unittest import IsolatedAsyncioTestCase
from unittest.mock import patch

from fastapi import HTTPException, Request

from app.core.rate_limit import build_rate_limit_dependency


def _request(
    *,
    path: str,
    method: str = "POST",
    email: str = "user@example.com",
    forwarded_for: str = "203.0.113.7",
) -> Request:
    body = json.dumps({"email": email}).encode("utf-8")
    sent = False

    async def receive():
        nonlocal sent
        if sent:
            return {"type": "http.request", "body": b"", "more_body": False}
        sent = True
        return {"type": "http.request", "body": body, "more_body": False}

    scope = {
        "type": "http",
        "http_version": "1.1",
        "method": method,
        "scheme": "http",
        "path": path,
        "query_string": b"",
        "headers": [
            (b"content-type", b"application/json"),
            (b"x-forwarded-for", forwarded_for.encode("utf-8")),
        ],
        "client": (forwarded_for, 9000),
        "server": ("testserver", 80),
    }
    return Request(scope, receive)


class RateLimitTests(IsolatedAsyncioTestCase):
    async def test_rate_limit_blocks_after_threshold(self) -> None:
        scope = f"auth-test-{uuid.uuid4()}"
        dependency = build_rate_limit_dependency(scope=scope, limit=1, window_seconds=60)

        await dependency(_request(path="/api/auth/login"))

        with self.assertRaises(HTTPException) as exc:
            await dependency(_request(path="/api/auth/login"))

        self.assertEqual(exc.exception.status_code, 429)
        self.assertIn("too many requests", str(exc.exception.detail).lower())

    async def test_rate_limit_isolated_by_email_identity(self) -> None:
        scope = f"auth-test-{uuid.uuid4()}"
        dependency = build_rate_limit_dependency(scope=scope, limit=1, window_seconds=60)

        await dependency(_request(path="/api/auth/login", email="a@example.com"))
        await dependency(_request(path="/api/auth/login", email="b@example.com"))

    async def test_rate_limit_can_be_disabled(self) -> None:
        scope = f"auth-test-{uuid.uuid4()}"
        dependency = build_rate_limit_dependency(scope=scope, limit=1, window_seconds=60)

        with patch("app.core.rate_limit.settings.RATE_LIMIT_ENABLED", False):
            await dependency(_request(path="/api/auth/login"))
            await dependency(_request(path="/api/auth/login"))

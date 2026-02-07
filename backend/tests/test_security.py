"""Security tests for JWT secret validation and CSRF checks."""

import uuid
import sys
import types
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock, patch

from fastapi import Request

# Keep unit tests import-safe in environments where PyJWT isn't installed.
if "jwt" not in sys.modules:
    mock_jwt = types.ModuleType("jwt")

    class _PyJWTError(Exception):
        pass

    class _ExpiredSignatureError(_PyJWTError):
        pass

    mock_jwt.PyJWTError = _PyJWTError
    mock_jwt.ExpiredSignatureError = _ExpiredSignatureError
    mock_jwt.encode = lambda *args, **kwargs: "mock.token"
    mock_jwt.decode = lambda *args, **kwargs: {}
    sys.modules["jwt"] = mock_jwt

# Prevent DB engine initialization during dependency import.
mock_engine_module = types.ModuleType("app.db.engine")


async def _fake_get_db():
    return None


mock_engine_module.get_db = _fake_get_db
sys.modules["app.db.engine"] = mock_engine_module

from app.core.config import Settings
from app.core.deps import get_current_user
from app.utils.exceptions import ForbiddenError


def _result(value):
    result = Mock()
    result.scalar_one_or_none.return_value = value
    return result


def _request(method: str, origin: str | None = None) -> Request:
    headers = []
    if origin:
        headers.append((b"origin", origin.encode("utf-8")))
    scope = {
        "type": "http",
        "method": method,
        "path": "/api/auth/me",
        "headers": headers,
    }
    return Request(scope)


class SettingsSecurityTests(IsolatedAsyncioTestCase):
    async def test_production_rejects_default_secret_key(self) -> None:
        with self.assertRaises(ValueError):
            Settings(
                _env_file=None,
                ENVIRONMENT="production",
                SECRET_KEY="dev-secret-key-change-in-production-min-32-chars",
            )

    async def test_production_rejects_short_secret_key(self) -> None:
        with self.assertRaises(ValueError):
            Settings(
                _env_file=None,
                ENVIRONMENT="production",
                SECRET_KEY="short-secret",
            )

    async def test_production_accepts_strong_secret_key(self) -> None:
        settings = Settings(
            _env_file=None,
            ENVIRONMENT="production",
            SECRET_KEY="this-is-a-very-strong-secret-key-with-32-plus-length",
        )
        self.assertTrue(len(settings.SECRET_KEY) >= 32)


class CsrfDependencyTests(IsolatedAsyncioTestCase):
    async def test_unsafe_browser_request_requires_csrf_header(self) -> None:
        user = SimpleNamespace(id=uuid.uuid4())
        db = AsyncMock()
        db.execute = AsyncMock(return_value=_result(user))

        with patch("app.core.deps.decode_token", return_value={"sub": str(user.id), "csrf": "abc123"}):
            with self.assertRaises(ForbiddenError):
                await get_current_user(
                    authorization="Bearer token",
                    csrf_token=None,
                    request=_request("POST", origin="http://localhost:5173"),
                    db=db,
                )

    async def test_unsafe_browser_request_rejects_csrf_mismatch(self) -> None:
        user = SimpleNamespace(id=uuid.uuid4())
        db = AsyncMock()
        db.execute = AsyncMock(return_value=_result(user))

        with patch("app.core.deps.decode_token", return_value={"sub": str(user.id), "csrf": "abc123"}):
            with self.assertRaises(ForbiddenError):
                await get_current_user(
                    authorization="Bearer token",
                    csrf_token="wrong",
                    request=_request("POST", origin="http://localhost:5173"),
                    db=db,
                )

    async def test_unsafe_browser_request_accepts_matching_csrf(self) -> None:
        user = SimpleNamespace(id=uuid.uuid4())
        db = AsyncMock()
        db.execute = AsyncMock(return_value=_result(user))

        with patch("app.core.deps.decode_token", return_value={"sub": str(user.id), "csrf": "abc123"}):
            resolved_user = await get_current_user(
                authorization="Bearer token",
                csrf_token="abc123",
                request=_request("POST", origin="http://localhost:5173"),
                db=db,
            )

        self.assertEqual(resolved_user.id, user.id)

    async def test_safe_method_does_not_require_csrf_header(self) -> None:
        user = SimpleNamespace(id=uuid.uuid4())
        db = AsyncMock()
        db.execute = AsyncMock(return_value=_result(user))

        with patch("app.core.deps.decode_token", return_value={"sub": str(user.id), "csrf": "abc123"}):
            resolved_user = await get_current_user(
                authorization="Bearer token",
                csrf_token=None,
                request=_request("GET", origin="http://localhost:5173"),
                db=db,
            )

        self.assertEqual(resolved_user.id, user.id)

    async def test_non_browser_request_skips_csrf_check(self) -> None:
        user = SimpleNamespace(id=uuid.uuid4())
        db = AsyncMock()
        db.execute = AsyncMock(return_value=_result(user))

        with patch("app.core.deps.decode_token", return_value={"sub": str(user.id), "csrf": "abc123"}):
            resolved_user = await get_current_user(
                authorization="Bearer token",
                csrf_token=None,
                request=_request("POST", origin=None),
                db=db,
            )

        self.assertEqual(resolved_user.id, user.id)

    async def test_cookie_token_is_accepted_without_authorization_header(self) -> None:
        user = SimpleNamespace(id=uuid.uuid4())
        db = AsyncMock()
        db.execute = AsyncMock(return_value=_result(user))

        scope = {
            "type": "http",
            "method": "GET",
            "path": "/api/auth/me",
            "headers": [
                (b"origin", b"http://localhost:5173"),
                (b"cookie", b"access_token=cookie-token"),
            ],
        }
        request = Request(scope)

        with patch("app.core.deps.decode_token", return_value={"sub": str(user.id), "csrf": "abc123"}):
            resolved_user = await get_current_user(
                authorization=None,
                csrf_token=None,
                request=request,
                db=db,
            )

        self.assertEqual(resolved_user.id, user.id)

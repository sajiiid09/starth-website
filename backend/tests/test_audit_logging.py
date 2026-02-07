"""Tests for audit logging integrations."""

import uuid
import sys
import types
import importlib.metadata as importlib_metadata
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock, patch

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

# Keep auth schema imports safe when optional email-validator dependency is absent.
if "email_validator" not in sys.modules:
    mock_email_validator = types.ModuleType("email_validator")

    class _EmailNotValidError(ValueError):
        pass

    def _validate_email(email, *args, **kwargs):
        if "@" not in email:
            raise _EmailNotValidError("invalid email")
        return SimpleNamespace(email=email, normalized=email)

    mock_email_validator.EmailNotValidError = _EmailNotValidError
    mock_email_validator.validate_email = _validate_email
    sys.modules["email_validator"] = mock_email_validator

    _real_version = importlib_metadata.version

    def _version_with_email_validator(package: str) -> str:
        if package == "email-validator":
            return "2.0.0"
        return _real_version(package)

    importlib_metadata.version = _version_with_email_validator

from app.models.audit_log import AuditLog
from app.services import audit_service
from app.services import auth_service


def _result(value):
    result = Mock()
    result.scalar_one_or_none.return_value = value
    return result


class AuditLoggingTests(IsolatedAsyncioTestCase):
    async def test_reset_password_writes_audit_log(self) -> None:
        user_id = uuid.uuid4()
        user = SimpleNamespace(
            id=user_id,
            email="user@example.com",
            otp_code="123456",
            otp_expiry=datetime.now(timezone.utc) + timedelta(minutes=10),
            password_hash="old_hash",
        )
        db = Mock()
        db.execute = AsyncMock(return_value=_result(user))
        db.flush = AsyncMock()

        payload = SimpleNamespace(
            email="user@example.com",
            otp_code="123456",
            new_password="new-password-123",
        )

        with (
            patch.object(auth_service, "hash_password", return_value="new_hash"),
            patch.object(auth_service, "log_audit_event", AsyncMock()) as mock_audit,
        ):
            await auth_service.reset_password(db=db, payload=payload)

        self.assertEqual(user.password_hash, "new_hash")
        self.assertIsNone(user.otp_code)
        self.assertIsNone(user.otp_expiry)
        mock_audit.assert_awaited_once()
        self.assertEqual(mock_audit.await_args.kwargs["action"], "password_reset")
        self.assertEqual(mock_audit.await_args.kwargs["actor_user_id"], user_id)
        self.assertEqual(mock_audit.await_args.kwargs["resource_type"], "user")

    async def test_log_audit_event_adds_audit_log_model(self) -> None:
        db = Mock()
        db.add = Mock()

        await audit_service.log_audit_event(
            db=db,
            action="password_reset",
            actor_user_id=uuid.uuid4(),
            target_user_id=uuid.uuid4(),
            resource_type="user",
            resource_id=uuid.uuid4(),
            details={"source": "unit-test"},
        )

        db.add.assert_called_once()
        self.assertIsInstance(db.add.call_args.args[0], AuditLog)

"""Authentication business logic."""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_otp,
    hash_password,
    otp_expiry,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserRead,
    VerifyEmailRequest,
    VerifyEmailResponse,
)
from app.services.email_service import send_otp_email, send_password_reset_email
from app.utils.exceptions import BadRequestError, ConflictError, UnauthorizedError

# Roles that users are allowed to self-assign during registration.
# "admin" is intentionally excluded — admins must be created via seed or DB.
ALLOWED_REGISTRATION_ROLES = {"user", "venue_owner", "service_provider"}


def _user_to_read(user: User) -> UserRead:
    """Convert a User ORM instance to a UserRead schema."""
    return UserRead(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        roles=[user.role],
        is_verified=user.is_verified,
        created_at=user.created_at,
    )


async def register_user(db: AsyncSession, payload: RegisterRequest) -> TokenResponse:
    """Create a new user, send OTP email, return tokens."""
    # Validate role against whitelist (prevent admin self-registration)
    if payload.role not in ALLOWED_REGISTRATION_ROLES:
        raise BadRequestError(f"Invalid role: {payload.role}")

    # Check for existing user
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none() is not None:
        raise ConflictError("A user with this email already exists")

    # Derive first_name / last_name from full_name if provided
    first_name = payload.first_name
    last_name = payload.last_name
    if not first_name and payload.full_name:
        parts = payload.full_name.strip().split(None, 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else None

    otp = generate_otp()

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=first_name,
        last_name=last_name,
        role=payload.role,
        otp_code=otp,
        otp_expiry=otp_expiry(),
    )
    db.add(user)
    await db.flush()

    # Send OTP email (non-blocking failure is OK in dev)
    await send_otp_email(user.email, otp)

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_to_read(user),
    )


async def login_user(db: AsyncSession, payload: LoginRequest) -> TokenResponse:
    """Verify credentials and return tokens."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise UnauthorizedError("Invalid email or password")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_to_read(user),
    )


async def verify_email_otp(
    db: AsyncSession,
    payload: VerifyEmailRequest,
) -> VerifyEmailResponse:
    """Verify OTP code and mark user email as verified."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is None:
        raise BadRequestError("User not found")

    if user.is_verified:
        return VerifyEmailResponse(
            already_verified=True,
            message="Email is already verified",
            email=user.email,
        )

    if user.otp_code != payload.otp_code:
        raise BadRequestError("Invalid OTP code")

    if user.otp_expiry and user.otp_expiry < datetime.now(timezone.utc):
        raise BadRequestError("OTP code has expired")

    user.is_verified = True
    user.otp_code = None
    user.otp_expiry = None
    await db.flush()

    return VerifyEmailResponse(
        message="Email verified successfully",
        email=user.email,
    )


async def send_forgot_password_otp(db: AsyncSession, email: str) -> None:
    """Generate an OTP and email it so the user can reset their password."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        # Silently return to avoid leaking whether the email exists.
        return

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expiry = otp_expiry()
    await db.flush()

    await send_password_reset_email(user.email, otp)


async def reset_password(
    db: AsyncSession,
    payload: ResetPasswordRequest,
) -> None:
    """Verify OTP and update the user's password."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is None:
        raise BadRequestError("User not found")

    if user.otp_code != payload.otp_code:
        raise BadRequestError("Invalid OTP code")

    if user.otp_expiry and user.otp_expiry < datetime.now(timezone.utc):
        raise BadRequestError("OTP code has expired")

    user.password_hash = hash_password(payload.new_password)
    user.otp_code = None
    user.otp_expiry = None
    await db.flush()

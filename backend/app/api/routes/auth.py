"""Auth router — all /api/auth/* endpoints matching the frontend contract."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.engine import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LogoutResponse,
    RegisterRequest,
    ResetPasswordRequest,
    ResetPasswordResponse,
    TokenResponse,
    UserRead,
    UserUpdate,
    VerifyEmailRequest,
    VerifyEmailResponse,
)
from app.services.auth_service import (
    login_user,
    register_user,
    reset_password,
    send_forgot_password_otp,
    verify_email_otp,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Registration (both /signup and /register hit the same logic)
# ---------------------------------------------------------------------------


@router.post("/signup", response_model=TokenResponse)
async def signup(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await register_user(db, payload)


@router.post("/register", response_model=TokenResponse)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await register_user(db, payload)


# ---------------------------------------------------------------------------
# Login / Logout
# ---------------------------------------------------------------------------


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await login_user(db, payload)


@router.post("/logout", response_model=LogoutResponse)
async def logout() -> LogoutResponse:
    # Stateless JWT — nothing to invalidate server-side
    return LogoutResponse()


# ---------------------------------------------------------------------------
# Current user
# ---------------------------------------------------------------------------


@router.get("/me", response_model=UserRead)
async def get_me(user: User = Depends(get_current_user)) -> UserRead:
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


@router.put("/me", response_model=UserRead)
async def update_me(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    if payload.first_name is not None:
        user.first_name = payload.first_name
    if payload.last_name is not None:
        user.last_name = payload.last_name
    await db.flush()

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


# ---------------------------------------------------------------------------
# Email verification & password reset
# ---------------------------------------------------------------------------


@router.post("/verify-email", response_model=VerifyEmailResponse)
async def verify_email(
    payload: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
) -> VerifyEmailResponse:
    return await verify_email_otp(db, payload)


@router.post("/forgot-password", response_model=ResetPasswordResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> ResetPasswordResponse:
    """Send a password-reset OTP to the user's email."""
    await send_forgot_password_otp(db, payload.email)
    # Always return success to avoid leaking whether the email exists.
    return ResetPasswordResponse()


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_pwd(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> ResetPasswordResponse:
    await reset_password(db, payload)
    return ResetPasswordResponse()

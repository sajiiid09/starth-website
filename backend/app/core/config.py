"""Application configuration loaded from environment variables."""

import secrets

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

INSECURE_SECRET_KEYS = {
    "",
    "dev-secret-key-change-in-production-min-32-chars",
    "change-me-to-a-random-string-at-least-32-chars-long",
}


class Settings(BaseSettings):
    """Central configuration. Values come from .env or environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://strathwell:strathwell_dev@localhost:5432/strathwell"

    # ── JWT ──────────────────────────────────────────────────────────────
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Email / SMTP ────────────────────────────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@strathwell.com"
    SMTP_FROM_NAME: str = "Strathwell"

    # ── Cloudinary ──────────────────────────────────────────────────────
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # ── Stripe ──────────────────────────────────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PLATFORM_COMMISSION: float = 0.10
    STRIPE_PRICE_BASIC_ID: str = ""
    STRIPE_PRICE_PRO_ID: str = ""
    STRIPE_PRICE_PREMIUM_ID: str = ""

    # ── NVIDIA NeMo ─────────────────────────────────────────────────────
    NVIDIA_API_KEY: str = ""
    NVIDIA_API_BASE: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_MODEL: str = "nemotron-3-nano-30b-a3b"

    # ── Google Imagen ───────────────────────────────────────────────────
    GOOGLE_API_KEY: str = ""
    GOOGLE_PROJECT_ID: str = ""
    IMAGEN_MODEL: str = "imagegeneration@006"

    # ── Sentry (monitoring) ──────────────────────────────────────────────
    SENTRY_DSN: str = ""

    # ── Frontend ────────────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"

    # ── Database pool ───────────────────────────────────────────────────
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    # ── Rate limiting ───────────────────────────────────────────────────
    RATE_LIMIT_ENABLED: bool = True
    AUTH_RATE_LIMIT_REQUESTS: int = 10
    AUTH_RATE_LIMIT_WINDOW_SECONDS: int = 60
    API_RATE_LIMIT_REQUESTS: int = 120
    API_RATE_LIMIT_WINDOW_SECONDS: int = 60

    # ── Gunicorn / runtime ──────────────────────────────────────────────
    GUNICORN_WORKERS: int = 4
    GUNICORN_TIMEOUT: int = 60

    # ── Misc ────────────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    @model_validator(mode="after")
    def validate_security_settings(self) -> "Settings":
        is_production = self.ENVIRONMENT.lower() == "production"

        if not self.SECRET_KEY:
            if is_production:
                raise ValueError("SECRET_KEY must be set in production")
            # Avoid a hardcoded dev JWT secret when .env is missing.
            self.SECRET_KEY = secrets.token_urlsafe(64)

        if is_production:
            if self.SECRET_KEY in INSECURE_SECRET_KEYS:
                raise ValueError("SECRET_KEY must not use default/insecure values in production")
            if len(self.SECRET_KEY) < 32:
                raise ValueError("SECRET_KEY must be at least 32 characters in production")

        return self

    @property
    def is_dev(self) -> bool:
        return self.ENVIRONMENT == "development"


settings = Settings()

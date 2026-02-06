"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


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
    SECRET_KEY: str = "dev-secret-key-change-in-production-min-32-chars"
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

    # ── Misc ────────────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    @property
    def is_dev(self) -> bool:
        return self.ENVIRONMENT == "development"


settings = Settings()

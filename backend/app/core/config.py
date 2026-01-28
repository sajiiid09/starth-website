from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    app_env: str = Field(default="local", alias="APP_ENV")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    sentry_dsn: str | None = Field(default=None, alias="SENTRY_DSN")
    database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/strathwell",
        alias="DATABASE_URL",
    )
    jwt_secret: str = Field(default="", alias="JWT_SECRET")
    cors_origins: str = Field(default="", alias="CORS_ORIGINS")
    stripe_secret_key: str = Field(default="", alias="STRIPE_SECRET_KEY")
    stripe_webhook_secret: str = Field(default="", alias="STRIPE_WEBHOOK_SECRET")
    booking_deposit_percent: float = Field(default=0.30, alias="BOOKING_DEPOSIT_PERCENT")
    platform_commission_percent: float = Field(
        default=0.10, alias="PLATFORM_COMMISSION_PERCENT"
    )
    reservation_release_percent: float = Field(
        default=0.50, alias="RESERVATION_RELEASE_PERCENT"
    )
    enable_demo_ops: bool = Field(default=False, alias="ENABLE_DEMO_OPS")
    enable_admin_retry: bool = Field(default=False, alias="ENABLE_ADMIN_RETRY")
    read_only_mode: bool = Field(default=False, alias="READ_ONLY_MODE")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=15, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=14, alias="REFRESH_TOKEN_EXPIRE_DAYS")
    admin_bootstrap_token: str = Field(default="", alias="ADMIN_BOOTSTRAP_TOKEN")
    storage_provider: str = Field(default="s3", alias="STORAGE_PROVIDER")
    s3_region: str = Field(default="", alias="S3_REGION")
    s3_bucket: str = Field(default="", alias="S3_BUCKET")
    s3_access_key_id: str = Field(default="", alias="S3_ACCESS_KEY_ID")
    s3_secret_access_key: str = Field(default="", alias="S3_SECRET_ACCESS_KEY")
    s3_endpoint_url: str = Field(default="", alias="S3_ENDPOINT_URL")
    s3_public_base_url: str = Field(default="", alias="S3_PUBLIC_BASE_URL")
    upload_url_expire_seconds: int = Field(default=300, alias="UPLOAD_URL_EXPIRE_SECONDS")
    max_upload_bytes: int = Field(default=15_000_000, alias="MAX_UPLOAD_BYTES")
    allowed_upload_mime: str = Field(
        default="image/jpeg,image/png,image/webp,video/mp4,application/pdf,image/svg+xml",
        alias="ALLOWED_UPLOAD_MIME",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.cors_origins:
            return []
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def validate(self) -> None:
        if self.app_env != "prod":
            return

        required_vars = {
            "DATABASE_URL": self.database_url,
            "JWT_SECRET": self.jwt_secret,
            "STRIPE_SECRET_KEY": self.stripe_secret_key,
            "STRIPE_WEBHOOK_SECRET": self.stripe_webhook_secret,
        }
        for name, value in required_vars.items():
            if not value:
                raise RuntimeError(f"Missing required configuration: {name}")

        if self.storage_provider == "s3":
            s3_required = {
                "S3_BUCKET": self.s3_bucket,
                "S3_ACCESS_KEY_ID": self.s3_access_key_id,
                "S3_SECRET_ACCESS_KEY": self.s3_secret_access_key,
            }
            for name, value in s3_required.items():
                if not value:
                    raise RuntimeError(f"Missing required configuration: {name}")

        if self.cors_origins.strip() == "*" or "*" in self.cors_origins_list:
            raise RuntimeError("CORS_ORIGINS must be an explicit allowlist in production.")

        if self.access_token_expire_minutes <= 0 or self.refresh_token_expire_days <= 0:
            raise RuntimeError("Token expiration settings must be greater than zero.")

        if self.upload_url_expire_seconds <= 0 or self.upload_url_expire_seconds > 600:
            raise RuntimeError("UPLOAD_URL_EXPIRE_SECONDS must be between 1 and 600.")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

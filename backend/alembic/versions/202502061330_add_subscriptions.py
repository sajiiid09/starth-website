"""add subscriptions

Revision ID: 202502061330
Revises: 202502061230
Create Date: 2025-02-06 13:30:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "202502061330"
down_revision = "202502061230"
branch_labels = None
depends_on = None


def upgrade() -> None:
    subscription_provider = postgresql.ENUM("stripe", "manual", name="subscription_provider")
    subscription_provider.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "provider",
            sa.Enum("stripe", "manual", name="subscription_provider"),
            nullable=False,
            server_default="manual",
        ),
        sa.Column("provider_subscription_id", sa.String(length=255), nullable=True),
        sa.Column(
            "status",
            sa.Enum("trial", "active", "past_due", "canceled", name="subscription_status"),
            nullable=False,
        ),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("user_id", name="uq_subscriptions_user_id"),
    )


def downgrade() -> None:
    op.drop_table("subscriptions")
    op.execute("DROP TYPE IF EXISTS subscription_provider")

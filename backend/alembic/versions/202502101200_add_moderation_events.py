"""add moderation events

Revision ID: 202502101200
Revises: 202502091200
Create Date: 2025-02-10 12:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "202502101200"
down_revision = "202502091200"
branch_labels = None
depends_on = None


def upgrade() -> None:
    moderation_event_kind = postgresql.ENUM(
        "warning", "soft_block", "hard_block", name="moderation_event_kind"
    )
    moderation_event_kind.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "moderation_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("booking_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "kind",
            sa.Enum(
                "warning", "soft_block", "hard_block", name="moderation_event_kind"
            ),
            nullable=False,
        ),
        sa.Column("reason", sa.String(length=255), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id", name="pk_moderation_events"),
    )


def downgrade() -> None:
    op.drop_table("moderation_events")
    moderation_event_kind = postgresql.ENUM(
        "warning", "soft_block", "hard_block", name="moderation_event_kind"
    )
    moderation_event_kind.drop(op.get_bind(), checkfirst=True)

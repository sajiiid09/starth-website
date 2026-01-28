"""add disputes

Revision ID: 202502101210
Revises: 202502101200
Create Date: 2025-02-10 12:10:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "202502101210"
down_revision = "202502101200"
branch_labels = None
depends_on = None


def upgrade() -> None:
    dispute_status = postgresql.ENUM(
        "open", "under_review", "resolved", "refunded", "adjusted", name="dispute_status"
    )
    dispute_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "disputes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("booking_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("opened_by_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reason", sa.String(length=255), nullable=False),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "open",
                "under_review",
                "resolved",
                "refunded",
                "adjusted",
                name="dispute_status",
            ),
            nullable=False,
            server_default="open",
        ),
        sa.Column("resolution_note", sa.Text(), nullable=True),
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
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"]),
        sa.ForeignKeyConstraint(["opened_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id", name="pk_disputes"),
    )


def downgrade() -> None:
    op.drop_table("disputes")
    dispute_status = postgresql.ENUM(
        "open", "under_review", "resolved", "refunded", "adjusted", name="dispute_status"
    )
    dispute_status.drop(op.get_bind(), checkfirst=True)

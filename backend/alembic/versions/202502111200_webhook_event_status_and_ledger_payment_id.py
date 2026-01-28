"""extend webhook events and ledger entries

Revision ID: 202502111200
Revises: 202502101210
Create Date: 2025-02-11 12:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "202502111200"
down_revision = "202502101210"
branch_labels = None
depends_on = None


def upgrade() -> None:
    webhook_provider = sa.Enum("stripe", name="webhook_provider")
    webhook_event_status = sa.Enum(
        "received", "processed", "failed", name="webhook_event_status"
    )
    webhook_provider.create(op.get_bind(), checkfirst=True)
    webhook_event_status.create(op.get_bind(), checkfirst=True)

    op.alter_column(
        "webhook_events",
        "provider",
        type_=webhook_provider,
        existing_type=sa.String(length=50),
        existing_nullable=False,
    )
    op.add_column(
        "webhook_events",
        sa.Column(
            "event_type",
            sa.String(length=255),
            nullable=False,
            server_default="unknown",
        ),
    )
    op.add_column(
        "webhook_events",
        sa.Column("payload_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column(
        "webhook_events",
        sa.Column(
            "status",
            webhook_event_status,
            nullable=False,
            server_default="received",
        ),
    )
    op.execute(
        "UPDATE webhook_events SET status = 'processed' WHERE processed_at IS NOT NULL"
    )
    op.add_column(
        "webhook_events",
        sa.Column("error", sa.Text(), nullable=True),
    )
    op.create_index(
        "ix_webhook_events_status", "webhook_events", ["status"], unique=False
    )
    op.create_index(
        "ix_webhook_events_received_at", "webhook_events", ["received_at"], unique=False
    )

    op.add_column(
        "ledger_entries",
        sa.Column("payment_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_ledger_entries_payment_id",
        "ledger_entries",
        "payments",
        ["payment_id"],
        ["id"],
    )
    op.create_unique_constraint(
        "uq_ledger_entries_payment_type",
        "ledger_entries",
        ["payment_id", "type"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_ledger_entries_payment_type",
        "ledger_entries",
        type_="unique",
    )
    op.drop_constraint(
        "fk_ledger_entries_payment_id",
        "ledger_entries",
        type_="foreignkey",
    )
    op.drop_column("ledger_entries", "payment_id")

    op.drop_index("ix_webhook_events_received_at", table_name="webhook_events")
    op.drop_index("ix_webhook_events_status", table_name="webhook_events")
    op.drop_column("webhook_events", "error")
    op.drop_column("webhook_events", "status")
    op.drop_column("webhook_events", "payload_json")
    op.drop_column("webhook_events", "event_type")
    op.alter_column(
        "webhook_events",
        "provider",
        type_=sa.String(length=50),
        existing_nullable=False,
    )
    sa.Enum(name="webhook_event_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="webhook_provider").drop(op.get_bind(), checkfirst=True)

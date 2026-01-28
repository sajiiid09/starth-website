"""add payout_id to ledger entries

Revision ID: 202502121200
Revises: 202502111200
Create Date: 2025-02-12 12:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "202502121200"
down_revision = "202502111200"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "ledger_entries",
        sa.Column("payout_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_ledger_entries_payout_id",
        "ledger_entries",
        "payouts",
        ["payout_id"],
        ["id"],
    )
    op.create_unique_constraint(
        "uq_ledger_entries_payout_type",
        "ledger_entries",
        ["payout_id", "type"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_ledger_entries_payout_type",
        "ledger_entries",
        type_="unique",
    )
    op.drop_constraint(
        "fk_ledger_entries_payout_id",
        "ledger_entries",
        type_="foreignkey",
    )
    op.drop_column("ledger_entries", "payout_id")

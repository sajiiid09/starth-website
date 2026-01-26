"""add payouts_created_at to payments

Revision ID: 202502091200
Revises: 202502081200
Create Date: 2025-02-09 12:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "202502091200"
down_revision = "202502081200"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("payments", sa.Column("payouts_created_at", sa.DateTime(timezone=True)))


def downgrade() -> None:
    op.drop_column("payments", "payouts_created_at")

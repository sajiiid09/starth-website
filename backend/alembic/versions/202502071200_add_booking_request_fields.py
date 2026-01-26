"""add booking request fields

Revision ID: 202502071200
Revises: 202502061430
Create Date: 2025-02-07 12:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "202502071200"
down_revision = "202502061430"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("bookings", sa.Column("notes", sa.Text(), nullable=True))
    op.add_column("bookings", sa.Column("requested_budget_cents", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("bookings", "requested_budget_cents")
    op.drop_column("bookings", "notes")

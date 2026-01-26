"""add vendor review note

Revision ID: 202502061430
Revises: 202502061330
Create Date: 2025-02-06 14:30:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "202502061430"
down_revision = "202502061330"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("vendors", sa.Column("review_note", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("vendors", "review_note")

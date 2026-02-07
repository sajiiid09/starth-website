"""add audit actor context

Revision ID: 202502141200
Revises: 202502131200
Create Date: 2025-02-14 12:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "202502141200"
down_revision = "202502131200"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("audit_logs", sa.Column("actor_ip", sa.String(length=64), nullable=True))
    op.add_column(
        "audit_logs",
        sa.Column("actor_user_agent", sa.String(length=512), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("audit_logs", "actor_user_agent")
    op.drop_column("audit_logs", "actor_ip")

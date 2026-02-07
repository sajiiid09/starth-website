"""add event service id to payments

Revision ID: 3c7b1eab42d1
Revises: 9f2d1c4b6e8a
Create Date: 2026-02-07 00:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3c7b1eab42d1"
down_revision: Union[str, Sequence[str], None] = "9f2d1c4b6e8a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add event-service linkage to payout records for idempotency."""
    op.add_column(
        "payments",
        sa.Column("event_service_id", sa.UUID(), nullable=True),
    )
    op.create_index(
        op.f("ix_payments_event_service_id"),
        "payments",
        ["event_service_id"],
        unique=False,
    )
    op.create_foreign_key(
        op.f("fk_payments_event_service_id_event_services"),
        "payments",
        "event_services",
        ["event_service_id"],
        ["id"],
    )
    op.create_unique_constraint(
        op.f("uq_payments_event_service_id"),
        "payments",
        ["event_service_id"],
    )


def downgrade() -> None:
    """Remove event-service linkage from payout records."""
    op.drop_constraint(op.f("uq_payments_event_service_id"), "payments", type_="unique")
    op.drop_constraint(
        op.f("fk_payments_event_service_id_event_services"),
        "payments",
        type_="foreignkey",
    )
    op.drop_index(op.f("ix_payments_event_service_id"), table_name="payments")
    op.drop_column("payments", "event_service_id")

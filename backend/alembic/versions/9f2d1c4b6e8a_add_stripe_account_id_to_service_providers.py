"""add stripe account id to service providers

Revision ID: 9f2d1c4b6e8a
Revises: 374639f26a3d
Create Date: 2026-02-07 00:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9f2d1c4b6e8a"
down_revision: Union[str, Sequence[str], None] = "374639f26a3d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add Stripe connected account id for provider payouts."""
    op.add_column(
        "service_providers",
        sa.Column("stripe_account_id", sa.String(length=255), nullable=True),
    )
    op.create_index(
        op.f("ix_service_providers_stripe_account_id"),
        "service_providers",
        ["stripe_account_id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove Stripe connected account id column."""
    op.drop_index(
        op.f("ix_service_providers_stripe_account_id"),
        table_name="service_providers",
    )
    op.drop_column("service_providers", "stripe_account_id")

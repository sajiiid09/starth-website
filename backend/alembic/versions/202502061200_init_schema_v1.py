"""init schema v1

Revision ID: 202502061200
Revises: 
Create Date: 2025-02-06 12:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "202502061200"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    user_role = postgresql.ENUM("organizer", "vendor", "admin", name="user_role")
    subscription_status = postgresql.ENUM(
        "trial", "active", "past_due", "canceled", name="subscription_status"
    )
    vendor_type = postgresql.ENUM(
        "venue_owner", "service_provider", name="vendor_type"
    )
    vendor_verification_status = postgresql.ENUM(
        "draft", "submitted", "approved", "needs_changes", name="vendor_verification_status"
    )
    booking_status = postgresql.ENUM(
        "draft",
        "awaiting_vendor_approval",
        "ready_for_payment",
        "paid",
        "in_progress",
        "completed",
        "canceled",
        name="booking_status",
    )
    booking_vendor_role = postgresql.ENUM("venue", "service", name="booking_vendor_role")
    booking_vendor_approval_status = postgresql.ENUM(
        "pending", "approved", "declined", "countered", name="booking_vendor_approval_status"
    )
    payment_provider = postgresql.ENUM("stripe", "paypal", "manual", name="payment_provider")
    payment_status = postgresql.ENUM(
        "pending", "paid", "failed", "refunded", name="payment_status"
    )
    ledger_entry_type = postgresql.ENUM(
        "held_funds", "platform_fee", "release", "payout", "refund", name="ledger_entry_type"
    )
    payout_milestone = postgresql.ENUM("reservation", "completion", name="payout_milestone")
    payout_status = postgresql.ENUM(
        "locked", "eligible", "paid", "reversed", "held", name="payout_status"
    )

    user_role.create(op.get_bind(), checkfirst=True)
    subscription_status.create(op.get_bind(), checkfirst=True)
    vendor_type.create(op.get_bind(), checkfirst=True)
    vendor_verification_status.create(op.get_bind(), checkfirst=True)
    booking_status.create(op.get_bind(), checkfirst=True)
    booking_vendor_role.create(op.get_bind(), checkfirst=True)
    booking_vendor_approval_status.create(op.get_bind(), checkfirst=True)
    payment_provider.create(op.get_bind(), checkfirst=True)
    payment_status.create(op.get_bind(), checkfirst=True)
    ledger_entry_type.create(op.get_bind(), checkfirst=True)
    payout_milestone.create(op.get_bind(), checkfirst=True)
    payout_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("organizer", "vendor", "admin", name="user_role"),
            nullable=False,
            server_default="organizer",
        ),
        sa.Column(
            "subscription_status",
            sa.Enum("trial", "active", "past_due", "canceled", name="subscription_status"),
            nullable=False,
            server_default="trial",
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
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
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "templates",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("blueprint_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("est_cost_min", sa.Integer(), nullable=True),
        sa.Column("est_cost_max", sa.Integer(), nullable=True),
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
    )

    op.create_table(
        "vendors",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "vendor_type",
            sa.Enum("venue_owner", "service_provider", name="vendor_type"),
            nullable=False,
        ),
        sa.Column(
            "verification_status",
            sa.Enum(
                "draft",
                "submitted",
                "approved",
                "needs_changes",
                name="vendor_verification_status",
            ),
            nullable=False,
            server_default="draft",
        ),
        sa.Column(
            "payout_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
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
        sa.UniqueConstraint("user_id", name="uq_vendors_user_id"),
    )
    op.create_index("ix_vendors_user_id", "vendors", ["user_id"], unique=True)

    op.create_table(
        "venue_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "vendor_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("vendors.id"),
            nullable=False,
        ),
        sa.Column("venue_name", sa.String(length=255), nullable=False),
        sa.Column("location_text", sa.String(length=255), nullable=False),
        sa.Column("square_feet", sa.Integer(), nullable=True),
        sa.Column("capacity_comfortable", sa.Integer(), nullable=True),
        sa.Column("capacity_max", sa.Integer(), nullable=True),
        sa.Column("pricing_note", sa.Text(), nullable=True),
        sa.Column("assets_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
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
        sa.UniqueConstraint("vendor_id", name="uq_venue_profiles_vendor_id"),
    )

    op.create_table(
        "service_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "vendor_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("vendors.id"),
            nullable=False,
        ),
        sa.Column(
            "categories_json",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column(
            "service_areas_json",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column("pricing_note", sa.Text(), nullable=True),
        sa.Column("assets_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
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
        sa.UniqueConstraint("vendor_id", name="uq_service_profiles_vendor_id"),
    )

    op.create_table(
        "bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "organizer_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "template_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("templates.id"),
            nullable=True,
        ),
        sa.Column("event_date", sa.Date(), nullable=True),
        sa.Column("guest_count", sa.Integer(), nullable=True),
        sa.Column("location_text", sa.String(length=255), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "draft",
                "awaiting_vendor_approval",
                "ready_for_payment",
                "paid",
                "in_progress",
                "completed",
                "canceled",
                name="booking_status",
            ),
            nullable=False,
            server_default="draft",
        ),
        sa.Column(
            "total_gross_amount_cents",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="usd"),
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
    )
    op.create_index("ix_bookings_status", "bookings", ["status"], unique=False)
    op.create_index(
        "ix_bookings_organizer_user_id", "bookings", ["organizer_user_id"], unique=False
    )

    op.create_table(
        "booking_vendors",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "booking_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("bookings.id"),
            nullable=False,
        ),
        sa.Column(
            "vendor_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("vendors.id"),
            nullable=False,
        ),
        sa.Column(
            "role_in_booking",
            sa.Enum("venue", "service", name="booking_vendor_role"),
            nullable=False,
        ),
        sa.Column(
            "approval_status",
            sa.Enum(
                "pending",
                "approved",
                "declined",
                "countered",
                name="booking_vendor_approval_status",
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "agreed_amount_cents",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column("counter_note", sa.Text(), nullable=True),
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
        sa.UniqueConstraint("booking_id", "vendor_id", name="uq_booking_vendor"),
    )
    op.create_index(
        "ix_booking_vendors_booking_id", "booking_vendors", ["booking_id"], unique=False
    )

    op.create_table(
        "payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "booking_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("bookings.id"),
            nullable=False,
        ),
        sa.Column(
            "payer_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "provider",
            sa.Enum("stripe", "paypal", "manual", name="payment_provider"),
            nullable=False,
        ),
        sa.Column("provider_intent_id", sa.String(length=255), nullable=True),
        sa.Column(
            "status",
            sa.Enum("pending", "paid", "failed", "refunded", name="payment_status"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("amount_cents", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="usd"),
        sa.Column("idempotency_key", sa.String(length=255), nullable=True),
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
        sa.UniqueConstraint("idempotency_key", name="uq_payments_idempotency_key"),
    )

    op.create_table(
        "ledger_entries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "booking_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("bookings.id"),
            nullable=False,
        ),
        sa.Column(
            "booking_vendor_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("booking_vendors.id"),
            nullable=True,
        ),
        sa.Column(
            "type",
            sa.Enum(
                "held_funds",
                "platform_fee",
                "release",
                "payout",
                "refund",
                name="ledger_entry_type",
            ),
            nullable=False,
        ),
        sa.Column("amount_cents", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "payouts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "booking_vendor_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("booking_vendors.id"),
            nullable=False,
        ),
        sa.Column(
            "milestone",
            sa.Enum("reservation", "completion", name="payout_milestone"),
            nullable=False,
        ),
        sa.Column("amount_cents", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("locked", "eligible", "paid", "reversed", "held", name="payout_status"),
            nullable=False,
            server_default="locked",
        ),
        sa.Column(
            "admin_approved_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=True,
        ),
        sa.Column("provider_payout_id", sa.String(length=255), nullable=True),
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
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "actor_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column("action", sa.String(length=255), nullable=False),
        sa.Column("entity_type", sa.String(length=100), nullable=False),
        sa.Column("entity_id", sa.String(length=36), nullable=False),
        sa.Column("before_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("after_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("payouts")
    op.drop_table("ledger_entries")
    op.drop_table("payments")
    op.drop_index("ix_booking_vendors_booking_id", table_name="booking_vendors")
    op.drop_table("booking_vendors")
    op.drop_index("ix_bookings_organizer_user_id", table_name="bookings")
    op.drop_index("ix_bookings_status", table_name="bookings")
    op.drop_table("bookings")
    op.drop_table("service_profiles")
    op.drop_table("venue_profiles")
    op.drop_index("ix_vendors_user_id", table_name="vendors")
    op.drop_table("vendors")
    op.drop_table("templates")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS payout_status")
    op.execute("DROP TYPE IF EXISTS payout_milestone")
    op.execute("DROP TYPE IF EXISTS ledger_entry_type")
    op.execute("DROP TYPE IF EXISTS payment_status")
    op.execute("DROP TYPE IF EXISTS payment_provider")
    op.execute("DROP TYPE IF EXISTS booking_vendor_approval_status")
    op.execute("DROP TYPE IF EXISTS booking_vendor_role")
    op.execute("DROP TYPE IF EXISTS booking_status")
    op.execute("DROP TYPE IF EXISTS vendor_verification_status")
    op.execute("DROP TYPE IF EXISTS vendor_type")
    op.execute("DROP TYPE IF EXISTS subscription_status")
    op.execute("DROP TYPE IF EXISTS user_role")

# Strathwell Backend Development Documentation (Phases 1–12)

## 1) Overview
The Strathwell backend is a FastAPI service that powers organizer subscriptions, vendor onboarding, booking orchestration, payments, controlled payouts, and admin operations. It is designed for a marketplace flow where organizers request bookings, vendors approve/counter, payments are collected by the platform, and payouts are controlled by admin approval. Trust and dispute logging provide a minimal compliance and safety layer.

**Principles**
- Subscription-gated access for organizers.
- Deterministic booking and payout state transitions.
- Platform-held funds with explicit commission and payout milestones.
- Idempotent payment and webhook handling.
- Audit logs for all admin mutations.

## 2) Architecture
**Framework & Modules**
- FastAPI routes live under `app/api/routes/`, with `app/api/router.py` wiring all endpoints.
- Core service logic is organized under `app/services/` (bookings, payments, payouts, audit, storage).
- Schema validation lives under `app/schemas/`.

**Data Layer**
- PostgreSQL with SQLAlchemy models under `app/models/`.
- Alembic manages migrations (`backend/alembic/`).
- `app/db/session.py` provides session lifecycle.

**Integrations**
- Stripe (PaymentIntents + webhooks) for payments.
- S3-compatible storage for uploads.
- pgvector is planned for planner/RAG workflows (not implemented yet).

**Background Processing**
- Webhook processing is synchronous in API handlers for now. Long-running jobs are not yet required; future phases can add async workers.

## 3) Domain Models
### Core
- **User**: auth identity with subscription status.
- **RefreshToken**: persisted refresh token for session management.
- **Vendor**: vendor profile with type (venue/service) and verification status.
- **VenueProfile / ServiceProfile**: vendor profile data.
- **Template**: event blueprints and estimated costs.

### Booking & Vendor Assignment
- **Booking**: organizer request with `status`, totals, and metadata.
- **BookingVendor**: per-vendor approval status, role, and agreed pricing.

### Payments & Ledger
- **Payment**: payment intent metadata and status.
- **WebhookEvent**: Stripe event idempotency tracking.
- **LedgerEntry**: financial ledger entries (`held_funds`, `platform_fee`, `payout`).
- **Payout**: vendor payout records tied to booking vendors.

### Trust & Disputes
- **ModerationEvent**: logs trust warnings/blocks with sanitized excerpts.
- **Dispute**: dispute records tied to bookings.

### Audit
- **AuditLog**: centralized admin action logging with before/after snapshots.

## 4) State Machines
### Booking Status
`draft → awaiting_vendor_approval → ready_for_payment → paid → in_progress → completed`

### Booking Vendor Approval
`pending → approved / declined / countered`

### Payout Status
`locked → eligible → paid`
`held` and `reversed` are terminal admin outcomes.

### Dispute Status
`open → under_review → resolved/refunded/adjusted`

## 5) Key API Flows
### Auth
- Signup/login/refresh/logout routes produce JWT access tokens and refresh tokens.

### Subscription
- Organizer subscription start/cancel endpoints.
- Subscription status gates template detail and booking/payment flows.

### Templates
- Public list and subscription-gated detail.
- Admin CRUD for templates with audit logging.

### Vendor Onboarding
- Vendor onboarding endpoints for venue owners and service providers.
- Admin approval/needs-changes updates with audit logs.

### Uploads
- Presigned upload endpoint for S3-compatible storage.

### Booking Orchestration
- Organizer creates booking requests (venue required).
- Vendors approve/decline/counter; organizer can accept counters.
- Booking becomes `ready_for_payment` only when all vendors approved.

### Payments
- Organizer creates Stripe PaymentIntent once booking is ready.
- Stripe webhook updates payment + booking status.
- Webhook idempotency is tracked with `webhook_events`.

### Ledger, Commission, and Payouts
- On payment success, paid amount is allocated across vendors proportionally to agreed pricing.
- Platform commission (default 10%) is recorded per vendor allocation.
- Reservation and completion payouts are created and start `locked`.
- Vendors request reservation payouts (eligible), admins approve (paid).

### Admin Overview and Ops
- Admin overview endpoints for vendors/bookings/payments/payouts.
- Ops endpoints for health details and optional demo seeding (gated by env flag).

### Trust & Disputes
- Trust moderation event logging endpoint for off-platform prevention signals.
- Dispute creation endpoint for organizers/vendors.
- Admin dispute listing and status updates with audit logging.
- Dispute creation holds eligible payouts for safety.

## 6) Configuration / Environment Variables
- `APP_ENV`: runtime environment (local/staging/prod).
- `DATABASE_URL`: Postgres connection string.
- `JWT_SECRET`, `JWT_ALGORITHM`: auth token settings.
- `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`: token lifetimes.
- `ADMIN_BOOTSTRAP_TOKEN`: admin provisioning token.
- `CORS_ORIGINS`: comma-separated allowlist of allowed origins; prod forbids wildcard.
- `STORAGE_PROVIDER`, `S3_*`: object storage config.
- `UPLOAD_URL_EXPIRE_SECONDS`, `MAX_UPLOAD_BYTES`, `ALLOWED_UPLOAD_MIME`: upload rules.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: Stripe credentials.
- `BOOKING_DEPOSIT_PERCENT`: deposit percentage for payment intents.
- `PLATFORM_COMMISSION_PERCENT`: platform commission percent.
- `RESERVATION_RELEASE_PERCENT`: percent released for reservation payouts.
- `ENABLE_DEMO_OPS`: gate for admin demo seeding.
- `READ_ONLY_MODE`: block mutations for emergency read-only operation.

## 7) Operational Notes
- **Idempotency**:
  - Payment creation uses a caller-provided idempotency key.
  - Webhook processing uses `webhook_events` to avoid duplicate processing.
  - Payout creation is guarded by `payments.payouts_created_at`.
- **Audit Logging**:
  - All admin mutations are logged with before/after snapshots via `log_admin_action`.
- **Payout Semantics**:
  - "Paid" payouts are recorded in the database; actual provider transfers are deferred to Phase 13+.
- **Admin Safety**:
  - Some admin mutations require `X-Confirm-Action: true` to proceed (payout approvals, booking cancel/force-complete).
  - `READ_ONLY_MODE=true` blocks write endpoints except health and Stripe webhooks.

## 8) Development Phases Summary (1–12)
1. Core auth + user models.
2. Subscription scaffolding (manual + Stripe placeholders).
3. Vendor onboarding and admin vendor approvals.
4. Template authoring + public access.
5. Planner gating and access checks.
6. Refresh tokens and security hardening.
7. Object storage uploads and presign endpoints.
8. Booking orchestration with vendor approvals.
9. Stripe PaymentIntents + webhooks.
10. Ledger entries + commission + payouts with admin control.
11. Admin overview, ops endpoints, and audit hardening.
12. Trust layer (moderation events), disputes, and deployment readiness.

## 9) Future Enhancements
- Stripe Billing for subscriptions.
- Stripe Connect transfers for payouts.
- Second-payment handling for deposits and remaining balances.
- Planner/RAG endpoints with pgvector and background jobs.

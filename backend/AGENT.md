# Backend AGENT.md

## Current Phase
**Phase 12 — Trust Layer Basics + Disputes + Deploy Readiness + Documentation (Complete)**

## Decisions Made
- Uploads use S3-compatible presigned PUT URLs; backend stays stateless.
- Upload access is restricted by role: vendor for vendor assets, admin for template media.
- Template list remains public; template detail requires `trial` or `active` subscription.
- Booking requests always create vendor linkage rows with `pending` approvals.
- Booking readiness requires all included vendors to be `approved` before moving to `ready_for_payment`.
- Organizer rejection of a vendor counter marks that vendor as `declined` and keeps the booking in `awaiting_vendor_approval`.
- Payments are collected via Stripe PaymentIntents; booking must be `ready_for_payment`.
- Booking totals are derived from `booking_vendor.agreed_amount_cents`; payment blocks if any approved vendor has missing pricing.
- Webhook idempotency is handled via a `webhook_events` table keyed by Stripe event id.
- Platform commission is 10% of paid amounts and recorded per vendor allocation.
- Reservation and completion payouts are created on payment success and start `locked` until requested and approved.
- All admin mutations are logged via a centralized audit helper with before/after snapshots.
- Trust and dispute events are recorded for auditability and payout safety.

## Implemented Modules
- `app/services/storage/s3.py` — S3 presign logic and object key builder.
- `app/services/storage/validation.py` — MIME type and size validation.
- `app/api/routes/uploads.py` — Presigned upload endpoint.
- `app/schemas/uploads.py` — Upload request/response schemas.
- `app/api/routes/vendors.py` — Vendor self-service onboarding endpoints.
- `app/services/bookings_service.py` — Booking workflow orchestration and status recomputation.
- `app/api/routes/bookings.py` — Booking request, vendor actions, organizer accept, admin views.
- `app/schemas/bookings.py` — Booking request and action payloads.
- `app/services/payments/base.py` — Payment service interface.
- `app/services/payments/stripe.py` — Stripe implementation for PaymentIntents and webhook parsing.
- `app/services/bookings_pricing.py` — Booking total calculation rules.
- `app/api/routes/payments.py` — Booking payment intent creation.
- `app/api/routes/webhooks.py` — Stripe webhook handler for payment state sync.
- `app/schemas/payments.py` — Payment request/response payloads.
- `app/services/commission.py` — Commission calculation helper.
- `app/services/payouts/allocation.py` — Proportional payout allocation across vendors.
- `app/api/routes/vendor_payouts.py` — Vendor payout request/listing endpoints.
- `app/api/routes/admin_payouts.py` — Admin payout review endpoints.
- `app/services/audit.py` — Central admin audit logging helper.
- `app/utils/serialization.py` — Safe model serialization for audit snapshots.
- `app/api/routes/admin_overview.py` — Admin overview listings for vendors/bookings/payments/payouts.
- `app/api/routes/admin_ops.py` — Admin ops endpoints for health and demo seed.
- `app/api/routes/trust.py` — Trust moderation event logging + admin listing.
- `app/api/routes/disputes.py` — Dispute creation and admin resolution endpoints.
- `BACKEND_DEVELOPMENT_DOCUMENTATION.md` — Full backend phase documentation.

## Known Issues / Risks
- Storage credentials must be provided via env vars; presign fails without S3 config.
- Vendor `display_name` uses user email until profile fields are added.

## Next Phase Checklist (Phase 13 — Planned)
- Implement actual payout transfers (Stripe Connect).
- Add second-payment handling for deposit + remaining balance.
- Expand reporting and reconciliation views.

## Production Hardening Roadmap
- **Phase 1 — Observability Baseline + Consistent Errors (Complete)**
  - Request correlation ID: every response includes `X-Request-ID`; incoming header is honored or a UUIDv4 is generated.
  - Structured JSON logging: one line per request with `timestamp`, `level`, `request_id`, `method`, `path`, `status`, `duration_ms`, and optional `user_id`/`role`.
  - Error schema: `{ "error": "code", "message": "...", "details": { ... } }` for API errors and validation failures.
  - Optional Sentry: enabled only when `SENTRY_DSN` is set (environment set to `APP_ENV`).
- **Phase 2 — Rate Limiting + Auth Hardening (Complete)**
  - In-memory rate limiting (MVP): `/auth/login` 5/min per IP, `/auth/signup` 3/min per IP, `/auth/refresh` 10/min per IP, `/bookings/{id}/pay` 5/min per user or IP, `/planner/*` 20/min per user.
  - Limiter returns 429 with `Retry-After` and the standard error schema. Multi-instance production needs a shared store (Redis) for consistency.
  - Refresh token reuse detection: if a revoked refresh token is reused, revoke all active refresh tokens for that user and return `refresh_token_reuse_detected`.
  - Signup password policy: minimum length 10 and non-blank passwords enforced.
- **Phase 3 — Webhook Reliability Upgrades (Complete)**
  - Stripe webhook events are persisted with lifecycle status `received`, `processed`, or `failed`, including event type, payload, and error details.
  - Webhook processing is event-first and idempotent; processed events short-circuit on repeat deliveries.
  - Held-funds ledger entries are idempotent via `payment_id` + type uniqueness.
  - Failure policy: missing payment rows are marked failed and return 200; other processing errors return 500 to trigger Stripe retries.
  - Admin retry endpoint: `POST /admin/webhooks/stripe/retry/{event_id}` (guarded by `ENABLE_ADMIN_RETRY=true` or `ENABLE_DEMO_OPS=true`).
- **Phase 4 — Stripe Reconciliation Job (Complete)**
  - Reconciliation script: `python -m scripts.reconcile_stripe --hours 24 --limit 100`.
  - Admin trigger: `POST /admin/payments/reconcile` (guarded by `ENABLE_DEMO_OPS=true`).
  - Reconciliation ensures Stripe is source-of-truth for recent payments and replays success side effects as needed.

## Phase 5 Checklist (Planned)
- Move rate limiting and webhook retries to Redis-backed infrastructure.
- Add alerting dashboards for failed webhook events and payment anomalies.

## Upload Rules
- Endpoint: `POST /uploads/presign`
- Allowed kinds:
  - `venue_blueprint`, `venue_photo`, `service_portfolio` (vendor only)
  - `template_media` (admin only)
- Validation:
  - MIME type must be in `ALLOWED_UPLOAD_MIME`
  - File size must be <= `MAX_UPLOAD_BYTES`

## Endpoints
- `POST /uploads/presign`
- `GET /vendors/me`
- `POST /vendors/onboarding/venue-owner`
- `POST /vendors/onboarding/service-provider`
- `GET /vendors/public`
- `GET /admin/vendors/pending`
- `POST /admin/vendors/{vendor_id}/approve`
- `POST /admin/vendors/{vendor_id}/needs-changes`
- `POST /admin/vendors/{vendor_id}/disable-payout`
- `GET /templates`
- `GET /templates/{template_id}` (subscription-gated)
- `POST /admin/templates`
- `PATCH /admin/templates/{template_id}`
- `DELETE /admin/templates/{template_id}`
- `GET /me/subscription`
- `POST /subscription/start`
- `POST /subscription/cancel`
- `POST /admin/users/{user_id}/subscription/set`
- `GET /planner/access-check` (gated by subscription)
- `POST /bookings`
- `GET /bookings/{booking_id}`
- `GET /vendor/bookings`
- `POST /vendor/bookings/{booking_id}/approve`
- `POST /vendor/bookings/{booking_id}/decline`
- `POST /vendor/bookings/{booking_id}/counter`
- `POST /bookings/{booking_id}/vendors/{booking_vendor_id}/accept-counter`
- `GET /admin/bookings`
- `GET /admin/bookings/{booking_id}`
- `POST /bookings/{booking_id}/pay`
- `POST /webhooks/stripe`
- `GET /vendor/payouts`
- `POST /vendor/payouts/{payout_id}/request`
- `GET /admin/payouts/pending`
- `POST /admin/payouts/{payout_id}/approve`
- `POST /admin/payouts/{payout_id}/hold`
- `POST /admin/payouts/{payout_id}/reverse`
- `POST /bookings/{booking_id}/complete`
- `POST /admin/bookings/{booking_id}/force-complete`
- `POST /admin/bookings/{booking_id}/cancel`
- `GET /admin/vendors` (filters: status, vendor_type)
- `GET /admin/bookings` (filter: status)
- `GET /admin/payments` (filter: status)
- `GET /admin/payouts` (filters: status, milestone)
- `GET /admin/health/details`
- `POST /admin/demo/seed` (ENABLE_DEMO_OPS=true)
- `POST /trust/moderation-events`
- `GET /admin/moderation-events` (filters: kind, user_id, booking_id)
- `POST /bookings/{booking_id}/disputes`
- `GET /admin/disputes` (filters: status, user_id, booking_id)
- `POST /admin/disputes/{dispute_id}/set-status`

## Booking Workflow (Phase 8)
- Organizer creates booking requests with a required venue vendor and optional service vendors.
- Booking status transitions: `draft` → `awaiting_vendor_approval` → `ready_for_payment`.
- Vendors respond with `approved`, `declined`, or `countered`.
- Organizer accepts or declines counters; acceptance preserves the proposed amount.
- Payloads:
  - `POST /bookings`: `{ template_id?, event_date?, guest_count?, location_text?, venue_vendor_id, service_vendor_ids?, notes?, requested_budget_cents?, currency }`
  - `POST /vendor/bookings/{booking_id}/approve`: `{ agreed_amount_cents?, note? }`
  - `POST /vendor/bookings/{booking_id}/decline`: `{ note? }`
  - `POST /vendor/bookings/{booking_id}/counter`: `{ proposed_amount_cents, note? }`
  - `POST /bookings/{booking_id}/vendors/{booking_vendor_id}/accept-counter`: `{ booking_vendor_id, accept }`

## Payments Workflow (Phase 9)
- Booking must be `ready_for_payment` with all vendors approved and priced (> 0) before payment creation.
- `POST /bookings/{booking_id}/pay` creates a Stripe PaymentIntent and returns `client_secret`.
- Supported payment modes: `deposit` (30%) or `full` (100%).
- Stripe webhook events handled: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`.
- On success: booking status becomes `paid` and a `held_funds` ledger entry is created.
- Webhook idempotency: Stripe event ids are stored in `webhook_events` and ignored on repeat.

## Payout Workflow (Phase 10)
- Payment success allocates paid amount proportionally across vendors by agreed pricing.
- Platform commission defaults to 10% of each vendor's allocated share.
- Two payouts are created per vendor allocation: `reservation` (50%) and `completion` (remainder), both `locked`.
- Vendors request reservation payouts by moving them to `eligible`; admins approve to mark `paid`.
- Booking completion sets `completion` payouts to `eligible` for admin approval.
- Deposit payments only release funds from the deposit; remaining balances require future payments.

## Admin Ops + Audit (Phase 11)
- Admin overview endpoints provide vendor/booking/payment/payout snapshots for operations.
- All admin mutations are logged with before/after snapshots using `log_admin_action`.
- Demo seeding is gated by `ENABLE_DEMO_OPS`.

## Trust + Disputes (Phase 12)
- Moderation events are sanitized (email/phone redaction) before storage.
- Dispute creation holds eligible payouts; admins can resolve disputes via status updates.

## Seed Script
- Run template seed script:
  ```bash
  python scripts/seed_templates.py
  ```

## Run Instructions (Local)
1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Run the API:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Required Environment Variables
Copy these into a `.env` file or export them in your shell:
```bash
APP_ENV=local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/strathwell
JWT_SECRET=change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=14
ADMIN_BOOTSTRAP_TOKEN=change-me
STORAGE_PROVIDER=s3
S3_REGION=us-east-1
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=change-me
S3_SECRET_ACCESS_KEY=change-me
S3_ENDPOINT_URL=
S3_PUBLIC_BASE_URL=
UPLOAD_URL_EXPIRE_SECONDS=300
MAX_UPLOAD_BYTES=15000000
ALLOWED_UPLOAD_MIME=image/jpeg,image/png,image/webp,video/mp4,application/pdf,image/svg+xml
CORS_ORIGINS=http://localhost:3000
STRIPE_SECRET_KEY=change-me
STRIPE_WEBHOOK_SECRET=change-me
BOOKING_DEPOSIT_PERCENT=0.30
PLATFORM_COMMISSION_PERCENT=0.10
RESERVATION_RELEASE_PERCENT=0.50
ENABLE_DEMO_OPS=false
```

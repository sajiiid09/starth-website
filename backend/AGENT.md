# Backend AGENT.md

## Current Phase
**Phase 9 — Payments V1 (Complete)**

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

## Known Issues / Risks
- Storage credentials must be provided via env vars; presign fails without S3 config.
- Vendor `display_name` uses user email until profile fields are added.

## Next Phase Checklist (Phase 10 — Planned)
- Implement payout scheduling and vendor disbursements.
- Add escrow release rules and payout milestones.
- Expand vendor/profile metadata and reporting.

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
```

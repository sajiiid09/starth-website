# Backend AGENT.md

## Current Phase
**Phase 6 — Vendor Onboarding + Admin Approval + Public Showcase (Complete)**

## Decisions Made
- Vendor onboarding requires `trial` or `active` subscription.
- Vendor approval is required for public listing and payout enablement.
- Template list remains public; template detail requires `trial` or `active` subscription.

## Implemented Modules
- `app/schemas/vendors.py` — Vendor onboarding, public card, and admin review schemas.
- `app/services/vendors_service.py` — Vendor onboarding, profile upsert, and public listing logic.
- `app/api/routes/vendors.py` — Vendor self-service endpoints.
- `app/api/routes/public_vendors.py` — Public vendor showcase endpoint.
- `app/api/routes/admin_vendors.py` — Admin approval and review endpoints with audit logs.
- `app/models/vendor.py` — Added `review_note` for admin feedback.
- `scripts/seed_templates.py` — Seed script for MVP templates.

## Known Issues / Risks
- Subscription billing is manual only; Stripe Billing integration is pending.
- Vendor `display_name` uses user email until profile fields are added.

## Next Phase Checklist (Phase 7 — Planned)
- Add richer vendor profile fields (display name, logo, portfolio).
- Add template search and additional filters.
- Implement Stripe Billing integration and webhook syncing.
- Build booking workflow endpoints.

## Vendor Onboarding Rules
- Vendor role required for onboarding endpoints.
- Vendor must have `trial` or `active` subscription to submit onboarding.
- Vendor type mismatches return `{ "error": "vendor_type_mismatch" }` with HTTP 400.
- Only `approved` vendors appear in `/vendors/public`.

## Public Vendor Filters
- `/vendors/public` supports `vendor_type`, `category`, `location`, and `service_area`.

## Endpoints
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
CORS_ORIGINS=http://localhost:3000
STRIPE_SECRET_KEY=change-me
STRIPE_WEBHOOK_SECRET=change-me
```

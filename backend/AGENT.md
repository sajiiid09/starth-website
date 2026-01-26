# Backend AGENT.md

## Current Phase
**Phase 7 — Object Storage + Signed Uploads (Complete)**

## Decisions Made
- Uploads use S3-compatible presigned PUT URLs; backend stays stateless.
- Upload access is restricted by role: vendor for vendor assets, admin for template media.
- Template list remains public; template detail requires `trial` or `active` subscription.

## Implemented Modules
- `app/services/storage/s3.py` — S3 presign logic and object key builder.
- `app/services/storage/validation.py` — MIME type and size validation.
- `app/api/routes/uploads.py` — Presigned upload endpoint.
- `app/schemas/uploads.py` — Upload request/response schemas.
- `app/api/routes/vendors.py` — Vendor self-service onboarding endpoints.

## Known Issues / Risks
- Storage credentials must be provided via env vars; presign fails without S3 config.
- Vendor `display_name` uses user email until profile fields are added.

## Next Phase Checklist (Phase 8 — Planned)
- Add asset registration + linking to profiles.
- Add webhook listener for provider events.
- Expand vendor/profile metadata.
- Build booking workflow endpoints.

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
```

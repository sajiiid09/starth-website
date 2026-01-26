# Backend AGENT.md

## Current Phase
**Phase 4 — Subscription Gating + Provider-Agnostic Interface (Complete)**

## Decisions Made
- Subscription gating allows access for users with `trial` or `active` status.
- Manual subscription provider is the MVP implementation; Stripe Billing is stubbed for later.
- `users.subscription_status` is treated as a denormalized cache synced from `subscriptions`.

## Implemented Modules
- `app/models/subscription.py` — Subscription model for provider status tracking.
- `app/services/subscription/` — Provider-agnostic interface with manual implementation and Stripe stub.
- `app/api/routes/subscription.py` — User subscription endpoints (`/me/subscription`, `/subscription/start`, `/subscription/cancel`).
- `app/api/routes/admin_subscriptions.py` — Admin endpoint to set user subscription status with audit logs.
- `app/api/routes/planner.py` — Placeholder gated endpoint for AI planner access.
- `app/api/deps.py` — Subscription guard dependency enforcing active/trial status.

## Known Issues / Risks
- Subscription billing is manual only; Stripe Billing integration is pending.
- Subscription gating currently only enforced on `/planner/access-check`.

## Next Phase Checklist (Phase 5 — Planned)
- Add template detail endpoints and apply subscription gating.
- Implement Stripe Billing integration and webhook syncing.
- Add subscription history/audit enhancements.
- Build AI planner endpoints and apply RBAC + subscription checks.

## File/Folder Map (High Level)
- `app/` — FastAPI application source
  - `api/` — API routers + dependencies
  - `core/` — Config + security utilities
  - `db/` — SQLAlchemy session and base
  - `models/` — SQLAlchemy models + enums
  - `schemas/` — Pydantic schemas
  - `services/` — Business logic
  - `utils/` — Helpers/utilities
- `alembic/` — Alembic migrations and versions
- `scripts/` — Placeholder for scripts
- `requirements.txt` — Python dependencies

## Migration Commands
- Create migration:
  ```bash
  alembic revision --autogenerate -m "add subscriptions"
  ```
- Apply migration:
  ```bash
  alembic upgrade head
  ```

## Subscription Gating Rules
- Access allowed if `subscription_status` is `trial` or `active`.
- Forbidden response uses HTTP 403 with:
  ```json
  {"error": "subscription_required", "message": "Active subscription required."}
  ```

## Endpoints
- `GET /me/subscription`
- `POST /subscription/start`
- `POST /subscription/cancel`
- `POST /admin/users/{user_id}/subscription/set`
- `GET /planner/access-check` (gated by subscription)

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

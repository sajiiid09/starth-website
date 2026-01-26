# Backend AGENT.md

## Current Phase
**Phase 5 — Templates Module (Complete)**

## Decisions Made
- Template list is public; template detail requires `trial` or `active` subscription.
- Manual subscription provider remains MVP; Stripe Billing is stubbed for later.
- `users.subscription_status` is treated as a denormalized cache synced from `subscriptions`.

## Implemented Modules
- `app/models/subscription.py` — Subscription model for provider status tracking.
- `app/services/subscription/` — Provider-agnostic interface with manual implementation and Stripe stub.
- `app/services/templates_service.py` — Template CRUD service.
- `app/api/routes/templates.py` — Public template list and gated detail endpoint.
- `app/api/routes/admin_templates.py` — Admin CRUD endpoints with audit logging.
- `app/api/routes/subscription.py` — User subscription endpoints.
- `app/api/routes/admin_subscriptions.py` — Admin subscription toggle endpoints.
- `app/api/routes/planner.py` — Placeholder gated endpoint for AI planner access.
- `app/api/deps.py` — Subscription guard dependency enforcing active/trial status.
- `scripts/seed_templates.py` — Seed script for MVP templates.

## Known Issues / Risks
- Subscription billing is manual only; Stripe Billing integration is pending.
- Template detail gating is enforced, but other premium endpoints will need to adopt it later.

## Next Phase Checklist (Phase 6 — Planned)
- Add template detail caching and filters.
- Implement Stripe Billing integration and webhook syncing.
- Expand template metadata and search.
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
- `scripts/` — Utility scripts
- `requirements.txt` — Python dependencies

## Template Gating Rules
- `GET /templates` is public.
- `GET /templates/{template_id}` requires `trial` or `active` subscription.

## Endpoints
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

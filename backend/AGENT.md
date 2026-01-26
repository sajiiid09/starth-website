# Backend AGENT.md

## Current Phase
**Phase 2 — Database + Alembic + Core Schema V1 (Complete)**

## Decisions Made
- Kept `requirements.txt` + pip for dependency management.
- Implemented sync SQLAlchemy models with UUID primary keys and shared timestamp mixins.
- Centralized enums in `app/models/enums.py` for consistent reuse across tables.
- Used JSONB for flexible fields (assets, categories, blueprint data) to keep the MVP schema lean.

## Implemented Modules
- `app/models/` — Core SQLAlchemy models (users, vendors, bookings, payments, payouts, audit logs, etc.).
- `app/models/enums.py` — Enum definitions for roles, statuses, and provider types.
- `app/db/base.py` — Base class with `TimestampMixin` and `CreatedAtMixin`.
- `alembic/` — Migration environment with `alembic.ini`, `env.py`, and initial schema migration.

## Known Issues / Risks
- Defaults for UUID primary keys rely on application-side generation (no DB default).
- JSONB fields are flexible but lack strict typing until schemas are introduced in Phase 3.

## Next Phase Checklist (Phase 3 — Planned)
- Add Pydantic schemas for request/response validation.
- Implement service layer scaffolding and initial CRUD endpoints.
- Add authentication utilities (JWT, password hashing) and user onboarding flows.
- Introduce pgvector template embeddings if needed for RAG MVP.

## File/Folder Map (High Level)
- `app/` — FastAPI application source
  - `api/` — API routers
  - `core/` — Config and security placeholders
  - `db/` — SQLAlchemy session and base
  - `models/` — SQLAlchemy models + enums
  - `schemas/` — Pydantic schemas (Phase 3)
  - `services/` — Business logic (Phase 3)
  - `utils/` — Helpers/utilities
- `alembic/` — Alembic migrations and versions
- `scripts/` — Placeholder for scripts
- `requirements.txt` — Python dependencies

## Migration Commands
- Create migration:
  ```bash
  alembic revision --autogenerate -m "init schema v1"
  ```
- Apply migration:
  ```bash
  alembic upgrade head
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
CORS_ORIGINS=http://localhost:3000
STRIPE_SECRET_KEY=change-me
STRIPE_WEBHOOK_SECRET=change-me
```

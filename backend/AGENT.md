# Backend AGENT.md

## Current Phase
**Phase 3 — Auth + JWT + RBAC (Complete)**

## Decisions Made
- Kept `requirements.txt` + pip for dependency management.
- Implemented JWT access + refresh tokens with rotation and server-side storage of hashed refresh tokens.
- Added admin bootstrap endpoint guarded by an `ADMIN_BOOTSTRAP_TOKEN` header.
- Used JSONB for flexible schema fields to keep the MVP schema lean.

## Implemented Modules
- `app/models/` — Core SQLAlchemy models including `RefreshToken` for token rotation.
- `app/core/security.py` — Password hashing and JWT utilities.
- `app/api/routes/auth.py` — Signup/login/refresh/logout/bootstrap endpoints.
- `app/api/deps.py` — Auth dependencies and RBAC guards.
- `alembic/` — Migration environment and refresh token migration.

## Known Issues / Risks
- Defaults for UUID primary keys rely on application-side generation (no DB default).
- JSONB fields are flexible but lack strict typing until schemas are introduced in Phase 4.

## Next Phase Checklist (Phase 4 — Planned)
- Add Pydantic schemas for core entities and validation.
- Implement service layer scaffolding and CRUD endpoints.
- Add subscription enforcement and Stripe integration stubs.
- Introduce pgvector template embeddings for RAG MVP.

## File/Folder Map (High Level)
- `app/` — FastAPI application source
  - `api/` — API routers + dependencies
  - `core/` — Config + security utilities
  - `db/` — SQLAlchemy session and base
  - `models/` — SQLAlchemy models + enums
  - `schemas/` — Pydantic schemas (Phase 4)
  - `services/` — Business logic (Phase 4)
  - `utils/` — Helpers/utilities
- `alembic/` — Alembic migrations and versions
- `scripts/` — Placeholder for scripts
- `requirements.txt` — Python dependencies

## Migration Commands
- Create migration:
  ```bash
  alembic revision --autogenerate -m "add refresh tokens"
  ```
- Apply migration:
  ```bash
  alembic upgrade head
  ```

## Auth Notes
- Access tokens: 15 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).
- Refresh tokens: 14 days (configurable via `REFRESH_TOKEN_EXPIRE_DAYS`).
- Refresh token rotation: old token is revoked on refresh; only hashed tokens are stored.
- Admin bootstrap: `POST /auth/bootstrap-admin` with `ADMIN_BOOTSTRAP_TOKEN` header.

## Endpoints
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/bootstrap-admin`

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

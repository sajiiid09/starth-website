# Backend AGENT.md

## Current Phase
**Phase 1 — Backend Foundation + AGENT.md Bootstrap (Complete)**

## Decisions Made
- Chose `requirements.txt` + pip for dependency management since no backend tooling existed.
- Implemented sync SQLAlchemy engine with `psycopg2-binary` for MVP simplicity.
- Added a minimal settings module using `pydantic-settings` with environment-based configuration.

## Implemented Modules
- `app/main.py`: FastAPI app, CORS middleware, `/health` endpoint, and API router mount.
- `app/core/config.py`: Settings model with env loading and CORS parsing.
- `app/api/router.py`: Placeholder router for future endpoints.
- `app/db/session.py` + `app/db/base.py`: SQLAlchemy engine/session + base.
- `requirements.txt`: Core backend dependencies for Phase 1.

## Known Issues / Risks
- Database connection details are placeholders; ensure `DATABASE_URL` matches your local setup.
- JWT/Stripe secrets are not set by default; they must be provided via environment variables in later phases.

## Next Phase Checklist (Phase 2 — Planned)
- Initialize Alembic configuration and migration environment.
- Add initial SQLAlchemy models and Pydantic schemas.
- Implement auth scaffolding (password hashing, JWT utilities, user model).
- Add initial API routes and service layer structure.
- Introduce basic automated tests and CI hooks if needed.

## File/Folder Map (High Level)
- `app/` — FastAPI application source
  - `api/` — API routers
  - `core/` — Config and security placeholders
  - `db/` — SQLAlchemy session and base
  - `models/` — SQLAlchemy models (Phase 2)
  - `schemas/` — Pydantic schemas (Phase 2)
  - `services/` — Business logic (Phase 2)
  - `utils/` — Helpers/utilities
- `alembic/` — Placeholder (Phase 2 setup)
- `scripts/` — Placeholder for scripts
- `requirements.txt` — Python dependencies

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

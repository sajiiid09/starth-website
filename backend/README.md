# Strathwell Backend

## Setup
1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Create a `.env` file from the sample:
   ```bash
   cp .env.example .env
   ```
   - `CORS_ORIGINS` must be a comma-separated allowlist; `APP_ENV=prod` enforces strict validation.

## Database
1. Run migrations:
   ```bash
   alembic upgrade head
   ```
2. (Optional) Seed templates:
   ```bash
   python scripts/seed_templates.py
   ```

## Run
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

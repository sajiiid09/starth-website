# Backend Development Documentation

## Critical Gap Remediation (Debugger Pass)

Date: 2026-02-07

### Issues Re-validated

- Rate limiting middleware existed in code but needed explicit app wiring confirmation.
- Stripe subscription billing needed implementation-level verification and route integration.
- Payment service still had risky mock fallback behavior in production-critical flows.
- Audit log model existed but sensitive auth flow coverage and admin read path needed completion.

### Fixes Applied

1. Rate limiting is now enforced globally in app wiring:
- `backend/app/main.py` applies `RateLimitMiddleware` with explicit auth and write-operation rules.
- Regression test added:
  - `backend/tests/test_main_rate_limit_middleware.py`

2. Stripe subscription billing is implemented and exposed:
- Implemented service methods in:
  - `backend/app/services/subscription/stripe.py`
  - `start_subscription`, `cancel_subscription`, `sync_subscription`, `list_user_subscriptions`
- Added API routes:
  - `backend/app/api/routes/subscriptions.py`
- Wired router in:
  - `backend/app/main.py`
- Added webhook sync support for subscription lifecycle events in:
  - `backend/app/api/routes/webhooks.py` (`customer.subscription.*`)
- Regression tests added:
  - `backend/tests/test_subscription_service.py`

3. Production mock-payment safety guard:
- Updated `backend/app/services/payment_service.py`:
  - `create_payment_intent` now raises `ConfigurationError` in production if `STRIPE_SECRET_KEY` is missing (no silent mock fallback).
  - `release_payment` and refund path also fail fast in production when Stripe is required but not configured.
- Regression tests added:
  - `backend/tests/test_payment_service.py`
  - New cases verify production rejects missing Stripe configuration.

4. Audit logging persistence:
- Added audit writes for password reset in:
  - `backend/app/services/auth_service.py`
- Replaced placeholder admin audit endpoint with persisted DB query from:
  - `backend/app/models/audit_log.py`
  - endpoint: `GET /admin/audit-logs` in `backend/app/api/routes/admin.py`
- Added pagination/filter support (`action`, `status`, `actor_user_id`, `target_user_id`) and `total` count.
- Regression tests added:
  - `backend/tests/test_audit_logging.py`

5. Schema migration alignment:
- Added migration:
  - `backend/alembic/versions/5b0f4b7f6c2d_add_audit_logs_and_stripe_customer_id.py`
- Includes:
  - `users.stripe_customer_id` (+ unique index)
  - `audit_logs` table (+ indexes/FKs)

### Verification Steps

1. Run backend unit tests:
- `cd backend`
- `../.venv/bin/python -m unittest discover -s tests -p 'test_*.py'`

2. Specifically verify new high-risk coverage:
- `test_main_rate_limit_middleware.py`
- `test_subscription_service.py`
- `test_audit_logging.py`
- `test_payment_service.py` (production Stripe configuration guards)

## Payment Release Fix: Stripe Destination ID (Phase 1)

Date: 2026-02-07

### Issue

`release_payment()` used `EventService.service_provider_id` (internal UUID) as the Stripe transfer destination, instead of the provider's Stripe connected account ID.

### Fix Applied

- Added `stripe_account_id` to `ServiceProvider` model.
- Updated `release_payment()` in `backend/app/services/payment_service.py` to:
  - Load the `ServiceProvider` record from `EventService.service_provider_id`.
  - Use `ServiceProvider.stripe_account_id` as `stripe.Transfer.create(..., destination=...)`.
  - Return an onboarding-required error when Stripe is enabled but `stripe_account_id` is missing.
  - Store payout `payee_id` as the provider's user ID (`ServiceProvider.user_id`) for FK correctness.
- Added Alembic migration:
  - `backend/alembic/versions/9f2d1c4b6e8a_add_stripe_account_id_to_service_providers.py`

### Verification / Testing Steps

1. Run unit tests:
   - `cd backend`
   - `../.venv/bin/python -m unittest discover -s tests -p 'test_*.py'`
2. Covered test cases:
   - Successful release path uses `ServiceProvider.stripe_account_id` as Stripe transfer destination.
   - Missing `stripe_account_id` returns a failure with `onboarding_required=True` and does not attempt Stripe transfer.

## Webhook Security Fix: Unsafe Fallback (Phase 2)

Date: 2026-02-07

### Issue

`stripe_webhook()` accepted unsigned payloads when `STRIPE_WEBHOOK_SECRET` was not set, which is unsafe in production.

### Fix Applied

- Updated `backend/app/api/routes/webhooks.py` to enforce environment-aware webhook security:
  - In `production`, if `STRIPE_WEBHOOK_SECRET` is missing, the endpoint now rejects requests with `403 Forbidden`.
  - When a webhook secret is configured, the endpoint now requires the `Stripe-Signature` header.
  - Signature verification is now performed using Stripe's signature verifier:
    - `stripe.WebhookSignature.verify_header(payload, header, secret)`
  - Invalid/missing signatures return `403 Forbidden`.
  - Payload parsing remains strict; malformed JSON returns `400 Bad Request`.
- Non-production behavior:
  - If `STRIPE_WEBHOOK_SECRET` is not configured outside production, verification is skipped with a warning log only.

### How Signature Validation Works

1. Stripe sends a `Stripe-Signature` header with timestamp + HMAC signature data.
2. The backend computes and compares the expected signature using the configured `STRIPE_WEBHOOK_SECRET`.
3. If verification fails, the webhook is rejected before any event handler logic runs.
4. If verification passes, the event payload is parsed and routed to handlers (e.g., payment succeeded).

### Verification / Testing Steps

1. Run unit tests:
   - `cd backend`
   - `../.venv/bin/python -m unittest discover -s tests -p 'test_*.py'`
2. Covered webhook test cases:
   - Production + missing `STRIPE_WEBHOOK_SECRET` -> `403`.
   - Secret configured + missing signature header -> `403`.
   - Secret configured + invalid signature -> `403`.
   - Secret configured + valid signature -> webhook accepted and `payment_intent.succeeded` updates payment/event state.

## Concurrency Fix: Payment Release Safety (Phase 3)

Date: 2026-02-07

### Issue

Concurrent calls to `release_payment()` could race and trigger duplicate Stripe transfers or inconsistent DB state.

### Fix Applied

- Refactored `release_payment()` in `backend/app/services/payment_service.py`:
  - Wrapped payout flow in `async with db.begin_nested()` for explicit transactional scope.
  - Added row lock on `EventService` lookup via `with_for_update()` to serialize concurrent payout attempts for the same service.
  - Added idempotency check using a dedicated payout record per event service:
    - Query existing `Payment` where `event_service_id` + `payment_type="service_payment"`.
    - If already `released`, return idempotent success (`already_released=True`) without calling Stripe again.
    - If in progress (`payout_started`), reject duplicate concurrent processing.
  - Added Stripe transfer idempotency key:
    - `idempotency_key = f"release_payment:{event_service_id}"`
  - Added `payout_started` intermediate status in the payment record before Stripe transfer, then transition to `released` only after transfer succeeds.
  - Added `try/except` around transaction to ensure failures are returned cleanly and transactional changes roll back.

- Schema updates:
  - Added `event_service_id` to `Payment` model to tie payout records to one service.
  - Added migration: `backend/alembic/versions/3c7b1eab42d1_add_event_service_id_to_payments.py`
  - Enforced uniqueness on `payments.event_service_id` to prevent duplicate payout rows for the same service.

### Why Context Manager + Idempotency Key

1. `async with db.begin_nested()` provides explicit transactional boundaries and rollback behavior for failures in mixed DB + Stripe logic.
2. Row-level locking (`FOR UPDATE`) ensures only one concurrent payout flow can proceed for a given service row at a time.
3. `payout_started` records in DB make in-flight payouts visible and block duplicate attempts.
4. Stripe idempotency key protects against duplicate external transfers if retries occur after partial failures.

### Verification / Testing Steps

1. Run unit tests:
   - `cd backend`
   - `../.venv/bin/python -m unittest discover -s tests -p 'test_*.py'`
2. Covered Phase 3 test cases:
   - Uses provider `stripe_account_id` and sends Stripe transfer with idempotency key.
   - Missing `stripe_account_id` returns onboarding-required error.
   - Already released payout returns idempotent success without second transfer.
   - Concurrent release requests only create one Stripe transfer.
   - Stripe transfer failure rolls back `payout_started` state and keeps service status unchanged.

## Security Improvements: JWT + CSRF (Phase 4)

Date: 2026-02-07

### Issue

- JWT secret handling allowed insecure defaults that are unsafe in production.
- Browser-based authenticated requests needed explicit CSRF validation on sensitive endpoints.

### Fix Applied

- Updated JWT secret handling in `backend/app/core/config.py`:
  - `SECRET_KEY` now relies on environment configuration instead of a fixed hardcoded value.
  - In production (`ENVIRONMENT=production`), startup now fails if:
    - `SECRET_KEY` is missing,
    - `SECRET_KEY` is a known default/insecure value,
    - `SECRET_KEY` is shorter than 32 characters.
  - In non-production, if missing, a random per-process key is generated to avoid a hardcoded dev secret.

- Added CSRF protection for JWT-authenticated browser requests:
  - Access tokens now include a random `csrf` claim.
  - Login/register responses now include `csrf_token`.
  - Frontend stores `csrf_token` and sends it as `X-CSRF-Token` on unsafe authenticated methods (`POST`, `PUT`, `PATCH`, `DELETE`).
  - Backend `get_current_user`/`get_current_user_optional` validates CSRF for unsafe browser requests:
    - checks request origin matches configured `FRONTEND_URL`,
    - checks `X-CSRF-Token` matches JWT `csrf` claim (constant-time comparison).
  - Safe methods (`GET`, `HEAD`, `OPTIONS`, `TRACE`) and non-browser clients (no `Origin` header) are not blocked by CSRF checks.

### Environment Setup (SECRET_KEY)

1. Set `ENVIRONMENT=production` in production deployments.
2. Set a strong `SECRET_KEY` (32+ chars), for example:
   - `openssl rand -base64 48`
3. Export it before starting backend:
   - `export SECRET_KEY='<generated-strong-secret>'`
4. Confirm no default placeholder values are used.

### Verification / Testing Steps

1. Run backend tests:
   - `cd backend`
   - `../.venv/bin/python -m unittest discover -s tests -p 'test_*.py'`
2. Covered Phase 4 test cases:
   - Production rejects insecure/default JWT secret values.
   - Production accepts strong secret values.
   - Unsafe browser requests without CSRF header are blocked.
   - Unsafe browser requests with invalid CSRF token are blocked.
   - Unsafe browser requests with valid CSRF token are accepted.
   - Safe methods and non-browser requests are not blocked by CSRF checks.

## Production Readiness + DevOps Setup (Phase 5)

Date: 2026-02-07

### Production Docker Setup

- Added production `backend/Dockerfile`:
  - Uses a multi-stage build with `uv` lockfile sync in builder stage.
  - Runs API with Gunicorn + Uvicorn workers in runtime stage.
  - Uses `backend/scripts/start-production.sh` as runtime command.
- Added production entrypoint script:
  - `backend/scripts/start-production.sh`
  - Configurable with env vars: `PORT`, `GUNICORN_WORKERS`, `GUNICORN_TIMEOUT`.
- Added configurable DB connection pool settings:
  - `DB_POOL_SIZE`, `DB_MAX_OVERFLOW`, `DB_POOL_TIMEOUT`, `DB_POOL_RECYCLE`.
  - Wired in `backend/app/db/engine.py` for scalable deployment tuning.

### Structured Logging

- Added JSON structured logging configuration:
  - `backend/app/core/logging_config.py`
  - Logs include `timestamp`, `level`, `logger`, `message`, and extra context fields.
- Added request logging middleware:
  - `backend/app/core/request_logging.py`
  - Logs request lifecycle metadata:
    - `request_id`, `method`, `path`, `status_code`, `duration_ms`, `client_ip`
  - Adds `X-Request-ID` to responses.
- Integrated logging setup during app startup:
  - `backend/app/main.py` now calls logging setup and adds middleware.

### Rate Limiting

- Added in-memory sliding-window limiter:
  - `backend/app/core/rate_limit.py`
- Applied auth-focused rate limiting to:
  - `/api/auth/signup`
  - `/api/auth/register`
  - `/api/auth/login`
  - `/api/auth/verify-email`
  - `/api/auth/resend-verification`
  - `/api/auth/forgot-password`
  - `/api/auth/reset-password`
- Rate-limit configuration via env vars:
  - `RATE_LIMIT_ENABLED`
  - `AUTH_RATE_LIMIT_REQUESTS`
  - `AUTH_RATE_LIMIT_WINDOW_SECONDS`
- Note: in-memory limiter is suitable for single-instance/development. For multi-instance production, use Redis/shared-store limiter.

### Email / Password Reset Workflow Finalization

- Added resend verification endpoint and service:
  - Endpoint: `POST /api/auth/resend-verification`
  - Schema: `ResendVerificationRequest`
  - Service function: `resend_verification_otp(...)`
- Behavior:
  - Unknown email -> generic success message (no account enumeration)
  - Already verified -> `already_verified=true`
  - Unverified -> generates fresh OTP, updates expiry, sends verification email

### Docker Compose (Dev/Test)

- Expanded `backend/docker-compose.yml`:
  - `db` service (PostgreSQL + pgvector)
  - `api` service for backend development (`uvicorn --reload`)
  - `backend-tests` profile service for test runs in containers
- Common commands:
  - Start dev stack: `docker compose up --build`
  - Run backend tests in container: `docker compose --profile test run --rm backend-tests`

### CI/CD Pipeline

- Added GitHub Actions workflow:
  - `.github/workflows/backend-ci-cd.yml`
- Pipeline stages:
  1. Unit tests (`unittest`) on backend changes
  2. Docker image build (and push on non-PR events)
  3. Deploy trigger job (webhook-based, controlled by `DEPLOY_WEBHOOK_URL` secret)

### Environment Variables for Production

Set these for production deployments:

- Security:
  - `ENVIRONMENT=production`
  - `SECRET_KEY=<strong-random-32+-char-secret>`
- Database:
  - `DATABASE_URL`
  - `DB_POOL_SIZE`, `DB_MAX_OVERFLOW`, `DB_POOL_TIMEOUT`, `DB_POOL_RECYCLE`
- Runtime:
  - `GUNICORN_WORKERS`, `GUNICORN_TIMEOUT`, `PORT`
- Rate limiting:
  - `RATE_LIMIT_ENABLED=true`
  - `AUTH_RATE_LIMIT_REQUESTS`
  - `AUTH_RATE_LIMIT_WINDOW_SECONDS`

### Verification / Testing Steps

1. Run local backend tests:
   - `cd backend`
   - `../.venv/bin/python -m unittest discover -s tests -p 'test_*.py'`
2. Run Dockerized development stack:
   - `cd backend`
   - `docker compose up --build`
3. (CI/CD) Validate workflow by opening PR with backend changes and confirming all jobs pass.

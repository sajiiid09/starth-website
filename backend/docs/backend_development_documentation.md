# Backend Development Documentation

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

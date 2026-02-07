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

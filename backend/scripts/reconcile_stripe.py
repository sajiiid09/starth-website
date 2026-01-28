from __future__ import annotations

import argparse
import logging

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.session import SessionLocal
from app.services.payments.stripe_sync import reconcile_stripe_payments

logger = logging.getLogger("scripts.reconcile_stripe")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Reconcile Stripe payments.")
    parser.add_argument("--hours", type=int, default=24)
    parser.add_argument("--limit", type=int, default=100)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    settings = get_settings()
    configure_logging(settings.log_level)

    with SessionLocal() as db:
        summary = reconcile_stripe_payments(db, hours=args.hours, limit=args.limit)
    logger.info(
        "reconcile_summary",
        extra={
            "scanned": summary["scanned"],
            "updated": summary["updated"],
            "errors": summary["errors"],
        },
    )


if __name__ == "__main__":
    main()

from __future__ import annotations

import math

from app.core.config import get_settings


def compute_commission(amount_cents: int) -> int:
    settings = get_settings()
    return int(math.floor(amount_cents * settings.platform_commission_percent))

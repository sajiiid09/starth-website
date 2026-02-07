from __future__ import annotations

from datetime import datetime
from enum import Enum
from uuid import UUID


EXCLUDED_FIELDS = {"password_hash", "token_hash"}


def model_to_dict(model: object | None) -> dict[str, object] | None:
    if model is None:
        return None
    if not hasattr(model, "__table__"):
        raise ValueError("model_missing_table")
    data: dict[str, object] = {}
    for column in model.__table__.columns:
        name = column.name
        if name in EXCLUDED_FIELDS:
            continue
        value = getattr(model, name)
        if isinstance(value, Enum):
            value = value.value
        elif isinstance(value, UUID):
            value = str(value)
        elif isinstance(value, datetime):
            value = value.isoformat()
        data[name] = value
    return data

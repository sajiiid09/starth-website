from __future__ import annotations

from app.models.audit_log import AuditLog
from app.utils.serialization import model_to_dict


def log_admin_action(
    db,
    actor_user_id,
    action: str,
    entity_type: str,
    entity_id: str,
    before_obj: object | dict | None,
    after_obj: object | dict | None,
    actor_ip: str | None = None,
    actor_user_agent: str | None = None,
) -> None:
    before_json = _normalize_snapshot(before_obj)
    after_json = _normalize_snapshot(after_obj)
    audit_log = AuditLog(
        actor_user_id=actor_user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        actor_ip=actor_ip,
        actor_user_agent=actor_user_agent,
        before_json=before_json,
        after_json=after_json,
    )
    db.add(audit_log)


def _normalize_snapshot(snapshot: object | dict | None) -> dict | None:
    if snapshot is None:
        return None
    if isinstance(snapshot, dict):
        return snapshot
    return model_to_dict(snapshot) or None

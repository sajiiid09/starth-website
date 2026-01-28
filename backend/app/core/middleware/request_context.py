from __future__ import annotations

import logging
import time
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid4())
        request.state.request_id = request_id

        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = int((time.perf_counter() - start_time) * 1000)

        response.headers["X-Request-ID"] = request_id

        log_payload: dict[str, object] = {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": duration_ms,
        }

        user = getattr(request.state, "user", None)
        if user is not None:
            log_payload["user_id"] = str(getattr(user, "id", ""))
            role = getattr(user, "role", None)
            if role is not None:
                log_payload["role"] = getattr(role, "value", str(role))

        logger = logging.getLogger("app.request")
        logger.info("request", extra=log_payload)

        return response

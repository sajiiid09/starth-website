from __future__ import annotations

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class ReadOnlyModeMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, enabled: bool) -> None:
        super().__init__(app)
        self.enabled = enabled

    async def dispatch(self, request: Request, call_next) -> Response:
        if not self.enabled:
            return await call_next(request)

        if request.method in {"POST", "PATCH", "PUT", "DELETE"}:
            path = request.url.path
            if path == "/health" or path.startswith("/webhooks/stripe"):
                return await call_next(request)
            return JSONResponse(
                status_code=503,
                content={
                    "error": "read_only_mode",
                    "message": "Service is temporarily in read-only mode.",
                    "details": {},
                },
            )

        return await call_next(request)

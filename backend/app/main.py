import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.router import router as api_router
from app.core.config import get_settings
from app.core.errors import APIError
from app.core.logging import configure_logging
from app.core.middleware.request_context import RequestContextMiddleware
from app.core.middleware.rate_limit import RateLimitMiddleware, default_rate_limit_rules
from app.core.middleware.security_headers import SecurityHeadersMiddleware
from app.core.monitoring import init_sentry

settings = get_settings()
configure_logging(settings.log_level)
init_sentry(settings)
settings.validate()

cors_origins = settings.cors_origins_list
if settings.app_env != "prod" and not cors_origins:
    cors_origins = ["http://localhost:3000", "http://localhost:5173"]

app = FastAPI(title="Strathwell API", debug=settings.app_env != "prod")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, rules=default_rate_limit_rules())
app.add_middleware(RequestContextMiddleware)


@app.exception_handler(APIError)
async def handle_api_error(_: Request, exc: APIError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details,
        },
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "error": "validation_error",
            "message": "Validation error.",
            "details": {"errors": exc.errors()},
        },
    )


@app.exception_handler(StarletteHTTPException)
async def handle_http_exception(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    if isinstance(exc.detail, dict):
        error_code = exc.detail.get("error", "http_error")
        message = exc.detail.get("message", "Request failed.")
        details = {k: v for k, v in exc.detail.items() if k not in {"error", "message"}}
    else:
        error_code = "http_error"
        message = str(exc.detail)
        details = {}
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": error_code, "message": message, "details": details},
    )


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    logger = logging.getLogger("app.error")
    logger.exception("Unhandled exception", extra={"path": request.url.path})
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_error",
            "message": "Something went wrong.",
            "details": {},
        },
    )


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router)

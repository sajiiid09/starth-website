from __future__ import annotations


class APIError(Exception):
    def __init__(
        self,
        error_code: str,
        message: str,
        status_code: int = 400,
        details: dict | None = None,
    ) -> None:
        super().__init__(message)
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


def bad_request(message: str, details: dict | None = None) -> APIError:
    return APIError(error_code="bad_request", message=message, status_code=400, details=details)


def forbidden(message: str, details: dict | None = None) -> APIError:
    return APIError(error_code="forbidden", message=message, status_code=403, details=details)


def not_found(message: str, details: dict | None = None) -> APIError:
    return APIError(error_code="not_found", message=message, status_code=404, details=details)


def conflict(message: str, details: dict | None = None) -> APIError:
    return APIError(error_code="conflict", message=message, status_code=409, details=details)


def payment_required(message: str, details: dict | None = None) -> APIError:
    return APIError(
        error_code="payment_required", message=message, status_code=402, details=details
    )

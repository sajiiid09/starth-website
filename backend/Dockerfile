FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .
RUN uv sync --frozen --no-dev

FROM python:3.12-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    PORT=8000

COPY --from=builder /app/.venv /app/.venv
COPY . /app

RUN chmod +x /app/scripts/start-production.sh

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD ["/app/scripts/start-production.sh"]

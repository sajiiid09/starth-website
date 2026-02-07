#!/usr/bin/env sh
set -eu

: "${PORT:=8000}"
: "${GUNICORN_WORKERS:=4}"
: "${GUNICORN_TIMEOUT:=60}"

exec gunicorn "app.main:app" \
  --worker-class "uvicorn.workers.UvicornWorker" \
  --bind "0.0.0.0:${PORT}" \
  --workers "${GUNICORN_WORKERS}" \
  --timeout "${GUNICORN_TIMEOUT}" \
  --access-logfile "-" \
  --error-logfile "-" \
  --log-level "info"

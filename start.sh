#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting deployment..."

echo "Running collectstatic..."
python /app/manage.py collectstatic --noinput

if [ "${SKIP_MIGRATIONS:-0}" = "1" ]; then
  echo "⚠️  Skipping migrations (SKIP_MIGRATIONS=1)"
else
  echo "Running migrations..."
  python /app/manage.py migrate --noinput
fi

echo "Starting gunicorn on port ${PORT:-5000}..."
# Use PORT environment variable provided by Render, fallback to 5000 for local development
exec /usr/local/bin/gunicorn config.wsgi --bind 0.0.0.0:${PORT:-5000} --chdir=/app --workers 2 --timeout 120 --access-logfile - --error-logfile -


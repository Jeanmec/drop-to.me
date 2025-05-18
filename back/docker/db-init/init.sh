#!/bin/bash
set -e

envsubst < /docker-entrypoint-initdb.d/init-user-db.sql.template > /docker-entrypoint-initdb.d/init-user-db.sql

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -f /docker-entrypoint-initdb.d/init-user-db.sql

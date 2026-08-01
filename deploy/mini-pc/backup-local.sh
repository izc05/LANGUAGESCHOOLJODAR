#!/usr/bin/env bash
set -Eeuo pipefail

umask 077

DB_CONTAINER="${SUPABASE_DB_CONTAINER:-supabase-db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"
SUPABASE_PROJECT_DIR="${SUPABASE_PROJECT_DIR:-/opt/isivoltpro-activos/supabase-project}"
BACKUP_ROOT="${ACTIVOS_BACKUP_ROOT:-/opt/isivoltpro-activos/backups}"
RETENTION_DAYS="${ACTIVOS_BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +'%Y%m%dT%H%M%SZ')"
FINAL_DIR="${BACKUP_ROOT}/${TIMESTAMP}"
TEMP_DIR="${BACKUP_ROOT}/.${TIMESTAMP}.tmp"

for command in docker tar sha256sum find; do
  if ! command -v "${command}" >/dev/null 2>&1; then
    echo "ERROR: falta el comando ${command}." >&2
    exit 1
  fi
done

if ! docker inspect "${DB_CONTAINER}" >/dev/null 2>&1; then
  echo "ERROR: no se encuentra el contenedor ${DB_CONTAINER}." >&2
  exit 1
fi

if [ ! -d "${SUPABASE_PROJECT_DIR}/volumes/storage" ]; then
  echo "ERROR: no se encuentra ${SUPABASE_PROJECT_DIR}/volumes/storage." >&2
  exit 1
fi

mkdir -p "${BACKUP_ROOT}"
rm -rf "${TEMP_DIR}"
mkdir -p "${TEMP_DIR}"
trap 'rm -rf "${TEMP_DIR}"' EXIT

echo "Creando copia PostgreSQL..."
docker exec -i "${DB_CONTAINER}" \
  pg_dump --format=custom --no-owner --no-privileges -U "${DB_USER}" -d "${DB_NAME}" \
  > "${TEMP_DIR}/database.dump"

echo "Creando copia de Storage..."
tar -C "${SUPABASE_PROJECT_DIR}/volumes" -czf "${TEMP_DIR}/storage.tar.gz" storage

cat > "${TEMP_DIR}/manifest.txt" <<EOF
created_at_utc=${TIMESTAMP}
database_container=${DB_CONTAINER}
database_name=${DB_NAME}
storage_source=${SUPABASE_PROJECT_DIR}/volumes/storage
EOF

(
  cd "${TEMP_DIR}"
  sha256sum database.dump storage.tar.gz manifest.txt > SHA256SUMS
  sha256sum --check SHA256SUMS
)

mv "${TEMP_DIR}" "${FINAL_DIR}"
trap - EXIT

find "${BACKUP_ROOT}" -mindepth 1 -maxdepth 1 -type d \
  -name '20????????T??????Z' -mtime "+${RETENTION_DAYS}" -print -exec rm -rf {} +

echo "Copia terminada: ${FINAL_DIR}"

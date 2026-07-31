#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SQL_DIR="${REPO_ROOT}/src/sql"
DB_CONTAINER="${SUPABASE_DB_CONTAINER:-supabase-db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker no está instalado o no está disponible para este usuario." >&2
  exit 1
fi

if ! docker inspect "${DB_CONTAINER}" >/dev/null 2>&1; then
  echo "ERROR: no se encuentra el contenedor ${DB_CONTAINER}. Arranca primero el backend autoalojado." >&2
  exit 1
fi

mapfile -t migrations < <(
  find "${SQL_DIR}" -maxdepth 1 -type f -name '[0-9][0-9][0-9]_*.sql' \
    ! -name '000_*' \
    ! -name '004_seed_demo.sql' \
    ! -name '005_demo_signup.sql' \
    -print | sort -V
)

if [ "${#migrations[@]}" -eq 0 ]; then
  echo "ERROR: no se han encontrado migraciones en ${SQL_DIR}." >&2
  exit 1
fi

echo "Aplicando ${#migrations[@]} migraciones de IsiVoltPro Activos..."
for migration in "${migrations[@]}"; do
  echo "--> $(basename "${migration}")"
  docker exec -i "${DB_CONTAINER}" \
    psql -v ON_ERROR_STOP=1 -U "${DB_USER}" -d "${DB_NAME}" \
    < "${migration}"
done

echo "Base de datos local preparada correctamente."

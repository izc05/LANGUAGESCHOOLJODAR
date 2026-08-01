#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SQL_DIR="${REPO_ROOT}/src/sql"
DB_CONTAINER="${SUPABASE_DB_CONTAINER:-supabase-db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"

for command in docker sha256sum; do
  if ! command -v "${command}" >/dev/null 2>&1; then
    echo "ERROR: falta el comando ${command}." >&2
    exit 1
  fi
done

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

docker exec -i "${DB_CONTAINER}" \
  psql -v ON_ERROR_STOP=1 -U "${DB_USER}" -d "${DB_NAME}" <<'SQL'
create table if not exists public.isivoltpro_schema_migrations (
  version text primary key,
  checksum text not null,
  applied_at timestamptz not null default now()
);
SQL

echo "Revisando ${#migrations[@]} migraciones de IsiVoltPro Activos..."
for migration in "${migrations[@]}"; do
  version="$(basename "${migration}")"
  checksum="$(sha256sum "${migration}" | awk '{print $1}')"
  existing="$(
    printf "select checksum from public.isivoltpro_schema_migrations where version = :'version';\n" \
      | docker exec -i "${DB_CONTAINER}" \
          psql -At -v ON_ERROR_STOP=1 -U "${DB_USER}" -d "${DB_NAME}" \
          -v version="${version}"
  )"

  if [ -n "${existing}" ]; then
    if [ "${existing}" != "${checksum}" ]; then
      echo "ERROR: ${version} ya fue aplicada pero su checksum ha cambiado." >&2
      echo "Esperado: ${existing}" >&2
      echo "Actual:   ${checksum}" >&2
      exit 1
    fi
    echo "--> ${version} ya aplicada; se omite."
    continue
  fi

  echo "--> Aplicando ${version}"
  {
    echo '\set ON_ERROR_STOP on'
    echo 'begin;'
    cat "${migration}"
    echo
    echo "insert into public.isivoltpro_schema_migrations (version, checksum) values (:'version', :'checksum');"
    echo 'commit;'
  } | docker exec -i "${DB_CONTAINER}" \
      psql -v ON_ERROR_STOP=1 -U "${DB_USER}" -d "${DB_NAME}" \
      -v version="${version}" \
      -v checksum="${checksum}"
done

echo "Base de datos local preparada y verificada correctamente."

#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DB_CONTAINER="${SUPABASE_DB_CONTAINER:-supabase-db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"
SUPABASE_ADMIN_URL="${SUPABASE_ADMIN_URL:-http://127.0.0.1:8000}"

required=(SUPABASE_SECRET_KEY ADMIN_EMAIL ADMIN_PASSWORD ADMIN_NAME)
for variable in "${required[@]}"; do
  if [ -z "${!variable:-}" ]; then
    echo "ERROR: falta la variable ${variable}." >&2
    exit 1
  fi
done

if [ "${#ADMIN_PASSWORD}" -lt 12 ]; then
  echo "ERROR: ADMIN_PASSWORD debe tener al menos 12 caracteres." >&2
  exit 1
fi

for command in curl jq docker; do
  if ! command -v "${command}" >/dev/null 2>&1; then
    echo "ERROR: falta el comando ${command}." >&2
    exit 1
  fi
done

if ! docker inspect "${DB_CONTAINER}" >/dev/null 2>&1; then
  echo "ERROR: no se encuentra el contenedor ${DB_CONTAINER}." >&2
  exit 1
fi

payload="$(
  jq -n \
    --arg email "${ADMIN_EMAIL}" \
    --arg password "${ADMIN_PASSWORD}" \
    --arg name "${ADMIN_NAME}" \
    '{email: $email, password: $password, email_confirm: true, user_metadata: {nombre: $name}}'
)"

response_file="$(mktemp)"
trap 'rm -f "${response_file}"' EXIT

http_status="$(
  curl --silent --show-error \
    --output "${response_file}" \
    --write-out '%{http_code}' \
    --request POST \
    --header "apikey: ${SUPABASE_SECRET_KEY}" \
    --header "Authorization: Bearer ${SUPABASE_SECRET_KEY}" \
    --header 'Content-Type: application/json' \
    --data "${payload}" \
    "${SUPABASE_ADMIN_URL%/}/auth/v1/admin/users"
)"

if [[ ! "${http_status}" =~ ^2 ]]; then
  echo "ERROR: el backend respondió HTTP ${http_status} al crear el usuario." >&2
  jq . "${response_file}" >&2 || cat "${response_file}" >&2
  exit 1
fi

admin_user_id="$(jq -r '.id // .user.id // empty' "${response_file}")"
if [ -z "${admin_user_id}" ]; then
  echo "ERROR: no se pudo obtener el UUID del usuario creado." >&2
  jq . "${response_file}" >&2
  exit 1
fi

docker exec -i "${DB_CONTAINER}" \
  psql -v ON_ERROR_STOP=1 -U "${DB_USER}" -d "${DB_NAME}" \
  -v admin_user_id="${admin_user_id}" \
  -v admin_email="${ADMIN_EMAIL}" \
  -v admin_name="${ADMIN_NAME}" \
  < "${REPO_ROOT}/deploy/mini-pc/link-local-admin.sql"

echo "Administrador local creado y vinculado: ${ADMIN_EMAIL}"
unset ADMIN_PASSWORD SUPABASE_SECRET_KEY

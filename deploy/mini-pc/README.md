# Despliegue local de IsiVoltPro Activos

Esta guía prepara IsiVoltPro Activos en el mini PC sin utilizar el proyecto de Supabase Cloud de HomeServe.

## Separación obligatoria

- **HomeServe** conserva su backend administrado y `ot.isivoltpro.com`.
- **IsiVoltPro Activos** utiliza un backend autoalojado independiente.
- PocketBase puede continuar en `127.0.0.1:8090`; estos archivos no lo modifican.
- No se comparten usuarios, UUID, claves, Storage ni datos entre aplicaciones.

## Arquitectura

| Servicio | Dirección local | Dirección pública prevista |
|---|---:|---|
| Web Activos | `http://127.0.0.1:5175` | `https://activos.isivoltpro.com` |
| API/Auth/Storage local | `http://127.0.0.1:8000` | `https://api.activos.isivoltpro.com` |
| PocketBase existente | `http://127.0.0.1:8090` | Sin cambios |
| HomeServe | Servicio actual | `https://ot.isivoltpro.com` |

Cloudflare Tunnel publicará la web y la API mediante conexiones salientes; no es necesario abrir puertos del router.

## Estado de preparación

Estos archivos preparan el despliegue, pero no convierten por sí solos el mini PC en producción. Antes de utilizar datos reales deben completarse:

- copia automática fuera del propio mini PC;
- prueba de restauración en QA;
- SMTP para invitaciones y recuperación;
- monitorización de disco, memoria, contenedores y certificados;
- actualización periódica de sistema y stack;
- pruebas RLS y E2E con dos tenants.

## 1. Comprobar recursos

El stack completo necesita como mínimo 4 GB de RAM, 2 núcleos y 40 GB SSD. Se recomiendan 8 GB, 4 núcleos y 80 GB o más.

```bash
free -h
nproc
df -h /
docker --version
docker compose version
git --version
```

No continúes si el disco está casi lleno o Docker no funciona correctamente.

## 2. Instalar el backend autoalojado

Utiliza el instalador Docker oficial en un directorio independiente:

```bash
sudo mkdir -p /opt/isivoltpro-activos
sudo chown -R "$USER":"$USER" /opt/isivoltpro-activos
cd /opt/isivoltpro-activos
curl -fsSL https://supabase.link/setup.sh -o setup-supabase.sh
less setup-supabase.sh
sh setup-supabase.sh
```

El script debe inspeccionarse antes de ejecutarlo. Durante el asistente configura:

```text
SUPABASE_PUBLIC_URL=https://api.activos.isivoltpro.com
API_EXTERNAL_URL=https://api.activos.isivoltpro.com/auth/v1
SITE_URL=https://activos.isivoltpro.com
PROXY_DOMAIN=api.activos.isivoltpro.com
```

Arranca y comprueba el backend:

```bash
cd /opt/isivoltpro-activos/supabase-project
sh run.sh start
docker compose ps
sh run.sh secrets
```

Guarda en un gestor privado:

```text
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
POSTGRES_PASSWORD
DASHBOARD_USERNAME
DASHBOARD_PASSWORD
```

`SUPABASE_SECRET_KEY`, las contraseñas y el archivo `.env` del backend nunca deben entrar en GitHub ni en el frontend.

## 3. Descargar la aplicación

```bash
cd /home/isi
git clone https://github.com/izc05/isivolpro-activos.git
cd isivolpro-activos
git checkout main
git pull --ff-only
```

## 4. Crear la configuración privada

```bash
cp .env.mini-pc.example .env.mini-pc
chmod 600 .env.mini-pc
nano .env.mini-pc
```

Contenido esperado:

```dotenv
VITE_BACKEND_MODE=self-hosted
VITE_SUPABASE_URL=https://api.activos.isivoltpro.com
VITE_SUPABASE_PUBLISHABLE_KEY=CLAVE_PUBLICA_GENERADA_EN_EL_MINI_PC
VITE_ENABLE_DEMO_SIGNUP=false
ACTIVOS_WEB_BIND=127.0.0.1
ACTIVOS_WEB_PORT=5175
```

## 5. Aplicar la base de datos

```bash
chmod +x deploy/mini-pc/*.sh
deploy/mini-pc/apply-database.sh
```

El aplicador:

- ordena las migraciones numeradas;
- excluye seeds y registro demo;
- guarda versión y checksum en `isivoltpro_schema_migrations`;
- omite migraciones ya aplicadas;
- se detiene si una migración aplicada fue modificada;
- ejecuta cada migración nueva dentro de una transacción.

No edites una migración ya aplicada. Crea una migración nueva.

## 6. Crear el primer administrador

Elige un correo real y una contraseña nueva de al menos 12 caracteres.

```bash
export SUPABASE_ADMIN_URL='http://127.0.0.1:8000'
export SUPABASE_SECRET_KEY='CLAVE_SECRETA_SOLO_DEL_SERVIDOR'
export ADMIN_EMAIL='TU_CORREO_REAL'
export ADMIN_PASSWORD='UNA_CONTRASEÑA_NUEVA_Y_SEGURA'
export ADMIN_NAME='Isicio Zafra'

deploy/mini-pc/create-local-admin.sh
unset SUPABASE_SECRET_KEY ADMIN_PASSWORD
```

El script crea el usuario en Auth, actualiza su perfil, crea la organización local `IsiVoltPro Activos` y asigna la membresía `admin_cliente`.

## 7. Construir y arrancar la web

La imagen utiliza Node 22.22 y `npm ci`, por lo que reproduce exactamente `package-lock.json`.

```bash
docker compose \
  --env-file .env.mini-pc \
  -f docker-compose.mini-pc.yml \
  up -d --build

docker compose -f docker-compose.mini-pc.yml ps
curl -I http://127.0.0.1:5175
```

La web solo se enlaza a `127.0.0.1`; no queda expuesta directamente en la red.

## 8. Crear una primera copia

```bash
export SUPABASE_PROJECT_DIR='/opt/isivoltpro-activos/supabase-project'
export ACTIVOS_BACKUP_ROOT='/opt/isivoltpro-activos/backups'
export ACTIVOS_BACKUP_RETENTION_DAYS='14'

deploy/mini-pc/backup-local.sh
```

La copia contiene:

- `database.dump` en formato personalizado de PostgreSQL;
- `storage.tar.gz`;
- manifiesto y checksums SHA-256.

Esta copia sigue estando en el mismo equipo. Debe replicarse cifrada a otro dispositivo o almacenamiento antes de usar datos reales.

## 9. Configurar Cloudflare Tunnel

En el túnel existente `isivolt-mini-pc`, añade:

```text
activos.isivoltpro.com      -> http://localhost:5175
api.activos.isivoltpro.com  -> http://localhost:8000
```

No cambies:

```text
ot.isivoltpro.com -> servicio HomeServe existente
```

Después verifica:

```bash
curl -I https://activos.isivoltpro.com
curl -I https://api.activos.isivoltpro.com/auth/v1/health
```

Studio debe mantenerse protegido y no exponerse públicamente sin controles adicionales.

## 10. Actualizar la aplicación

Antes de cada actualización:

```bash
cd /home/isi/isivolpro-activos
deploy/mini-pc/backup-local.sh
git pull --ff-only
deploy/mini-pc/apply-database.sh
docker compose \
  --env-file .env.mini-pc \
  -f docker-compose.mini-pc.yml \
  up -d --build
```

Después comprueba salud, inicio de sesión, una consulta de activos y una OT de prueba.

## Resultado esperado

- HomeServe continúa sin cambios.
- Activos funciona aunque su antiguo proyecto cloud esté pausado o eliminado.
- El frontend no contiene URL ni clave cloud por defecto.
- Datos, usuarios y Storage permanecen en el mini PC.
- El acceso externo utiliza HTTPS mediante Cloudflare Tunnel.
- Si el mini PC se apaga o pierde Internet, Activos deja de estar disponible externamente.

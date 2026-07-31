# IsiVoltPro Activos en el mini PC

Esta configuración separa completamente las dos aplicaciones:

- **HomeServe** continúa usando su proyecto administrado de Supabase.
- **IsiVoltPro Activos** usa un backend autoalojado en el mini PC.
- PocketBase puede seguir funcionando en `127.0.0.1:8090`; esta instalación no modifica ese servicio.

La aplicación mantiene la API, Auth, PostgreSQL, Storage y políticas RLS que ya utiliza el código, pero todo se ejecuta en Docker dentro del mini PC. No se usa ningún proyecto de Supabase Cloud ni se comparte una clave con HomeServe.

## Arquitectura propuesta

| Servicio | Dirección local | Dirección pública sugerida |
|---|---:|---|
| IsiVoltPro Activos web | `http://127.0.0.1:5175` | `https://activos.isivoltpro.com` |
| Backend autoalojado | `http://127.0.0.1:8000` | `https://api.activos.isivoltpro.com` |
| PocketBase existente | `http://127.0.0.1:8090` | Sin cambios |
| HomeServe | Servicio actual | `https://ot.isivoltpro.com` |

Cloudflare Tunnel publicará únicamente los dos primeros servicios sin abrir puertos del router.

## 1. Comprobar recursos

El backend completo necesita como mínimo 4 GB de RAM, 2 núcleos y unos 40 GB libres. Se recomiendan 8 GB de RAM para trabajar con margen.

```bash
free -h
nproc
df -h /
docker --version
docker compose version
```

## 2. Instalar el backend autoalojado

Usar la instalación Docker oficial en un directorio independiente:

```bash
sudo mkdir -p /opt/isivoltpro-activos
sudo chown -R "$USER":"$USER" /opt/isivoltpro-activos
cd /opt/isivoltpro-activos
curl -fsSL https://supabase.link/setup.sh -o setup-supabase.sh
less setup-supabase.sh
sh setup-supabase.sh
```

Durante el asistente usar:

```text
SUPABASE_PUBLIC_URL=https://api.activos.isivoltpro.com
API_EXTERNAL_URL=https://api.activos.isivoltpro.com/auth/v1
SITE_URL=https://activos.isivoltpro.com
PROXY_DOMAIN=api.activos.isivoltpro.com
```

Arrancar y comprobar el backend:

```bash
cd /opt/isivoltpro-activos/supabase-project
sh run.sh start
docker compose ps
sh run.sh secrets
```

Guardar de forma privada estos dos valores generados:

```text
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

Nunca copiar `SUPABASE_SECRET_KEY` al frontend ni a GitHub.

## 3. Descargar la aplicación

```bash
cd /home/isi
git clone https://github.com/izc05/isivolpro-activos.git
cd isivolpro-activos
git checkout agent/isivoltpro-brand-refresh
```

Cuando la PR se integre, el último comando se sustituirá por:

```bash
git checkout main
git pull --ff-only
```

## 4. Crear la configuración privada

```bash
cp .env.mini-pc.example .env.mini-pc
nano .env.mini-pc
```

Configurar:

```dotenv
VITE_BACKEND_MODE=self-hosted
VITE_SUPABASE_URL=https://api.activos.isivoltpro.com
VITE_SUPABASE_PUBLISHABLE_KEY=CLAVE_PUBLICA_GENERADA_EN_EL_MINI_PC
VITE_ENABLE_DEMO_SIGNUP=false
ACTIVOS_WEB_BIND=127.0.0.1
ACTIVOS_WEB_PORT=5175
```

## 5. Crear la base de datos de Activos

```bash
chmod +x deploy/mini-pc/apply-database.sh
deploy/mini-pc/apply-database.sh
```

El script aplica en orden las migraciones de `src/sql`, omitiendo los datos demo y el registro demo.

## 6. Crear el administrador local

Elegir un correo real y una contraseña nueva para esta instalación. Este será el correo definitivo de acceso a IsiVoltPro Activos.

```bash
chmod +x deploy/mini-pc/create-local-admin.sh

export SUPABASE_PUBLIC_URL='https://api.activos.isivoltpro.com'
export SUPABASE_SECRET_KEY='CLAVE_SECRETA_SOLO_DEL_SERVIDOR'
export ADMIN_EMAIL='TU_CORREO_REAL'
export ADMIN_PASSWORD='UNA_CONTRASEÑA_NUEVA_Y_SEGURA'
export ADMIN_NAME='Isicio Zafra'

deploy/mini-pc/create-local-admin.sh
unset SUPABASE_SECRET_KEY ADMIN_PASSWORD
```

El script crea el usuario de Auth, su perfil, el cliente local `IsiVoltPro Activos` y la membresía de administrador.

## 7. Construir y arrancar la web

```bash
docker compose \
  --env-file .env.mini-pc \
  -f docker-compose.mini-pc.yml \
  up -d --build

docker compose -f docker-compose.mini-pc.yml ps
curl -I http://127.0.0.1:5175
```

## 8. Rutas de Cloudflare Tunnel

En el túnel existente `isivolt-mini-pc`, añadir dos aplicaciones publicadas:

```text
activos.isivoltpro.com      -> http://localhost:5175
api.activos.isivoltpro.com  -> http://localhost:8000
```

No cambiar la ruta actual de HomeServe:

```text
ot.isivoltpro.com -> servicio HomeServe existente
```

## 9. Actualizaciones posteriores

```bash
cd /home/isi/isivolpro-activos
git pull --ff-only
docker compose \
  --env-file .env.mini-pc \
  -f docker-compose.mini-pc.yml \
  up -d --build
```

Antes de actualizar el backend o aplicar nuevas migraciones, realizar una copia de seguridad de la base de datos y del volumen de Storage.

## Resultado esperado

- HomeServe continúa operativo en Supabase Cloud.
- IsiVoltPro Activos funciona aunque el proyecto cloud de Activos esté pausado o eliminado.
- Usuarios, datos, fotografías y documentos de Activos permanecen en el mini PC.
- El acceso externo se realiza por HTTPS mediante Cloudflare Tunnel.
- Si el mini PC está apagado o pierde Internet, Activos no estará disponible externamente.

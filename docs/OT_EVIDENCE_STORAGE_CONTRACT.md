# Contrato de evidencias, Storage, firmas e informes OT

Estado: **vigente para diseño; sin migración de archivos todavía**

## 1. Objetivo

Evitar que fotografías y documentos de distinta naturaleza aparezcan mezclados, pierdan trazabilidad o dependan de URLs públicas. Este contrato toma la separación visual probada en HomeServe y conserva la profundidad documental de Activos.

## 2. Principio de propiedad

Cada archivo tiene una única entidad propietaria y un propósito explícito. Puede mostrarse desde vistas relacionadas, pero no se duplica ni se reasocia implícitamente.

```text
Cliente
└── Instalación
    ├── Fotos de instalación
    ├── Documentos de instalación
    ├── Ubicaciones
    └── Activos
        ├── Fotos de activo
        ├── Documentos de activo
        └── Órdenes de trabajo
            ├── Fotos generales OT
            ├── Respuestas checklist
            │   └── Fotos de punto
            ├── Firmas
            └── Informes
```

## 3. Categorías

### 3.1 Fotografías de instalación

Uso: contexto estable del lugar.

Ejemplos:

- fachada;
- acceso;
- puerta o código de entrada;
- sala técnica;
- cuadro de ubicación;
- instrucciones visuales permanentes.

Nunca deben usarse como evidencia de que una intervención fue realizada.

### 3.2 Fotografías de activo

Uso: identidad y estado permanente del equipo.

Ejemplos:

- placa de características;
- vista general;
- conexiones;
- número de serie;
- ubicación del activo;
- esquema o etiqueta.

### 3.3 Fotografías generales de OT

Uso: evidencias no vinculadas a un punto concreto.

Categorías recomendadas:

- `antes`;
- `durante`;
- `despues`;
- `resultado`;
- `incidencia`;
- `material`;
- `otro`.

### 3.4 Fotografías de checklist

Uso: demostrar una respuesta concreta. Requieren `checklist_response_id` y heredan OT, tenant, punto y snapshot.

No deben aparecer en la galería general de OT salvo una vista agregada que las identifique expresamente como evidencia de checklist.

### 3.5 Firmas

Dos tipos separados:

- técnico;
- cliente/responsable.

Cada firma registra firmante, rol, fecha, visita/OT, hash o metadata necesaria y ruta privada. No se representa mediante una URL pública permanente.

### 3.6 Informes

Cada informe registra:

- versión;
- tipo;
- fecha de generación;
- usuario o proceso generador;
- OT;
- ruta privada;
- tamaño y MIME;
- hash opcional;
- estado vigente/sustituido;
- motivo de regeneración cuando proceda.

## 4. Tablas lógicas objetivo

Los nombres finales se decidirán tras inventario, pero el contrato lógico es:

| Colección | Clave propietaria | Relación opcional |
|---|---|---|
| `installation_photos` | `instalacion_id` | ubicación |
| `asset_photos` | `activo_id` | instalación |
| `work_order_photos` | `orden_trabajo_id` | visita |
| `checklist_response_photos` | `respuesta_id` | OT/visita derivadas |
| `work_order_signatures` | `orden_trabajo_id` | visita/tipo |
| `work_order_reports` | `orden_trabajo_id` | versión |
| `documents` | entidad polimórfica controlada | visibilidad/tipo |

Se evitarán relaciones polimórficas abiertas sin constraints. Cuando se use `entity_type/entity_id`, el backend validará tipos permitidos y pertenencia al tenant.

## 5. Convención de rutas

```text
{tenant_id}/installations/{installation_id}/photos/{uuid}.{ext}
{tenant_id}/assets/{asset_id}/photos/{uuid}.{ext}
{tenant_id}/work-orders/{work_order_id}/visits/{visit_id}/photos/{uuid}.{ext}
{tenant_id}/work-orders/{work_order_id}/checklist/{response_id}/{uuid}.{ext}
{tenant_id}/work-orders/{work_order_id}/signatures/{type}/{uuid}.{ext}
{tenant_id}/work-orders/{work_order_id}/reports/v{version}/{uuid}.pdf
```

La ruta no concede acceso por sí misma. RLS/Storage comprueba tenant, entidad y rol.

## 6. Metadata obligatoria

- `tenant_id`;
- bucket;
- path;
- filename original normalizado;
- MIME;
- tamaño;
- categoría;
- entidad propietaria;
- usuario creador;
- fecha;
- estado;
- checksum cuando sea útil;
- `checklist_response_id` para fotos de punto;
- versión para informes.

La política de Storage puede validar metadata de tamaño además del registro en tabla.

## 7. Seguridad

1. Buckets privados.
2. Nunca `service_role` en frontend.
3. URLs firmadas de corta duración.
4. Validación de MIME real y extensión.
5. Límites de tamaño por categoría.
6. Nombre generado en servidor; no confiar en el original.
7. Ruta con tenant como primer segmento.
8. Upsert solo cuando el caso esté controlado y tenga permisos SELECT/INSERT/UPDATE.
9. Eliminación lógica o registro auditado antes de borrar Storage.
10. Escaneo de malware cuando el producto pase a clientes externos y documentos arbitrarios.

## 8. Límites iniciales recomendados

| Tipo | Tamaño máximo inicial | Formatos |
|---|---:|---|
| Foto móvil | 12 MB | JPEG, PNG, WebP |
| Firma | 2 MB | PNG, JPEG |
| PDF informe | 25 MB | PDF |
| Documento técnico | 50 MB | PDF y lista controlada |
| Vídeo | No subir en Core inicial | Enlace externo o módulo específico |

Las imágenes se comprimirán en cliente o servidor conservando suficiente detalle técnico. La original podrá mantenerse cuando la evidencia reglamentaria lo requiera.

## 9. Interfaz

La ficha OT tendrá grupos separados:

- contexto de instalación;
- galería de instalación;
- activo;
- evidencias generales de la OT;
- fotografías del checklist;
- materiales;
- firmas;
- informes.

Cada tarjeta debe indicar claramente entidad, fecha, categoría y autor. No usar una única galería llamada «Fotos» para todo.

## 10. Reglas de cierre

El motor de requisitos consulta metadata, no solo elementos visuales:

- fotos iniciales requeridas;
- fotos finales requeridas;
- fotos obligatorias por punto;
- firma técnica;
- firma cliente;
- informe PDF vigente.

Un archivo subido pero no registrado correctamente no satisface el requisito. Un registro sin archivo accesible tampoco lo satisface.

## 11. Eliminación y retención

- Una OT validada no permite borrar evidencias ordinariamente.
- La corrección añade nuevas evidencias sin destruir las anteriores.
- Una cancelación conserva archivos e historial según política de retención.
- La eliminación por privacidad o error requiere rol, motivo y auditoría.
- Los informes sustituidos se marcan, no se sobrescriben silenciosamente.
- La política comercial definirá plazos de conservación por tipo de cliente y normativa.

## 12. Migración de archivos existentes

Antes de mover archivos:

1. inventariar buckets y rutas;
2. unir cada objeto con su metadata;
3. localizar huérfanos en tabla y Storage;
4. identificar fotos de checklist actualmente mezcladas;
5. copiar, verificar hash/tamaño y luego cambiar referencias;
6. mantener origen hasta validar;
7. ejecutar rollback si existen diferencias.

Nunca renombrar o mover masivamente objetos desde el frontend.

## 13. Pruebas mínimas

- tenant cruzado rechazado;
- técnico sin OT asignada rechazado;
- MIME/tamaño inválido rechazado;
- foto checklist no aparece como foto general;
- galería instalación no contiene OT;
- URL firmada caduca;
- requisito de cierre detecta ausencia real;
- regeneración PDF incrementa versión;
- eliminación genera auditoría;
- backup y restauración mantienen metadata y objetos.

## 14. Criterio de cierre

El contrato está implantado cuando una misma OT puede mostrar todos sus archivos en grupos correctos, con acceso privado y trazabilidad, y cuando el cierre valida la existencia real de cada evidencia configurada.

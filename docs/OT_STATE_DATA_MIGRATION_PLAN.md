# Plan reversible de migración de estados y datos OT

Estado: **diseño; no ejecutar todavía**  
Dependencias: contrato OT aprobado, pruebas de caracterización, backup y entorno QA.

## 1. Objetivo

Migrar el modelo histórico de estados de IsiVoltPro Activos al contrato canónico sin perder OT, visitas, checklist, evidencias, firmas, informes ni auditoría.

Esta fase no autoriza cambios en producción. Define consultas, mapeo, verificación y rollback.

## 2. Precondiciones obligatorias

1. Backup lógico completo de PostgreSQL.
2. Backup del Storage y su metadata.
3. Restauración probada en entorno QA.
4. Hash o recuento de tablas críticas antes de migrar.
5. Aplicación desplegada con adaptadores capaces de leer modelo antiguo y nuevo.
6. Ventana de mantenimiento definida.
7. Script transaccional e idempotente.
8. Plan de rollback probado en QA.

## 3. Inventario previo

Ejecutar y conservar resultados:

```sql
select estado, count(*)
from public.ordenes_trabajo
where deleted_at is null
 group by estado
 order by estado;

select
  count(*) as total_ot,
  count(*) filter (where tecnico_asignado_id is null) as sin_tecnico,
  count(*) filter (where instalacion_id is null) as sin_instalacion,
  count(*) filter (where tenant_id is null) as sin_tenant
from public.ordenes_trabajo;

select ot.estado, count(v.*) as visitas
from public.ordenes_trabajo ot
left join public.ot_visitas v on v.orden_trabajo_id = ot.id
 group by ot.estado
 order by ot.estado;
```

Los nombres exactos se ajustarán al esquema real verificado antes de ejecutar.

## 4. Mapeo de estados

| Estado origen | Estado destino | Motivo bloqueo | Observación |
|---|---|---|---|
| `BORRADOR` | `BORRADOR` | null | Sin cambio |
| `NUEVA` | `NUEVA` | null | Sin cambio |
| `NUEVO` | `NUEVA` | null | Histórico |
| `PENDIENTE` | `NUEVA` | null | Histórico |
| `SIN_TECNICO` | `NUEVA` | null | Histórico |
| `SIN_TECNICO_ASIGNADO` | `NUEVA` | null | Histórico |
| `ASIGNADA` | `ASIGNADA` | null | Sin cambio |
| `ACEPTADA` | `ACEPTADA` | null | Sin cambio |
| `EN_CURSO` | `EN_CURSO` | null | Sin cambio |
| `PAUSADA` | `BLOQUEADA` | `OTRO` | Conservar nota existente |
| `PENDIENTE_MATERIAL` | `BLOQUEADA` | `MATERIAL` | Conservar materiales/nota |
| `PENDIENTE_CLIENTE` | `BLOQUEADA` | `RESPONSABLE` | Conservar nota/acceso |
| `FINALIZADA` | `FINALIZADA_TECNICO` | null | Pendiente de revisión salvo validación existente |
| `FIRMADA` | `FINALIZADA_TECNICO` | null | Histórico |
| `INFORME_GENERADO` | `FINALIZADA_TECNICO` | null | Histórico |
| `VALIDADA` | `VALIDADA` | null | Sin cambio |
| `CERRADA` | `VALIDADA` | null | Histórico |
| `CERRADO` | `VALIDADA` | null | Histórico |
| `CANCELADA` | `CANCELADA` | null | Sin cambio |

## 5. Campos nuevos o normalizados

Antes de migrar estados, confirmar o crear de forma compatible:

- `bloqueo_motivo`;
- `bloqueo_notas`;
- `bloqueado_at`;
- `bloqueado_by`;
- `finalizada_tecnico_at`;
- `finalizada_tecnico_by`;
- `validated_at` / `validated_by` o equivalentes existentes;
- `cancel_reason`;
- `reopen_reason`;
- `status_schema_version`.

No deben duplicarse columnas equivalentes ya presentes. El inventario del esquema decidirá el nombre final.

## 6. Estrategia de despliegue

### Paso 1 — Lectura compatible

El frontend reconoce estados antiguos y canónicos. Un valor desconocido genera error controlado, no una conversión silenciosa.

### Paso 2 — Escritura canónica

Las nuevas operaciones escriben únicamente estados canónicos. Los registros históricos siguen leyéndose mediante adaptador.

### Paso 3 — Migración QA

Aplicar el script sobre una copia restaurada. Verificar recuentos, transiciones, vistas, RLS, informes y auditoría.

### Paso 4 — Migración productiva

- activar mantenimiento;
- detener escrituras;
- backup final;
- ejecutar en transacción;
- validar conteos;
- levantar aplicación;
- prueba humo por rol.

### Paso 5 — Retirada diferida

La compatibilidad histórica no se elimina hasta que una consulta confirme cero estados antiguos durante al menos dos releases estables.

## 7. Esqueleto transaccional

```sql
begin;

-- Bloqueo con motivo
update public.ordenes_trabajo
set estado = 'BLOQUEADA',
    bloqueo_motivo = case estado
      when 'PENDIENTE_MATERIAL' then 'MATERIAL'
      when 'PENDIENTE_CLIENTE' then 'RESPONSABLE'
      else coalesce(bloqueo_motivo, 'OTRO')
    end,
    status_schema_version = 2
where estado in ('PAUSADA', 'PENDIENTE_MATERIAL', 'PENDIENTE_CLIENTE');

-- Final técnico
update public.ordenes_trabajo
set estado = 'FINALIZADA_TECNICO',
    status_schema_version = 2
where estado in ('FINALIZADA', 'FIRMADA', 'INFORME_GENERADO');

-- Validación histórica
update public.ordenes_trabajo
set estado = 'VALIDADA',
    status_schema_version = 2
where estado in ('CERRADA', 'CERRADO');

-- Nueva histórica
update public.ordenes_trabajo
set estado = 'NUEVA',
    status_schema_version = 2
where estado in ('NUEVO', 'PENDIENTE', 'SIN_TECNICO', 'SIN_TECNICO_ASIGNADO');

-- Aquí se ejecutan comprobaciones; no confirmar si fallan.
commit;
```

Este bloque es ilustrativo y no se ejecutará sin adaptar nombres, constraints, triggers, RPC y auditoría.

## 8. Verificación posterior

```sql
select estado, count(*)
from public.ordenes_trabajo
 group by estado
 order by estado;

select count(*) as estados_no_canonicos
from public.ordenes_trabajo
where estado not in (
  'BORRADOR','NUEVA','ASIGNADA','ACEPTADA','EN_CURSO',
  'BLOQUEADA','FINALIZADA_TECNICO','VALIDADA','CANCELADA'
);

select count(*) as bloqueadas_sin_motivo
from public.ordenes_trabajo
where estado = 'BLOQUEADA'
  and bloqueo_motivo is null;
```

Además:

- comparar total de OT antes/después;
- comparar visitas, respuestas, fotos, materiales, firmas e informes por OT;
- comprobar que ninguna OT cambia de tenant;
- comprobar RLS por cada rol;
- generar informes de muestras históricas;
- revisar auditoría de migración.

## 9. Auditoría de migración

Crear un evento por lote o por OT según volumen, incluyendo:

- versión origen/destino;
- estado anterior/nuevo;
- motivo derivado;
- fecha;
- operador técnico;
- identificador de ejecución.

No atribuir la migración a un usuario final.

## 10. Rollback

Rollback preferido: restaurar backup completo cuando la validación falle antes de reabrir escrituras.

Como defensa adicional, conservar temporalmente:

- `legacy_estado` o tabla de mapeo de migración;
- identificador de ejecución;
- recuentos y exportación de IDs afectados.

No intentar un rollback parcial improvisado después de que la aplicación haya generado nuevas operaciones canónicas.

## 11. Criterio de aprobación

La migración se aprueba cuando:

- todos los estados son canónicos;
- todas las bloqueadas tienen motivo;
- no se pierde ninguna relación;
- los roles y RLS pasan;
- los informes históricos siguen accesibles;
- el backup puede restaurarse;
- no hay escrituras antiguas durante el periodo de observación.

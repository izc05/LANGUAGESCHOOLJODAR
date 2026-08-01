# Contrato canónico del motor OT de IsiVoltPro

Estado: **vigente para diseño y migración**  
Ámbito: IsiVoltPro Activos  
Fuentes comparadas: `izc05/isivolpro-activos` y `izc05/homeserve`

## 1. Propósito

Este documento define el comportamiento objetivo del motor de órdenes de trabajo de IsiVoltPro. Ninguna migración, pantalla, RPC o servicio nuevo debe introducir estados, permisos o evidencias incompatibles con este contrato sin una ADR aprobada.

HomeServe se utiliza como fuente de patrones maduros de ejecución, tipado, validación, consultas y experiencia de usuario. IsiVoltPro Activos conserva la propiedad del modelo maestro: clientes, instalaciones, ubicaciones, activos, QR/NFC, mantenimiento, especialidades, materiales, firmas, informes y auditoría.

## 2. Principios no negociables

1. La OT pertenece a un `tenant_id` y nunca puede cruzar clientes.
2. La instalación es obligatoria; ubicación y activo pueden ser opcionales.
3. Administración y ejecución técnica son responsabilidades distintas.
4. El técnico asignado ejecuta visita, checklist, evidencias, materiales y firmas.
5. La finalización técnica no equivale al cierre administrativo.
6. Una OT validada o cancelada es de solo lectura, salvo reapertura administrativa explícita y auditada.
7. No se permite finalizar mediante una actualización genérica de estado.
8. Los requisitos de cierre se congelan al crear o preparar la OT.
9. Las evidencias de instalación, activo, OT y punto de checklist son colecciones distintas.
10. Toda acción crítica genera historial y auditoría.
11. HomeServe y Activos no comparten base de datos, usuarios, Storage, claves ni despliegue.
12. La convergencia se realiza mediante contratos y adaptadores, nunca copiando el repositorio completo.

## 3. Entidad canónica `WorkOrder`

### Identidad y pertenencia

| Campo | Tipo | Obligatorio | Regla |
|---|---|---:|---|
| `id` | UUID | Sí | Identificador interno inmutable |
| `tenant_id` | UUID | Sí | Aislamiento multiempresa |
| `codigo_ot` | texto | Sí | Único dentro del tenant |
| `created_by` | UUID | Sí | Usuario creador |
| `created_at` | timestamptz | Sí | Inmutable |
| `updated_at` | timestamptz | Sí | Gestionado por backend |

### Contexto operativo

| Campo | Tipo | Obligatorio | Regla |
|---|---|---:|---|
| `cliente_id` | UUID | Sí | Cliente propietario |
| `instalacion_id` | UUID | Sí | Lugar principal del trabajo |
| `ubicacion_id` | UUID | No | Zona interior o funcional |
| `activo_id` | UUID | No | Equipo afectado |
| `tecnico_asignado_id` | UUID | No al crear | Obligatorio antes de aceptar |
| `plan_mantenimiento_id` | UUID | No | Origen preventivo |
| `incidencia_id` | UUID | No | Aviso que originó la OT |
| `ot_origen_id` | UUID | No | OT relacionada o seguimiento |

### Definición del trabajo

| Campo | Tipo | Obligatorio | Regla |
|---|---|---:|---|
| `titulo` | texto | Sí | Claro y accionable |
| `descripcion` | texto | Sí | Problema o alcance |
| `tipo` | enum | Sí | Taxonomía canónica |
| `prioridad` | enum | Sí | `baja`, `normal`, `alta`, `urgente`, `critica` |
| `instrucciones_tecnico` | texto | No | Procedimiento específico |
| `riesgos_precauciones` | texto | No | Seguridad y acceso |
| `resultado_esperado` | texto | No | Criterio de éxito |
| `fecha_planificada` | timestamptz | No | Inicio previsto |
| `fecha_limite` | timestamptz | No | SLA o vencimiento |
| `duracion_estimada_min` | entero | No | Planificación |

### Configuración congelada

La OT debe guardar una configuración inmutable o versionada con, como mínimo:

```json
{
  "requiere_checklist": false,
  "requiere_fotos_iniciales": false,
  "requiere_fotos_finales": false,
  "requiere_mediciones": false,
  "requiere_materiales": false,
  "requiere_firma_tecnico": false,
  "requiere_firma_cliente": false,
  "requiere_prueba_funcional": false,
  "requiere_informe_pdf": false,
  "requiere_revision_admin": true,
  "requiere_verificacion_qr": false
}
```

La modificación posterior de una plantilla no cambia los requisitos de una OT ya creada.

## 4. Estados canónicos

| Estado | Responsable | Significado |
|---|---|---|
| `BORRADOR` | Administración | Preparación no lanzada |
| `NUEVA` | Administración | Creada y pendiente de asignación o planificación |
| `ASIGNADA` | Administración | Técnico asignado; pendiente de aceptación |
| `ACEPTADA` | Técnico | Trabajo aceptado; pendiente de inicio |
| `EN_CURSO` | Técnico | Intervención activa |
| `BLOQUEADA` | Técnico / coordinación | No puede continuar por causa registrada |
| `FINALIZADA_TECNICO` | Técnico | Ejecución terminada; pendiente de revisión |
| `VALIDADA` | Administración | Revisada y cerrada definitivamente |
| `CANCELADA` | Administración | Anulada con motivo, sin borrar historial |

### Motivos de bloqueo

- `MATERIAL`
- `ACCESO`
- `RESPONSABLE`
- `EMPRESA_EXTERNA`
- `SEGURIDAD`
- `OTRO`

Los estados históricos de Activos `PAUSADA`, `PENDIENTE_MATERIAL` y `PENDIENTE_CLIENTE` se adaptarán a `BLOQUEADA` junto con su motivo. Durante la transición se mantendrá lectura compatible, pero no se crearán nuevas OT con esos estados una vez desplegado el contrato.

### Transiciones permitidas

```text
BORRADOR -> NUEVA | ASIGNADA | CANCELADA
NUEVA -> ASIGNADA | CANCELADA
ASIGNADA -> ACEPTADA | CANCELADA
ACEPTADA -> EN_CURSO | BLOQUEADA | CANCELADA
EN_CURSO -> BLOQUEADA | FINALIZADA_TECNICO | CANCELADA
BLOQUEADA -> EN_CURSO | CANCELADA
FINALIZADA_TECNICO -> VALIDADA | EN_CURSO
VALIDADA -> EN_CURSO (solo reapertura administrativa)
CANCELADA -> sin transición
```

La transición a `FINALIZADA_TECNICO` solo puede realizarla el cierre guiado después de verificar requisitos. La transición a `VALIDADA` solo puede realizarla un rol autorizado tras revisión administrativa.

## 5. Tipos canónicos

- `correctiva`
- `preventiva`
- `conductiva`
- `inspeccion`
- `revision_legal`
- `mejora`
- `aviso_cliente`
- `instalacion`
- `sustitucion`
- `medicion`
- `urgencia`
- `otro`

Los módulos técnicos podrán añadir subtipo o plantilla, pero no ciclos de estado diferentes.

## 6. Roles y responsabilidades

| Capacidad | Superadmin | Admin cliente | Coordinador | Técnico | Técnico externo | Cliente lectura |
|---|---:|---:|---:|---:|---:|---:|
| Crear/editar borrador | Sí | Sí | Sí | No | No | No |
| Asignar/reasignar | Sí | Sí | Sí | No | No | No |
| Aceptar OT asignada | No | No | No | Sí | Sí | No |
| Ejecutar visita/checklist | No | No | No | Sí | Sí | No |
| Bloquear/reanudar | No | No | Supervisión | Sí | Sí | No |
| Finalizar técnicamente | No | No | No | Sí | Sí | No |
| Solicitar corrección | Sí | Sí | Sí | No | No | No |
| Validar | Sí | Sí | Sí | No | No | No |
| Cancelar | Sí | Sí | Sí | No | No | No |
| Reabrir | Sí | Sí | Sí | No | No | No |
| Ver auditoría completa | Sí | Sí | Sí | No | No | No |
| Consulta autorizada | Sí | Sí | Sí | OT asignadas | OT asignadas | Sí |

La base de datos, no solo la interfaz, debe aplicar estas reglas.

## 7. Checklist canónico

Una plantilla tiene versión explícita y se compone de secciones y puntos ordenados. Cada punto puede definir tipo de respuesta, obligatoriedad, foto obligatoria, medición/unidad, límites, observación, defecto, acción y material.

Al preparar la OT se guardan `template_id`, `template_version_id`, `checklist_snapshot`, fecha y usuario. Las respuestas se asocian al punto del snapshot, no a la plantilla viva.

Valores base:

- `pendiente`
- `ok`
- `no_ok`
- `no_aplica`

Una respuesta obligatoria pendiente bloquea la finalización. Una fotografía de checklist debe llevar `checklist_response_id` y no aparecer mezclada en la galería genérica.

## 8. Evidencias y Storage

Colecciones separadas:

1. `installation_photos`
2. `asset_photos`
3. `work_order_photos`
4. `checklist_response_photos`
5. `signatures`
6. `reports`
7. `documents`

Reglas: buckets privados, ruta iniciada por `tenant_id`, MIME/tamaño validados, URL firmada temporal, metadata en tabla, eliminación trazable y sin asociaciones implícitas.

## 9. Visitas y tiempo

Una OT admite una o varias visitas. Cada visita registra técnico, inicio/fin, verificación QR opcional, resumen, resultado, tiempo real y bloqueo o nueva visita. No puede existir visita activa con OT `FINALIZADA_TECNICO`, `VALIDADA` o `CANCELADA`.

## 10. Materiales, firmas e informe

Los materiales registran artículo, cantidad, unidad, coste, movimiento y usuario. Las firmas de técnico y cliente son independientes y privadas.

El PDF toma datos congelados de OT, contexto, visitas, checklist, mediciones, evidencias, materiales, firmas y conclusión. Una regeneración no sobrescribe silenciosamente la anterior.

## 11. Revisión y auditoría

La revisión administrativa puede validar, solicitar corrección con nota o reabrir con motivo. Debe conservarse cada revisión.

Acciones auditables mínimas: creación, asignación, aceptación, visitas, bloqueo, QR, checklist, evidencias, materiales, firmas, informe, finalización técnica, corrección, validación, cancelación y reapertura.

## 12. Frontera de API

Las transiciones críticas se ejecutarán mediante RPC transaccionales o servicios equivalentes:

- `create_work_order`
- `assign_work_order`
- `accept_work_order`
- `start_work_order_visit`
- `block_work_order`
- `resume_work_order`
- `verify_work_order_qr`
- `finalize_work_order_visit`
- `review_work_order`
- `cancel_work_order`
- `reopen_work_order`

El frontend nunca encadenará varias escrituras sensibles suponiendo que todas terminarán correctamente.

## 13. Compatibilidad y migración

1. tipos y adaptadores de lectura;
2. pruebas de caracterización;
3. RPC canónicos nuevos;
4. doble lectura compatible;
5. migración de estados históricos;
6. retirada posterior de compatibilidad obsoleta.

No se modificará información masivamente sin backup, migración reversible y verificación de conteos.

## 14. Criterio de aceptación

```text
Crear -> asignar -> aceptar -> iniciar visita -> verificar QR opcional
-> ejecutar checklist/evidencias/materiales -> firmar -> generar PDF
-> finalizar técnicamente -> revisar -> validar -> consultar histórico
```

También deben probarse bloqueo, reanudación, corrección, cancelación, reapertura, aislamiento entre tenants y restauración de backup.

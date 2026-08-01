# Inventario técnico OT: HomeServe e IsiVoltPro Activos

Estado: OT-00

Finalidad: punto de entrada obligatorio antes de adaptar código entre repositorios.

## 1. Regla de uso

Este inventario identifica responsabilidades y piezas verificadas. No implica copiar archivos literalmente. Cada capacidad se llevará a Activos mediante contrato, pruebas y adaptación al modelo existente.

## 2. IsiVoltPro Activos: piezas verificadas

### Ciclo de estados

| Archivo | Responsabilidad actual | Riesgo / decisión |
|---|---|---|
| `src/utils/workOrderLifecycle.js` | Estados, compatibilidad histórica, etiquetas, prioridad, tipos y acciones siguientes | Mantener operativo; sustituir gradualmente por dominio tipado |
| `src/services/workOrderLifecycleService.js` | Actualización genérica, reapertura, validación, auditoría y puente a mantenimiento | No permite finalización genérica; debe evolucionar a RPC canónicos |
| `src/services/workOrderService.js` | Consulta y operaciones generales de OT | Debe dividirse en repositorios por responsabilidad |
| `src/services/rolePermissionMatrix.js` | Matriz declarativa de roles | Conservar reglas y llevarlas a tipos/RLS verificados |

### Cierre e integridad

| Archivo / migración | Contrato que protege |
|---|---|
| `src/sql/038_phase1_work_order_integrity.sql` | Integridad de estados y cierre guiado |
| `src/sql/040_phase2_checklist_snapshot.sql` | Snapshot de checklist |
| `src/sql/041_phase2_work_order_qr_verification.sql` | Verificación QR ligada a OT |
| `src/sql/042_phase2_separate_signatures.sql` | Firmas separadas |
| `src/sql/043_phase2_admin_review_workflow.sql` | Revisión administrativa/correcciones |
| `src/sql/044_reconcile_finalized_work_order_visits.sql` | Coherencia entre visita y OT finalizada |
| `src/sql/045_separate_work_order_management_execution.sql` | Separación de administración y técnico |

### Pantallas y rutas

Activos expone rutas específicas para:

- dashboard OT;
- control/planificación;
- agenda;
- listado y realizadas;
- Mis OT;
- detalle;
- visita;
- checklist;
- firma;
- informe;
- incidencias;
- auditoría.

La granularidad funcional es una fortaleza. El trabajo de convergencia debe reorganizar internamente sin eliminar rutas útiles hasta completar una sustitución probada.

### Pruebas actuales

| Archivo | Cobertura |
|---|---|
| `tests/work-order-security.test.js` | Estados, requisitos y presencia de contratos SQL |
| `tests/work-context.test.js` | Contexto cliente/instalación |
| `tests/work-order-convergence-characterization.test.js` | Regresión OT-00 y futura migración |

Limitación actual: parte de las pruebas SQL inspecciona texto de migraciones; todavía faltan pruebas vivas de PostgreSQL/RLS y E2E.

## 3. HomeServe: piezas verificadas

### Contratos y compatibilidad

| Archivo | Responsabilidad | Uso previsto en Activos |
|---|---|---|
| `src/features/work-orders/types/workOrder.ts` | Estados, prioridades, tipos, motivos de bloqueo, requisitos y entidad TypeScript | Referencia directa para OT-01; adaptar campos al modelo Activos |
| `src/features/work-orders/domain/statusCompatibility.ts` | Convierte estados heredados y falla ante valores desconocidos | Adoptar el patrón; conservar `NUEVA` de Activos como estado canónico adicional |
| `src/features/work-orders/api/workOrderMapper.ts` | Adaptación de filas antiguas al dominio tipado | Crear equivalente en Activos |

HomeServe utiliza como estados canónicos:

```text
BORRADOR, ASIGNADA, ACEPTADA, EN_CURSO, BLOQUEADA,
FINALIZADA_TECNICO, VALIDADA, CANCELADA
```

El contrato IsiVoltPro añade `NUEVA` para representar una OT lanzada y pendiente de asignación.

### Consultas y asignación

| Archivo | Responsabilidad | Uso previsto |
|---|---|---|
| `src/features/work-orders/api/workOrdersRepository.ts` | Consulta tipada, límites, filtro tenant, soft delete y enriquecimiento de nombres | Adoptar estructura de repositorio y validaciones; optimizar consultas en Activos |
| `src/features/work-orders/api/workOrderAssignment.ts` | Argumentos tipados y RPC atómico `assign_work_order` | Adoptar patrón de RPC y respuesta validada |
| `src/features/work-orders/api/workOrderAuditRepository.ts` | Historial/auditoría legible | Combinar con auditoría más amplia de Activos |

Observación: `workOrdersRepository.ts` carga nombres relacionados mediante varias consultas. Es claro y seguro, pero antes de copiar el patrón debe medirse rendimiento y considerar vistas `security_invoker`, RPC o consultas optimizadas.

### Componentes de experiencia

| Componente | Valor que aporta |
|---|---|
| `PremiumWorkOrderDetail.tsx` | Ficha administrativa por pestañas y zonas de solo lectura |
| `WorkOrderAssignmentPanel` | Asignación/reasignación visible y segura |
| `LifecycleActions` | Acciones técnicas según estado/usuario |
| `WorkOrderChecklistPanel` | Ejecución y lectura de checklist |
| `WorkOrderChecklistPreparationPanel` | Preparación/versionado antes de ejecutar |
| `WorkOrderPhotosPanel` | Evidencia general excluyendo fotos de checklist |
| `InstallationPhotoGallery` | Galería estable de instalación separada |
| `LocationMapCard.tsx` | Mapa y «Cómo llegar» sin clave privada |

No se copiarán estilos ni marca. Se adoptarán jerarquía, accesibilidad, objetivos táctiles, estados vacíos y separación de responsabilidades.

### Disciplina de ingeniería

HomeServe dispone de:

- TypeScript;
- Zod;
- React Hook Form;
- TanStack Query;
- Vitest;
- Testing Library;
- ESLint;
- typecheck;
- build y regresiones por feature.

Las PR recientes verifican más de 160 pruebas, typecheck, lint y build. Esta disciplina debe convertirse en estándar del producto maestro.

## 4. Datos y tablas conceptuales

### Coincidencias que se conservarán

- `clientes`
- `instalaciones`
- `ubicaciones`
- `activos`
- `ordenes_trabajo`
- perfiles/membresías por tenant
- historial/auditoría
- checklist/plantillas/versiones/respuestas
- adjuntos/evidencias
- materiales

### Capacidades más desarrolladas en Activos

- visitas múltiples;
- verificación QR;
- materiales y costes;
- firmas;
- PDF;
- mantenimiento preventivo;
- OCA y módulos técnicos;
- relación con historial del activo.

### Capacidades a reforzar desde HomeServe

- asignación atómica;
- bloqueo tipado;
- contratos TypeScript;
- validación de formularios;
- repositorios por feature;
- consulta/caché predecible;
- separación de galerías;
- ficha administrativa y mapa;
- cobertura automatizada.

## 5. Fronteras objetivo por feature

```text
src/features/work-orders/
├── api/
│   ├── workOrdersRepository
│   ├── workOrderAssignmentRepository
│   ├── workOrderExecutionRepository
│   ├── workOrderReviewRepository
│   ├── workOrderEvidenceRepository
│   └── workOrderAuditRepository
├── adapters/
│   ├── legacyStatusAdapter
│   └── databaseRowAdapter
├── components/
├── domain/
│   ├── lifecycle
│   ├── requirements
│   └── permissions
├── schemas/
├── types/
└── tests/
```

Los servicios actuales no se eliminarán hasta que la nueva capa cubra el mismo flujo y la PR correspondiente tenga rollback.

## 6. Mapa de migración por fase

| Fase | Archivos fuente HomeServe | Destino Activos |
|---|---|---|
| OT-01 | tipos, `statusCompatibility`, schemas | dominio, tipos, adaptadores y Zod |
| OT-02 | repositorios y Query hooks | capa de consultas/mutaciones |
| OT-03 | formularios y alta rápida | Nueva OT profesional |
| OT-04 | lifecycle actions y detalle técnico | vista técnico móvil |
| OT-05 | checklist preparation/panel/photos | checklist versionado y evidencias |
| OT-06 | — + capacidades Activos | materiales, firmas, informe y cierre |
| OT-07 | detalle premium/review | revisión administrativa |
| OT-08 | dashboard/listado/agenda | operación y planificación |
| OT-09 | tests y políticas | RLS, E2E, rendimiento y piloto |

## 7. Deuda técnica detectada

### Activos

- JavaScript sin contratos estáticos generales.
- Servicios amplios con varias responsabilidades.
- pruebas de base de datos aún mayoritariamente documentales/textuales;
- ausencia de un gate CI estable en `main` antes de esta PR;
- estados históricos mezclados con estados oficiales;
- diseño y despliegue aún en PR separadas.

### HomeServe

- parte importante de composición permanece en `src/App.tsx`;
- repositorio especializado que no contiene toda la profundidad Core;
- consultas de enriquecimiento potencialmente N-grupo/múltiples rondas;
- firma e informe no están tan maduros como en Activos;
- no debe convertirse en dependencia del producto maestro.

## 8. Criterio para actualizar este inventario

Cada PR de convergencia debe actualizar este documento cuando:

- una pieza pase de heredada a canónica;
- se retire un adaptador;
- cambie la responsabilidad de un servicio;
- se añada un RPC;
- una capacidad quede cubierta por pruebas vivas;
- se detecte una diferencia nueva entre repositorios.

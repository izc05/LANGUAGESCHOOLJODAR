# Matriz de origen y convergencia OT

Estado: OT-00

Objetivo: decidir qué se adopta de HomeServe, qué se conserva de Activos y qué debe reconstruirse mediante un contrato común.

## 1. Resumen

- **HomeServe** aporta mayor disciplina de ingeniería y una experiencia OT administrativa/técnica más limpia.
- **Activos** aporta el dominio completo de mantenimiento: jerarquía de activos, QR/NFC, preventivos, especialidades, materiales, firmas, PDF y auditoría.
- El destino no es HomeServe dentro de Activos. El destino es un **motor OT propio de IsiVoltPro**.

## 2. Estados actuales

### Activos

```text
BORRADOR, NUEVA, ASIGNADA, ACEPTADA, EN_CURSO, PAUSADA,
PENDIENTE_MATERIAL, PENDIENTE_CLIENTE, FINALIZADA, VALIDADA, CANCELADA
```

Compatibilidad histórica:

```text
FIRMADA -> FINALIZADA
INFORME_GENERADO -> FINALIZADA
CERRADA/CERRADO -> VALIDADA
NUEVO/PENDIENTE/SIN_TECNICO -> NUEVA
```

### HomeServe

```text
BORRADOR, ASIGNADA, ACEPTADA, EN_CURSO, BLOQUEADA,
FINALIZADA_TECNICO, VALIDADA, CANCELADA
```

HomeServe modela el bloqueo mediante motivo separado y expresa claramente que el técnico termina antes de la validación.

### Mapeo objetivo

| Activos actual | HomeServe | Canónico IsiVoltPro | Acción |
|---|---|---|---|
| `BORRADOR` | `BORRADOR` | `BORRADOR` | Conservar |
| `NUEVA` | — | `NUEVA` | Conservar de Activos |
| `ASIGNADA` | `ASIGNADA` | `ASIGNADA` | Conservar |
| `ACEPTADA` | `ACEPTADA` | `ACEPTADA` | Conservar |
| `EN_CURSO` | `EN_CURSO` | `EN_CURSO` | Conservar |
| `PAUSADA` | `BLOQUEADA` | `BLOQUEADA` + `OTRO` | Adaptar |
| `PENDIENTE_MATERIAL` | `BLOQUEADA` | `BLOQUEADA` + `MATERIAL` | Migrar |
| `PENDIENTE_CLIENTE` | `BLOQUEADA` | `BLOQUEADA` + `RESPONSABLE` | Migrar |
| `FINALIZADA` | `FINALIZADA_TECNICO` | `FINALIZADA_TECNICO` | Renombrar semánticamente |
| `VALIDADA` | `VALIDADA` | `VALIDADA` | Conservar |
| `CANCELADA` | `CANCELADA` | `CANCELADA` | Conservar |

## 3. Matriz funcional

| Área | HomeServe | Activos | Decisión |
|---|---|---|---|
| Jerarquía cliente/instalación/ubicación/activo | Correcta, enfocada a OT | Más amplia y central | **Conservar Activos** |
| Formulario Nueva OT | Tipado, validado, alta rápida y precarga | Funcional, más disperso | **Adoptar patrones HomeServe** |
| Estados | Compactos, bloqueo tipado y final técnico explícito | Más históricos y especializados | **Combinar según contrato** |
| Asignación | Flujo dedicado, disponibilidad y auditoría | Disponible con permisos | **Adoptar atomicidad HomeServe** |
| Técnico móvil | Jerarquía clara y objetivos táctiles | Buen flujo guiado y más capacidades | **Combinar** |
| Visitas | Resumen y ejecución estructurados | Varias visitas y cierre integrado | **Conservar modelo Activos y UX HomeServe** |
| Checklist | Plantillas versionadas y snapshot | Snapshot, requisitos técnicos y especialidades | **Unificar** |
| Evidencias | Separación explícita entre instalación, OT y checklist | Muchas galerías y Storage privado | **Adoptar separación HomeServe sobre Storage Activos** |
| Materiales | Estructura básica | Flujo y PDF más completo | **Conservar Activos** |
| Firmas | Aún limitada en algunas vistas | Técnico/cliente y cierre | **Conservar Activos** |
| PDF | No es la principal fortaleza actual | Genérico y especializado FV | **Conservar y refactorizar Activos** |
| Revisión admin | Clara, tabulada y con estado de validación | Correcciones, validación y auditoría | **Combinar** |
| Dashboard | Mejor jerarquía operativa | Más métricas y especialidades | **UX HomeServe + datos Activos** |
| Mapas y acceso | Componente probado y reutilizable | Dirección disponible, menor integración | **Adoptar HomeServe** |
| Tipado | TypeScript estricto | JavaScript | **Adoptar progresivamente** |
| Formularios | React Hook Form + Zod | Estado local/manual | **Adoptar** |
| Consultas | TanStack Query | Servicios directos | **Adoptar progresivamente** |
| Pruebas | Vitest, Testing Library, typecheck, lint y build | Node tests y verificaciones textuales SQL | **Adoptar disciplina HomeServe** |
| RLS/tenant | Sólido y probado en mayor profundidad | Buen diseño, pendiente de validar completamente | **Conservar esquema Activos y elevar pruebas** |
| Backend | Supabase Cloud propio | Backend futuro autoalojado | **Nunca compartir** |

## 4. Patrones concretos a adoptar de HomeServe

1. `WorkOrderStatus`, prioridades, tipos y requisitos definidos como contratos TypeScript.
2. Capa de compatibilidad para estados históricos que falla ante valores desconocidos.
3. Formulario con Zod y mensajes consistentes.
4. Alta rápida de cliente/instalación desde Nueva OT sin perder el borrador.
5. Precarga al crear OT desde instalación, activo, técnico, incidencia o una OT relacionada.
6. Repositorios por feature y consultas gestionadas mediante TanStack Query.
7. Separación visual y lógica de:
   - galería de instalación;
   - evidencias generales de OT;
   - fotos de checklist.
8. Mapa reutilizable sin clave privada y enlace «Cómo llegar».
9. Ficha administrativa con pestañas y zonas de solo lectura.
10. Pruebas de componentes y repositorios junto con typecheck, lint y build obligatorios.

## 5. Capacidades que pertenecen a Activos

1. QR/NFC de instalación, ubicación y activo.
2. Verificación QR vinculada a la ejecución de una OT.
3. Mantenimiento preventivo y puente plan → actuación → OT.
4. OCA e inspecciones.
5. Especialidades FV, electricidad, RITE, PCI, Legionella y futuras.
6. Materiales y movimientos.
7. Firmas separadas.
8. Informes PDF completos.
9. Historial 360 del activo.
10. Auditoría central y trazabilidad reglamentaria.
11. Backend autoalojado y despliegue del mini PC.

## 6. Elementos prohibidos

- Copiar logotipos, colores o textos HomeServe.
- Conectar Activos al proyecto Supabase de HomeServe.
- Copiar UUID, usuarios, fotografías o datos demo.
- Sustituir las tablas de Activos de una sola vez.
- Crear dos motores OT paralelos permanentes.
- Duplicar un activo o cliente para satisfacer una pantalla.
- Permitir transiciones solo desde el frontend.
- Mezclar evidencias de distintas entidades.
- Añadir módulos técnicos con ciclos de estados propios.

## 7. Componentes objetivo

```text
src/features/work-orders/
  api/
  components/
  domain/
  hooks/
  schemas/
  types/
  adapters/
  tests/
```

La migración será progresiva. El código JavaScript actual seguirá operativo mediante adaptadores hasta que cada flujo esté cubierto por pruebas.

## 8. Orden de adopción

1. Estados y contratos.
2. Pruebas de caracterización.
3. Formularios y validación.
4. Consultas/caché.
5. Nueva OT y altas rápidas.
6. Ejecución móvil.
7. Checklist/evidencias.
8. Cierre, firmas, PDF y revisión.
9. Dashboard y planificación.
10. Eliminación de compatibilidad antigua.

## 9. Condición para copiar una idea

Una capacidad de HomeServe solo se integra cuando:

- existe una necesidad en Activos;
- respeta el contrato canónico;
- no reduce las funciones actuales;
- incluye pruebas;
- mantiene aislamiento multi-tenant;
- tiene rollback;
- está adaptada a la marca y al dominio IsiVoltPro.

# Convergencia del motor OT: HomeServe → IsiVoltPro Activos

## 1. Decisión

HomeServe no sustituirá a IsiVoltPro Activos y los repositorios no se fusionarán completos.

La estrategia es:

- **HomeServe**: laboratorio de experiencia operativa OT, validación y pruebas.
- **IsiVoltPro Activos**: producto maestro de activos, mantenimiento y órdenes de trabajo.
- **Resultado**: un motor OT canónico de IsiVoltPro dentro de Activos, incorporando las mejores soluciones comprobadas de HomeServe.

No se copiarán marca, colores, credenciales, datos, backend ni dependencias comerciales de HomeServe.

## 2. Diagnóstico comparado

### Lo mejor de HomeServe

1. Base TypeScript estricta.
2. Formularios con React Hook Form y Zod.
3. Caché y sincronización de consultas mediante TanStack Query.
4. Cobertura amplia con Vitest, Testing Library y pruebas SQL/pgTAP.
5. Creación y asignación segura mediante RPC.
6. Alta rápida de instalación y equipo desde Nueva OT.
7. Apertura de Nueva OT precargada desde instalación, activo, técnico o plantilla.
8. Dashboard administrativo centrado en prioridades, carga y planificación.
9. Ficha premium administrativa y ficha técnica diferenciadas.
10. Ejecución técnica guiada: aceptar, iniciar, bloquear, reanudar y finalizar.
11. Plantillas de checklist versionadas.
12. Snapshot inmutable del checklist al crear la OT.
13. Fotografías vinculadas al punto exacto del checklist.
14. Galería privada de instalación separada de evidencias de OT.
15. Mapa e indicaciones con dirección real.
16. Estados canónicos y adaptadores para estados heredados.
17. Tablas administrativas legibles y responsive.
18. Validación sistemática: typecheck, lint, tests, build, migraciones y RLS.

### Lo mejor de IsiVoltPro Activos

1. Modelo completo cliente → instalación → ubicación → activo.
2. QR/NFC por instalación, ubicación y activo.
3. Documentos, fotografías, vídeos e historial asociados.
4. Mantenimiento preventivo y calendario.
5. Incidencias internas y públicas desde QR.
6. Gestión de OCA e inspecciones.
7. Especialización fotovoltaica avanzada.
8. Materiales, firmas e informes PDF.
9. Auditoría funcional visible.
10. Roles amplios y estructura multiempresa.
11. Cierre guiado y requisitos configurables.
12. Verificación QR vinculada a la OT.
13. Firma técnica y firma de cliente separadas.
14. Revisión administrativa, correcciones y anulación con motivo.
15. Historial 360 del activo como objetivo del producto.
16. PWA, QR, Capacitor y futura operación móvil/offline.

## 3. Regla de integración

Para cada capacidad se elegirá una de estas acciones:

- **ADOPTAR**: incorporar el patrón de HomeServe a Activos.
- **CONSERVAR**: mantener el patrón de Activos.
- **COMBINAR**: crear una versión canónica tomando ambos.
- **DESCARTAR**: no trasladar porque pertenece a la demo o a la marca HomeServe.

Nunca se copiará un archivo sin revisar:

- modelo de datos;
- permisos y RLS;
- contratos de servicio;
- estados;
- rutas;
- diseño visual IsiVoltPro;
- pruebas y migraciones;
- compatibilidad con el backend autoalojado.

## 4. Matriz de convergencia

| Área | Acción | Fuente principal | Resultado en Activos |
|---|---|---|---|
| TypeScript | ADOPTAR | HomeServe | Migración progresiva de servicios y componentes críticos |
| React Hook Form + Zod | ADOPTAR | HomeServe | Formularios OT tipados y validación central |
| TanStack Query | ADOPTAR | HomeServe | Caché, invalidación y estados de carga uniformes |
| Modelo cliente/instalación/ubicación/activo | CONSERVAR | Activos | Modelo canónico del producto |
| Creación de OT | COMBINAR | Ambos | RPC segura + contexto completo de activo/ubicación |
| Alta rápida desde Nueva OT | ADOPTAR | HomeServe | Crear instalación, ubicación o activo sin abandonar el flujo |
| OT precargada desde activo/instalación | ADOPTAR | HomeServe | Acciones contextuales en ficha 360 |
| Estados OT | COMBINAR | Ambos | Catálogo único con adaptador temporal de legacy |
| Dashboard administrativo | ADOPTAR | HomeServe | Bandeja de prioridades, carga, agenda y revisión con marca IsiVoltPro |
| Vista técnico móvil | COMBINAR | Ambos | Simplicidad HomeServe + QR, materiales, firmas y especialidades de Activos |
| Aceptar/iniciar/bloquear/reanudar | ADOPTAR | HomeServe | Comandos backend auditados |
| Verificación QR | CONSERVAR | Activos | Requisito configurable antes de ejecutar |
| Plantillas versionadas | ADOPTAR | HomeServe | Catálogo profesional por especialidad |
| Snapshot del checklist | COMBINAR | Ambos | Definición inmutable, requisitos y mediciones de Activos |
| Fotos por punto | ADOPTAR | HomeServe | Evidencia vinculada exactamente al punto |
| Galería instalación | ADOPTAR | HomeServe | Separada de evidencias y fotos de checklist |
| Materiales y costes | CONSERVAR/AMPLIAR | Activos | Movimientos, coste real y repuestos asociados |
| Firma técnica/cliente | CONSERVAR | Activos | Requisitos independientes por OT |
| PDF | COMBINAR | Ambos | Informe IsiVoltPro con snapshot, evidencias y validación |
| Revisión y correcciones | CONSERVAR/MEJORAR | Activos | UX HomeServe sobre flujo seguro existente |
| Auditoría | COMBINAR | Ambos | Libro de eventos legible + acciones backend auditadas |
| Mapa e indicaciones | ADOPTAR | HomeServe | Tarjeta reutilizable en OT, instalación y técnico |
| RLS y pgTAP | ADOPTAR NIVEL | HomeServe | Cobertura equivalente en backend local |
| PWA/Capacitor/QR | CONSERVAR | Activos | Canal móvil del ecosistema |
| Branding HomeServe | DESCARTAR | HomeServe | Identidad única IsiVoltPro |
| Datos demo HomeServe | DESCARTAR | HomeServe | Seed propio y neutral de IsiVoltPro |

## 5. Modelo canónico de estados

Antes de mover componentes se creará un único catálogo de estados y transiciones.

Propuesta inicial:

```text
BORRADOR
ASIGNADA
ACEPTADA
EN_CURSO
BLOQUEADA
PENDIENTE_MATERIAL
PENDIENTE_CLIENTE
FINALIZADA_TECNICO
CORRECCION_SOLICITADA
VALIDADA
CANCELADA
```

`CERRADA`, `FINALIZADA`, `FIRMADA`, `INFORME_GENERADO` y otros estados heredados se normalizarán mediante adaptadores y migraciones controladas. No se añadirán alias indefinidamente.

Cada transición tendrá:

- actor permitido;
- estado de origen;
- estado de destino;
- validaciones;
- efecto sobre visitas;
- auditoría;
- mensaje visible;
- prueba automática.

## 6. Modelo canónico de checklist

### Plantilla

- organización propietaria;
- especialidad;
- versión;
- estado borrador/publicada/retirada;
- secciones ordenadas;
- puntos ordenados;
- tipo de respuesta;
- obligatoriedad;
- criticidad;
- foto obligatoria;
- medición y unidad;
- límites mínimo/máximo;
- instrucciones;
- normativa o referencia técnica.

### Snapshot por OT

Al crear o asignar una OT se conserva una copia inmutable de la versión utilizada. Una actualización posterior de la plantilla no altera trabajos históricos.

### Respuesta

- OK / No OK / No aplica;
- valor medido;
- observación;
- defecto;
- acción realizada;
- fotografías vinculadas;
- material utilizado;
- fecha y usuario.

## 7. Modelo de evidencias

Las evidencias se separarán en cuatro ámbitos:

1. **Galería de instalación**: fotografías descriptivas permanentes.
2. **Galería del activo**: identificación, placa, entorno y estado general.
3. **Evidencia de visita/OT**: antes, durante y después.
4. **Evidencia de checklist**: asociada a un punto concreto.

No se mostrarán todas las fotografías en una galería única. Cada archivo conservará organización, entidad, autor, fecha, tamaño, tipo MIME, propósito y política de visibilidad.

## 8. Arquitectura objetivo del frontend

La convergencia no se realizará copiando el `main.tsx` monolítico de HomeServe. Se trasladarán patrones a una estructura modular de Activos:

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── permissions/
├── domain/
│   ├── work-orders/
│   ├── assets/
│   ├── maintenance/
│   └── organizations/
├── features/
│   ├── work-order-create/
│   ├── work-order-assignment/
│   ├── technician-execution/
│   ├── admin-review/
│   └── checklist-templates/
├── shared/
│   ├── api/
│   ├── ui/
│   ├── forms/
│   └── utils/
└── modules/
    ├── electrical/
    ├── photovoltaic/
    ├── rite/
    ├── pci/
    └── legionella/
```

La migración será gradual. No se reescribirá toda la aplicación en una única PR.

## 9. Plan de ejecución por PR

### PR OT-00 — Contrato y pruebas de caracterización

- inventariar tablas, RPC, estados y servicios de ambos repositorios;
- documentar diferencias;
- añadir pruebas que congelen el comportamiento actual de Activos;
- no cambiar UI ni base de datos.

**Criterio de cierre:** conocemos qué puede migrarse sin romper producción.

### PR OT-01 — Tipos, esquemas y adaptadores

- introducir TypeScript en el dominio OT;
- definir esquemas Zod;
- crear adaptador de estados y DTO;
- mantener compatibilidad con servicios existentes.

**Criterio de cierre:** el núcleo OT tiene tipos únicos y tests.

### PR OT-02 — Capa de consultas

- introducir TanStack Query;
- normalizar claves de consulta;
- centralizar invalidaciones;
- eliminar refrescos manuales dispersos.

**Criterio de cierre:** listados y detalles se actualizan de forma predecible.

### PR OT-03 — Nueva OT profesional

- React Hook Form + Zod;
- selección de cliente, instalación, ubicación, activo y plantilla;
- precarga desde contexto;
- altas rápidas controladas;
- creación como borrador o asignada mediante RPC.

**Criterio de cierre:** la OT se crea sin abandonar el flujo y queda auditada.

### PR OT-04 — Ciclo técnico

- aceptar;
- iniciar;
- bloquear/reanudar;
- cronómetro y visitas;
- mapa e indicaciones;
- requisitos visibles.

**Criterio de cierre:** el técnico recorre el flujo desde móvil sin acciones administrativas.

### PR OT-05 — Checklist versionado y evidencias

- administración de plantillas;
- snapshot inmutable;
- secciones y puntos;
- respuestas y mediciones;
- fotos por punto;
- separación de galerías.

**Criterio de cierre:** cada evidencia tiene contexto exacto y el histórico no cambia.

### PR OT-06 — Materiales, firmas y cierre

- movimientos y costes;
- firma técnica y cliente;
- motor único de requisitos;
- finalización técnica transaccional;
- informe PDF.

**Criterio de cierre:** no se puede finalizar saltándose requisitos configurados.

### PR OT-07 — Revisión administrativa

- bandeja de pendientes de validar;
- revisión de evidencias;
- correcciones con nota;
- validación;
- anulación con motivo;
- solo lectura final.

**Criterio de cierre:** administración controla calidad sin alterar evidencias técnicas.

### PR OT-08 — Dashboard y planificación

- KPIs operativos;
- prioridades y vencimientos;
- carga por técnico;
- agenda;
- filtros y tabla legible;
- indicadores por especialidad.

**Criterio de cierre:** coordinación puede decidir qué atender y quién debe hacerlo.

### PR OT-09 — Endurecimiento

- E2E completo;
- pgTAP/RLS;
- Storage privado;
- rendimiento;
- accesibilidad;
- responsive;
- migración desde datos reales;
- rollback y restauración.

**Criterio de cierre:** apto para piloto controlado.

## 10. Qué no se hará durante la convergencia

- fusionar repositorios completos;
- compartir el Supabase de HomeServe;
- copiar estilos o marca HomeServe;
- crear nuevos módulos técnicos antes de estabilizar OT;
- eliminar tablas o datos históricos sin migración;
- cambiar todos los estados en una única operación sin adaptador;
- reescribir toda la aplicación de una vez;
- declarar offline, seguridad o producción sin pruebas reales;
- añadir IA antes de disponer de datos estructurados fiables.

## 11. Política de origen y atribución interna

Cada PR de convergencia indicará:

- comportamiento tomado de HomeServe;
- archivos o patrones utilizados como referencia;
- adaptación realizada para Activos;
- diferencias de modelo y permisos;
- pruebas añadidas;
- migraciones necesarias;
- riesgo y rollback.

HomeServe permanecerá funcional durante todo el proceso y servirá como referencia visual y operativa hasta que el motor canónico de Activos lo supere.

## 12. Resultado esperado

IsiVoltPro Activos tendrá:

- la profundidad de activos, mantenimiento, QR y especialidades que ya posee;
- la claridad operativa y la disciplina de pruebas desarrollada en HomeServe;
- una experiencia técnica móvil simplificada;
- un motor OT tipado, versionado, auditable y modular;
- capacidad de crecer sin duplicar aplicaciones ni perder el rumbo del ecosistema.

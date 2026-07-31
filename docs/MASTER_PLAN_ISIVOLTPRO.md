# Plan maestro canónico de IsiVoltPro

> Documento rector del producto. Toda decisión de arquitectura, interfaz, datos o negocio debe respetarlo. Los cambios de rumbo deberán modificarse aquí mediante una PR específica y con justificación explícita.

## 1. Visión

IsiVoltPro será un ecosistema profesional para mantenimiento, gestión de activos, inspecciones y operaciones técnicas. No es una demostración aislada ni una colección de utilidades inconexas.

El objetivo es convertir conocimiento técnico real en una plataforma que permita:

- conocer qué instalaciones y activos existen;
- identificar cada elemento mediante QR o NFC;
- planificar mantenimiento y obligaciones reglamentarias;
- gestionar incidencias y órdenes de trabajo;
- guiar al técnico durante la intervención;
- conservar evidencias, mediciones, materiales, firmas e informes;
- medir riesgos, costes, paradas, cumplimiento y vida útil;
- ofrecer trazabilidad completa y defendible.

## 2. Producto maestro

**IsiVoltPro Activos** es el producto profesional maestro del ecosistema.

Su modelo central es:

```text
Organización / cliente
→ instalación
→ ubicación
→ activo
→ incidencia o necesidad preventiva
→ orden de trabajo
→ visita técnica
→ procedimiento / checklist
→ mediciones, materiales y evidencias
→ firmas e informe
→ revisión administrativa
→ histórico, costes, riesgos y cumplimiento
```

No se crearán aplicaciones separadas que dupliquen clientes, instalaciones, activos, usuarios u órdenes de trabajo. Las especialidades se incorporarán como módulos sobre el mismo núcleo.

## 3. Capas del ecosistema

```text
IsiVoltPro Plataforma / Core
├── identidad, organizaciones, usuarios y permisos
├── clientes, instalaciones, ubicaciones y activos
├── QR / NFC
├── incidencias y solicitudes
├── órdenes de trabajo
├── procedimientos, plantillas y checklist
├── documentos, fotografías, vídeos y firmas
├── materiales, inventario y costes
├── auditoría, notificaciones e informes
└── API e integraciones

Módulos técnicos activables
├── electricidad / REBT
├── fotovoltaica
├── climatización / RITE
├── refrigeración
├── PCI
├── Legionella
├── hospitales e instalaciones críticas
└── OCA / inspecciones reglamentarias

Interfaces
├── panel de administración y coordinación
├── aplicación simplificada para técnicos
├── portal de cliente
├── acceso público controlado desde QR
└── API para integraciones
```

Cada módulo técnico aporta catálogos, formularios, mediciones, plantillas, checklist, normativa, informes e indicadores. No debe replicar el núcleo.

## 4. Productos relacionados y límites

### HomeServe

El repositorio `izc05/homeserve` es un producto demostrativo y un laboratorio de experiencia de órdenes de trabajo. Su mejor lógica, interfaz y cobertura de pruebas podrá incorporarse a IsiVoltPro Activos.

No se copiarán:

- la marca HomeServe;
- su identidad visual roja;
- dependencias comerciales específicas;
- datos, usuarios o credenciales;
- su backend de producción.

HomeServe seguirá usando su proyecto independiente de Supabase Cloud. No compartirá base de datos, claves ni Storage con IsiVoltPro Activos.

### Hogar Seguro e IsiVolt Servicios

Son líneas futuras dirigidas a particulares y contratación de servicios. Permanecen separadas funcionalmente de la GMAO profesional.

No se desarrollará el marketplace de IsiVolt Servicios mientras IsiVoltPro Activos no tenga:

- despliegue estable;
- seguridad entre organizaciones verificada;
- copias de seguridad y restauración probadas;
- núcleo de activos y OT consolidado;
- al menos un piloto real completado.

## 5. Principios no negociables

1. **Un solo núcleo de datos.** Cliente, instalación, ubicación, activo y OT son entidades canónicas.
2. **Separación por organización.** Ningún cliente puede consultar o modificar datos de otro.
3. **Trazabilidad antes que comodidad.** Las acciones críticas deben quedar auditadas.
4. **No borrar historial operativo.** Se utilizará anulación o baja lógica con motivo.
5. **El técnico ejecuta; administración coordina y valida.** Los permisos y las pantallas deben reflejarlo.
6. **Cierre guiado.** Una OT no puede finalizar saltándose requisitos configurados.
7. **Móvil primero para el técnico.** La vista técnica debe reducir pasos y ruido.
8. **Evidencias asociadas al contexto correcto.** Las fotos deben vincularse a instalación, activo, visita o punto de checklist, sin mezclarse.
9. **Offline con sincronización controlada.** No se afirmará que existe modo offline hasta disponer de cola persistente, resolución de conflictos y pruebas.
10. **Seguridad en base de datos.** La interfaz nunca sustituye RLS, políticas de Storage y validaciones del servidor.
11. **Configuración, no bifurcaciones.** Las diferencias por especialidad o cliente deben resolverse con módulos, plantillas y permisos.
12. **No añadir funciones sin cerrar calidad.** Cada fase debe incluir pruebas, documentación, migración, rollback y criterio de aceptación.

## 6. Arquitectura y despliegue

### HomeServe

- Servicio independiente.
- Supabase Cloud existente.
- Dominio previsto: `ot.isivoltpro.com`.
- No se modificará durante el despliegue local de Activos.

### IsiVoltPro Activos

- Repositorio maestro: `izc05/isivolpro-activos`, pendiente de corregir a `isivoltpro-activos`.
- Frontend React/Vite servido desde Docker.
- Backend compatible con Supabase autoalojado en el mini PC para conservar PostgreSQL, Auth, Storage, RPC y RLS.
- Frontend previsto: `activos.isivoltpro.com` → `127.0.0.1:5175`.
- API prevista: `api.activos.isivoltpro.com` → `127.0.0.1:8000`.
- Exposición externa mediante Cloudflare Tunnel, sin abrir puertos del router.
- PocketBase existente en `127.0.0.1:8090` no se modificará.

El mini PC será válido para desarrollo, demostraciones y primeros pilotos. Antes de un uso crítico se exigirá:

- copia diaria de PostgreSQL;
- copia de Storage;
- copia externa al propio mini PC;
- prueba periódica de restauración;
- monitorización de memoria, CPU, disco, contenedores y disponibilidad;
- actualización documentada y reversible;
- SMTP real para invitaciones y recuperación de acceso.

## 7. Modelo de órdenes de trabajo

El flujo canónico será:

```text
BORRADOR
→ ASIGNADA
→ ACEPTADA
→ EN_CURSO
→ PENDIENTE_MATERIAL / PENDIENTE_CLIENTE / BLOQUEADA
→ EN_CURSO
→ FINALIZADA_TECNICO
→ CORRECCION_SOLICITADA o VALIDADA
→ CERRADA / HISTÓRICO
```

Los nombres definitivos se normalizarán en un único catálogo. Los estados heredados se adaptarán mediante compatibilidad, no mediante duplicación permanente.

Reglas:

- la creación y asignación son operaciones seguras y auditadas;
- solo técnicos activos pueden recibir una OT;
- el técnico acepta, inicia, bloquea, reanuda y ejecuta;
- administración no rellena evidencias técnicas en nombre del técnico;
- checklist, fotos, mediciones, firmas e informe se exigen según configuración;
- la finalización técnica envía a revisión, no cierra definitivamente;
- las correcciones requieren una nota visible al técnico;
- la validación deja la OT en solo lectura;
- la anulación requiere motivo y conserva todo el historial;
- toda transición crítica se valida en el backend y se audita.

## 8. Experiencia por rol

### Técnico

La navegación principal debe limitarse a:

1. Mis trabajos.
2. Escanear QR/NFC.
3. Abrir indicaciones y contexto.
4. Aceptar o iniciar.
5. Ejecutar procedimiento/checklist.
6. Registrar mediciones, materiales y evidencias.
7. Recoger firmas cuando proceda.
8. Revisar requisitos pendientes.
9. Generar parte y finalizar técnicamente.

### Coordinación / administración

Debe disponer de:

- bandeja operativa y prioridades;
- agenda y planificación;
- carga de técnicos;
- creación y asignación rápida;
- revisión de OT finalizadas;
- solicitud de correcciones;
- validación y anulación;
- indicadores, riesgos, vencimientos y auditoría.

### Cliente de lectura

Acceso limitado a información autorizada, documentos visibles, estado de trabajos e informes finales. Nunca debe acceder a notas internas o datos de otras organizaciones.

## 9. Estrategia de calidad

No se aceptará como terminado un desarrollo únicamente porque compile o se vea bien.

Cada entrega debe incluir, según alcance:

- TypeScript y lint sin errores;
- pruebas unitarias de reglas de negocio;
- pruebas de componentes;
- pruebas E2E del flujo real;
- pruebas de base de datos y RLS;
- prueba de Storage privado y URL firmadas;
- build de producción;
- revisión responsive;
- escaneo de secretos;
- migraciones reproducibles desde una base vacía;
- procedimiento de rollback;
- actualización de documentación.

Flujos E2E mínimos:

- acceso y recuperación;
- aislamiento entre organizaciones;
- creación de activo y QR;
- alta, asignación y ejecución de OT;
- checklist con fotografía vinculada al punto;
- materiales y mediciones;
- firma e informe;
- corrección y nueva finalización;
- validación y solo lectura;
- anulación con motivo;
- copia y restauración.

## 10. Orden de ejecución

### Fase A — Estabilización de plataforma

- separar las PR de marca, infraestructura y seguridad;
- corregir nombre del repositorio y marca oficial;
- desplegar backend y frontend locales;
- preparar backup, restauración, monitorización y SMTP;
- ejecutar migraciones desde cero y validar RLS.

### Fase B — Convergencia del motor OT

- adoptar lo mejor de HomeServe siguiendo `OT_CONVERGENCE_HOMESERVE_ACTIVOS.md`;
- unificar estados, tipos y adaptadores;
- mejorar creación, asignación, ejecución, checklist, fotos y revisión;
- elevar las pruebas automáticas al nivel de HomeServe.

### Fase C — Core profesional

- ficha 360 del activo;
- costes, tiempos de parada, criticidad y repuestos;
- preventivos y vencimientos;
- búsqueda global y cronología completa;
- portal de cliente;
- offline real y notificaciones.

### Fase D — Piloto

- un cliente real;
- una o dos instalaciones;
- técnicos y activos reales;
- QR/NFC físicos;
- varias semanas de operación;
- registro de fallos y tiempos;
- restauración probada.

### Fase E — Comercialización y módulos

- precios, contratos, privacidad, soporte y onboarding;
- activación modular de electricidad, FV, RITE, PCI, Legionella, hospitales y OCA;
- edición autoalojada y, cuando exista capacidad, edición gestionada.

## 11. Control de cambios

Antes de aprobar una nueva función se responderá:

1. ¿Pertenece al Core o a un módulo técnico?
2. ¿Duplica una entidad o flujo existente?
3. ¿Reduce pasos para el usuario correcto?
4. ¿Mantiene aislamiento, trazabilidad y permisos?
5. ¿Tiene pruebas y criterio de aceptación?
6. ¿Aumenta la deuda operativa del mini PC?
7. ¿Está alineada con el piloto y el producto vendible?

Una propuesta que contradiga este documento debe modificarse o acompañarse de una PR que actualice formalmente el plan maestro.

## 12. Métricas de avance

El avance se medirá por:

- porcentaje de flujos críticos cubiertos por pruebas;
- tiempo medio para crear, asignar y cerrar una OT;
- número de pasos y errores por intervención técnica;
- disponibilidad y restauraciones verificadas;
- incidencias de aislamiento o permisos;
- porcentaje de activos con ficha completa;
- preventivos realizados en plazo;
- tiempo de parada, costes y reincidencias;
- uso real durante pilotos;
- satisfacción de técnicos, coordinadores y clientes.

No se medirá únicamente por número de pantallas, módulos o líneas de código.

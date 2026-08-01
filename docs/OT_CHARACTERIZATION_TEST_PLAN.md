# Plan de pruebas de caracterización del motor OT

Estado: OT-00

Objetivo: congelar el comportamiento actual antes de introducir TypeScript, Zod, TanStack Query o migraciones de estados.

## 1. Principio

Una prueba de caracterización describe lo que el sistema hace hoy, incluso cuando posteriormente decidamos cambiarlo. Su función es detectar pérdidas accidentales durante la convergencia HomeServe → IsiVoltPro Activos.

OT-00 no cambia pantallas, tablas ni datos. Solo documenta y crea la red de seguridad necesaria para OT-01.

## 2. Capas de pruebas

### A. Dominio unitario

Herramienta objetivo: Vitest.

- normalización de estados actuales e históricos;
- etiquetas, tonos y agrupaciones;
- acciones siguientes;
- estados de solo lectura;
- prioridad y tipo;
- cálculo de progreso de checklist;
- requisitos de cierre;
- adaptación de bloqueos;
- permisos por rol;
- mapeo de registros de base de datos a contratos de frontend.

### B. Componentes

Herramientas objetivo: Testing Library + jsdom.

- Nueva OT;
- selector de cliente/instalación/ubicación/activo;
- precarga desde contexto;
- alta rápida sin perder datos;
- ficha administrativa;
- vista móvil del técnico;
- checklist;
- galería de instalación;
- evidencias OT;
- fotografías por punto;
- materiales;
- firmas;
- revisión administrativa;
- estados vacíos y errores.

### C. Integración con PostgreSQL/RLS

Herramienta objetivo: pgTAP o SQL de verificación ejecutado contra una base QA restaurable.

- tenant A no puede leer ni escribir tenant B;
- técnico solo consulta/ejecuta OT asignadas;
- administrador no responde el checklist como técnico;
- cliente de lectura no modifica;
- actualización requiere políticas `SELECT` y `UPDATE` correctas;
- Storage valida tenant, entidad, MIME y tamaño;
- RPC críticos son atómicos;
- estados finales bloquean cambios;
- una visita activa no puede convivir con una OT finalizada;
- cancelación y reapertura requieren motivo;
- auditoría se genera en la misma operación crítica cuando corresponda.

### D. Flujo E2E

Herramienta objetivo: Playwright.

Escenario principal:

```text
admin crea cliente/instalación/activo
-> crea OT con plantilla
-> asigna técnico
-> técnico acepta
-> inicia visita
-> verifica QR si se exige
-> responde checklist
-> carga fotos antes/después
-> registra medición/material
-> firma técnico/cliente
-> genera informe
-> finaliza técnicamente
-> admin revisa y valida
-> OT y activo muestran histórico completo
```

Escenarios alternativos:

- bloqueo por material y reanudación;
- bloqueo por acceso;
- corrección administrativa;
- cancelación con motivo;
- reapertura con motivo;
- segunda visita;
- checklist opcional vacío;
- checklist obligatorio incompleto;
- firma o PDF obligatorio ausente;
- pérdida de red y reintento controlado;
- acceso directo mediante QR/NFC;
- usuario de otro tenant intentando acceder por URL.

## 3. Matriz mínima de estados

| Desde | Acción | Resultado esperado |
|---|---|---|
| BORRADOR | Lanzar | NUEVA |
| BORRADOR/NUEVA | Asignar | ASIGNADA |
| ASIGNADA | Aceptar técnico asignado | ACEPTADA |
| ACEPTADA | Iniciar visita | EN_CURSO |
| EN_CURSO | Bloquear con motivo | BLOQUEADA |
| BLOQUEADA | Reanudar | EN_CURSO |
| EN_CURSO | Finalizar sin requisitos | Error sin cambios parciales |
| EN_CURSO | Finalizar con requisitos | FINALIZADA_TECNICO |
| FINALIZADA_TECNICO | Solicitar corrección | EN_CURSO + nota |
| FINALIZADA_TECNICO | Validar | VALIDADA |
| VALIDADA | Editar directamente | Rechazado |
| VALIDADA | Reabrir con motivo | EN_CURSO + auditoría |
| Activa | Cancelar sin motivo | Rechazado |
| Activa | Cancelar con motivo | CANCELADA |
| CANCELADA | Cualquier transición | Rechazado |

## 4. Compatibilidad histórica

Probar que los datos existentes se leen sin corrupción:

| Valor histórico | Lectura esperada |
|---|---|
| `FIRMADA` | finalización técnica |
| `INFORME_GENERADO` | finalización técnica |
| `FINALIZADA` | finalización técnica |
| `CERRADA` / `CERRADO` | validada |
| `PAUSADA` | bloqueada, motivo otro |
| `PENDIENTE_MATERIAL` | bloqueada, motivo material |
| `PENDIENTE_CLIENTE` | bloqueada, motivo responsable |
| `NUEVO`, `PENDIENTE`, `SIN_TECNICO` | nueva |
| valor desconocido | error visible y telemetría; nunca conversión silenciosa |

## 5. Checklist y evidencias

Casos obligatorios:

1. La plantilla publicada crea una versión inmutable.
2. Una OT conserva el snapshot aunque cambie la plantilla.
3. Los puntos mantienen orden, tipo, límites y obligatoriedad.
4. `no_aplica` solo es válido cuando el punto lo permite.
5. Una foto requerida bloquea el cierre si falta.
6. La foto de checklist lleva `checklist_response_id`.
7. La galería OT excluye fotos de checklist.
8. La galería de instalación nunca muestra fotos de OT.
9. Las URLs firmadas caducan y no se guardan como URL permanente.
10. Una eliminación deja auditoría o soft delete según contrato.

## 6. Firmas, materiales e informe

- firma técnica y responsable separadas;
- permisos y obligatoriedad independientes;
- no cerrar si falta una firma obligatoria;
- material con cantidad/unidad/coste válidos;
- PDF contiene snapshots, no consultas ambiguas posteriores;
- PDF regenerado conserva versión anterior o sustitución auditada;
- acceso al informe mediante URL firmada;
- validación administrativa visible en informe/histórico cuando aplique.

## 7. Pruebas de resiliencia

Antes del piloto:

- backup automático de PostgreSQL;
- backup de Storage;
- restauración en entorno QA;
- verificación de recuentos y hashes/metadata;
- reinicio de contenedores;
- disco casi lleno;
- backend temporalmente no disponible;
- token caducado;
- actualización con rollback.

## 8. Datos de prueba canónicos

Crear fixtures reproducibles:

- dos tenants;
- dos administradores;
- coordinador;
- técnico interno y externo;
- cliente de lectura;
- instalaciones y activos de electricidad, FV y climatización;
- OT en cada estado;
- OT con todos los requisitos;
- OT sin checklist;
- OT bloqueada por cada motivo;
- evidencias separadas;
- una OT histórica con estados heredados.

Los fixtures no usarán datos personales reales.

## 9. Gates obligatorios de CI

Para cada PR OT:

```text
npm ci
npm run typecheck
npm run lint
npm test -- --run
npm run build
pruebas SQL/RLS del alcance
git diff --check
escaneo de secretos
```

Mientras Activos siga parcialmente en JavaScript, `typecheck` y `lint` se introducirán por etapas, pero no se reducirá la cobertura existente.

## 10. Condición de cierre de OT-00B

OT-00B se cierra cuando:

- el comportamiento actual relevante está cubierto;
- las pruebas fallan ante una transición, permiso o evidencia incorrectos;
- existe base QA reproducible;
- el flujo principal E2E funciona;
- se ha probado aislamiento entre tenants;
- se ha probado una restauración;
- OT-01 puede comenzar sin depender de pruebas manuales informales.

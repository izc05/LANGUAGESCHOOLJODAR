# ADR-001: Convergencia del motor OT HomeServe → IsiVoltPro Activos

- Estado: **Propuesta para aprobación**
- Fecha: 2026-07-31
- Decisores: IsiVoltPro
- Relacionada con: #76, #77

## Contexto

Existen dos repositorios con capacidades OT solapadas:

- `izc05/homeserve`: aplicación especializada, con TypeScript, formularios validados, TanStack Query, mayor cobertura de pruebas y una experiencia administrativa/técnica madura.
- `izc05/isivolpro-activos`: producto maestro del ecosistema, con clientes, instalaciones, ubicaciones, activos, QR/NFC, mantenimiento preventivo, OCA, especialidades, materiales, firmas, PDF y auditoría.

Mantener dos motores OT evolucionando independientemente generaría duplicidad, comportamientos divergentes, mayor superficie de seguridad y coste de mantenimiento. Copiar HomeServe entero dentro de Activos también sería incorrecto porque arrastraría marca, estructura, supuestos y deuda ajena al dominio maestro.

## Decisión

IsiVoltPro Activos será el único producto maestro y el propietario del contrato OT a largo plazo.

HomeServe seguirá operativo e independiente, pero se utilizará como fuente de patrones que se integrarán selectivamente mediante PR pequeñas, pruebas y adaptadores.

Se adopta un contrato canónico con:

- separación entre finalización técnica y validación administrativa;
- bloqueo con motivo tipado;
- checklist versionado y snapshot inmutable;
- evidencias separadas por entidad;
- transiciones críticas atómicas en backend;
- permisos aplicados mediante RLS/RPC;
- frontend progresivamente tipado;
- pruebas unitarias, componentes, SQL/RLS y E2E.

## Alternativas consideradas

### A. Mantener los dos motores para siempre

Rechazada. Duplica lógica, errores, migraciones y esfuerzo. Las mejoras no convergerían y los clientes recibirían comportamientos diferentes.

### B. Reemplazar Activos por HomeServe

Rechazada. Se perderían o degradarían QR/NFC, jerarquía 360 del activo, preventivos, módulos técnicos, materiales, firmas, PDF y estrategia autoalojada.

### C. Copiar carpetas completas de HomeServe

Rechazada. Generaría dependencias y modelos duplicados, además de dificultar el rollback y la seguridad.

### D. Reescribir todo desde cero

Rechazada. El motor actual contiene conocimiento y flujos valiosos. Una reescritura larga elevaría el riesgo sin aportar valor inmediato al piloto.

### E. Convergencia incremental mediante contrato

Aceptada. Permite conservar funcionamiento, medir regresiones y adoptar solo capacidades demostradas.

## Consecuencias positivas

- Un único modelo OT para todo el ecosistema.
- Mejor experiencia móvil y administrativa.
- Mayor disciplina de tipado, validación y consultas.
- Reutilización de los mejores patrones ya construidos.
- Menor riesgo que una reescritura.
- Compatibilidad con módulos técnicos actuales y futuros.
- Separación operativa entre HomeServe Cloud y Activos autoalojado.

## Consecuencias negativas y costes

- Periodo temporal con adaptadores de compatibilidad.
- Necesidad de pruebas antes de refactorizar.
- Migración gradual de JavaScript a TypeScript.
- Estados históricos que deberán normalizarse.
- Trabajo adicional para documentar y probar rollback.
- No se podrán añadir módulos sin control durante la estabilización.

## Restricciones

1. No compartir backend, usuarios, Storage o claves.
2. No mezclar marca HomeServe con IsiVoltPro.
3. No migrar datos sin backup y verificación.
4. No introducir una segunda tabla OT canónica permanente.
5. No eliminar compatibilidad hasta confirmar que no quedan registros históricos.
6. No fusionar una fase OT si reduce funciones existentes.
7. No confiar únicamente en controles del frontend.
8. No iniciar OT-01 hasta aprobar contrato y pruebas OT-00.

## Plan de implantación

- OT-00: contrato, mapeo, caracterización y migración planificada.
- OT-01: tipos, Zod y adaptadores.
- OT-02: consultas y caché.
- OT-03: Nueva OT profesional.
- OT-04: ciclo técnico móvil.
- OT-05: checklist/evidencias.
- OT-06: materiales, firmas, PDF y cierre.
- OT-07: revisión administrativa.
- OT-08: dashboard y planificación.
- OT-09: seguridad, rendimiento y piloto.

## Métricas de éxito

- cero pérdida de datos durante migraciones;
- cero acceso cruzado entre tenants;
- transiciones OT cubiertas automáticamente;
- cierre imposible sin requisitos configurados;
- reducción de pasos del técnico;
- tiempos de consulta aceptables en móvil;
- backup y restauración probados;
- un piloto real completado sin flujos paralelos externos.

## Revisión de esta decisión

Esta ADR solo puede sustituirse mediante otra ADR que explique el motivo, impacto, plan de migración y rollback. Las preferencias visuales o la aparición de una nueva tecnología no son motivo suficiente para romper el contrato.

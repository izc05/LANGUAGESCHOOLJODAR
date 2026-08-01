import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  OFFICIAL_WORK_ORDER_STATUSES,
  normalizedStatus,
  validNextActions,
  isWorkOrderReadOnly,
  getWorkOrderChecklistProgress
} from '../src/utils/workOrderLifecycle.js';
import { ROLE_PERMISSION_MATRIX, roleCan } from '../src/services/rolePermissionMatrix.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CURRENT_ACTIVOS_STATUSES = [
  'BORRADOR',
  'NUEVA',
  'ASIGNADA',
  'ACEPTADA',
  'EN_CURSO',
  'PAUSADA',
  'PENDIENTE_MATERIAL',
  'PENDIENTE_CLIENTE',
  'FINALIZADA',
  'VALIDADA',
  'CANCELADA'
];

test('caracteriza sin ambigüedad los estados oficiales actuales de Activos', () => {
  assert.deepEqual(OFFICIAL_WORK_ORDER_STATUSES, CURRENT_ACTIVOS_STATUSES);
});

test('caracteriza la compatibilidad actual con estados históricos', () => {
  assert.equal(normalizedStatus('FIRMADA'), 'FINALIZADA');
  assert.equal(normalizedStatus('INFORME_GENERADO'), 'FINALIZADA');
  assert.equal(normalizedStatus('CERRADA'), 'VALIDADA');
  assert.equal(normalizedStatus('CERRADO'), 'VALIDADA');
  assert.equal(normalizedStatus('NUEVO'), 'NUEVA');
  assert.equal(normalizedStatus('PENDIENTE'), 'NUEVA');
  assert.equal(normalizedStatus('SIN_TECNICO'), 'NUEVA');
});

test('caracteriza los estados de pausa que OT-00 migrará a bloqueo con motivo', () => {
  assert.equal(normalizedStatus('PAUSADA'), 'PAUSADA');
  assert.equal(normalizedStatus('PENDIENTE_MATERIAL'), 'PENDIENTE_MATERIAL');
  assert.equal(normalizedStatus('PENDIENTE_CLIENTE'), 'PENDIENTE_CLIENTE');
  assert.deepEqual(validNextActions({ estado: 'PAUSADA' }), [
    'EN_CURSO',
    'PENDIENTE_MATERIAL',
    'PENDIENTE_CLIENTE',
    'CANCELADA'
  ]);
  assert.deepEqual(validNextActions({ estado: 'PENDIENTE_MATERIAL' }), ['EN_CURSO', 'CANCELADA']);
  assert.deepEqual(validNextActions({ estado: 'PENDIENTE_CLIENTE' }), ['EN_CURSO', 'CANCELADA']);
});

test('caracteriza la separación actual entre finalización y validación', () => {
  assert.equal(isWorkOrderReadOnly('FINALIZADA'), true);
  assert.equal(isWorkOrderReadOnly('VALIDADA'), true);
  assert.deepEqual(validNextActions({ estado: 'FINALIZADA' }), ['VALIDADA', 'EN_CURSO']);
  assert.deepEqual(validNextActions({ estado: 'VALIDADA' }), ['REABRIR']);
  assert.deepEqual(validNextActions({ estado: 'CANCELADA' }), []);
});

test('el flujo genérico sigue sin ofrecer finalización directa', () => {
  for (const status of ['NUEVA', 'ASIGNADA', 'ACEPTADA', 'EN_CURSO', 'PAUSADA', 'PENDIENTE_MATERIAL', 'PENDIENTE_CLIENTE']) {
    assert.equal(validNextActions({ estado: status }).includes('FINALIZADA'), false, status);
  }
});

test('caracteriza el cierre de checklist opcional y obligatorio', () => {
  assert.deepEqual(getWorkOrderChecklistProgress({ configuracion: { requiere_checklist: false } }, []), {
    required: false,
    available: false,
    completed: 0,
    total: 0,
    complete: true
  });

  const required = getWorkOrderChecklistProgress(
    { configuracion: { requiere_checklist: true } },
    [{ resultado: 'ok' }, { resultado: 'pendiente' }]
  );
  assert.equal(required.required, true);
  assert.equal(required.complete, false);
  assert.equal(required.completed, 1);
  assert.equal(required.total, 2);
});

test('caracteriza la separación de gestión y ejecución por rol', () => {
  for (const role of ['superadmin', 'admin_cliente', 'coordinador']) {
    assert.equal(roleCan(role, 'canManageWorkOrders'), true, role);
    assert.equal(roleCan(role, 'canExecuteWorkOrders'), false, role);
    assert.equal(roleCan(role, 'canValidateWorkOrders'), true, role);
    assert.equal(roleCan(role, 'canAnnulWorkOrders'), true, role);
  }

  for (const role of ['tecnico', 'tecnico_externo']) {
    assert.equal(roleCan(role, 'canManageWorkOrders'), false, role);
    assert.equal(roleCan(role, 'canExecuteWorkOrders'), true, role);
    assert.equal(roleCan(role, 'canValidateWorkOrders'), false, role);
    assert.equal(roleCan(role, 'canAnnulWorkOrders'), false, role);
  }

  assert.equal(roleCan('cliente_lectura', 'canManageWorkOrders'), false);
  assert.equal(roleCan('cliente_lectura', 'canExecuteWorkOrders'), false);
  assert.deepEqual(Object.keys(ROLE_PERMISSION_MATRIX), [
    'superadmin',
    'admin_cliente',
    'coordinador',
    'tecnico',
    'tecnico_externo',
    'cliente_lectura'
  ]);
});

test('el servicio de ciclo mantiene filtro tenant y prohíbe finalizar fuera del cierre guiado', async () => {
  const source = await readFile(path.join(root, 'src/services/workOrderLifecycleService.js'), 'utf8');
  assert.match(source, /target === 'FINALIZADA'/);
  assert.match(source, /solo puede finalizarse desde el cierre guiado/i);
  assert.match(source, /\.eq\('tenant_id', row\.tenant_id\)/);
  assert.match(source, /reopen_reason/);
  assert.match(source, /reopen_work_order/);
});

test('las migraciones actuales contienen los contratos que no pueden perderse', async () => {
  const integrity = await readFile(path.join(root, 'src/sql/038_phase1_work_order_integrity.sql'), 'utf8');
  const snapshot = await readFile(path.join(root, 'src/sql/040_phase2_checklist_snapshot.sql'), 'utf8');
  const qr = await readFile(path.join(root, 'src/sql/041_phase2_work_order_qr_verification.sql'), 'utf8');
  const signatures = await readFile(path.join(root, 'src/sql/042_phase2_separate_signatures.sql'), 'utf8');
  const review = await readFile(path.join(root, 'src/sql/043_phase2_admin_review_workflow.sql'), 'utf8');
  const roles = await readFile(path.join(root, 'src/sql/045_separate_work_order_management_execution.sql'), 'utf8');

  assert.match(integrity, /finalize_work_order_visit/i);
  assert.match(snapshot, /checklist_snapshot jsonb/i);
  assert.match(qr, /verify_work_order_qr/i);
  assert.match(signatures, /firma_tecnico_path text/i);
  assert.match(review, /review_work_order/i);
  assert.match(roles, /can_execute_work_order/i);
});

test('el contrato OT-00 documenta explícitamente la futura adaptación sin aplicarla todavía', async () => {
  const contract = await readFile(path.join(root, 'docs/OT_CANONICAL_CONTRACT.md'), 'utf8');
  const mapping = await readFile(path.join(root, 'docs/OT_SOURCE_MAPPING.md'), 'utf8');

  assert.match(contract, /`BLOQUEADA`/);
  assert.match(contract, /`FINALIZADA_TECNICO`/);
  assert.match(contract, /No se modificará información masivamente sin backup/i);
  assert.match(mapping, /PENDIENTE_MATERIAL.*BLOQUEADA.*MATERIAL/is);
  assert.match(mapping, /Conectar Activos al proyecto Supabase de HomeServe/i);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Activos no contiene un backend cloud predeterminado', async () => {
  const source = await readFile(path.join(root, 'src/services/supabaseClient.js'), 'utf8');

  assert.doesNotMatch(source, /https:\/\/[^'"\s]+\.supabase\.co/i);
  assert.doesNotMatch(source, /defaultSupabaseUrl|defaultSupabaseAnonKey/);
  assert.match(source, /VITE_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(source, /backendConfiguration/);
  assert.match(source, /127\.0\.0\.1:8000/);
});

test('las plantillas de entorno no incluyen secretos reales', async () => {
  const generic = await readFile(path.join(root, '.env.example'), 'utf8');
  const miniPc = await readFile(path.join(root, '.env.mini-pc.example'), 'utf8');

  assert.doesNotMatch(generic, /sb_(publishable|secret)_[A-Za-z0-9_-]{10,}/);
  assert.doesNotMatch(miniPc, /sb_(publishable|secret)_[A-Za-z0-9_-]{10,}/);
  assert.match(miniPc, /PEGA_AQUI_LA_CLAVE_PUBLICA/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchBetaStatus, claimBetaSlot, isBetaBlocked } from './beta.js';

// Un "Supabase" de mentira que devuelve lo que le pidamos
const fake = (result) => ({ rpc: async () => (typeof result === 'function' ? result() : result) });

test('isBetaBlocked: solo bloquea la cola y las cuentas en pausa', () => {
  assert.equal(isBetaBlocked({ state: 'waitlist' }), true);
  assert.equal(isBetaBlocked({ state: 'suspended' }), true);
  assert.equal(isBetaBlocked({ state: 'active' }), false);
});

test('isBetaBlocked: sin información no se bloquea a nadie', () => {
  assert.equal(isBetaBlocked(null), false);
  assert.equal(isBetaBlocked(undefined), false);
  assert.equal(isBetaBlocked({}), false);
});

test('claimBetaSlot devuelve el estado cuando el servidor responde bien', async () => {
  const estado = { state: 'waitlist', position: 4 };
  assert.deepEqual(await claimBetaSlot(fake({ data: estado, error: null })), estado);
});

test('claimBetaSlot falla en abierto: error, función inexistente, respuesta rara o excepción => null', async () => {
  assert.equal(await claimBetaSlot(fake({ data: null, error: { code: 'PGRST202' } })), null);
  assert.equal(await claimBetaSlot(fake({ data: {}, error: null })), null);
  assert.equal(await claimBetaSlot(fake({ data: 'hola', error: null })), null);
  assert.equal(await claimBetaSlot(fake(() => { throw new Error('sin red'); })), null);
});

test('fetchBetaStatus: devuelve el estado público o null si algo falla', async () => {
  const publico = { capacity: 25, remaining: 3 };
  assert.deepEqual(await fetchBetaStatus(fake({ data: publico, error: null })), publico);
  assert.equal(await fetchBetaStatus(fake({ data: null, error: { message: 'x' } })), null);
  assert.equal(await fetchBetaStatus(fake(() => { throw new Error('sin red'); })), null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { rateLimitMinutes } from './portalAccess.js';

test('rateLimitMinutes: null si el servidor no ha limitado los intentos', () => {
  assert.equal(rateLimitMinutes(null), null);
  assert.equal(rateLimitMinutes(undefined), null);
  assert.equal(rateLimitMinutes({ status: 'locked' }), null);
  assert.equal(rateLimitMinutes({ status: 'locked', rate_limited: false, retry_after: 300 }), null);
  assert.equal(rateLimitMinutes({ status: 'success' }), null);
});

test('rateLimitMinutes: redondea los segundos hacia arriba y nunca devuelve menos de 1', () => {
  assert.equal(rateLimitMinutes({ status: 'locked', rate_limited: true, retry_after: 600 }), 10);
  assert.equal(rateLimitMinutes({ status: 'locked', rate_limited: true, retry_after: 601 }), 11);
  assert.equal(rateLimitMinutes({ status: 'locked', rate_limited: true, retry_after: 59 }), 1);
  assert.equal(rateLimitMinutes({ status: 'locked', rate_limited: true, retry_after: 1 }), 1);
});

test('rateLimitMinutes: si falta o es inválido retry_after, avisa de 1 minuto', () => {
  assert.equal(rateLimitMinutes({ status: 'locked', rate_limited: true }), 1);
  assert.equal(rateLimitMinutes({ status: 'locked', rate_limited: true, retry_after: 'x' }), 1);
  assert.equal(rateLimitMinutes({ status: 'locked', rate_limited: true, retry_after: -5 }), 1);
});

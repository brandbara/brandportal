import test from 'node:test';
import assert from 'node:assert/strict';
import { hasAcceptedTerms, acceptTerms, needsTermsAcceptance } from './terms.js';

// Supabase falso: from().select().eq().limit() y rpc()
const fakeSupabase = ({ rows = [], selectError = null, rpc = async () => ({ data: null, error: null }) } = {}) => ({
  from: (table) => {
    assert.equal(table, 'terms_acceptances');
    const chain = {
      select: () => chain,
      eq: (col, val) => { chain.filter = { col, val }; return chain; },
      limit: async () => (selectError ? { data: null, error: selectError } : { data: rows.filter((r) => r.version === chain.filter.val), error: null }),
    };
    return chain;
  },
  rpc,
});

test('hasAcceptedTerms: true si hay fila de esa versión, false si no', async () => {
  const sb = fakeSupabase({ rows: [{ version: '2026-10-26.2' }] });
  assert.equal(await hasAcceptedTerms(sb, '2026-10-26.2'), true);
  assert.equal(await hasAcceptedTerms(sb, '2026-10-26.3'), false);
});

test('hasAcceptedTerms falla en abierto: error o excepción → null (no se bloquea a nadie)', async () => {
  assert.equal(await hasAcceptedTerms(fakeSupabase({ selectError: { message: 'relation does not exist' } }), 'x'), null);
  const boom = { from: () => { throw new Error('sin red'); } };
  assert.equal(await hasAcceptedTerms(boom, 'x'), null);
});

test('needsTermsAcceptance solo pide aceptar cuando se sabe seguro que falta', () => {
  assert.equal(needsTermsAcceptance(false), true);
  assert.equal(needsTermsAcceptance(true), false);
  assert.equal(needsTermsAcceptance(null), false);
  assert.equal(needsTermsAcceptance(undefined), false);
});

test('acceptTerms: true solo si el servidor confirma la versión; al escribir los fallos sí se notifican', async () => {
  let sent;
  const ok = fakeSupabase({ rpc: async (fn, args) => { sent = { fn, args }; return { data: { version: args.p_version, accepted_at: '2026-10-26T16:00:00Z' }, error: null }; } });
  assert.equal(await acceptTerms(ok, '2026-10-26.3'), true);
  assert.deepEqual(sent, { fn: 'accept_terms', args: { p_version: '2026-10-26.3' } });

  assert.equal(await acceptTerms(fakeSupabase({ rpc: async () => ({ data: null, error: { message: 'x' } }) }), 'v'), false);
  assert.equal(await acceptTerms(fakeSupabase({ rpc: async () => ({ data: { version: 'otra' }, error: null }) }), 'v'), false);
  assert.equal(await acceptTerms(fakeSupabase({ rpc: async () => { throw new Error('sin red'); } }), 'v'), false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchAuthProviders, shouldShowGoogle } from './authProviders.js';

const resp = (body, ok = true) => async () => ({ ok, json: async () => body });

test('lee qué proveedores están activos', async () => {
  const p = await fetchAuthProviders({ url: 'https://x.supabase.co/', anonKey: 'k', fetchFn: resp({ external: { email: true, google: true, github: false } }) });
  assert.deepEqual(p, { google: true, email: true });
  const q = await fetchAuthProviders({ url: 'https://x.supabase.co', anonKey: 'k', fetchFn: resp({ external: { email: true, google: false } }) });
  assert.deepEqual(q, { google: false, email: true });
});

test('pide la dirección correcta, con la clave pública, sin barras dobles', async () => {
  let visto;
  await fetchAuthProviders({ url: 'https://x.supabase.co//', anonKey: 'clave', fetchFn: async (u, o) => { visto = { u, o }; return { ok: true, json: async () => ({ external: { google: true } }) }; } });
  assert.equal(visto.u, 'https://x.supabase.co/auth/v1/settings');
  assert.equal(visto.o.headers.apikey, 'clave');
});

test('falla en abierto: respuestas raras, errores o excepciones → null', async () => {
  assert.equal(await fetchAuthProviders({ url: 'u', anonKey: 'k', fetchFn: resp({}, false) }), null);
  assert.equal(await fetchAuthProviders({ url: 'u', anonKey: 'k', fetchFn: resp({}) }), null);
  assert.equal(await fetchAuthProviders({ url: 'u', anonKey: 'k', fetchFn: resp({ external: 'raro' }) }), null);
  assert.equal(await fetchAuthProviders({ url: 'u', anonKey: 'k', fetchFn: async () => { throw new Error('sin red'); } }), null);
  assert.equal(await fetchAuthProviders({ url: '', anonKey: 'k', fetchFn: resp({}) }), null);
});

test('el botón de Google solo se oculta si se sabe seguro que está desactivado', () => {
  assert.equal(shouldShowGoogle({ google: false, email: true }), false);
  assert.equal(shouldShowGoogle({ google: true, email: true }), true);
  assert.equal(shouldShowGoogle(null), true);
  assert.equal(shouldShowGoogle(undefined), true);
});

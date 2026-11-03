import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchOwnImage, fetchPortalPreview, MAX_IMAGE_BYTES, readEnv } from './network.js';
import { PNG_40x20, SUPABASE, STORAGE, capeoRpc } from './fixtures.js';

const env = { supabaseUrl: SUPABASE, anonKey: 'anon-key' };
const json = (body, init = {}) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' }, ...init });
const spy = (impl) => { const calls = []; const f = async (url, init) => { calls.push({ url: String(url), init }); return impl(url, init); }; f.calls = calls; return f; };

test('pregunta a Supabase como un visitante anónimo y SIN contraseña (no cuenta como intento fallido)', async () => {
  const fetchImpl = spy(() => json(capeoRpc()));
  const p = await fetchPortalPreview('capeo', env, { fetchImpl });
  assert.equal(p.kind, 'ok');
  assert.equal(p.name, 'Capeo');
  assert.equal(fetchImpl.calls.length, 1);
  const { url, init } = fetchImpl.calls[0];
  assert.equal(url, `${SUPABASE}/rest/v1/rpc/get_portal_secure`);
  assert.equal(init.method, 'POST');
  assert.deepEqual(JSON.parse(init.body), { p_slug: 'capeo', p_password: null });
  assert.equal(init.headers.apikey, 'anon-key');
  assert.equal(init.headers.authorization, 'Bearer anon-key');
});

test('cualquier fallo al consultar el portal da la vista previa genérica y nunca lanza error', async () => {
  const casos = {
    'respuesta de error': () => new Response('boom', { status: 500 }),
    'sin permiso': () => new Response('{}', { status: 401 }),
    'JSON roto': () => new Response('{no es json', { status: 200 }),
    'sin portal (null)': () => json(null),
    'la red falla': () => { throw new TypeError('fetch failed'); },
    'respuesta enorme': () => new Response('{}', { status: 200, headers: { 'content-length': String(50 * 1024 * 1024) } }),
  };
  for (const [nombre, impl] of Object.entries(casos)) {
    assert.deepEqual(await fetchPortalPreview('capeo', env, { fetchImpl: spy(impl) }), { kind: 'none' }, nombre);
  }
});

test('sin configuración de Supabase no se hace ninguna petición', async () => {
  const fetchImpl = spy(() => json(capeoRpc()));
  assert.deepEqual(await fetchPortalPreview('capeo', { supabaseUrl: '', anonKey: '' }, { fetchImpl }), { kind: 'none' });
  assert.deepEqual(await fetchPortalPreview('capeo', { supabaseUrl: SUPABASE, anonKey: '' }, { fetchImpl }), { kind: 'none' });
  assert.equal(fetchImpl.calls.length, 0);
});

test('si Supabase tarda demasiado se corta la espera y se usa la vista previa genérica', async () => {
  const fetchImpl = (url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new Error('abortado'))));
  const t0 = Date.now();
  assert.deepEqual(await fetchPortalPreview('capeo', env, { fetchImpl, timeoutMs: 50 }), { kind: 'none' });
  assert.ok(Date.now() - t0 < 2000);
});

test('readEnv acepta los nombres que ya usa la web y los equivalentes sin VITE_', () => {
  assert.deepEqual(readEnv({ VITE_SUPABASE_URL: 'u', VITE_SUPABASE_ANON_KEY: 'k' }), { supabaseUrl: 'u', anonKey: 'k' });
  assert.deepEqual(readEnv({ SUPABASE_URL: 'u2', SUPABASE_ANON_KEY: 'k2' }), { supabaseUrl: 'u2', anonKey: 'k2' });
  assert.deepEqual(readEnv({}), { supabaseUrl: '', anonKey: '' });
});

test('imagen propia válida: se descarga, se comprueba y se devuelven sus medidas', async () => {
  const fetchImpl = spy(() => new Response(PNG_40x20, { status: 200, headers: { 'content-type': 'image/png' } }));
  const img = await fetchOwnImage(`${STORAGE}logo.png`, SUPABASE, { fetchImpl });
  assert.equal(img.type, 'image/png');
  assert.equal(img.width, 40);
  assert.equal(img.height, 20);
  assert.equal(fetchImpl.calls[0].init.redirect, 'manual', 'no se siguen redirecciones');
});

test('imágenes de otras direcciones no se descargan jamás', async () => {
  const fetchImpl = spy(() => new Response(PNG_40x20));
  for (const url of ['https://evil.example/x.png', 'http://169.254.169.254/latest/meta-data', 'file:///etc/passwd', `${SUPABASE}/storage/v1/object/public/otro/x.png`, null]) {
    assert.equal(await fetchOwnImage(url, SUPABASE, { fetchImpl }), null, String(url));
  }
  assert.equal(fetchImpl.calls.length, 0);
});

test('se rechaza lo que no sea PNG o JPEG real aunque el servidor diga otra cosa, y lo demasiado grande o redirigido', async () => {
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><script>1</script></svg>');
  const url = `${STORAGE}x.png`;
  const casos = {
    'SVG disfrazado de PNG': () => new Response(svg, { status: 200, headers: { 'content-type': 'image/png' } }),
    'redirección': () => new Response(null, { status: 302, headers: { location: 'https://evil.example/x.png' } }),
    'no encontrada': () => new Response('x', { status: 404 }),
    'declara demasiado tamaño': () => new Response(PNG_40x20, { status: 200, headers: { 'content-length': String(MAX_IMAGE_BYTES + 1) } }),
    'se pasa del tope sin declararlo': () => new Response(new ReadableStream({ start(c) { c.enqueue(PNG_40x20); c.enqueue(new Uint8Array(MAX_IMAGE_BYTES)); c.close(); } }), { status: 200 }),
    'la red falla': () => { throw new TypeError('fetch failed'); },
  };
  for (const [nombre, impl] of Object.entries(casos)) {
    assert.equal(await fetchOwnImage(url, SUPABASE, { fetchImpl: spy(impl) }), null, nombre);
  }
});

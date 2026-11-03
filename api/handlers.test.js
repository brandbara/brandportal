import test from 'node:test';
import assert from 'node:assert/strict';
import portalMeta from './portal-meta.js';
import og from './og.js';
import { JPEG_24x16, PNG_40x20, STORAGE, SUPABASE, capeoRpc } from './_lib/fixtures.js';
import { previewVersion, extractPreview } from './_lib/preview.js';

// Entorno y red simulados: Supabase responde get_portal_secure y el almacenamiento sirve dos imágenes.
const withWorld = async (rpcByslug, fn, { storage = {} } = {}) => {
  const realFetch = globalThis.fetch;
  const oldEnv = { u: process.env.VITE_SUPABASE_URL, k: process.env.VITE_SUPABASE_ANON_KEY };
  process.env.VITE_SUPABASE_URL = SUPABASE;
  process.env.VITE_SUPABASE_ANON_KEY = 'anon';
  const calls = [];
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    calls.push(u);
    if (u.endsWith('/rest/v1/rpc/get_portal_secure')) {
      const { p_slug } = JSON.parse(init.body);
      return new Response(JSON.stringify(rpcByslug[p_slug] ?? null), { status: 200 });
    }
    if (u.startsWith(STORAGE)) {
      const file = u.slice(STORAGE.length);
      if (file in storage) return new Response(storage[file], { status: 200 });
      return new Response('nope', { status: 404 });
    }
    throw new Error('petición inesperada: ' + u);
  };
  try {
    return await fn(calls);
  } finally {
    globalThis.fetch = realFetch;
    for (const [k, v] of [['VITE_SUPABASE_URL', oldEnv.u], ['VITE_SUPABASE_ANON_KEY', oldEnv.k]]) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  }
};
const meta = (slug, origin = 'https://brandbara.com') => portalMeta(new Request(`${origin}/api/portal-meta?slug=${encodeURIComponent(slug)}`));
const image = (slug, origin = 'https://brandbara.com') => og(new Request(`${origin}/api/og?slug=${encodeURIComponent(slug)}`));
const world = { capeo: capeoRpc(), privada: { status: 'locked', is_protected: true, user_id: 'u', brand_name: 'Marca Privada' } };
const files = { 'logo.png': PNG_40x20, 'hero.jpeg': JPEG_24x16 };

test('portal-meta: un portal público devuelve sus propias etiquetas', async () => {
  await withWorld(world, async () => {
    const res = await meta('capeo');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/html/);
    assert.equal(res.headers.get('x-robots-tag'), 'noindex');
    assert.match(res.headers.get('cache-control'), /s-maxage=300/);
    const html = await res.text();
    assert.ok(html.includes('<title>Capeo · Brand Portal</title>'));
    const v = previewVersion(extractPreview(capeoRpc(), SUPABASE));
    assert.ok(html.includes(`https://brandbara.com/api/og?slug=capeo&amp;v=${v}`));
    assert.ok(!html.includes('dueno@example.com'), 'el correo del dueño no sale nunca');
  });
});

test('portal-meta: portal con contraseña = solo nombre; portal que no existe = etiquetas genéricas con caché corta', async () => {
  await withWorld(world, async () => {
    const privada = await (await meta('privada')).text();
    assert.ok(privada.includes('Marca Privada · Brand Portal') && privada.includes('protegido con contraseña'));
    const res = await meta('no-existe');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('cache-control'), /s-maxage=60$/);
    const html = await res.text();
    assert.ok(html.includes('og:image" content="https://brandbara.com/og-image.png"'));
    assert.ok(!html.includes('/api/og'));
  });
});

test('portal-meta: una dirección no válida ni siquiera consulta la base de datos', async () => {
  await withWorld(world, async (calls) => {
    for (const slug of ['', '../etc/passwd', 'Capeo', 'a b', "x'--", 'x'.repeat(200)]) {
      const res = await meta(slug);
      assert.equal(res.status, 200);
      assert.ok((await res.text()).includes('og-image.png'), slug);
    }
    assert.equal(calls.length, 0);
  });
});

test('portal-meta: en una versión de prueba la imagen apunta a esa misma versión', async () => {
  await withWorld(world, async () => {
    const html = await (await meta('capeo', 'https://brandbara-git-feat-team.vercel.app')).text();
    assert.ok(html.includes('https://brandbara-git-feat-team.vercel.app/api/og?slug=capeo'));
  });
});

test('portal-meta: si Supabase falla se devuelven las etiquetas genéricas, sin error', async () => {
  const realFetch = globalThis.fetch;
  process.env.VITE_SUPABASE_URL = SUPABASE; process.env.VITE_SUPABASE_ANON_KEY = 'anon';
  globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
  try {
    const res = await meta('capeo');
    assert.equal(res.status, 200);
    assert.ok((await res.text()).includes('og-image.png'));
  } finally {
    globalThis.fetch = realFetch; delete process.env.VITE_SUPABASE_URL; delete process.env.VITE_SUPABASE_ANON_KEY;
  }
});

test('og: devuelve un PNG con caché larga cuando están todas las imágenes', async () => {
  await withWorld(world, async () => {
    const res = await image('capeo');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/png');
    assert.match(res.headers.get('cache-control'), /s-maxage=3600/);
    const png = new Uint8Array(await res.arrayBuffer());
    assert.deepEqual(Array.from(png.slice(0, 4)), [0x89, 0x50, 0x4e, 0x47]);
    assert.equal(new DataView(png.buffer).getUint32(16), 1200);
  }, { storage: files });
});

test('og: si falta una imagen del portal la tarjeta se dibuja igual pero se guarda poco tiempo en caché', async () => {
  await withWorld(world, async () => {
    const res = await image('capeo');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('cache-control'), /s-maxage=60$/);
  }, { storage: { 'logo.png': PNG_40x20 } });
});

test('og: portal con contraseña = tarjeta con solo el nombre y sin tocar el almacenamiento', async () => {
  await withWorld(world, async (calls) => {
    const res = await image('privada');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/png');
    assert.deepEqual(calls.filter((u) => u.startsWith(STORAGE)), []);
  }, { storage: files });
});

test('og: portal inexistente o dirección rara = redirección a la imagen genérica de BrandBara', async () => {
  await withWorld(world, async (calls) => {
    for (const slug of ['no-existe', '../x', 'A B', '']) {
      const res = await image(slug);
      assert.equal(res.status, 302, slug);
      assert.equal(res.headers.get('location'), 'https://brandbara.com/og-image.png');
    }
    assert.equal(calls.filter((u) => u.includes('get_portal_secure')).length, 1, 'solo el slug válido consulta');
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMetaHtml, cleanName, drawableName, escapeHtml, extractPreview, fitInside, isValidSlug, luminance,
  normalizeHex, ownImageUrl, previewVersion, sniffImage, toDataUri,
} from './preview.js';
import { JPEG_24x16, PNG_40x20, SUPABASE, STORAGE, capeoRpc } from './fixtures.js';

test('solo se aceptan direcciones de portal con letras minúsculas, números y guiones', () => {
  for (const ok of ['capeo', 'a', 'mi-marca-2', '0abc']) assert.equal(isValidSlug(ok), true, ok);
  for (const bad of ['', '-a', 'a-', 'Capeo', 'a b', 'a/b', '../x', 'a.b', 'a'.repeat(65), null, undefined, 5, 'a%20b', 'é']) {
    assert.equal(isValidSlug(bad), false, String(bad));
  }
});

test('los nombres se limpian: sin caracteres de control, espacios colapsados y con tope', () => {
  assert.equal(cleanName('  Capeo \n\t  Studio  '), 'Capeo Studio');
  assert.equal(cleanName('A\u0000B‮C​D'), 'A B C D');
  assert.equal(cleanName('x'.repeat(200)).length, 60);
  assert.equal(cleanName(null), '');
  assert.equal(cleanName({}), '[object Object]'.slice(0, 60));
  // no corta un emoji por la mitad
  assert.equal(Array.from(cleanName('😀'.repeat(100))).length, 60);
});

test('para la imagen solo se dibuja lo que la tipografía incrustada sabe: se omiten emojis y escrituras no latinas', () => {
  assert.equal(drawableName('Café Ñandú Łódź'), 'Café Ñandú Łódź');
  assert.equal(drawableName('Capeo 🎨'), 'Capeo');
  assert.equal(drawableName('東京 Studio'), 'Studio');
  assert.equal(drawableName('مرحبا'), '');
  assert.equal(drawableName('Σ∑ Math ★'), 'Math');
});

test('el texto de las etiquetas se escapa para que un nombre no pueda inyectar HTML', () => {
  assert.equal(escapeHtml(`<img src=x onerror="a()"> & 'q'`), '&lt;img src=x onerror=&quot;a()&quot;&gt; &amp; &#39;q&#39;');
  const html = buildMetaHtml({
    slug: 'capeo', origin: 'https://brandbara.com',
    preview: { kind: 'ok', name: `"><script>alert(1)</script>`, lang: 'ES' },
  });
  assert.ok(!html.includes('<script'), 'no debe aparecer ninguna etiqueta script');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  // cada valor de content="..." sigue cerrado correctamente
  for (const m of html.matchAll(/content="([^"]*)"/g)) assert.ok(!/[<>]/.test(m[1]), m[1]);
});

test('colores: solo hexadecimales válidos, normalizados', () => {
  assert.equal(normalizeHex('#FF3C87'), '#ff3c87');
  assert.equal(normalizeHex('#fa0'), '#ffaa00');
  for (const bad of ['red', 'ff3c87', '#ff3c8', '#gggggg', 'url(x)', '#fff;}', null, 12]) assert.equal(normalizeHex(bad), null, String(bad));
  assert.ok(luminance('#ffffff') > 0.99 && luminance('#000000') === 0 && luminance('nope') === 0);
  assert.ok(luminance('#ffe640') > 0.6 && luminance('#ff3c87') < 0.6);
});

test('solo se leen imágenes de nuestro almacenamiento público de portales', () => {
  assert.equal(ownImageUrl(`${STORAGE}a.png`, SUPABASE), `${STORAGE}a.png`);
  const bad = [
    'https://evil.example/storage/v1/object/public/portals_assets/x.png',
    `${SUPABASE}/storage/v1/object/public/otro_bucket/x.png`,
    `${SUPABASE}/storage/v1/object/sign/portals_assets/x.png`,
    `https://user:pw@proj.supabase.co/storage/v1/object/public/portals_assets/x.png`,
    `${STORAGE}../../x.png`,
    `${STORAGE}%2e%2e/x.png`,
    'http://proj.supabase.co/storage/v1/object/public/portals_assets/x.png',
    `https://proj.supabase.co.evil.example/storage/v1/object/public/portals_assets/x.png`,
    'data:image/png;base64,AAAA', 'javascript:alert(1)', '', null, undefined, 7, `${STORAGE}${'a'.repeat(700)}`,
  ];
  for (const url of bad) assert.equal(ownImageUrl(url, SUPABASE), null, String(url).slice(0, 80));
  assert.equal(ownImageUrl(`${STORAGE}a.png`, ''), null);
  assert.equal(ownImageUrl(`${STORAGE}a.png`, 'http://proj.supabase.co'), null, 'el almacenamiento debe ser https');
});

test('extractPreview: portal público, con contraseña, inexistente y respuestas raras', () => {
  const ok = extractPreview(capeoRpc(), SUPABASE);
  assert.deepEqual(ok, {
    kind: 'ok', name: 'Capeo', lang: 'ES', hero: `${STORAGE}hero.jpeg`, logo: `${STORAGE}logo.png`,
    background: '#ff3c87', accent: '#ff3c87',
  });
  // un portal con contraseña solo da su nombre: nada de portada, logo ni colores
  const locked = extractPreview({ status: 'locked', is_protected: true, user_id: 'u', brand_name: 'Marca Privada' }, SUPABASE);
  assert.deepEqual(locked, { kind: 'locked', name: 'Marca Privada' });
  for (const none of [null, undefined, {}, 'x', 5, { status: 'success' }, { status: 'locked' }, { status: 'otra' }]) {
    assert.deepEqual(extractPreview(none, SUPABASE), { kind: 'none' }, JSON.stringify(none));
  }
  // el correo del dueño (profile.email) no sale nunca de aquí
  assert.ok(!JSON.stringify(ok).includes('dueno@example.com'));
});

test('extractPreview: portada de color, idioma inglés, imágenes ajenas ignoradas y lienzo sin datos', () => {
  const items = [
    { type: 'header', content: { logo: 'https://evil.example/logo.png' } },
    { type: 'hero', content: { bgType: 'color', bgValue: '#112233' } },
  ];
  const p = extractPreview(capeoRpc({ brand_name: '', canvas_data: { items, profile: { name: 'Otra', language: 'en' } } }), SUPABASE);
  assert.equal(p.name, 'Otra');
  assert.equal(p.lang, 'EN');
  assert.equal(p.logo, null);
  assert.equal(p.hero, null);
  assert.equal(p.background, '#112233');
  const vacio = extractPreview(capeoRpc({ canvas_data: null }), SUPABASE);
  assert.equal(vacio.kind, 'ok');
  assert.equal(vacio.hero, null);
  assert.equal(vacio.background, null);
  const raro = extractPreview(capeoRpc({ canvas_data: { items: 'no', profile: 7 } }), SUPABASE);
  assert.equal(raro.kind, 'ok');
});

test('la versión de la imagen cambia cuando cambia lo que se ve y no si no cambia nada', () => {
  const a = extractPreview(capeoRpc(), SUPABASE);
  assert.equal(previewVersion(a), previewVersion({ ...a }));
  assert.notEqual(previewVersion(a), previewVersion({ ...a, name: 'Capeo 2' }));
  assert.notEqual(previewVersion(a), previewVersion({ ...a, logo: `${STORAGE}otro.png` }));
  assert.match(previewVersion(a), /^[a-z0-9]{1,8}$/);
});

test('se reconocen PNG y JPEG por sus primeros bytes y se leen sus medidas; lo demás se rechaza', () => {
  assert.deepEqual(sniffImage(PNG_40x20), { type: 'image/png', width: 40, height: 20 });
  assert.deepEqual(sniffImage(JPEG_24x16), { type: 'image/jpeg', width: 24, height: 16 });
  const text = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>');
  const gif = Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, ...new Array(30).fill(0)]);
  const webp = new TextEncoder().encode('RIFF\u0000\u0000\u0000\u0000WEBPVP8 ' + 'x'.repeat(20));
  for (const bad of [text, gif, webp, new Uint8Array(0), new Uint8Array(10), null]) assert.equal(sniffImage(bad), null);
  // cabecera PNG con medidas absurdas o a cero
  const huge = PNG_40x20.slice(); new DataView(huge.buffer).setUint32(16, 99999);
  assert.equal(sniffImage(huge), null);
  const zero = PNG_40x20.slice(); new DataView(zero.buffer).setUint32(16, 0);
  assert.equal(sniffImage(zero), null);
  // JPEG truncado antes de la cabecera de medidas: no se queda en bucle
  assert.equal(sniffImage(JPEG_24x16.slice(0, 40)), null);
});

test('fitInside conserva la proporción y no agranda', () => {
  assert.deepEqual(fitInside(600, 200, 380, 120), { width: 360, height: 120 });
  assert.deepEqual(fitInside(100, 50, 380, 120), { width: 100, height: 50 });
  assert.deepEqual(fitInside(1, 5000, 100, 100), { width: 1, height: 100 });
});

test('toDataUri convierte bytes en base64 también para imágenes grandes', () => {
  const big = new Uint8Array(200_000).map((_, i) => i % 251);
  const uri = toDataUri(big, 'image/png');
  assert.ok(uri.startsWith('data:image/png;base64,'));
  assert.deepEqual(Uint8Array.from(Buffer.from(uri.split(',')[1], 'base64')), big);
});

test('etiquetas de un portal público: título, descripción, imagen propia, noindex y enlace', () => {
  const preview = extractPreview(capeoRpc(), SUPABASE);
  const html = buildMetaHtml({ slug: 'capeo', preview, origin: 'https://brandbara.com' });
  assert.ok(html.includes('<title>Capeo · Brand Portal</title>'));
  assert.ok(html.includes('<meta property="og:title" content="Capeo · Brand Portal">'));
  assert.ok(html.includes('<meta property="og:url" content="https://brandbara.com/capeo">'));
  assert.ok(html.includes(`content="https://brandbara.com/api/og?slug=capeo&amp;v=${previewVersion(preview)}"`));
  assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
  assert.ok(html.includes('<meta name="robots" content="noindex">'));
  assert.ok(html.includes('og:image:width" content="1200"') && html.includes('og:image:height" content="630"'));
  assert.ok(html.includes('<a href="https://brandbara.com/capeo">Abrir el portal de Capeo</a>'));
  assert.ok(html.includes('lang="es"') && html.includes('content="es_ES"'));
  assert.ok(!html.includes('dueno@example.com'));
});

test('etiquetas en inglés si el portal está en inglés', () => {
  const html = buildMetaHtml({ slug: 'acme', origin: 'https://brandbara.com', preview: { kind: 'ok', name: 'Acme', lang: 'EN' } });
  assert.ok(html.includes('lang="en"') && html.includes('content="en_US"'));
  assert.ok(html.includes('Acme brand guidelines'));
});

test('un portal con contraseña enseña solo su nombre y una descripción neutra', () => {
  const html = buildMetaHtml({ slug: 'privada', origin: 'https://brandbara.com', preview: { kind: 'locked', name: 'Marca Privada' } });
  assert.ok(html.includes('<title>Marca Privada · Brand Portal</title>'));
  assert.ok(html.includes('protegido con contraseña'));
  assert.ok(!html.includes('identidad visual'), 'no debe prometer contenido que no se puede ver');
});

test('sin portal, o con dirección no válida, se devuelven las etiquetas genéricas de BrandBara', () => {
  const generic = buildMetaHtml({ slug: 'no-existe', origin: 'https://brandbara.com', preview: { kind: 'none' } });
  assert.ok(generic.includes('<meta property="og:image" content="https://brandbara.com/og-image.png">'));
  assert.ok(generic.includes('BrandBara | Crea tu Brand Portal Gratis en Minutos'));
  assert.ok(!generic.includes('/api/og'));
  // aunque llegara un portal "válido" con una dirección inventada, no se personaliza
  const evil = buildMetaHtml({ slug: '../../x"onerror=1', origin: 'https://brandbara.com', preview: { kind: 'ok', name: 'X', lang: 'ES' } });
  assert.ok(!evil.includes('/api/og') && !evil.includes('onerror'));
});

test('el origen de las etiquetas solo puede ser una dirección https normal (si no, se usa brandbara.com)', () => {
  for (const origin of ['javascript:alert(1)', 'http://brandbara.com', 'https://a.com/"><x>', '', undefined, 'https://a.com\nx']) {
    const html = buildMetaHtml({ slug: 'capeo', origin, preview: { kind: 'ok', name: 'Capeo', lang: 'ES' } });
    assert.ok(html.includes('content="https://brandbara.com/capeo"'), String(origin));
  }
  const html = buildMetaHtml({ slug: 'capeo', origin: 'https://brandbara-git-x-team.vercel.app', preview: { kind: 'ok', name: 'Capeo', lang: 'ES' } });
  assert.ok(html.includes('https://brandbara-git-x-team.vercel.app/api/og?slug=capeo'), 'las versiones de prueba apuntan a su propia imagen');
});

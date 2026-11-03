import test from 'node:test';
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import { buildCard } from './card.js';
import { installThirdPartyGuard, isBlockedHost, renderCardPng } from './render.js';
import { JPEG_24x16, PNG_40x20 } from './fixtures.js';
import { sniffImage } from './preview.js';

const img = (bytes) => ({ bytes, ...sniffImage(bytes) });
const img0 = () => img(PNG_40x20);
const ok = (over = {}) => ({ kind: 'ok', name: 'Capeo', lang: 'ES', background: '#ff3c87', accent: '#ff3c87', ...over });
const pngSize = (png) => { const v = new DataView(png.buffer, png.byteOffset); return { sig: Array.from(png.slice(0, 4)), w: v.getUint32(16), h: v.getUint32(20) }; };

// Lector mínimo de PNG (8 bits, sin entrelazado) para comprobar píxeles concretos de la tarjeta.
const decodePng = (png) => {
  const v = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const width = v.getUint32(16), height = v.getUint32(20), colorType = png[25];
  assert.equal(png[24], 8); assert.equal(png[28], 0, 'sin entrelazado');
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  assert.ok(bpp, 'tipo de color no soportado por la prueba');
  const idat = []; let o = 8;
  while (o < png.length) { const len = v.getUint32(o); const type = String.fromCharCode(...png.slice(o + 4, o + 8)); if (type === 'IDAT') idat.push(png.slice(o + 8, o + 8 + len)); o += 12 + len; }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp; const out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const ft = raw[y * (stride + 1)]; const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0, b = y ? out[(y - 1) * stride + x] : 0, c = x >= bpp && y ? out[(y - 1) * stride + x - bpp] : 0;
      const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
      const paeth = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      out[y * stride + x] = (line[x] + [0, a, b, (a + b) >> 1, paeth][ft]) & 255;
    }
  }
  return { width, height, at: (x, y) => [...out.subarray(y * stride + x * bpp, y * stride + x * bpp + 3)] };
};
const flat = (node, out = []) => {
  if (Array.isArray(node)) node.forEach((n) => flat(n, out));
  else if (node && typeof node === 'object') { out.push(node); flat(node.props?.children, out); }
  else if (typeof node === 'string') out.push({ text: node });
  return out;
};
const texts = (tree) => flat(tree).filter((n) => n.text !== undefined).map((n) => n.text);
const imgs = (tree) => flat(tree).filter((n) => n.type === 'img');
const colorOf = (tree, text) => flat(tree).find((n) => n.props?.children === text)?.props.style.color;

test('el diseño (se entrega a la mitad: 600×315): con portada y logo lleva dos imágenes de usuario más la marca BrandBara, y el nombre en blanco', () => {
  const tree = buildCard(ok(), { hero: img(JPEG_24x16), logo: img(PNG_40x20) });
  assert.equal(imgs(tree).length, 3);
  assert.deepEqual(texts(tree), ['BRAND PORTAL', 'Capeo']);
  assert.equal(colorOf(tree, 'Capeo'), '#ffffff');
});

test('el diseño: sin portada el fondo es el color de marca y el texto se adapta (oscuro sobre colores claros)', () => {
  const claro = buildCard(ok({ background: '#ffe640' }), {});
  assert.equal(claro.props.style.backgroundColor, '#ffe640', 'el envoltorio y la tarjeta usan el mismo fondo');
  assert.equal(colorOf(claro, 'Capeo'), '#0f111a');
  const oscuro = buildCard(ok({ background: '#0b6e4f' }), {});
  assert.equal(colorOf(oscuro, 'Capeo'), '#ffffff');
  const sinColor = buildCard(ok({ background: null }), {});
  assert.equal(sinColor.props.style.backgroundColor, '#0f111a');
  const colorRaro = buildCard(ok({ background: 'url(javascript:1)' }), {});
  assert.equal(colorRaro.props.style.backgroundColor, '#0f111a');
});

test('el diseño: un portal con contraseña nunca dibuja portada ni logo aunque se los pasaran', () => {
  const tree = buildCard({ kind: 'locked', name: 'Marca Privada' }, { hero: img(JPEG_24x16), logo: img(PNG_40x20) });
  assert.equal(imgs(tree).length, 2, 'la portada se dibuja solo si se pasa; el logo del portal nunca en bloqueados');
  assert.equal(imgs(tree).filter((i) => i.props.src.startsWith('data:image/svg+xml')).length, 1);
});

test('el diseño: nombres con solo emojis o escrituras sin soporte dejan la tarjeta sin nombre en vez de cuadraditos', () => {
  assert.deepEqual(texts(buildCard(ok({ name: '🎨🎨' }), {})), ['BRAND PORTAL']);
  assert.deepEqual(texts(buildCard(ok({ name: '東京' }), {})), ['BRAND PORTAL']);
});

test('el diseño: el tamaño de letra baja con nombres largos', () => {
  const size = (name) => flat(buildCard(ok({ name }), {})).find((n) => n.props?.children === name)?.props.style.fontSize;
  assert.ok(size('Capeo') > size('Estudio Creativo Norte') && size('Estudio Creativo Norte') > size('x'.repeat(40)));
});

test('se dibuja un PNG de 600×315 con portada y logo', async () => {
  const { png, degraded } = await renderCardPng(ok(), { hero: img(JPEG_24x16), logo: img(PNG_40x20) });
  assert.equal(degraded, false);
  assert.deepEqual(pngSize(png), { sig: [0x89, 0x50, 0x4e, 0x47], w: 600, h: 315 });
  assert.ok(png.length > 3_000 && png.length < 300_000, `pesa ${png.length} bytes: WhatsApp puede ignorar imágenes pesadas`);
});

test('se dibuja también sin imágenes, con acentos poco comunes y en un portal con contraseña', async () => {
  for (const [p, i] of [[ok({ name: 'Łódź Café Źródło Őrség' }), {}], [{ kind: 'locked', name: 'Marca Privada' }, {}], [ok({ name: 'Ñandú' }), { logo: img(PNG_40x20) }]]) {
    const { png, degraded } = await renderCardPng(p, i);
    assert.equal(degraded, false, p.name);
    assert.deepEqual(pngSize(png), { sig: [0x89, 0x50, 0x4e, 0x47], w: 600, h: 315 });
  }
});

test('si una imagen está estropeada se reintenta sin imágenes y se devuelve igualmente una tarjeta válida', async () => {
  // empieza como un JPEG pero el resto es basura: el generador lanza error
  const corrupta = { bytes: Uint8Array.from([0xff, 0xd8, 0xff, ...Array.from({ length: 200 }, (_, i) => (i * 37) & 255)]), type: 'image/jpeg', width: 24, height: 16 };
  const { png, degraded } = await renderCardPng(ok(), { hero: corrupta, logo: img(PNG_40x20) });
  assert.equal(degraded, true);
  assert.equal(pngSize(png).w, 600);
});

test('NUNCA se contacta con terceros al dibujar, ni con nombres con emojis, escrituras no latinas o símbolos raros', async () => {
  const real = globalThis.fetch;
  const llamadas = [];
  globalThis.fetch = async (url) => { llamadas.push(String(url)); throw new Error('sin red en la prueba'); };
  try {
    const nombres = ['Capeo 🎨🚀', '東京デザイン', 'مرحبا بالعالم', 'Привет Мир', '∑ ∫ ≠ ★ ☎ ➜', 'é̂̃ zalgo ̷̡̛̗', '👨‍👩‍👧‍👦 Familia', 'A<B>"C"&\'D\'', '</text><image href="https://evil.example/x.png"/>'];
    for (const name of nombres) {
      const { png } = await renderCardPng(ok({ name }), {});
      assert.equal(pngSize(png).w, 600, name);
    }
  } finally {
    globalThis.fetch = real;
  }
  assert.deepEqual(llamadas, [], 'el dibujo no debe pedir nada por la red');
});

test('el cinturón de seguridad corta cualquier intento de bajar tipografías o emojis de Google o jsDelivr', async () => {
  for (const url of ['https://fonts.googleapis.com/css2?family=Noto+Sans', 'https://fonts.gstatic.com/s/x.ttf', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f600.svg', new Request('https://cdn.jsdelivr.net/x')]) {
    assert.equal(isBlockedHost(url), true, String(url.url || url));
  }
  for (const url of ['https://proj.supabase.co/rest/v1/rpc/get_portal_secure', 'https://brandbara.com/og-image.png', 'https://notjsdelivr.net.example.com/x', '/relativa']) {
    assert.equal(isBlockedHost(url), false, url);
  }
  const real = globalThis.fetch;
  globalThis.fetch = async () => new Response('ok');
  try {
    installThirdPartyGuard();
    await assert.rejects(() => fetch('https://fonts.googleapis.com/css2?family=X'), /bloqueada/);
    await assert.rejects(() => fetch('https://cdn.jsdelivr.net/x'), /bloqueada/);
    assert.equal(await (await fetch('https://proj.supabase.co/x')).text(), 'ok', 'lo demás pasa');
  } finally {
    globalThis.fetch = real;
  }
});

test('la tarjeta reducida a la mitad queda bien colocada: fondo de marca en la esquina, pastilla blanca de BrandBara abajo a la derecha', async () => {
  const { png } = await renderCardPng(ok({ background: '#ffe640', accent: '#ffe640' }), {});
  const img = decodePng(png);
  assert.equal(img.width, 600);
  assert.equal(img.height, 315);
  assert.deepEqual(img.at(4, 4), [0xff, 0xe6, 0x40], 'esquina superior izquierda con el color de marca');
  assert.deepEqual(img.at(595, 4), [0xff, 0xe6, 0x40]);
  assert.deepEqual(img.at(4, 310), [0xff, 0xe6, 0x40]);
  assert.deepEqual(img.at(428, 263), [255, 255, 255], 'pastilla blanca de BrandBara en su sitio');
  assert.deepEqual(img.at(590, 308), [0xff, 0xe6, 0x40], 'la pastilla no se sale del borde');
  const withLogo = decodePng((await renderCardPng(ok({ background: '#ffe640' }), { logo: img0() })).png);
  assert.deepEqual(withLogo.at(38, 38), [255, 255, 255], 'pastilla blanca del logotipo arriba a la izquierda');
});

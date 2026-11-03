// Vista previa al compartir un portal (WhatsApp, Telegram, Slack, iMessage, LinkedIn, X...).
//
// Por qué existe: la web es una aplicación que se pinta en el navegador. Los programas que generan la tarjeta
// de un enlace NO ejecutan la web: solo leen las etiquetas del HTML inicial, que eran siempre las genéricas de
// BrandBara. Estas funciones preparan, para cada portal, esas etiquetas y los datos de su imagen.
//
// Este archivo solo tiene funciones puras (sin red ni imágenes) para poder probarlas de forma aislada.
// Quien lo usa: api/portal-meta.js (etiquetas) y api/og.js (imagen).

export const SITE_URL = 'https://brandbara.com';

// Mismas reglas que al crear un enlace en la web (letras minúsculas, números y guiones).
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
export const isValidSlug = (slug) => typeof slug === 'string' && SLUG_RE.test(slug);

// ---------------------------------------------------------------------------------------------------------
// Textos
// ---------------------------------------------------------------------------------------------------------

// Nombre listo para mostrar: sin caracteres de control, espacios colapsados y con tope de longitud.
export const cleanName = (value, max = 60) => {
  const text = String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(text).slice(0, max).join('').trim();
};

// Lo que la tipografía incrustada sabe dibujar (latino, latino extendido y puntuación habitual).
// Lo demás (emojis, escrituras no latinas) se omite SOLO en la imagen: así el generador nunca intenta
// descargar emojis de un tercero y no salen cuadraditos. Las etiquetas de texto conservan el nombre completo.
export const drawableName = (value) =>
  cleanName(value).replace(/[^\u0020-\u007e\u00a0-\u024f\u1e00-\u1eff\u2010-\u2027\u20ac]/gu, '').replace(/\s+/g, ' ').trim();

export const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const TEXTS = {
  ES: {
    title: (name) => `${name} · Brand Portal`,
    description: (name) => `Guía de marca de ${name}: identidad visual, colores y recursos. Creado con BrandBara.`,
    lockedDescription: () => 'Portal de marca protegido con contraseña. Creado con BrandBara.',
    alt: (name) => `Portal de marca de ${name}`,
    open: (name) => `Abrir el portal de ${name}`,
    locale: 'es_ES',
  },
  EN: {
    title: (name) => `${name} · Brand Portal`,
    description: (name) => `${name} brand guidelines: visual identity, colors and assets. Made with BrandBara.`,
    lockedDescription: () => 'Password-protected brand portal. Made with BrandBara.',
    alt: (name) => `${name} brand portal`,
    open: (name) => `Open the ${name} portal`,
    locale: 'en_US',
  },
};
export const textsFor = (lang) => TEXTS[String(lang || '').toUpperCase() === 'EN' ? 'EN' : 'ES'];

// ---------------------------------------------------------------------------------------------------------
// Datos del portal (lo que devuelve get_portal_secure sin contraseña)
// ---------------------------------------------------------------------------------------------------------

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
export const normalizeHex = (value) => {
  if (typeof value !== 'string' || !HEX_RE.test(value.trim())) return null;
  let hex = value.trim().toLowerCase();
  if (hex.length === 4) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  return hex;
};

// Luminosidad aproximada (0 = negro, 1 = blanco) para elegir texto claro u oscuro sobre un color.
export const luminance = (hex) => {
  const n = normalizeHex(hex);
  if (!n) return 0;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Solo se leen imágenes que están en NUESTRO almacenamiento público de portales: así la tarjeta no puede usarse
// para que nuestro servidor descargue direcciones arbitrarias ni para avisar a terceros de quién comparte qué.
export const storagePrefix = (supabaseUrl) => {
  try {
    const u = new URL(supabaseUrl);
    if (u.protocol !== 'https:') return null;
    return `${u.origin}/storage/v1/object/public/portals_assets/`;
  } catch {
    return null;
  }
};

export const ownImageUrl = (value, supabaseUrl) => {
  const prefix = storagePrefix(supabaseUrl);
  if (!prefix || typeof value !== 'string' || value.length > 600) return null;
  let u;
  try { u = new URL(value); } catch { return null; }
  if (u.username || u.password || u.hash || !u.href.startsWith(prefix)) return null;
  // Sin recorridos de carpetas ni barras/puntos codificados (se mira también el texto original, que la URL normaliza).
  if (/\.\.|%2e|%2f|%5c|\\/i.test(value)) return null;
  return u.href;
};

const findItem = (items, type) => (Array.isArray(items) ? items.find((i) => i && i.type === type) : null)?.content || null;

// Convierte la respuesta de get_portal_secure en lo mínimo que hace falta para la vista previa.
//   · null / ausente              -> { kind: 'none' }   (se usa la tarjeta genérica de BrandBara)
//   · portal con contraseña       -> { kind: 'locked', name }  (solo el nombre, que ya se ve en su pantalla de acceso)
//   · portal público              -> { kind: 'ok', name, lang, hero, logo, accent }
export const extractPreview = (rpc, supabaseUrl) => {
  if (!rpc || typeof rpc !== 'object') return { kind: 'none' };
  if (rpc.status === 'locked') {
    const name = cleanName(rpc.brand_name);
    return name ? { kind: 'locked', name } : { kind: 'none' };
  }
  if (rpc.status !== 'success') return { kind: 'none' };
  const canvas = rpc.canvas_data && typeof rpc.canvas_data === 'object' ? rpc.canvas_data : {};
  const name = cleanName(rpc.brand_name) || cleanName(canvas.profile?.name);
  if (!name) return { kind: 'none' };

  const header = findItem(canvas.items, 'header');
  const hero = findItem(canvas.items, 'hero');
  const colors = findItem(canvas.items, 'color')?.colors;

  const heroImage = hero?.bgType === 'image' ? ownImageUrl(hero.bgValue, supabaseUrl) : null;
  const heroColor = hero?.bgType === 'color' ? normalizeHex(hero.bgValue) : null;
  const accent = normalizeHex(Array.isArray(colors) ? colors[0]?.hex : null);

  return {
    kind: 'ok',
    name,
    lang: String(canvas.profile?.language || '').toUpperCase() === 'EN' ? 'EN' : 'ES',
    hero: heroImage,
    logo: ownImageUrl(header?.logo, supabaseUrl),
    background: heroColor || accent || null,
    accent: accent || heroColor || null,
  };
};

// Huella corta y estable de lo que se ve en la tarjeta. Va en la dirección de la imagen para que, si el dueño
// cambia su logo o su nombre, las plataformas vean una dirección nueva y no sigan enseñando la imagen antigua.
export const previewVersion = (p) => {
  const text = [p.kind, p.name, p.lang, p.hero, p.logo, p.background, p.accent].join('|');
  let h = 2166136261;
  for (const ch of text) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36);
};

// ---------------------------------------------------------------------------------------------------------
// Imágenes
// ---------------------------------------------------------------------------------------------------------

// Solo PNG y JPEG (comprobando los primeros bytes, no el tipo que diga el servidor). Devuelve { type, width, height } o null.
export const sniffImage = (bytes) => {
  if (!bytes || bytes.length < 24) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  if (isPng) {
    const width = view.getUint32(16);
    const height = view.getUint32(20);
    return width > 0 && height > 0 && width <= 20000 && height <= 20000 ? { type: 'image/png', width, height } : null;
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) { i += 1; continue; }
      const marker = bytes[i + 1];
      if (marker === 0xff) { i += 1; continue; }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
      const length = view.getUint16(i + 2);
      const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isFrame) {
        const height = view.getUint16(i + 5);
        const width = view.getUint16(i + 7);
        return width > 0 && height > 0 ? { type: 'image/jpeg', width, height } : null;
      }
      if (length < 2) return null;
      i += 2 + length;
    }
  }
  return null;
};

// Tamaño que cabe dentro de un recuadro conservando la proporción.
export const fitInside = (width, height, maxWidth, maxHeight) => {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
};

export const toDataUri = (bytes, type) => {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  return `data:${type};base64,${btoa(binary)}`;
};

// ---------------------------------------------------------------------------------------------------------
// HTML con las etiquetas
// ---------------------------------------------------------------------------------------------------------

// Etiquetas genéricas de BrandBara: tienen que ser IGUALES a las de index.html (lo comprueba una prueba automática).
export const GENERIC = {
  title: 'BrandBara | Crea tu Brand Portal Gratis en Minutos',
  description: 'Centraliza el ADN de tu marca. Crea un manual de identidad visual interactivo, sube tus logos y tipografías, y compártelo con tus clientes y equipo. Empieza gratis.',
  ogTitle: 'BrandBara | El Brand Portal de tu Marca',
  ogDescription: 'Centraliza tu identidad visual interactiva y compártela en minutos. Cero PDFs, 100% en la nube.',
  ogUrl: SITE_URL,
  ogImage: `${SITE_URL}/og-image.png`,
  themeColor: '#0f111a',
};

const meta = (attr, key, value) => `    <meta ${attr}="${key}" content="${escapeHtml(value)}">`;

// preview = resultado de extractPreview; origin = https://brandbara.com (o la dirección de la versión de prueba).
export const buildMetaHtml = ({ slug, preview: requested, origin }) => {
  // Con una dirección no válida nunca se personaliza nada: se devuelven las etiquetas genéricas.
  const preview = isValidSlug(slug) ? requested : { kind: 'none' };
  const safeOrigin = /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(origin || '') ? origin : SITE_URL;
  const pageUrl = isValidSlug(slug) ? `${safeOrigin}/${slug}` : safeOrigin;

  let head;
  if (preview.kind === 'ok' || preview.kind === 'locked') {
    const t = textsFor(preview.lang);
    const title = t.title(preview.name);
    const description = preview.kind === 'locked' ? t.lockedDescription() : t.description(preview.name);
    const image = `${safeOrigin}/api/og?slug=${slug}&v=${previewVersion(preview)}`;
    head = [
      `    <title>${escapeHtml(title)}</title>`,
      meta('name', 'description', description),
      meta('property', 'og:site_name', 'BrandBara'),
      meta('property', 'og:type', 'website'),
      meta('property', 'og:locale', t.locale),
      meta('property', 'og:title', title),
      meta('property', 'og:description', description),
      meta('property', 'og:url', pageUrl),
      meta('property', 'og:image', image),
      meta('property', 'og:image:type', 'image/png'),
      meta('property', 'og:image:width', '1200'),
      meta('property', 'og:image:height', '630'),
      meta('property', 'og:image:alt', t.alt(preview.name)),
      meta('name', 'twitter:card', 'summary_large_image'),
      meta('name', 'twitter:title', title),
      meta('name', 'twitter:description', description),
      meta('name', 'twitter:image', image),
    ].join('\n');
  } else {
    head = [
      `    <title>${escapeHtml(GENERIC.title)}</title>`,
      meta('name', 'description', GENERIC.description),
      meta('property', 'og:title', GENERIC.ogTitle),
      meta('property', 'og:description', GENERIC.ogDescription),
      meta('property', 'og:type', 'website'),
      meta('property', 'og:url', GENERIC.ogUrl),
      meta('property', 'og:image', GENERIC.ogImage),
      meta('property', 'og:image:width', '1200'),
      meta('property', 'og:image:height', '630'),
      meta('name', 'twitter:card', 'summary_large_image'),
      meta('name', 'twitter:image', GENERIC.ogImage),
    ].join('\n');
  }

  const t = textsFor(preview.lang);
  const link = preview.kind === 'none'
    ? `<a href="${escapeHtml(safeOrigin)}">BrandBara</a>`
    : `<a href="${escapeHtml(pageUrl)}">${escapeHtml(t.open(preview.name))}</a>`;

  return `<!DOCTYPE html>
<html lang="${preview.lang === 'EN' ? 'en' : 'es'}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
${head}
    <meta name="theme-color" content="${GENERIC.themeColor}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  </head>
  <body>
    <p>${link}</p>
  </body>
</html>
`;
};

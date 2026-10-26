// ==========================================
// ENLACES Y VÍDEOS SEGUROS
// Los enlaces los escribe el dueño del portal y los pulsan sus visitantes. Un enlace "javascript:..." (o un
// iframe con esa dirección) ejecutaría código en brandbara.com con la sesión del visitante, así que solo se
// aceptan esquemas conocidos. Además, si alguien pega "drive.google.com/..." sin "https://", se completa
// (antes el enlace apuntaba a una página inexistente dentro de brandbara.com).
// ==========================================

const LINK_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];
const MEDIA_PROTOCOLS = ['http:', 'https:'];

const parseUrl = (raw, protocols) => {
  const value = String(raw ?? '').trim();
  if (!value) return null;
  // Los navegadores ignoran espacios y saltos de línea dentro del esquema ("java\nscript:"): se comprueba igual
  // eslint-disable-next-line no-control-regex
  const compact = value.replace(/[\u0000- \u007f-\u009f]/g, '');
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(compact);
  try {
    if (hasScheme) {
      const url = new URL(value);
      return protocols.includes(url.protocol) ? url : null;
    }
    // Sin esquema: "www.web.com/pagina" o "drive.google.com/x" → https://
    const url = new URL('https://' + value.replace(/^\/+/, ''));
    return url.hostname.includes('.') ? url : null;
  } catch {
    return null;
  }
};

// Dirección para un <a href>. Si no es válida devuelve '#' (el botón queda inactivo)
export const toSafeHref = (raw) => parseUrl(raw, LINK_PROTOCOLS)?.href || '#';

// Evita que un botón sin enlace abra una pestaña nueva con la propia página
export const blockEmptyLink = (raw) => (event) => {
  if (toSafeHref(raw) === '#') event.preventDefault();
};

// Dirección http(s) para imágenes/vídeos pegados por el usuario; null si no es válida
export const toSafeMediaUrl = (raw) => parseUrl(raw, MEDIA_PROTOCOLS)?.href || null;

// ¿Es un origen que un <img> o <video> puede cargar? (archivos locales recién subidos o enlaces http/https)
export const isSafeMediaSrc = (raw) => /^(blob:|data:(image|video)\/|https?:)/i.test(String(raw ?? '').trim());

// Solo YouTube y Vimeo se pueden incrustar. Devuelve la dirección de incrustación o null.
export const getVideoEmbedUrl = (raw) => {
  const href = toSafeMediaUrl(raw);
  if (!href) return null;
  const url = new URL(href);
  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '');
  const isId = (id) => /^[\w-]{11}$/.test(id || '');

  if (host === 'youtu.be') {
    const id = url.pathname.split('/')[1];
    return isId(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const fromPath = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/);
    const id = url.pathname === '/watch' ? url.searchParams.get('v') : fromPath?.[1];
    return isId(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const match = url.pathname.match(/^\/(?:video\/)?(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}?dnt=1` : null;
  }
  return null;
};

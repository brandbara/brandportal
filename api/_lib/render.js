// Dibuja la tarjeta como PNG. Es la única parte que usa el generador de imágenes (@vercel/og: satori + resvg).
import { ImageResponse } from '@vercel/og';
import { buildCard, CARD_HEIGHT, CARD_WIDTH } from './card.js';
import { INTER_700_LATIN, INTER_700_LATIN_EXT } from './fontData.js';

// Cinturón de seguridad: la librería de imágenes, si le falta una letra o un emoji, intenta bajarlo de Google Fonts o de
// jsDelivr (terceros que verían la dirección de nuestro servidor). Nuestros textos se limpian antes para que no ocurra,
// y aquí se corta además cualquier intento de contactar con esos servidores.
const BLOCKED_HOSTS = /(^|\.)(googleapis\.com|gstatic\.com|jsdelivr\.net)$/i;
export const isBlockedHost = (input) => {
  try {
    const raw = typeof input === 'string' ? input : (input && input.url) || String(input);
    return BLOCKED_HOSTS.test(new URL(raw, 'http://localhost').hostname);
  } catch {
    return false;
  }
};
export const installThirdPartyGuard = () => {
  if (globalThis.fetch.__brandbaraGuard) return;
  const real = globalThis.fetch;
  const guarded = function (input, init) {
    if (isBlockedHost(input)) return Promise.reject(new Error('Conexión con un tercero bloqueada: ' + String(input).slice(0, 80)));
    return real.call(this, input, init);
  };
  guarded.__brandbaraGuard = true;
  try { globalThis.fetch = guarded; } catch { /* entorno con fetch de solo lectura: queda la limpieza de textos */ }
};

const decode = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
let fonts = null;
const getFonts = () => {
  // Misma tipografía con dos subconjuntos: el generador solo mira el segundo (InterExt) si falta una letra en el primero
  // (ł, ő, ź...). Con el mismo nombre las dos tipografías no se combinan, por eso tienen nombres distintos.
  fonts ||= [
    { name: 'Inter', data: decode(INTER_700_LATIN), weight: 700, style: 'normal' },
    { name: 'InterExt', data: decode(INTER_700_LATIN_EXT), weight: 700, style: 'normal' },
  ];
  return fonts;
};

// Devuelve los bytes del PNG. Se dibuja entero ANTES de responder para poder capturar un fallo
// (por ejemplo una imagen corrupta) y reintentar sin imágenes en vez de enviar una respuesta rota.
export const renderCardPng = async (preview, images) => {
  installThirdPartyGuard();
  const draw = async (imgs) => {
    const res = new ImageResponse(buildCard(preview, imgs), {
      width: CARD_WIDTH, height: CARD_HEIGHT, fonts: getFonts(),
    });
    return new Uint8Array(await res.arrayBuffer());
  };
  try {
    return { png: await draw(images), degraded: false };
  } catch (error) {
    console.error('og: fallo al dibujar con imágenes, se reintenta sin ellas:', error && error.message);
    try {
      return { png: await draw({}), degraded: true };
    } catch (second) {
      second.firstError = error && (error.stack || error.message);
      throw second;
    }
  }
};

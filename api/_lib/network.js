// Parte con red de la vista previa de portales (Supabase). Va separada de preview.js para poder probar aquella sin red.
import { extractPreview, ownImageUrl, sniffImage } from './preview.js';

const PORTAL_TIMEOUT_MS = 4000;
const IMAGE_TIMEOUT_MS = 4000;
const MAX_PORTAL_BYTES = 8 * 1024 * 1024;   // respuesta de get_portal_secure (el lienzo completo del portal)
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const withTimeout = (ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
};

// Lee un cuerpo con tope de tamaño (sin fiarse de Content-Length, que puede faltar o mentir).
const readLimited = async (res, limit) => {
  const declared = Number(res.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > limit) return null;
  if (!res.body) {
    const buf = new Uint8Array(await res.arrayBuffer());
    return buf.length <= limit ? buf : null;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > limit) { try { await reader.cancel(); } catch { /* noop */ } return null; }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.length; }
  return out;
};

// Pregunta a Supabase por el portal SIN contraseña (igual que un visitante anónimo; un intento sin contraseña
// no cuenta como fallo en el límite de intentos). Devuelve el resultado de extractPreview.
// Cualquier error (red, tiempo, formato) devuelve { kind: 'none' }: la vista previa nunca rompe, cae a la genérica.
export const fetchPortalPreview = async (slug, { supabaseUrl, anonKey }, { fetchImpl = fetch, timeoutMs = PORTAL_TIMEOUT_MS } = {}) => {
  if (!supabaseUrl || !anonKey) return { kind: 'none' };
  const t = withTimeout(timeoutMs);
  try {
    const res = await fetchImpl(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/rpc/get_portal_secure`, {
      method: 'POST',
      headers: { apikey: anonKey, authorization: `Bearer ${anonKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ p_slug: slug, p_password: null }),
      signal: t.signal,
    });
    if (!res.ok) return { kind: 'none' };
    const bytes = await readLimited(res, MAX_PORTAL_BYTES);
    if (!bytes) return { kind: 'none' };
    return extractPreview(JSON.parse(new TextDecoder().decode(bytes)), supabaseUrl);
  } catch {
    return { kind: 'none' };
  } finally {
    t.done();
  }
};

// Descarga una imagen de NUESTRO almacenamiento (nada de otras direcciones, ni redirecciones) y la valida.
// Devuelve { bytes, type, width, height } o null.
export const fetchOwnImage = async (url, supabaseUrl, { fetchImpl = fetch, timeoutMs = IMAGE_TIMEOUT_MS } = {}) => {
  const safe = ownImageUrl(url, supabaseUrl);
  if (!safe) return null;
  const t = withTimeout(timeoutMs);
  try {
    const res = await fetchImpl(safe, { redirect: 'manual', signal: t.signal, headers: { accept: 'image/png,image/jpeg' } });
    if (!res.ok) return null;
    const bytes = await readLimited(res, MAX_IMAGE_BYTES);
    if (!bytes) return null;
    const info = sniffImage(bytes);
    return info ? { bytes, ...info } : null;
  } catch {
    return null;
  } finally {
    t.done();
  }
};

export const readEnv = (env) => ({
  supabaseUrl: env.VITE_SUPABASE_URL || env.SUPABASE_URL || '',
  anonKey: env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '',
});

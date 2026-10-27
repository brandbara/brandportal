// Acceso al almacenamiento local del navegador (localStorage) que NUNCA lanza excepciones.
//
// Por qué existe: localStorage puede fallar sin que el usuario haya hecho nada raro:
//  · está bloqueado (navegador con cookies/almacenamiento desactivado, algunos modos privados, iframes);
//  · está lleno (QuotaExceededError, p. ej. un borrador con imágenes grandes);
//  · el valor guardado está corrupto o no es JSON.
// Si una de esas llamadas lanza dentro de un guardado o un cierre de sesión, el resto de la función no se ejecuta:
// el portal no llega a subirse al servidor o la sesión no se cierra en pantalla. Con estas funciones el fallo
// del almacenamiento es solo eso (no se guarda el borrador local) y todo lo demás sigue funcionando.

// Clave del borrador local. La usa también ErrorBoundary.jsx (que se mantiene sin dependencias a propósito).
export const DRAFT_KEY = 'brandPortalData';

// Devuelve el almacenamiento o null. Solo acceder a `window.localStorage` ya puede lanzar un error de seguridad.
function resolve(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function safeGet(key, storage) {
  try {
    const s = resolve(storage);
    return s ? s.getItem(key) : null;
  } catch {
    return null;
  }
}

// true si se ha guardado; false si no se ha podido (bloqueado o lleno). Nunca lanza.
export function safeSet(key, value, storage) {
  try {
    const s = resolve(storage);
    if (!s) return false;
    s.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key, storage) {
  try {
    const s = resolve(storage);
    if (!s) return false;
    s.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// Lee un JSON. Si no existe, está corrupto o el almacenamiento falla, devuelve `fallback`.
export function safeGetJSON(key, fallback = null, storage) {
  const raw = safeGet(key, storage);
  if (raw === null || raw === undefined || raw === '') return fallback;
  try {
    const value = JSON.parse(raw);
    return value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
}

export function safeSetJSON(key, value, storage) {
  let text;
  try {
    text = JSON.stringify(value);
  } catch {
    return false;
  }
  if (typeof text !== 'string') return false;
  return safeSet(key, text, storage);
}

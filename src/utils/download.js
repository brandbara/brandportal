// ==========================================
// DESCARGA DE ARCHIVOS (logotipos, mockups…)
// Objetivo: que el botón "Descargar" SIEMPRE guarde un archivo con nombre y extensión correctos
// (p. ej. "Logo_Principal_logo.svg") y NUNCA abra la imagen en una pestaña nueva.
//
// Por qué no basta con <a download>: el navegador lo ignora cuando el archivo está en otro dominio
// (Supabase Storage) y guarda el nombre aleatorio de la nube, p. ej. "phsxv4m1nn7.svg+xml".
//
// Estrategia:
//  1) Se descarga el contenido con fetch y se guarda desde la memoria con el nombre limpio.
//     Para archivos de Supabase se añade "?download=nombre.ext": es otra dirección distinta de la que
//     usa la <img> (evita una copia en caché sin permisos CORS) y además hace que Supabase responda
//     con "Content-Disposition: attachment".
//  2) Si fetch falla (red/CORS), se pide el mismo enlace "?download=" en un iframe oculto: el navegador
//     lo guarda como descarga sin salir de la página ni abrir pestañas.
//  3) Si todo falla se avisa con un mensaje; nunca se abre la imagen en grande.
// ==========================================

export const MIME_EXTENSIONS = {
  'image/svg+xml': 'svg', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp',
  'image/gif': 'gif', 'image/avif': 'avif', 'image/bmp': 'bmp', 'video/mp4': 'mp4', 'video/webm': 'webm',
};

// Extensiones que pueden aparecer al final de la dirección (las subidas antiguas acaban en ".svg+xml")
const URL_EXTENSIONS = {
  'svg': 'svg', 'svg+xml': 'svg', 'png': 'png', 'jpg': 'jpg', 'jpeg': 'jpg', 'webp': 'webp',
  'gif': 'gif', 'avif': 'avif', 'bmp': 'bmp', 'mp4': 'mp4', 'webm': 'webm',
};

const STORAGE_PATH = '/storage/v1/object/public/';

export const safeFileName = (name) =>
  String(name || 'archivo').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'archivo';

export const extensionFromUrl = (src) => {
  try {
    const path = new URL(src, window.location.href).pathname;
    const last = decodeURIComponent(path.split('/').pop() || '');
    const match = last.match(/\.([A-Za-z0-9+]+)$/);
    return match ? (URL_EXTENSIONS[match[1].toLowerCase()] || null) : null;
  } catch {
    return null;
  }
};

// ¿Es un archivo público de Supabase Storage? (admite el parámetro ?download=)
export const isStorageUrl = (src) => {
  try {
    const url = new URL(src, window.location.href);
    return /^https?:$/.test(url.protocol) && url.pathname.includes(STORAGE_PATH);
  } catch {
    return false;
  }
};

export const withDownloadParam = (src, fileName) => {
  const url = new URL(src, window.location.href);
  url.searchParams.set('download', fileName);
  return url.toString();
};

const saveBlob = (blob, fileName) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
};

// En Chrome/Edge una descarga correcta nunca dispara el evento "load" del iframe; si salta, la dirección
// mostró una página, una imagen o un error y no se descargó nada. En otros navegadores no hay forma fiable de saberlo.
const canDetectFrameFailure = () =>
  typeof navigator !== 'undefined' && !!navigator.userAgentData?.brands?.some((b) => /Chromium/i.test(b.brand));

const downloadWithHiddenFrame = (url, onFailed) => {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;';
  if (onFailed && canDetectFrameFailure()) frame.addEventListener('load', onFailed, { once: true });
  frame.src = url;
  document.body.appendChild(frame);
  setTimeout(() => frame.remove(), 60000);
};

// Muestra un aviso en la esquina (lo recoge el componente principal, que es quien dibuja los avisos)
const notifyError = (message) => {
  if (message) window.dispatchEvent(new CustomEvent('brandbara:toast', { detail: message }));
};

/**
 * Descarga `src` como archivo y devuelve true si se inició la descarga.
 * @param {string} src       blob:, data: o dirección http(s) del archivo
 * @param {string} baseName  nombre sin extensión (se limpia de tildes y símbolos)
 * @param {{errorMessage?: string}} [options] errorMessage: texto del aviso si falla
 */
export const downloadFile = async (src, baseName, options = {}) => {
  if (!src) return false;
  const base = safeFileName(baseName);
  const storage = isStorageUrl(src);
  const urlExtension = extensionFromUrl(src);
  const requestedName = `${base}.${urlExtension || 'png'}`;
  const requestUrl = storage ? withDownloadParam(src, requestedName) : src;

  // 1) Descarga directa: fetch + guardado desde memoria
  let response = null;
  try {
    response = await fetch(requestUrl, { credentials: 'omit' });
  } catch (err) {
    console.error('Descarga directa no disponible (red o permisos CORS):', err);
  }

  if (response) {
    if (!response.ok) {
      // El archivo ya no existe o no es accesible (p. ej. borrado de la nube): no tiene sentido reintentar
      console.error('Descarga fallida: HTTP ' + response.status);
      notifyError(options.errorMessage);
      return false;
    }
    try {
      const blob = await response.blob();
      const mime = (blob.type || '').split(';')[0].trim().toLowerCase();
      const extension = MIME_EXTENSIONS[mime] || urlExtension || 'png';
      saveBlob(blob, `${base}.${extension}`);
      return true;
    } catch (err) {
      console.error('No se pudo guardar el archivo:', err);
      notifyError(options.errorMessage);
      return false;
    }
  }

  // 2) Sin respuesta (CORS/red): archivos de Supabase por iframe oculto con "?download="
  if (storage) {
    try {
      downloadWithHiddenFrame(requestUrl, () => notifyError(options.errorMessage));
      return true;
    } catch (err) {
      console.error('Descarga alternativa no disponible:', err);
    }
  }

  // 3) Último recurso: avisar (nunca abrir la imagen en grande)
  notifyError(options.errorMessage);
  return false;
};

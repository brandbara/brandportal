// ==========================================
// INICIO DE SESIÓN SIN CONTRASEÑA (Google + enlace por correo)
// Funciones puras para interpretar errores y la vuelta desde Google, con pruebas en authFlow.test.js.
// ==========================================

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim());

// Clasifica un error de Supabase Auth para mostrar un mensaje claro (las claves están en translations.js → auth.err*).
//   'rate'          → pidió demasiados enlaces seguidos
//   'notAuthorized' → el servidor de correo aún no puede escribir a esa dirección (SMTP propio sin configurar)
//   'email'         → correo no válido
//   'network'       → sin conexión
//   'generic'       → cualquier otro
export const authErrorKind = (error) => {
  if (!error) return null;
  const msg = String(error.message || '').toLowerCase();
  const code = String(error.code || '').toLowerCase();
  const status = Number(error.status) || 0;
  if (status === 429 || code.includes('rate_limit') || msg.includes('rate limit') || msg.includes('security purposes')) return 'rate';
  if (code === 'email_address_not_authorized' || msg.includes('not authorized')) return 'notAuthorized';
  if (code === 'email_address_invalid' || code === 'validation_failed' || msg.includes('invalid email') || msg.includes('is invalid')) return 'email';
  if (msg.includes('failed to fetch') || msg.includes('network') || error.name === 'AuthRetryableFetchError') return 'network';
  return 'generic';
};

// Al volver de Google (o de un enlace caducado) Supabase añade el error a la dirección:
//   /#error=access_denied&error_code=otp_expired&error_description=...   o   /?error=...
// Devuelve { error, code } o null si no hay ninguno. No se devuelve la descripción (texto del proveedor) para no mostrarla tal cual.
export const readAuthRedirectError = (loc) => {
  if (!loc) return null;
  const raw = [String(loc.search || '').replace(/^\?/, ''), String(loc.hash || '').replace(/^#/, '')];
  for (const part of raw) {
    if (!part) continue;
    let params;
    try { params = new URLSearchParams(part); } catch { continue; }
    const error = params.get('error');
    const code = params.get('error_code');
    if (error || code) return { error: error || '', code: code || '' };
  }
  return null;
};

// Dirección sin los parámetros de error, para dejarla limpia tras avisar.
export const stripAuthRedirectError = (loc) => {
  const path = String(loc?.pathname || '/');
  return path || '/';
};

// Mensaje para la vuelta con error: enlace caducado/usado vs. el usuario canceló vs. otro fallo.
export const redirectErrorKind = (info) => {
  if (!info) return null;
  if (info.code === 'otp_expired') return 'expired';
  if (info.error === 'access_denied') return 'cancelled';
  return 'generic';
};

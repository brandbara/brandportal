// ==========================================
// ACCESO A PORTALES CON CONTRASEÑA
// get_portal_secure() frena los intentos repetidos: con 8 contraseñas incorrectas en 10 minutos contesta
// { status: 'locked', rate_limited: true, retry_after: <segundos> } incluso si la contraseña fuera correcta.
// Una web antigua en caché solo ve status 'locked' (y muestra "contraseña incorrecta"); no se rompe.
// ==========================================

// Minutos que hay que esperar (entero, mínimo 1) si el servidor ha limitado los intentos; null si no.
export const rateLimitMinutes = (data) => {
  if (!data || data.rate_limited !== true) return null;
  const seconds = Number(data.retry_after);
  if (!Number.isFinite(seconds) || seconds <= 0) return 1;
  return Math.max(1, Math.ceil(seconds / 60));
};

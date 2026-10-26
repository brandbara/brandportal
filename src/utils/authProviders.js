// ==========================================
// ¿QUÉ FORMAS DE ENTRAR ESTÁN ACTIVAS EN SUPABASE?
// Supabase publica en /auth/v1/settings qué proveedores están activados. Así el botón «Continuar con Google» solo se
// muestra cuando Google está de verdad configurado (si no, el botón llevaría a una página de error de Supabase).
// Falla en abierto: si no se puede saber (sin red, formato inesperado) devuelve null y el botón se muestra.
// ==========================================

export const fetchAuthProviders = async ({ url, anonKey, fetchFn = globalThis.fetch }) => {
  try {
    if (!url || !anonKey || typeof fetchFn !== 'function') return null;
    const res = await fetchFn(`${String(url).replace(/\/+$/, '')}/auth/v1/settings`, { headers: { apikey: anonKey } });
    if (!res.ok) return null;
    const data = await res.json();
    const ext = data && data.external;
    if (!ext || typeof ext !== 'object') return null;
    return { google: ext.google === true, email: ext.email !== false };
  } catch {
    return null;
  }
};

// Solo se oculta cuando se sabe seguro que Google está desactivado.
export const shouldShowGoogle = (providers) => providers?.google !== false;

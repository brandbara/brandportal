// ==========================================
// BETA CON PLAZAS LIMITADAS Y COLA DE ESPERA
// El servidor (Supabase) es quien decide y quien impide de verdad crear portales o subir archivos sin plaza.
// Estas funciones solo preguntan el estado para poder mostrarlo. "Fallan en abierto": si no hay red, o si la
// función aún no existe en el servidor, devuelven null y la web NO bloquea a nadie por un fallo técnico.
// ==========================================

// Estado público: { capacity, active, remaining, waiting, notify_by_email } (sin iniciar sesión)
export const fetchBetaStatus = async (supabase) => {
  try {
    const { data, error } = await supabase.rpc('beta_status');
    if (error || !data || typeof data !== 'object') return null;
    return data;
  } catch {
    return null;
  }
};

// Al iniciar sesión: crea el perfil si falta (con plaza o en la cola) y devuelve además
// { state: 'active' | 'waitlist' | 'suspended', position }. Es seguro llamarla varias veces.
export const claimBetaSlot = async (supabase) => {
  try {
    const { data, error } = await supabase.rpc('claim_beta_slot');
    if (error || !data || typeof data !== 'object' || !data.state) return null;
    return data;
  } catch {
    return null;
  }
};

// ¿Esta cuenta tiene el acceso bloqueado (en cola o pausada)? Con null (sin información) no se bloquea.
export const isBetaBlocked = (beta) => beta?.state === 'waitlist' || beta?.state === 'suspended';

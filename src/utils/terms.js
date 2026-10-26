// ==========================================
// ACEPTACIÓN DE LOS TÉRMINOS Y LA PRIVACIDAD (registro en el servidor)
// El servidor guarda la versión aceptada con SU hora (tabla terms_acceptances, función accept_terms).
// Aquí solo se pregunta y se envía. "Fallan en abierto" al LEER: si no hay red o la tabla aún no existe,
// devuelven null y la web no bloquea a nadie por un fallo técnico.
// ==========================================

// ¿Ha aceptado esta cuenta la versión indicada? true | false | null (no se ha podido saber)
export const hasAcceptedTerms = async (supabase, version) => {
  try {
    const { data, error } = await supabase
      .from('terms_acceptances')
      .select('version')
      .eq('version', version)
      .limit(1);
    if (error || !Array.isArray(data)) return null;
    return data.length > 0;
  } catch {
    return null;
  }
};

// Registra la aceptación. Devuelve true solo si el servidor la ha guardado (al escribir sí hay que avisar si falla).
export const acceptTerms = async (supabase, version) => {
  try {
    const { data, error } = await supabase.rpc('accept_terms', { p_version: version });
    return !error && Boolean(data) && data.version === version;
  } catch {
    return false;
  }
};

// Solo se pide aceptar cuando se sabe con certeza que falta (con null no se bloquea).
export const needsTermsAcceptance = (accepted) => accepted === false;

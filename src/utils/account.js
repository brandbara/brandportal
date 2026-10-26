// ==========================================
// BORRADO REAL DE CUENTA (derecho de supresión, RGPD)
// Orden importante:
//  1) Se listan y se borran los archivos del usuario por la API de Storage (son públicos: si se quedaran,
//     seguirían visibles en internet y nadie podría borrarlos después).
//  2) Se llama a delete_my_account() en la base de datos, que borra la cuenta y, en cascada, perfil y portal.
//     La función se niega si aún quedan archivos, así nunca quedan huérfanos.
// Si algo falla antes del paso 2, la cuenta sigue existiendo y se puede reintentar.
// ==========================================

const BUCKET = 'portals_assets';
const CHUNK = 100;

export const deleteMyAccount = async (supabase) => {
  const { data: paths, error: listError } = await supabase.rpc('my_asset_paths');
  if (listError) throw listError;

  const files = Array.isArray(paths) ? paths : [];
  for (let i = 0; i < files.length; i += CHUNK) {
    const chunk = files.slice(i, i + CHUNK);
    const { data: removed, error: removeError } = await supabase.storage.from(BUCKET).remove(chunk);
    if (removeError) throw removeError;
    if ((removed || []).length < chunk.length) throw new Error('No se pudieron borrar todos los archivos');
  }

  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
};

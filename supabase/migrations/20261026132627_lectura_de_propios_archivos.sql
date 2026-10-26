-- Cada usuario puede ver (y por tanto borrar) solo los archivos de SU carpeta.
--
-- Por qué: sin una política de lectura en storage.objects, "DELETE ... WHERE name = ..."
-- no encuentra filas y la API de Storage no borra nada (comprobado en producción:
-- el rol authenticated veía 0 de 56 archivos de su propia carpeta). Eso hacía que
-- "Eliminar cuenta" fallase con 'assets_remaining' para quien tuviese archivos.
--
-- No expone archivos de otros usuarios (comprobado: un usuario ajeno ve 0; el dueño ve
-- los suyos) y el cubo ya es público para servir las imágenes por URL.
--
-- Aplicada en producción el 26-oct-2026 (versión 20261026132627).
create policy "Users can read own assets" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'portals_assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

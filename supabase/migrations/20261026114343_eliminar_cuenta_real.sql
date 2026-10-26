-- Borrado real de cuenta (derecho de supresión, RGPD).
-- Ya aplicada en el proyecto de Supabase el 26-oct-2026 (migración "eliminar_cuenta_real").
-- 1) my_asset_paths(): lista los archivos del propio usuario en el bucket para que el cliente los borre por la API de Storage.
-- 2) delete_my_account(): borra al usuario (cascada: profiles -> portals). Exige que ya no queden archivos suyos,
--    para no dejar imágenes públicas huérfanas que nadie podría borrar después.

create or replace function public.my_asset_paths()
returns setof text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select o.name
  from storage.objects o
  where o.bucket_id = 'portals_assets'
    and (storage.foldername(o.name))[1] = (select auth.uid())::text;
$$;

revoke all on function public.my_asset_paths() from public, anon;
grant execute on function public.my_asset_paths() to authenticated;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  if exists (
    select 1 from storage.objects o
    where o.bucket_id = 'portals_assets'
      and (storage.foldername(o.name))[1] = uid::text
  ) then
    raise exception 'assets_remaining' using errcode = 'P0001';
  end if;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

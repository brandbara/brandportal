-- Límite de espacio por cuenta aplicado en el SERVIDOR (antes solo lo controlaba el navegador).
-- Red de seguridad: se rechaza una subida nueva si la cuenta ya ha alcanzado su tope.
-- (El tamaño del archivo que se sube no se conoce al evaluar la política, así que una cuenta
--  puede sobrepasar el tope como mucho en un archivo: el bucket limita cada archivo a 10 MB.)
-- Topes: planes 'pro'/'premium' = 1 GB; cualquier otro (beta_founder, free…) = 20 MB.

create or replace function public.asset_limit_bytes(p_plan text)
returns bigint
language sql
immutable
set search_path = ''
as $$
  select case when lower(coalesce(p_plan, '')) in ('pro', 'premium')
              then 1073741824::bigint
              else 20971520::bigint end
$$;

create or replace function public.can_upload_asset()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_plan text;
  v_used bigint;
begin
  if v_uid is null then
    return false;
  end if;
  select plan into v_plan from public.profiles where id = v_uid;
  select coalesce(sum((o.metadata->>'size')::bigint), 0)
    into v_used
    from storage.objects o
   where o.bucket_id = 'portals_assets'
     and (storage.foldername(o.name))[1] = v_uid::text;
  return v_used < public.asset_limit_bytes(v_plan);
end
$$;

revoke all on function public.can_upload_asset() from public, anon;
grant execute on function public.can_upload_asset() to authenticated;

drop policy "Subida blindada de assets" on storage.objects;
create policy "Subida blindada de assets" on storage.objects
  for insert to public
  with check (
    bucket_id = 'portals_assets'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.can_upload_asset()
  );

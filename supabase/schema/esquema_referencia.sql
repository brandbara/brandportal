-- =====================================================================
-- BrandBara · ESQUEMA DE REFERENCIA de Supabase
-- Proyecto: ioktkbuualxcjsulbefb (eu-west-1) · Reconstruido el 26-oct-2026
--
-- QUÉ ES
--   Una foto de la estructura REAL de la base de datos (esquema public,
--   cubo 'portals_assets' y sus políticas en storage.objects), reconstruida
--   con consultas de solo lectura sobre el proyecto en producción.
--   Sirve para volver a montar BrandBara desde cero si algún día se pierde
--   el proyecto: aplicarlo en un proyecto de Supabase NUEVO y VACÍO.
--
-- QUÉ NO ES
--   · No es una migración: NO se ejecuta sobre producción (fallaría o,
--     peor, duplicaría políticas).
--   · No incluye DATOS (usuarios, portales) ni los ARCHIVOS del cubo: eso
--     lo cubren las copias de seguridad, no este archivo.
--   · No incluye la configuración de Authentication (proveedores, URLs de
--     redirección, plantillas de correo): vive en el panel de Supabase.
--
-- HISTORIAL DE MIGRACIONES REALES (supabase_migrations)
--   20261026110802 seguridad_paso1_perfiles_bucket_slugs
--   20261026111544 seguridad_paso2_portals_cerrado_y_politicas_limpias
--       (el SQL original de estas dos no se conservó; su resultado es lo
--        que describe este archivo)
--   20261026114343 eliminar_cuenta_real          -> supabase/migrations/
--   20261026125630 limite_espacio_en_servidor    -> supabase/migrations/
--   20261026132627 lectura_de_propios_archivos   -> supabase/migrations/
--
-- Si cambias la base de datos, añade una migración en supabase/migrations/
-- Y actualiza este archivo para que siga reflejando el estado real.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Tablas
-- ---------------------------------------------------------------------

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique,
  plan         text        default 'beta_founder',
  storage_used bigint      default 0,
  status       text        default 'active',
  strikes      integer     default 0,
  updated_at   timestamptz default now()
);

create table public.portals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade,
  slug          text not null unique,
  brand_name    text not null,
  canvas_data   jsonb       default '{}'::jsonb,
  is_public     boolean     default true,
  is_protected  boolean     default false,
  password_hash text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  constraint unique_user_portal unique (user_id)   -- un portal por usuario
);


-- ---------------------------------------------------------------------
-- 2. Funciones
--    (definiciones tal cual las devuelve pg_get_functiondef)
-- ---------------------------------------------------------------------

-- Tope de espacio por plan: 20 MB por defecto, 1 GB en pro/premium.
CREATE OR REPLACE FUNCTION public.asset_limit_bytes(p_plan text)
 RETURNS bigint
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select case when lower(coalesce(p_plan, '')) in ('pro', 'premium')
              then 1073741824::bigint
              else 20971520::bigint end
$function$;

-- ¿Puede la cuenta actual subir otro archivo? (la usa la política de subida)
CREATE OR REPLACE FUNCTION public.can_upload_asset()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Elimina la cuenta de quien la llama (solo si ya no le quedan archivos).
CREATE OR REPLACE FUNCTION public.delete_my_account()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

-- Lectura pública de un portal (con comprobación de contraseña).
CREATE OR REPLACE FUNCTION public.get_portal_secure(p_slug text, p_password text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  portal_record record;
begin
  select * into portal_record from public.portals where slug = p_slug;

  if not found then
    return null;
  end if;

  if portal_record.is_protected and (auth.uid() is null or auth.uid() != portal_record.user_id) then
    if portal_record.password_hash is null
       or p_password is null
       or portal_record.password_hash != p_password then
      return json_build_object(
        'status', 'locked',
        'is_protected', true,
        'user_id', portal_record.user_id,
        'brand_name', portal_record.brand_name
      );
    end if;
  end if;

  return json_build_object(
    'status', 'success',
    'id', portal_record.id,
    'user_id', portal_record.user_id,
    'slug', portal_record.slug,
    'brand_name', portal_record.brand_name,
    'canvas_data', portal_record.canvas_data,
    'is_protected', portal_record.is_protected
  );
end;
$function$;

-- Rechaza direcciones reservadas (info, admin, login…).
CREATE OR REPLACE FUNCTION public.guard_portal_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if lower(new.slug) = any (array[
    'info','admin','api','app','blog','hello','login','logout','signin','signup','register','edit',
    'dashboard','billing','pricing','support','help','about','terms','privacy','legal','cookies',
    'settings','account','profile','www','mail','email','static','assets','public','docs','status',
    'null','undefined','es','en','pro','free','home','index','new','404'
  ]) then
    raise exception 'slug_reserved' using errcode = '23514';
  end if;
  return new;
end;
$function$;

-- ¿Está libre esta dirección (slug) para el usuario actual?
CREATE OR REPLACE FUNCTION public.is_slug_available(p_slug text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select not exists (
    select 1 from public.portals
    where slug = p_slug and user_id is distinct from auth.uid()
  );
$function$;

-- Rutas de los archivos del usuario actual (para borrarlos al eliminar la cuenta).
CREATE OR REPLACE FUNCTION public.my_asset_paths()
 RETURNS SETOF text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select o.name
  from storage.objects o
  where o.bucket_id = 'portals_assets'
    and (storage.foldername(o.name))[1] = (select auth.uid())::text;
$function$;


-- ---------------------------------------------------------------------
-- 3. Disparador: direcciones reservadas
-- ---------------------------------------------------------------------

CREATE TRIGGER portals_guard_slug
  BEFORE INSERT OR UPDATE OF slug ON public.portals
  FOR EACH ROW EXECUTE FUNCTION guard_portal_slug();


-- ---------------------------------------------------------------------
-- 4. Seguridad por filas (RLS) y políticas
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.portals  enable row level security;

create policy "Owners manage portals" on public.portals
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners manage profile" on public.profiles
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ---------------------------------------------------------------------
-- 5. Permisos (GRANT / REVOKE)
--    Punto de partida: los permisos por defecto de Supabase en el esquema
--    public (anon, authenticated y service_role reciben todo en las tablas
--    y EXECUTE en las funciones). Aquí se recortan hasta el estado real.
-- ---------------------------------------------------------------------

-- profiles: nadie desde la web puede cambiar plan, storage_used, status ni
-- strikes. Solo se puede crear/tocar la fila propia (id, updated_at).
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, updated_at), update (id, updated_at) on public.profiles to authenticated;

-- portals: se mantienen los permisos por defecto; la protección real es RLS
-- (solo existe política para 'authenticated' y solo sobre la fila propia).

-- Funciones: solo las que necesita la web quedan accesibles.
revoke execute on function public.can_upload_asset()      from public, anon;
revoke execute on function public.delete_my_account()     from public, anon;
revoke execute on function public.get_portal_secure(text, text) from public;
revoke execute on function public.guard_portal_slug()     from public, anon, authenticated;
revoke execute on function public.is_slug_available(text) from public, anon;
revoke execute on function public.my_asset_paths()        from public, anon;
-- asset_limit_bytes(text) conserva los permisos por defecto (inofensiva: solo devuelve un número).

grant execute on function public.can_upload_asset()       to authenticated, service_role;
grant execute on function public.delete_my_account()      to authenticated, service_role;
grant execute on function public.get_portal_secure(text, text) to anon, authenticated, service_role;
grant execute on function public.guard_portal_slug()      to service_role;
grant execute on function public.is_slug_available(text)  to authenticated, service_role;
grant execute on function public.my_asset_paths()         to authenticated, service_role;


-- ---------------------------------------------------------------------
-- 6. Almacenamiento: cubo público 'portals_assets' + políticas
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portals_assets', 'portals_assets', true,
  10485760,                                  -- 10 MB por archivo
  array['image/jpeg','image/png','image/webp','image/gif','image/avif','image/bmp',
        'image/svg+xml','video/mp4','video/webm']
);

-- Subir: solo a tu carpeta (<tu uid>/...) y mientras no superes el tope de tu plan.
create policy "Subida blindada de assets" on storage.objects
  for insert to public
  with check (
    bucket_id = 'portals_assets'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
    and can_upload_asset()
  );

-- Borrar: solo tus propios archivos.
create policy "Users can delete own assets" on storage.objects
  for delete to public
  using (
    bucket_id = 'portals_assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Ver: cada usuario ve solo los archivos de su carpeta. Sin esta política el
-- borrado por la API de Storage no encuentra filas y no borra nada.
-- (Las imágenes se sirven por URL pública sin pasar por aquí: el cubo es público.)
create policy "Users can read own assets" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'portals_assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

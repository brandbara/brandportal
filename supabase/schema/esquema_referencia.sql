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
--   20261026150713 beta_plazas_y_cola            -> supabase/migrations/
--   20261026155048 aceptacion_terminos           -> supabase/migrations/
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
  status       text        not null default 'waitlist',  -- 'active' | 'waitlist' | 'suspended'
  strikes      integer     default 0,
  updated_at   timestamptz default now(),
  waitlist_since timestamptz default now(),   -- hora de llegada a la cola
  activated_at   timestamptz,                  -- cuándo obtuvo plaza
  notified_at    timestamptz,                  -- aviso de plaza enviado (fase 2: email)
  constraint profiles_status_check check (status in ('active', 'waitlist', 'suspended'))
);

-- Ajustes de la aplicación. Nadie los lee ni escribe desde la web (sin permisos para
-- anon/authenticated); solo las funciones de la beta. Se cambian desde el panel de Supabase:
--   update public.app_settings set value = '50' where key = 'beta_capacity';
create table public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
insert into public.app_settings (key, value) values
  ('beta_capacity',   '25'::jsonb),    -- plazas de la beta
  ('notify_by_email', 'false'::jsonb); -- true cuando el aviso por email esté en marcha

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

-- Registro (en el servidor) de qué versión de los Términos y la Privacidad aceptó cada usuario y cuándo.
-- Solo se escribe con accept_terms(); cada usuario solo lee lo suyo; se borra con la cuenta.
create table public.terms_acceptances (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  version     text not null,
  accepted_at timestamptz not null default now(),
  constraint terms_acceptances_version_check check (length(version) <= 20 and version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(\.[0-9]+)?$'),
  constraint terms_acceptances_user_version_key unique (user_id, version)
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

-- ¿Puede la cuenta actual subir otro archivo? Solo con plaza (status 'active') y
-- mientras no supere el tope de su plan. (La usa la política de subida.)
CREATE OR REPLACE FUNCTION public.can_upload_asset()
 returns boolean
 language plpgsql
 stable security definer
 set search_path to ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_plan   text;
  v_status text;
  v_used   bigint;
begin
  if v_uid is null then
    return false;
  end if;
  select plan, status into v_plan, v_status from public.profiles where id = v_uid;
  if v_status is distinct from 'active' then
    return false;
  end if;
  select coalesce(sum((o.metadata->>'size')::bigint), 0)
    into v_used
    from storage.objects o
   where o.bucket_id = 'portals_assets'
     and (storage.foldername(o.name))[1] = v_uid::text;
  return v_used < public.asset_limit_bytes(v_plan);
end
$$;

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


-- Beta con plazas y cola de espera
-- (reglas completas en supabase/migrations/…_beta_plazas_y_cola.sql)

CREATE OR REPLACE FUNCTION public.beta_capacity()
 returns integer
 language sql
 stable security definer
 set search_path to ''
as $$
  select coalesce((select (value #>> '{}')::int from public.app_settings where key = 'beta_capacity'), 0)
$$;

-- Estado público de la beta (para mostrar «quedan N plazas» al registrarse)
CREATE OR REPLACE FUNCTION public.beta_status()
 returns json
 language sql
 stable security definer
 set search_path to ''
as $$
  select json_build_object(
    'capacity',        public.beta_capacity(),
    'active',          (select count(*) from public.profiles where status = 'active'),
    'remaining',       greatest(public.beta_capacity() - (select count(*) from public.profiles where status = 'active'), 0),
    'waiting',         (select count(*) from public.profiles where status = 'waitlist'),
    'notify_by_email', coalesce((select (value #>> '{}')::boolean from public.app_settings where key = 'notify_by_email'), false)
  )
$$;

-- Reparte las plazas libres entre los primeros de la cola. Devuelve cuántos pasan a 'active'.
CREATE OR REPLACE FUNCTION public.promote_waitlist()
 returns integer
 language plpgsql
 security definer
 set search_path to ''
as $$
declare
  v_free integer;
  n      integer;
begin
  perform pg_advisory_xact_lock(hashtext('brandbara_beta_slots'));
  v_free := greatest(public.beta_capacity() - (select count(*) from public.profiles where status = 'active'), 0);
  if v_free = 0 then
    return 0;
  end if;
  with siguientes as (
    select id from public.profiles
     where status = 'waitlist'
     order by waitlist_since nulls last, id
     limit v_free
     for update skip locked
  )
  update public.profiles p
     set status = 'active', activated_at = now(), updated_at = now()
    from siguientes
   where p.id = siguientes.id;
  get diagnostics n = row_count;
  return n;
end
$$;

-- La web la llama al iniciar sesión: crea el perfil si falta (con plaza o en cola) y devuelve el estado.
CREATE OR REPLACE FUNCTION public.claim_beta_slot()
 returns json
 language plpgsql
 security definer
 set search_path to ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_row    public.profiles%rowtype;
  v_active integer;
  v_pos    integer := 0;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtext('brandbara_beta_slots'));

  select * into v_row from public.profiles where id = v_uid;

  if v_row.id is null then
    select count(*) into v_active from public.profiles where status = 'active';
    -- con cola pendiente nadie se cuela: primero los que esperan
    if v_active < public.beta_capacity() and not exists (select 1 from public.profiles where status = 'waitlist') then
      insert into public.profiles (id, email, status, activated_at, updated_at)
        select v_uid, u.email, 'active', now(), now() from auth.users u where u.id = v_uid;
    else
      insert into public.profiles (id, email, status, waitlist_since, updated_at)
        select v_uid, u.email, 'waitlist', now(), now() from auth.users u where u.id = v_uid;
    end if;
  else
    if v_row.status = 'waitlist' and v_row.waitlist_since is null then
      update public.profiles set waitlist_since = now() where id = v_uid;
    end if;
    -- el email se rellena si el perfil se creó sin él (la web no puede escribirlo)
    update public.profiles p set email = u.email
      from auth.users u
     where p.id = v_uid and u.id = v_uid and p.email is null
       and not exists (select 1 from public.profiles q where q.email = u.email);
  end if;

  -- si hay plazas libres y gente esperando (p. ej. se subió el tope), se reparten antes de responder
  perform public.promote_waitlist();

  select * into v_row from public.profiles where id = v_uid;
  if v_row.status = 'waitlist' then
    select count(*) into v_pos from public.profiles p
     where p.status = 'waitlist'
       and (coalesce(p.waitlist_since, 'infinity'::timestamptz), p.id) <= (coalesce(v_row.waitlist_since, 'infinity'::timestamptz), v_row.id);
  end if;

  return (public.beta_status()::jsonb || jsonb_build_object('state', v_row.status, 'position', v_pos, 'activated_at', v_row.activated_at))::json;
end
$$;

-- Al borrarse una cuenta (o cambiar los ajustes) se reparten las plazas que queden libres
CREATE OR REPLACE FUNCTION public.on_slots_may_have_changed()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $$
begin
  perform public.promote_waitlist();
  return null;
end
$$;


-- La web la llama cuando el usuario acepta una versión de los Términos y la Privacidad. Guarda la hora del servidor.
CREATE OR REPLACE FUNCTION public.accept_terms(p_version text)
 returns json
 language plpgsql
 security definer
 set search_path to ''
as $$
declare
  v_uid uuid := auth.uid();
  v_at  timestamptz;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_version is null or length(p_version) > 20 or p_version !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(\.[0-9]+)?$' then
    raise exception 'invalid_version' using errcode = '22023';
  end if;

  -- si ya la había aceptado se conserva la fecha original
  insert into public.terms_acceptances (user_id, version)
    values (v_uid, p_version)
    on conflict (user_id, version) do nothing;

  select accepted_at into v_at from public.terms_acceptances where user_id = v_uid and version = p_version;
  return json_build_object('version', p_version, 'accepted_at', v_at);
end
$$;


-- ---------------------------------------------------------------------
-- 3. Disparadores
-- ---------------------------------------------------------------------

CREATE TRIGGER portals_guard_slug
  BEFORE INSERT OR UPDATE OF slug ON public.portals
  FOR EACH ROW EXECUTE FUNCTION guard_portal_slug();

-- Beta: al borrarse una cuenta, o al cambiar los ajustes (p. ej. subir el tope de
-- plazas), pasan a 'active' los primeros de la cola hasta llenar las plazas libres.
create trigger profiles_promote_after_delete
  after delete on public.profiles
  for each row execute function public.on_slots_may_have_changed();

create trigger app_settings_promote_after_change
  after insert or update on public.app_settings
  for each statement execute function public.on_slots_may_have_changed();


-- ---------------------------------------------------------------------
-- 4. Seguridad por filas (RLS) y políticas
-- ---------------------------------------------------------------------

alter table public.profiles     enable row level security;
alter table public.portals      enable row level security;
alter table public.app_settings enable row level security;   -- sin políticas: solo las funciones la leen
alter table public.terms_acceptances enable row level security;

-- Portales: el dueño los gestiona, y solo crea/modifica si tiene plaza (status 'active').
create policy "Owners manage portals" on public.portals
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.status = 'active')
  );

create policy "Owners manage profile" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Aceptación de Términos: cada usuario solo lee las suyas (escribir: solo con accept_terms()).
create policy "Owners read own acceptances" on public.terms_acceptances
  for select to authenticated
  using ((select auth.uid()) = user_id);


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

-- app_settings: cerrada del todo para la web.
revoke all on public.app_settings from anon, authenticated;

-- terms_acceptances: la web solo puede LEER lo propio (RLS); escribir, solo con accept_terms().
revoke all on public.terms_acceptances from anon, authenticated;
grant select on public.terms_acceptances to authenticated;

-- portals: se mantienen los permisos por defecto; la protección real es RLS
-- (solo existe política para 'authenticated' y solo sobre la fila propia).

-- Funciones: solo las que necesita la web quedan accesibles.
revoke execute on function public.can_upload_asset()      from public, anon;
revoke execute on function public.delete_my_account()     from public, anon;
revoke execute on function public.get_portal_secure(text, text) from public;
revoke execute on function public.guard_portal_slug()     from public, anon, authenticated;
revoke execute on function public.is_slug_available(text) from public, anon;
revoke execute on function public.my_asset_paths()        from public, anon;
revoke execute on function public.beta_capacity()              from public, anon, authenticated;
revoke execute on function public.promote_waitlist()           from public, anon, authenticated;
revoke execute on function public.on_slots_may_have_changed()  from public, anon, authenticated;
revoke execute on function public.claim_beta_slot()            from public, anon;
revoke execute on function public.beta_status()                from public;
revoke execute on function public.accept_terms(text)           from public, anon;
-- asset_limit_bytes(text) conserva los permisos por defecto (inofensiva: solo devuelve un número).

grant execute on function public.can_upload_asset()       to authenticated, service_role;
grant execute on function public.delete_my_account()      to authenticated, service_role;
grant execute on function public.get_portal_secure(text, text) to anon, authenticated, service_role;
grant execute on function public.guard_portal_slug()      to service_role;
grant execute on function public.is_slug_available(text)  to authenticated, service_role;
grant execute on function public.my_asset_paths()         to authenticated, service_role;
grant execute on function public.claim_beta_slot()        to authenticated, service_role;   -- la web la llama al iniciar sesión
grant execute on function public.beta_status()            to anon, authenticated, service_role;  -- «quedan N plazas»
grant execute on function public.accept_terms(text)       to authenticated, service_role;        -- la web la llama al aceptar los Términos


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

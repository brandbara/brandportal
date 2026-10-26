-- Beta con plazas limitadas y cola de espera por plazas (no por tiempo).
--
-- Reglas:
--   · Hay un tope de plazas (app_settings.beta_capacity). Una plaza = una cuenta con status 'active'.
--   · Quien se registra con plazas libres entra directamente; si no hay, se registra igual pero queda
--     en la cola (status 'waitlist') y NO puede crear portal ni subir archivos (lo impide el servidor).
--   · La cola es por orden de llegada. Cuando se libera una plaza (se borra una cuenta) o se sube el tope,
--     pasa a 'active' el primero de la cola (promote_waitlist), automáticamente.
--   · Nadie puede activarse a sí mismo: la columna status no es escribible desde la web y el valor por
--     defecto de una fila nueva es 'waitlist'.
--
-- Despliegue: aplicar DESPUÉS de que la web nueva esté publicada. La web nueva tolera que esta migración
-- aún no exista (si la función no existe, no bloquea a nadie).

-- 1) Ajustes de la aplicación (nadie los lee ni escribe desde la web; solo las funciones de abajo)
create table public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;

insert into public.app_settings (key, value) values
  ('beta_capacity',   '25'::jsonb),   -- plazas de la beta (subir a 50 cuando convenga)
  ('notify_by_email', 'false'::jsonb); -- true cuando el aviso por email esté en marcha

-- 2) Perfiles: estado de la cuenta y datos de la cola
alter table public.profiles
  add column waitlist_since timestamptz,
  add column activated_at   timestamptz,
  add column notified_at    timestamptz;

update public.profiles set activated_at = coalesce(activated_at, updated_at, now()) where status = 'active';

-- Una fila nueva entra en la cola (con su hora de llegada) salvo que claim_beta_slot() le dé plaza.
alter table public.profiles alter column waitlist_since set default now();
alter table public.profiles alter column status set default 'waitlist';
alter table public.profiles alter column status set not null;
alter table public.profiles add constraint profiles_status_check check (status in ('active', 'waitlist', 'suspended'));

-- 3) Funciones
create function public.beta_capacity()
 returns integer
 language sql
 stable security definer
 set search_path to ''
as $$
  select coalesce((select (value #>> '{}')::int from public.app_settings where key = 'beta_capacity'), 0)
$$;

-- Estado público de la beta (para mostrar «quedan N plazas» al registrarse)
create function public.beta_status()
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
create function public.promote_waitlist()
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
create function public.claim_beta_slot()
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
create function public.on_slots_may_have_changed()
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

create trigger profiles_promote_after_delete
  after delete on public.profiles
  for each row execute function public.on_slots_may_have_changed();

create trigger app_settings_promote_after_change
  after insert or update on public.app_settings
  for each statement execute function public.on_slots_may_have_changed();

-- Permisos: solo beta_status (público) y claim_beta_slot (con sesión) se pueden llamar desde la web
revoke execute on function public.beta_capacity()              from public, anon, authenticated;
revoke execute on function public.promote_waitlist()           from public, anon, authenticated;
revoke execute on function public.on_slots_may_have_changed()  from public, anon, authenticated;
revoke execute on function public.claim_beta_slot()            from public, anon;
revoke execute on function public.beta_status()                from public;
grant  execute on function public.claim_beta_slot()            to authenticated, service_role;
grant  execute on function public.beta_status()                to anon, authenticated, service_role;

-- 4) Solo con plaza se puede crear/modificar un portal y subir archivos
alter policy "Owners manage portals" on public.portals
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.status = 'active')
  );

alter policy "Owners manage profile" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.can_upload_asset()
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

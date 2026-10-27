-- Límite de intentos para las contraseñas de los portales protegidos.
--
-- Por qué: get_portal_secure() la puede llamar cualquiera sin iniciar sesión y compara la contraseña
-- sin ningún freno: se podían probar contraseñas sin límite.
--
-- Cómo funciona:
--   · Cada intento FALLIDO con una contraseña escrita se anota (solo la dirección del portal y la hora;
--     no se guarda ninguna dirección IP ni dato personal).
--   · Con 8 fallos en los últimos 10 minutos en ese portal, durante el resto de la ventana la función
--     contesta "locked" con rate_limited = true y retry_after (segundos), incluso si la contraseña es
--     correcta (si no, el límite no frenaría nada).
--   · Abrir un portal protegido SIN escribir contraseña (p_password nulo) no cuenta como fallo.
--   · El dueño del portal (sesión iniciada) no pasa por nada de esto.
--   · La respuesta sigue siendo status = 'locked' para que la web actual funcione igual (muestra
--     "contraseña incorrecta"); la web nueva usa rate_limited y retry_after para avisar con claridad.
--   · Los fallos de más de 1 hora se borran solos en cada fallo nuevo.
--
-- Contrapartida conocida: alguien podría bloquear a los visitantes de un portal concreto (10 min cada vez)
-- haciendo intentos a propósito. Es preferible a que se puedan probar contraseñas sin freno; el dueño
-- nunca queda bloqueado. Mejora futura: anti-bots (captcha) en este punto.
--
-- Despliegue: tabla nueva + sustitución de una función; la web actual sigue funcionando.

create table public.portal_password_failures (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null,
  failed_at timestamptz not null default now()
);

create index portal_password_failures_slug_at_idx on public.portal_password_failures (slug, failed_at);
create index portal_password_failures_at_idx on public.portal_password_failures (failed_at);

alter table public.portal_password_failures enable row level security;   -- sin políticas: solo la función escribe

revoke all on public.portal_password_failures from anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_portal_secure(p_slug text, p_password text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  portal_record record;
  v_fails int;
  v_oldest timestamptz;
  v_retry int;
  c_max_fails constant int := 8;
  c_window constant interval := interval '10 minutes';
begin
  select * into portal_record from public.portals where slug = p_slug;

  if not found then
    return null;
  end if;

  if portal_record.is_protected and (auth.uid() is null or auth.uid() != portal_record.user_id) then
    -- Demasiados fallos recientes en este portal: se bloquea todo intento hasta que pase la ventana.
    select count(*), min(failed_at) into v_fails, v_oldest
      from public.portal_password_failures
      where slug = p_slug and failed_at > now() - c_window;

    if v_fails >= c_max_fails then
      v_retry := greatest(1, ceil(extract(epoch from (v_oldest + c_window - now())))::int);
      return json_build_object(
        'status', 'locked',
        'is_protected', true,
        'user_id', portal_record.user_id,
        'brand_name', portal_record.brand_name,
        'rate_limited', true,
        'retry_after', v_retry
      );
    end if;

    if portal_record.password_hash is null
       or p_password is null
       or portal_record.password_hash != p_password then
      -- Solo cuenta como fallo un intento con contraseña escrita (abrir el portal sin escribir nada no).
      if p_password is not null then
        insert into public.portal_password_failures (slug) values (p_slug);
        delete from public.portal_password_failures where failed_at < now() - interval '1 hour';
      end if;
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

-- Registro en el servidor de la aceptación de los Términos de uso y la Política de Privacidad.
--
-- Por qué: hasta ahora la versión y la fecha de aceptación solo viajaban en los metadatos del registro
-- (los escribe el navegador), no servían como prueba y no cubrían a las cuentas anteriores ni a quien
-- entra con Google o con enlace por correo (sin formulario de registro).
--
-- Cómo funciona:
--   · Cada vez que alguien acepta una versión de los textos, la web llama a accept_terms('AAAA-MM-DD[.n]').
--     El servidor guarda la fila con SU hora (now()), no la del navegador.
--   · Cada usuario solo puede leer sus propias filas; nadie puede insertar, cambiar ni borrar filas desde
--     la web (solo existe la función). El historial se conserva (una fila por versión aceptada).
--   · Al eliminar la cuenta se borran sus filas (cascada desde auth.users).
--
-- Despliegue: es solo una tabla nueva y una función nueva; la web actual no las usa, así que no rompe nada.

create table public.terms_acceptances (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  version     text not null,
  accepted_at timestamptz not null default now(),
  constraint terms_acceptances_version_check check (length(version) <= 20 and version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(\.[0-9]+)?$'),
  constraint terms_acceptances_user_version_key unique (user_id, version)
);

alter table public.terms_acceptances enable row level security;

create policy "Owners read own acceptances" on public.terms_acceptances
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Solo lectura de lo propio. Escribir: únicamente con accept_terms().
revoke all on public.terms_acceptances from anon, authenticated;
grant select on public.terms_acceptances to authenticated;

create or replace function public.accept_terms(p_version text)
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

revoke execute on function public.accept_terms(text) from public, anon;
grant execute on function public.accept_terms(text) to authenticated, service_role;

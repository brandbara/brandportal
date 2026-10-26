-- Pruebas de seguridad del esquema de referencia.
--
-- Se ejecutan en GitHub (revisión automática "Esquema de Supabase") sobre un Postgres
-- vacío donde antes se han aplicado, por este orden:
--   1) verificacion/supabase_simulado.sql
--   2) esquema_referencia.sql
-- Si cualquier comprobación falla se lanza una excepción y el robot se pone en rojo.
-- Todo ocurre en una sola transacción (un único bloque DO), en una base de datos desechable.

do $$
declare
  a constant uuid := '11111111-1111-1111-1111-111111111111';
  b constant uuid := '22222222-2222-2222-2222-222222222222';
  c constant uuid := '33333333-3333-3333-3333-333333333333';
  d constant uuid := '44444444-4444-4444-4444-444444444444';
  e constant uuid := '55555555-5555-5555-5555-555555555555';
  f constant uuid := '66666666-6666-6666-6666-666666666666';
  n int;
  r boolean;
  txt text;
  j json;
begin
  insert into auth.users (id, email) values
    (a, 'a@prueba.dev'), (b, 'b@prueba.dev'), (c, 'c@prueba.dev'), (d, 'd@prueba.dev'), (e, 'e@prueba.dev'), (f, 'f@prueba.dev');

  -- Beta de prueba con solo 2 plazas (en producción son 25 o 50, configurables)
  update public.app_settings set value = '2'::jsonb where key = 'beta_capacity';

  ------------------------------------------------------------------ Usuario A
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', a::text, true);
  set local role authenticated;

  j := public.claim_beta_slot();
  if j->>'state' <> 'active' then raise exception 'FALLO: A debería entrar con plaza y obtuvo %', j; end if;
  -- la web, además, hace este upsert del perfil propio antes de guardar el portal
  insert into public.profiles (id, updated_at) values (a, now())
    on conflict (id) do update set updated_at = excluded.updated_at;
  insert into public.portals (user_id, slug, brand_name) values (a, 'marca-a', 'Marca A');
  raise notice 'OK · A se registra con plaza libre, y crea su perfil y su portal';

  begin
    update public.profiles set plan = 'pro' where id = a;
    raise exception 'FALLO: un usuario pudo cambiarse el plan';
  exception when insufficient_privilege then
    raise notice 'OK · nadie puede cambiarse el plan desde la web';
  end;

  begin
    update public.profiles set storage_used = 0 where id = a;
    raise exception 'FALLO: un usuario pudo cambiar storage_used';
  exception when insufficient_privilege then
    raise notice 'OK · nadie puede cambiar storage_used desde la web';
  end;

  begin
    insert into public.profiles (id) values (b);
    raise exception 'FALLO: A pudo crear el perfil de B';
  exception when insufficient_privilege then
    raise notice 'OK · A no puede crear el perfil de otro usuario';
  end;

  begin
    update public.portals set slug = 'admin' where user_id = a;
    raise exception 'FALLO: se pudo usar una dirección reservada';
  exception when check_violation then
    raise notice 'OK · direcciones reservadas rechazadas';
  end;

  select public.is_slug_available('marca-a') into r;
  if r is distinct from true then raise exception 'FALLO: A debería poder usar su propia dirección'; end if;
  raise notice 'OK · is_slug_available: la dirección propia está disponible';

  ------------------------------------------------------------------ Usuario B
  reset role;
  perform set_config('request.jwt.claim.sub', b::text, true);
  set local role authenticated;

  j := public.claim_beta_slot();
  if j->>'state' <> 'active' then raise exception 'FALLO: B debería entrar con la 2ª plaza y obtuvo %', j; end if;
  if (j->>'remaining')::int <> 0 then raise exception 'FALLO: tras B no deberían quedar plazas y quedan %', j->>'remaining'; end if;
  select count(*) into n from public.profiles;
  if n <> 1 then raise exception 'FALLO: B debería ver solo su perfil y ve %', n; end if;
  select count(*) into n from public.portals;
  if n <> 0 then raise exception 'FALLO: B ve % portales ajenos', n; end if;
  raise notice 'OK · B (2ª plaza) solo ve su propio perfil y ningún portal de A';

  select public.is_slug_available('marca-a') into r;
  if r is distinct from false then raise exception 'FALLO: la dirección de A debería estar ocupada para B'; end if;
  raise notice 'OK · is_slug_available: la dirección de A está ocupada para B';

  ------------------------------------------------------------------ Visitante (anon)
  reset role;
  perform set_config('request.jwt.claim.role', 'anon', true);
  perform set_config('request.jwt.claim.sub', '', true);
  set local role anon;

  select count(*) into n from public.portals;
  if n <> 0 then raise exception 'FALLO: anon lee % portales directamente', n; end if;
  select count(*) into n from public.profiles;
  if n <> 0 then raise exception 'FALLO: anon lee % perfiles', n; end if;
  raise notice 'OK · un visitante no puede leer las tablas directamente';

  select (public.get_portal_secure('marca-a')::jsonb) ->> 'status' into txt;
  if txt is distinct from 'success' then raise exception 'FALLO: get_portal_secure devolvió %', txt; end if;
  raise notice 'OK · un visitante sí puede abrir un portal público por get_portal_secure';

  begin
    perform public.can_upload_asset();
    raise exception 'FALLO: anon pudo llamar a can_upload_asset';
  exception when insufficient_privilege then
    raise notice 'OK · un visitante no puede llamar a can_upload_asset';
  end;

  begin
    perform public.delete_my_account();
    raise exception 'FALLO: anon pudo llamar a delete_my_account';
  exception when insufficient_privilege then
    raise notice 'OK · un visitante no puede llamar a delete_my_account';
  end;

  begin
    insert into public.portals (user_id, slug, brand_name) values (null, 'zzz', 'x');
    raise exception 'FALLO: anon pudo insertar un portal';
  exception when insufficient_privilege then
    raise notice 'OK · un visitante no puede crear portales';
  end;

  begin
    perform public.accept_terms('2026-10-26');
    raise exception 'FALLO: anon pudo llamar a accept_terms';
  exception when insufficient_privilege then
    raise notice 'OK · un visitante no puede aceptar términos';
  end;

  begin
    perform 1 from public.terms_acceptances;
    raise exception 'FALLO: anon pudo leer el registro de aceptaciones';
  exception when insufficient_privilege then
    raise notice 'OK · un visitante no puede leer el registro de aceptaciones';
  end;

  ------------------------------------------------------------------ Beta: plazas y cola
  -- anon: puede ver el estado público de la beta, pero no reclamar plaza ni tocar los ajustes
  begin
    perform public.claim_beta_slot();
    raise exception 'FALLO: anon pudo llamar a claim_beta_slot';
  exception when insufficient_privilege then
    raise notice 'OK · un visitante no puede reclamar plaza';
  end;
  j := public.beta_status();
  if (j->>'capacity')::int <> 2 or (j->>'active')::int <> 2 or (j->>'remaining')::int <> 0 then
    raise exception 'FALLO: beta_status inesperado: %', j;
  end if;
  raise notice 'OK · un visitante ve cuántas plazas hay y cuántas quedan (beta_status)';
  begin
    perform 1 from public.app_settings;
    raise exception 'FALLO: anon pudo leer app_settings';
  exception when insufficient_privilege then
    raise notice 'OK · los ajustes de la aplicación no son legibles desde la web';
  end;

  -- C y D llegan con la beta llena: se registran, pero quedan en la cola
  reset role;
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', c::text, true);
  set local role authenticated;
  j := public.claim_beta_slot();
  if j->>'state' <> 'waitlist' or (j->>'position')::int <> 1 then raise exception 'FALLO: C debería ser el nº 1 de la cola y obtuvo %', j; end if;

  reset role;
  perform set_config('request.jwt.claim.sub', d::text, true);
  set local role authenticated;
  j := public.claim_beta_slot();
  if j->>'state' <> 'waitlist' or (j->>'position')::int <> 2 then raise exception 'FALLO: D debería ser el nº 2 de la cola y obtuvo %', j; end if;
  raise notice 'OK · con la beta llena, C y D se registran y entran en la cola (puestos 1 y 2)';

  -- E se salta claim_beta_slot: crea su perfil "a mano", como haría un cliente manipulado
  reset role;
  perform set_config('request.jwt.claim.sub', e::text, true);
  set local role authenticated;
  insert into public.profiles (id, updated_at) values (e, now());
  begin
    insert into public.portals (user_id, slug, brand_name) values (e, 'marca-e', 'Marca E');
    raise exception 'FALLO: un perfil creado a mano obtuvo plaza';
  exception when insufficient_privilege then
    raise notice 'OK · un perfil creado por fuera de claim_beta_slot nace en la cola y no puede crear portal';
  end;
  begin
    insert into public.profiles (id, status) values (e, 'active') on conflict (id) do update set status = 'active';
    raise exception 'FALLO: E pudo darse plaza a sí mismo';
  exception when insufficient_privilege then
    raise notice 'OK · nadie puede activarse a sí mismo desde la web';
  end;
  begin
    update public.profiles set waitlist_since = now() - interval '10 years' where id = e;
    raise exception 'FALLO: E pudo adelantarse en la cola';
  exception when insufficient_privilege then
    raise notice 'OK · nadie puede cambiar su turno en la cola';
  end;

  -- la cola de espera no usa servidor: ni portales ni archivos
  reset role;
  perform set_config('request.jwt.claim.sub', c::text, true);
  set local role authenticated;
  begin
    insert into public.portals (user_id, slug, brand_name) values (c, 'marca-c', 'Marca C');
    raise exception 'FALLO: C (en cola) pudo crear un portal';
  exception when insufficient_privilege then
    raise notice 'OK · quien está en la cola no puede crear portales';
  end;
  select public.can_upload_asset() into r;
  if r is distinct from false then raise exception 'FALLO: C (en cola) podría subir archivos'; end if;
  begin
    insert into storage.objects (bucket_id, name, metadata) values ('portals_assets', c || '/x.png', '{"size": 1}');
    raise exception 'FALLO: C (en cola) pudo subir un archivo';
  exception when insufficient_privilege then
    raise notice 'OK · quien está en la cola no puede subir archivos';
  end;
  begin
    perform public.promote_waitlist();
    raise exception 'FALLO: un usuario pudo llamar a promote_waitlist';
  exception when insufficient_privilege then
    raise notice 'OK · repartir plazas solo lo hace el servidor (promote_waitlist cerrada)';
  end;

  -- el orden de la cola es por hora de llegada (no por id): D llegó antes que C
  reset role;
  update public.profiles set waitlist_since = now() - interval '2 hours' where id = d;
  update public.profiles set waitlist_since = now() - interval '1 hour'  where id = c;
  update public.profiles set waitlist_since = now()                      where id = e;
  perform set_config('request.jwt.claim.sub', c::text, true);
  set local role authenticated;
  j := public.claim_beta_slot();
  if (j->>'position')::int <> 2 then raise exception 'FALLO: con D antes que C, C debería ser el nº 2 y es %', j->>'position'; end if;
  j := public.claim_beta_slot();   -- reclamar de nuevo no cambia nada (idempotente)
  if j->>'state' <> 'waitlist' or (j->>'position')::int <> 2 or (j->>'waiting')::int <> 3 then raise exception 'FALLO: claim repetido cambió el estado: %', j; end if;
  raise notice 'OK · la cola se ordena por llegada y reclamar varias veces no cambia nada';

  ------------------------------------------------------------------ Espacio y archivos
  reset role;
  insert into storage.objects (bucket_id, name, metadata) values
    ('portals_assets', a || '/a.png', '{"size": 15000000}'),
    ('portals_assets', a || '/b.png', '{"size": 6000000}');   -- 21 MB > tope de 20 MB

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', a::text, true);
  set local role authenticated;

  select public.can_upload_asset() into r;
  if r is distinct from false then raise exception 'FALLO: con 21 MB A aún puede subir'; end if;
  raise notice 'OK · con 21 MB se acaba el espacio (tope 20 MB)';

  begin
    insert into storage.objects (bucket_id, name, metadata) values ('portals_assets', a || '/c.png', '{"size": 1}');
    raise exception 'FALLO: la política de subida dejó pasar un archivo sin espacio';
  exception when insufficient_privilege then
    raise notice 'OK · el servidor rechaza subidas sin espacio';
  end;

  begin
    insert into storage.objects (bucket_id, name, metadata) values ('portals_assets', b || '/x.png', '{"size": 1}');
    raise exception 'FALLO: A pudo subir a la carpeta de B';
  exception when insufficient_privilege then
    raise notice 'OK · no se puede subir a la carpeta de otro usuario';
  end;

  begin
    perform public.delete_my_account();
    raise exception 'FALLO: se pudo eliminar la cuenta con archivos subidos';
  exception when raise_exception then
    if sqlerrm <> 'assets_remaining' then raise exception 'FALLO: error inesperado: %', sqlerrm; end if;
    raise notice 'OK · no se elimina la cuenta mientras queden archivos';
  end;

  select count(*) into n from storage.objects;
  if n <> 2 then raise exception 'FALLO: A debería ver sus 2 archivos y ve % (falta la política de lectura propia)', n; end if;
  raise notice 'OK · A ve sus propios archivos';

  delete from storage.objects where name = any (array[a || '/a.png', a || '/b.png']);
  reset role;
  select count(*) into n from storage.objects;
  if n <> 0 then raise exception 'FALLO: A no pudo borrar sus archivos (quedan %)', n; end if;
  raise notice 'OK · A puede borrar sus archivos';

  insert into storage.objects (bucket_id, name, metadata) values ('portals_assets', b || '/b.png', '{"size": 10}');
  set local role authenticated;
  select count(*) into n from storage.objects;
  if n <> 0 then raise exception 'FALLO: A ve % archivos de B', n; end if;
  delete from storage.objects where name = b || '/b.png';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO: A borró % archivos de B', n; end if;
  raise notice 'OK · A no ve ni borra archivos de otros';

  select public.can_upload_asset() into r;
  if r is distinct from true then raise exception 'FALLO: tras borrar, A debería poder subir de nuevo'; end if;
  raise notice 'OK · al liberar espacio se vuelve a poder subir';

  ------------------------------------------------------------------ Aceptación de Términos (en el servidor)
  j := public.accept_terms('2026-10-26.3');
  if j->>'version' <> '2026-10-26.3' or (j->>'accepted_at') is null then raise exception 'FALLO: accept_terms devolvió %', j; end if;
  select count(*) into n from public.terms_acceptances where user_id = a and version = '2026-10-26.3';
  if n <> 1 then raise exception 'FALLO: A debería tener 1 aceptación de la versión y tiene %', n; end if;
  raise notice 'OK · A acepta los Términos y queda registrado en el servidor';

  perform public.accept_terms('2026-10-26.3');
  select count(*) into n from public.terms_acceptances where user_id = a;
  if n <> 1 then raise exception 'FALLO: aceptar dos veces la misma versión no debe duplicar (hay %)', n; end if;
  perform public.accept_terms('2026-11-01');
  select count(*) into n from public.terms_acceptances where user_id = a;
  if n <> 2 then raise exception 'FALLO: una versión nueva debe añadirse al historial (hay %)', n; end if;
  raise notice 'OK · aceptar la misma versión no duplica y una versión nueva se añade al historial';

  begin
    perform public.accept_terms('hola');
    raise exception 'FALLO: se aceptó una versión con formato inválido';
  exception when sqlstate '22023' then
    raise notice 'OK · versiones con formato inválido rechazadas';
  end;
  begin
    perform public.accept_terms(null);
    raise exception 'FALLO: se aceptó una versión nula';
  exception when sqlstate '22023' then
    raise notice 'OK · versión nula rechazada';
  end;

  begin
    insert into public.terms_acceptances (user_id, version) values (a, '2030-01-01');
    raise exception 'FALLO: A pudo escribir directamente en terms_acceptances';
  exception when insufficient_privilege then
    raise notice 'OK · nadie escribe directamente en el registro de aceptaciones';
  end;
  begin
    update public.terms_acceptances set version = '2030-01-01' where user_id = a;
    raise exception 'FALLO: A pudo modificar su registro de aceptaciones';
  exception when insufficient_privilege then
    raise notice 'OK · nadie modifica el registro de aceptaciones';
  end;
  begin
    delete from public.terms_acceptances where user_id = a;
    raise exception 'FALLO: A pudo borrar su registro de aceptaciones';
  exception when insufficient_privilege then
    raise notice 'OK · nadie borra el registro de aceptaciones';
  end;

  reset role;
  insert into public.terms_acceptances (user_id, version) values (b, '2026-10-26');   -- B acepta (insertado como administrador)
  perform set_config('request.jwt.claim.sub', a::text, true);
  set local role authenticated;
  select count(*) into n from public.terms_acceptances where user_id = b;
  if n <> 0 then raise exception 'FALLO: A ve % aceptaciones de B', n; end if;
  select count(*) into n from public.terms_acceptances;
  if n <> 2 then raise exception 'FALLO: A debería ver solo sus 2 aceptaciones y ve %', n; end if;
  raise notice 'OK · cada usuario solo ve sus propias aceptaciones';

  ------------------------------------------------------------------ Eliminar cuenta
  perform public.delete_my_account();
  reset role;
  select count(*) into n from auth.users where id = a;
  if n <> 0 then raise exception 'FALLO: el usuario A sigue existiendo'; end if;
  select count(*) into n from public.profiles where id = a;
  if n <> 0 then raise exception 'FALLO: el perfil de A sigue existiendo'; end if;
  select count(*) into n from public.portals where user_id = a;
  if n <> 0 then raise exception 'FALLO: el portal de A sigue existiendo'; end if;
  select count(*) into n from auth.users where id = b;
  if n <> 1 then raise exception 'FALLO: se ha borrado también al usuario B'; end if;
  raise notice 'OK · eliminar cuenta borra usuario, perfil y portal, y solo los de A';
  select count(*) into n from public.terms_acceptances where user_id = a;
  if n <> 0 then raise exception 'FALLO: quedan % aceptaciones de A tras eliminar su cuenta', n; end if;
  select count(*) into n from public.terms_acceptances where user_id = b;
  if n <> 1 then raise exception 'FALLO: eliminar la cuenta de A ha tocado las aceptaciones de B (hay %)', n; end if;
  raise notice 'OK · eliminar cuenta borra sus aceptaciones y solo las suyas';

  ------------------------------------------------------------------ Beta: se libera una plaza
  select status into txt from public.profiles where id = d;
  if txt <> 'active' then raise exception 'FALLO: al borrarse A, el primero de la cola (D) debería pasar a active y está %', txt; end if;
  select status into txt from public.profiles where id = c;
  if txt <> 'waitlist' then raise exception 'FALLO: C no debería tener plaza todavía y está %', txt; end if;
  select count(*) into n from public.profiles where activated_at is not null and status = 'active';
  if n <> 2 then raise exception 'FALLO: debería haber 2 cuentas activas con fecha de activación y hay %', n; end if;
  raise notice 'OK · al borrarse una cuenta, el primero de la cola obtiene su plaza automáticamente';

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', d::text, true);
  set local role authenticated;
  insert into public.portals (user_id, slug, brand_name) values (d, 'marca-d', 'Marca D');
  select public.can_upload_asset() into r;
  if r is distinct from true then raise exception 'FALLO: D, ya con plaza, debería poder subir archivos'; end if;
  raise notice 'OK · quien sale de la cola ya puede crear portal y subir archivos';
  reset role;

  -- subir el tope reparte las plazas nuevas, también por orden
  update public.app_settings set value = '3'::jsonb where key = 'beta_capacity';
  select status into txt from public.profiles where id = c;
  if txt <> 'active' then raise exception 'FALLO: al subir el tope a 3, C (siguiente) debería entrar y está %', txt; end if;
  select status into txt from public.profiles where id = e;
  if txt <> 'waitlist' then raise exception 'FALLO: E aún no debería tener plaza y está %', txt; end if;
  raise notice 'OK · subir el tope de plazas da acceso a los siguientes de la cola, en orden';

  update public.app_settings set value = '1'::jsonb where key = 'beta_capacity';
  select count(*) into n from public.profiles where status = 'active';
  if n <> 3 then raise exception 'FALLO: bajar el tope no debe expulsar a quien ya tiene plaza (hay % activos)', n; end if;
  raise notice 'OK · bajar el tope no echa a quien ya tiene plaza';

  -- justicia: si se libera una plaza "sin avisar" (p. ej. suspender a alguien a mano), un recién
  -- llegado no se cuela por delante de quien ya espera
  update public.app_settings set value = '3'::jsonb where key = 'beta_capacity';   -- 3 activos = tope; E sigue esperando
  update public.profiles set status = 'suspended' where id = b;                    -- libera una plaza sin disparador
  perform set_config('request.jwt.claim.sub', f::text, true);
  set local role authenticated;
  j := public.claim_beta_slot();
  reset role;
  if j->>'state' <> 'waitlist' or (j->>'position')::int <> 1 then raise exception 'FALLO: F llegó el último y debería ser el nº 1 de la cola, obtuvo %', j; end if;
  select status into txt from public.profiles where id = e;
  if txt <> 'active' then raise exception 'FALLO: la plaza libre debía ser para E (esperaba antes que F) y E está %', txt; end if;
  raise notice 'OK · un recién llegado no se cuela: la plaza libre es para quien esperaba primero';

  if public.asset_limit_bytes('pro') <> 1073741824 or public.asset_limit_bytes(null) <> 20971520 then
    raise exception 'FALLO: topes de plan incorrectos';
  end if;
  raise notice 'OK · topes de plan: 20 MB por defecto, 1 GB en pro';

  raise notice 'TODAS LAS PRUEBAS DE SEGURIDAD HAN PASADO';
end
$$;

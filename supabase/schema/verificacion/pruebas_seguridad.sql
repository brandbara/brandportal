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
  n int;
  r boolean;
  txt text;
begin
  insert into auth.users (id) values (a), (b);

  ------------------------------------------------------------------ Usuario A
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', a::text, true);
  set local role authenticated;

  insert into public.profiles (id, updated_at) values (a, now());
  insert into public.portals (user_id, slug, brand_name) values (a, 'marca-a', 'Marca A');
  raise notice 'OK · A crea su perfil y su portal';

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

  select count(*) into n from public.profiles;
  if n <> 0 then raise exception 'FALLO: B ve % perfiles ajenos', n; end if;
  select count(*) into n from public.portals;
  if n <> 0 then raise exception 'FALLO: B ve % portales ajenos', n; end if;
  raise notice 'OK · B no ve perfiles ni portales de A';

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

  if public.asset_limit_bytes('pro') <> 1073741824 or public.asset_limit_bytes(null) <> 20971520 then
    raise exception 'FALLO: topes de plan incorrectos';
  end if;
  raise notice 'OK · topes de plan: 20 MB por defecto, 1 GB en pro';

  raise notice 'TODAS LAS PRUEBAS DE SEGURIDAD HAN PASADO';
end
$$;

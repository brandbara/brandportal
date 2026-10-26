# Esquema de referencia de Supabase

`esquema_referencia.sql` es una **foto de la estructura real** de la base de datos de producción
(tablas, funciones, permisos, políticas y el cubo `portals_assets`), reconstruida el 26-oct-2026 con
consultas de solo lectura. Sirve para **volver a montar BrandBara desde cero** en un proyecto de
Supabase nuevo y vacío si algún día se pierde el actual.

## Qué cubre y qué no

| Cubre | No cubre |
|---|---|
| Tablas `profiles` y `portals`, restricciones e índices | Los **datos** (usuarios, portales) → copias de seguridad |
| Seguridad por filas (RLS) y permisos por columna | Los **archivos** del cubo → copias de seguridad |
| Las 7 funciones, el disparador de direcciones reservadas | La configuración de **Authentication** (proveedores, URLs de redirección, plantillas de correo): está en el panel de Supabase |
| Cubo `portals_assets` y sus 3 políticas de almacenamiento | |

## Cómo se comprobó que es fiel a producción

Se calculó una huella (md5) de cada elemento (columnas, permisos, definiciones de funciones,
políticas, restricciones, índices, disparador y cubo) en producción y en un Postgres vacío donde se
aplicó este archivo. **Las dos huellas coinciden** (45 elementos al crear el archivo; tras la migración de la beta, 62: huella `a217fbf5…`, comprobada también en producción el 26-oct).

## Comprobación automática

El robot de GitHub «Esquema de Supabase» (`.github/workflows/esquema-supabase.yml`) corre cuando se
toca `supabase/`: monta un Postgres vacío, aplica el archivo y ejecuta
`verificacion/pruebas_seguridad.sql` (39 comprobaciones: nadie puede cambiarse el plan, un usuario no
ve datos de otro, el servidor rechaza subidas sin espacio, eliminar cuenta borra solo lo propio, la cola de la
beta respeta el orden de llegada y nadie puede activarse a sí mismo…).
Se probó además que las pruebas **fallan** si se rompe el esquema a propósito.

Esto garantiza que el archivo es aplicable y que las reglas de seguridad que describe funcionan. No
detecta, por sí solo, que producción se haya cambiado a mano sin actualizar el archivo.

## Beta con plazas y cola de espera (cómo se gestiona)

Las plazas son cuentas con `status = 'active'`. Quien se registra con la beta llena queda en la cola
(`status = 'waitlist'`): puede iniciar sesión pero el servidor no le deja crear portal ni subir archivos.
Cuando se borra una cuenta o se sube el tope, entra solo el primero de la cola (por orden de llegada).

Se gestiona desde el panel de Supabase → SQL Editor:

```sql
-- Ver el estado (plazas, ocupadas, libres, gente en cola)
select public.beta_status();

-- Subir (o bajar) las plazas: al subirlas entra solo la gente de la cola que quepa
update public.app_settings set value = '50' where key = 'beta_capacity';

-- Quién espera, por orden
select email, waitlist_since from public.profiles where status = 'waitlist' order by waitlist_since;

-- Pausar a una cuenta (libera su plaza) y repartir la plaza libre
update public.profiles set status = 'suspended' where email = 'alguien@ejemplo.com';
select public.promote_waitlist();
```

Bajar el tope **no** echa a nadie que ya tenga plaza: solo frena nuevas entradas.

## Regla de trabajo

Cada cambio en la base de datos = **una migración** en `supabase/migrations/` **y** actualizar
`esquema_referencia.sql` en el mismo Pull Request.

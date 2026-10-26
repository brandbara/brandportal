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
aplicó este archivo. **Las dos huellas coinciden (45 elementos).**

## Comprobación automática

El robot de GitHub «Esquema de Supabase» (`.github/workflows/esquema-supabase.yml`) corre cuando se
toca `supabase/`: monta un Postgres vacío, aplica el archivo y ejecuta
`verificacion/pruebas_seguridad.sql` (23 comprobaciones: nadie puede cambiarse el plan, un usuario no
ve datos de otro, el servidor rechaza subidas sin espacio, eliminar cuenta borra solo lo propio…).
Se probó además que las pruebas **fallan** si se rompe el esquema a propósito.

Esto garantiza que el archivo es aplicable y que las reglas de seguridad que describe funcionan. No
detecta, por sí solo, que producción se haya cambiado a mano sin actualizar el archivo.

## Regla de trabajo

Cada cambio en la base de datos = **una migración** en `supabase/migrations/` **y** actualizar
`esquema_referencia.sql` en el mismo Pull Request.

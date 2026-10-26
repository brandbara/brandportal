# Base de datos (Supabase)

Aquí se guardan los cambios de base de datos como archivos SQL, uno por migración, para que quede constancia de qué se ha cambiado y cuándo.

| Migración | Qué hace |
|---|---|
| `seguridad_paso1_perfiles_bucket_slugs` (26-oct-2026) | Perfiles y portales dejan de ser legibles por cualquiera; límites y tipos permitidos en el bucket; reglas de enlaces. *(Aplicada en Supabase; SQL pendiente de añadir aquí.)* |
| `seguridad_paso2_portals_cerrado_y_politicas_limpias` (26-oct-2026) | Los portales se leen solo mediante `get_portal_secure`; políticas limpias. *(Aplicada en Supabase; SQL pendiente de añadir aquí.)* |
| [`20261026114343_eliminar_cuenta_real.sql`](migrations/20261026114343_eliminar_cuenta_real.sql) | Borrado real de cuenta: `my_asset_paths()` y `delete_my_account()`. |

Las migraciones se aplican desde el panel de Supabase (SQL Editor) o con la herramienta conectada a Claude. El esquema inicial de las tablas (`profiles`, `portals`) todavía no está versionado: es una tarea pendiente.

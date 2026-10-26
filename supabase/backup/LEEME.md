# Copias de seguridad de la base de datos (gratis, sin Supabase Pro)

El plan gratuito de Supabase **no incluye copias de seguridad**. Este robot de GitHub (`Copia de seguridad de la base de datos`) las hace por ti **cada día**:

- Vuelca los **datos** de las cuentas (`auth.users`, `auth.identities`), los perfiles y los portales. La **estructura** ya está guardada en `supabase/schema/esquema_referencia.sql`.
- Las **cifra** (AES-256) con una contraseña que solo tú conoces. **Este repositorio es público**, así que nada se sube nunca sin cifrar.
- Las guarda **30 días** en GitHub (pestaña *Actions* → ejecución → *Artifacts*). Junto a cada copia hay un resumen en claro con solo fecha, tamaño y nº de filas (nada de contenido).

> **No copia los archivos** (imágenes y vídeos que suben los usuarios). Si se perdiera el almacenamiento, los portales se restaurarían pero sus imágenes tendrían que volver a subirse. Es un riesgo aceptado para la beta; la segunda fase puede guardar también los archivos.

## Puesta en marcha (una sola vez, ~5 minutos, solo tú)

Necesitas crear **2 secretos** en GitHub: *Settings → Secrets and variables → Actions → New repository secret*.

1. **`BACKUP_PASSPHRASE`** — la contraseña de cifrado.
   - Genérala en tu gestor de contraseñas: **larga y aleatoria (24 caracteres o más)**.
   - **Guárdala también en el gestor** con el nombre «BrandBara · copias de seguridad». **Sin ella las copias no se pueden abrir y no hay forma de recuperarla.**
2. **`SUPABASE_DB_URL`** — cómo se conecta el robot a la base de datos.
   - En Supabase: tu proyecto → botón **Connect** → pestaña **Connection string** → elige **Session pooler** (Método: *Session pooler*, no *Direct*: GitHub no tiene IPv6).
   - Copia la cadena `postgresql://postgres.xxxx:[YOUR-PASSWORD]@…pooler.supabase.com:5432/postgres` y **sustituye `[YOUR-PASSWORD]` por la contraseña de la base de datos** (*Project Settings → Database → Reset database password* si no la tienes; apúntala en el gestor).
   - Pega la cadena completa como valor del secreto. **No la pegues en el chat ni en ningún otro sitio.**

Luego, en GitHub: **Actions → Copia de seguridad de la base de datos → Run workflow** para probarlo ya (no esperes a mañana). Debe terminar en verde y dejar un *artifact* `copia-bd-…`.

Si falta algún secreto, el robot falla con un mensaje claro («Faltan los secretos: …») y GitHub te avisa por email.

## Cómo saber que va bien

- Cada día debe aparecer una ejecución verde. Si falla, GitHub te manda un email.
- El resumen (`resumen-….txt`) dice cuántos usuarios, perfiles y portales había. **Si de un día para otro baja de golpe, algo va mal: avísame.**
- Cada vez que se cambia este procedimiento, el robot **ensaya** todo con datos inventados: copiar, cifrar, comprobar que no hay nada legible, comprobar que una contraseña equivocada no abre nada, restaurar en una base vacía y comparar que sale idéntico.

## Cómo se restaura (si alguna vez hace falta)

1. Crea un proyecto nuevo de Supabase (o usa uno vacío).
2. Aplica la estructura: abre `supabase/schema/esquema_referencia.sql` en el *SQL Editor* de Supabase y ejecútalo.
3. Descarga la copia: GitHub → *Actions* → la ejecución que quieras → *Artifacts* → `copia-bd-…` (zip con el `.enc`).
4. Restaura (necesita `psql` y `openssl`; si no sabes hacerlo, **pídeme que lo haga yo** con la contraseña de cifrado):

   ```bash
   TARGET_URL='postgresql://…cadena del proyecto nuevo…' \
   BACKUP_PASSPHRASE='…tu contraseña de cifrado…' \
   supabase/backup/restaurar_copia.sh copia-bd-XXXX.sql.gz.enc
   ```
   Se hace en una sola transacción: o se restaura todo o no se toca nada.
5. Actualiza en Vercel las claves del proyecto nuevo (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`) y en Supabase → Authentication → URL Configuration las direcciones de brandbara.com.

**Haz un simulacro cada 3 meses** (pasos 1–4 en un proyecto de pruebas): una copia que nunca se ha restaurado es solo una esperanza.

## Límites que conviene conocer

- Si el repositorio se hace privado, las copias siguen cifradas igualmente.
- Frecuencia: diaria. En el peor caso se pierden las últimas 24 horas.
- Las contraseñas de los usuarios van dentro de la copia (como *hash*, nunca en claro) y por eso la copia solo existe cifrada.
- Con la cuenta gratuita de GitHub hay 500 MB para artefactos; una copia pesa unos KB o pocos MB.

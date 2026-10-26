# Acceso con Google y enlace por correo: configuración (una sola vez)

BrandBara no usa contraseñas. Se entra de dos formas, y las dos crean la cuenta si no existe:

- **Continuar con Google**: no necesita enviar correos. Funciona en cuanto se configuren las partes 1 y 2. Mientras Google no esté activado en Supabase, **el botón no se muestra** (la web lo comprueba sola), así que no hay riesgo de dejar un botón roto.
- **Enlace por correo**: necesita un servidor de correo propio (parte 3). Mientras no exista, Supabase solo envía correos a las personas del equipo del proyecto, con un límite muy bajo.

**Orden recomendado:** haz las partes 1 y 2 (Google) **antes de fusionar** el Pull Request. Al fusionarlo desaparece la contraseña y, sin Google ni correo propio, solo podrían entrar las personas del equipo de Supabase (con el enlace por correo). Hoy hay 4 cuentas, todas con contraseña.

Las cuentas que ya existen (con contraseña) entran con Google o con enlace usando **el mismo correo** y quedan enlazadas a la misma cuenta, con sus portales intactos.

Los textos legales ya cubren este acceso (Privacidad §2, §4 y §8; Términos §3; Cookies §3) y las páginas con dirección propia que Google pide existen:
`https://brandbara.com/legal/privacidad`, `/legal/terminos`, `/legal/aviso-legal`, `/legal/cookies`.

---

## Parte 1 · Google Cloud (unos 10 minutos)

Entra en <https://console.cloud.google.com> con la cuenta de Google que quieras como propietaria (activa en ella la verificación en dos pasos).

1. Crea un proyecto nuevo llamado **BrandBara**.
2. Busca **Google Auth Platform** (antes «Pantalla de consentimiento de OAuth») y pulsa **Empezar**:
   - Nombre de la aplicación: `BrandBara`.
   - Correo de asistencia al usuario: `brandbara.hello@gmail.com`.
   - Público: **Externo**.
   - Correo de contacto del desarrollador: `brandbara.hello@gmail.com`.
3. En **Branding**:
   - Página principal: `https://brandbara.com`
   - Política de privacidad: `https://brandbara.com/legal/privacidad`
   - Condiciones del servicio: `https://brandbara.com/legal/terminos`
   - Dominios autorizados: `brandbara.com` y `supabase.co`
4. En **Acceso a los datos** (ámbitos) deja **solo** los básicos: `openid`, `.../auth/userinfo.email` y `.../auth/userinfo.profile`. No añadas ningún otro: con ellos no hace falta verificación de Google.
5. En **Público** pulsa **Publicar aplicación** (pasar de «En pruebas» a «En producción»). Si se queda en pruebas, solo pueden entrar 100 personas dadas de alta a mano y las sesiones caducan a los 7 días.
6. En **Clientes** → **Crear cliente** → tipo **Aplicación web**, nombre `BrandBara web`:
   - Orígenes autorizados de JavaScript: `https://brandbara.com`
   - URI de redirección autorizados: `https://ioktkbuualxcjsulbefb.supabase.co/auth/v1/callback`
7. Al crear el cliente verás el **ID de cliente** y el **Secreto**. Cópialos y pégalos tú mismo en la parte 2. No los pegues en ningún chat ni los guardes en el repositorio.

## Parte 2 · Supabase (panel del proyecto `ioktkbuualxcjsulbefb`)

1. **Authentication → Sign In / Providers → Google**: actívalo, pega el ID de cliente y el secreto, y guarda. Deja desactivada la opción de saltar las comprobaciones de nonce.
2. **Authentication → URL Configuration**:
   - Site URL: `https://brandbara.com`
   - Redirect URLs: `https://brandbara.com/**`
   - **No añadas comodines amplios** como `https://*.vercel.app/**`: cualquiera podría crear una web ahí y recibir sesiones de tus usuarios. Para probar una vista previa de Vercel, añade solo esa dirección concreta y bórrala después.
3. **Authentication → Sign In / Providers → Email**: déjalo activado (es lo que envía el enlace) y **activa «Confirm email»**. Hoy está desactivado (el panel lo llama *autoconfirm*): cualquiera podría crear una cuenta con el correo de otra persona sin demostrar que es suyo y, si luego esa persona entra con Google, el atacante conservaría acceso a la misma cuenta. Con «Confirm email» activo esa cuenta no queda confirmada y no se enlaza. No afecta a nadie: las contraseñas ya no se usan y las 4 cuentas actuales están confirmadas. La caducidad del enlace por defecto es 1 hora (3600 s): no la cambies, porque el texto de la web dice «1 hora».

## Parte 3 · Correo propio para el enlace (Resend)

1. Crea una cuenta en <https://resend.com> y añade el dominio `brandbara.com`. Te dará unos registros DNS (SPF y DKIM) que se copian en el sitio donde compraste el dominio. Elige la región de envío **UE (Irlanda)** si te la ofrece.
2. Crea una **API key** de envío.
3. En Supabase, **Authentication → Emails → SMTP Settings**: activa el SMTP propio con
   - Servidor: `smtp.resend.com`, puerto `465`
   - Usuario: `resend`
   - Contraseña: la API key
   - Remitente: `BrandBara <acceso@brandbara.com>`
4. En **Authentication → Emails → Templates**, cambia **Magic Link** y **Confirm signup** a español (ver abajo).
5. Avísame cuando esté: **ese mismo día** añado Resend a Privacidad §4 y §8 y al registro legal (`src/data/legalTerceros.js`), y cuando puedas acepta su acuerdo de encargado (DPA) desde su panel.

Plantilla para **Magic Link** y para **Confirm signup** (asunto: `Tu enlace para entrar en BrandBara`):

```html
<h2>Entra en BrandBara</h2>
<p>Pulsa el botón para entrar. El enlace caduca en 1 hora y solo funciona una vez.</p>
<p><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 20px;background:#4f46e5;color:#ffffff;border-radius:10px;text-decoration:none;font-weight:bold">Entrar en BrandBara</a></p>
<p>Si no has sido tú, ignora este correo: nadie puede entrar sin este enlace.</p>
<p style="color:#64748b;font-size:12px">BrandBara · brandbara.hello@gmail.com</p>
```

## Parte 4 · Probar

1. Abre `https://brandbara.com` en una ventana privada → icono de perfil → **Continuar con Google** → elige cuenta.
2. Debe aparecer **«Antes de empezar»**: marca la casilla y acepta. En Supabase, tabla `terms_acceptances`, debe aparecer una fila con la versión y la hora.
3. Repite con **Enviarme un enlace de acceso** (solo cuando la parte 3 esté hecha).
4. Prueba con una de las cuentas antiguas: debe entrar a su portal de siempre.

## Si algo falla

| Mensaje | Causa | Arreglo |
|---|---|---|
| `provider is not enabled` | Google no está activado en Supabase | Parte 2, paso 1 |
| `redirect_uri_mismatch` (en Google) | La URI de callback no coincide | Parte 1, paso 6: copiarla exactamente |
| «No podemos enviar correos a esa dirección» | Aún no hay SMTP propio | Parte 3 |
| «El enlace ha caducado o ya se usó» | Enlace de más de 1 hora o abierto dos veces (algunos antivirus de correo lo abren antes) | Pedir otro |
| Entra pero vuelve a la portada | La URL no está en Redirect URLs | Parte 2, paso 2 |

## Notas de seguridad

- El botón de Google usa un icono genérico, no el logotipo oficial. Si quieres el oficial, descárgalo de la guía de marca de Google; no se ha dibujado ni copiado aquí.
- Entrar con Google solo pide nombre, correo y foto de perfil. La foto no se usa, pero Supabase la guarda con los datos de la cuenta, y así se declara en Privacidad.
- Quien controle el correo de una cuenta controla la cuenta (con enlace o con Google usando ese mismo correo). Por eso es importante la verificación en dos pasos en el correo principal.
- La aceptación de Términos se guarda en el servidor (`terms_acceptances`, función `accept_terms`) con la hora del servidor. Al subir `LEGAL_VERSION` en `src/data/legalEntity.js`, todas las cuentas vuelven a ver la pantalla «Antes de empezar» en su siguiente visita.

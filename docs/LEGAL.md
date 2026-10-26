# Proceso legal de BrandBara

Este documento es el **registro legal vivo** del producto. Lo mantiene Claude en cada cambio y lo revisa el abogado cuando se abra al público.
No es asesoramiento legal: deja el trabajo hecho para que un profesional lo revise rápido.

**Dónde está cada cosa**
- Textos que ve el usuario: `src/data/legal.js` (Aviso legal, Privacidad, Términos, Cookies, Denunciar contenido; ES/EN).
- Datos del titular y versión de los textos: `src/data/legalEntity.js` (la calle del domicilio está vacía a propósito, ver abajo).
- Terceros y librerías revisados: `src/data/legalTerceros.js`.
- Comprobaciones automáticas: `src/data/legal.test.js` y `src/data/legalTerceros.test.js` (fallan si falta algo).
- Análisis largo, riesgos y preguntas para el abogado: documento «Paquete legal BrandBara» del Proyecto en claude.ai.

## Regla: cada función nueva pasa por legal antes de salir

1. **Antes de construir**, se contestan 6 preguntas: ¿datos personales nuevos?, ¿servicio de terceros?, ¿cookies o almacenamiento?, ¿contenido de usuarios?, ¿emails?, ¿dinero o promociones?
2. **Si alguna es sí**, en el mismo Pull Request:
   - se actualiza el apartado correspondiente de `src/data/legal.js` (ES y EN a la vez);
   - se registra el servicio en `src/data/legalTerceros.js` (con el apartado donde se declara);
   - se anota la función en la tabla de abajo;
   - si el cambio es relevante para el usuario, se sube `LEGAL_VERSION` y se añade una línea al historial.
3. **El Pull Request lleva la lista de revisión legal** (`.github/pull_request_template.md`).
4. **La comprobación automática falla** si aparece un servicio externo o una librería sin registrar, o si la versión legal no consta aquí.
5. **Las funciones que dependen de algo aún inexistente** (cobros, emails…) no se anuncian en los textos hasta que existan: se activan en el mismo PR que la función.
6. **Lo que no sé o no puedo verificar** se anota como pregunta abierta para el abogado, no se inventa.

## Registro de funciones y su impacto legal

| Función | Datos | Terceros | Dónde se declara | Estado |
|---|---|---|---|---|
| Cuentas (email y contraseña) | Email, nombre, contraseña cifrada | Supabase | Privacidad §2, §4 | En producción |
| Beta con plazas y cola | Estado de cuenta, fechas de cola | Supabase | Privacidad §2, §10; Términos §4 | En producción |
| Portales públicos | Contenido del usuario, IP técnica del servidor | Supabase, Vercel | Privacidad §2, §3; Términos §5–§8 | En producción |
| Contraseña de portal | Huella (hash) de la contraseña | Supabase | Privacidad §2, §3; Términos §7 | En producción (comparación en el navegador: mejorar, ver seguridad) |
| Vídeos de YouTube/Vimeo | Ninguno nuestro; el proveedor puede guardar cookies al reproducir | YouTube, Vimeo | Privacidad §3; Cookies §2 | En producción: solo tras pulsar «Reproducir» |
| Borrador local y sesión | Almacenamiento del navegador | — | Cookies §1 | En producción |
| Eliminar cuenta | Borra archivos, usuario, perfil y portal | Supabase | Privacidad §5; Términos §14 | En producción |
| Copias de seguridad cifradas | Copia diaria de la base (30 días), sin archivos subidos | GitHub | Privacidad §5, §8; Términos §11 | Código en producción; faltan 2 secretos de GitHub |
| Denunciar contenido | Mensajes por correo | — | Denunciar contenido; Términos §9 | En producción |
| Encuesta PRO (enlace a Tally) | Lo que el usuario escriba en Tally | Tally | Privacidad §2, §4; Términos §4 | En producción: **confirmar qué pide el formulario** |
| Bloquear Remix Mágico | Un interruptor guardado en el portal | — | Sin cambio legal | En producción |

## Funciones planificadas: qué hay que hacer en legal al activarlas

| Función | Qué cambiar en los textos | Otras tareas |
|---|---|---|
| **Inicio con Google y enlace mágico** | Privacidad §2 (nombre, email y foto que envía Google), §4 (Google como proveedor de acceso), §8 (EE. UU.); Cookies §1 (la sesión sigue igual); retirar la contraseña de los datos | Registro de aceptación de Términos en el servidor; correo de envío (ver emails) |
| **Emails** (enlace mágico, aviso de cola) | Privacidad §4 (proveedor de envío) y §10; Términos §4 | DPA del proveedor; avisos = comunicaciones de servicio, nunca comerciales sin consentimiento (LSSI art. 21) |
| **«Invítame a un café»** (Wise) | Términos: aportación voluntaria, sin contraprestación, no reembolsable salvo error; Privacidad §4 (Wise) | Gestoría: IRPF e IVA de las aportaciones; botón solo en el editor, nunca en portales |
| **Plan PRO y cobros** | Términos: precio, impuestos, renovación, cancelación, **desistimiento de 14 días** (verificar TRLGDCU arts. 102–103); Privacidad §2 (datos de facturación) y §4 (procesador de pagos o «merchant of record») | Gestoría: alta, IVA internacional, facturación; revisar la cláusula de responsabilidad |
| **Analítica o medición** (si algún día) | Cookies: consentimiento previo y banner real con «Rechazar»; Privacidad | No activar nada sin consentimiento |
| **Exportar datos** | Privacidad §6 (hoy se hace por email) | |
| **API pública / subir tipos de archivo nuevos** | Términos §6 y Anexo A | Revisar seguridad de los archivos |

## Historial de versiones de los textos

| Versión | Qué cambió |
|---|---|
| 2026-10-26 | Textos nuevos (PR #22): Aviso legal, Privacidad, Términos con Anexo A, Cookies y Denunciar contenido; se retiran Stripe, Google Cloud, analítica, SAML, API, «BrandBara Site Inc.» y California/Nevada. Edad mínima 14 años. Datos del titular: nombre, NIF y correo; domicilio «a petición». |
| 2026-10-26.2 | Política de cookies sin «almacenamiento» en el título y banner más cercano; nombre y logotipo en lugar de «marca» (la marca no está registrada); encuesta PRO (Tally) en Privacidad; ventajas de la beta en Términos §4; proceso y registro legal. |

## Decisiones del titular (para no volver a preguntarlas)
- Titular: autónomo ya dado de alta (modelo 036 presentado el 8-oct-2026).
- Contacto para todo: `brandbara.hello@gmail.com` por ahora.
- Edad mínima: **14 años**.
- Vídeos incrustados: solo tras clic con aviso.
- **No se publica el domicilio** (es su vivienda): se publican nombre, NIF y correo, y el domicilio «a petición». Es provisional y no cumple a rajatabla el art. 10 LSSI; arreglo: oficina virtual o dirección de la gestoría, y rellenar `address` en `legalEntity.js`.
- El dominio está comprado, la **marca no está registrada**: se usa «™» (nunca «®») y los textos hablan de «nombre y logotipo». Antes de invertir en la marca, búsqueda de anterioridades y registro en OEPM/EUIPO.
- La gestoría se consulta más adelante.

## Pendiente de acción humana
- Aceptar los acuerdos de encargado de tratamiento (DPA) de Supabase, Vercel y GitHub desde sus paneles.
- Crear los secretos `BACKUP_PASSPHRASE` y `SUPABASE_DB_URL` en GitHub para activar las copias.
- Comprobar en Vercel que Web Analytics y Speed Insights están desactivados.
- 2FA o passkeys en GitHub, Supabase, Vercel, Google, Wise y el registrador del dominio.
- Antes de abrir al público o de cobrar: abogado de protección de datos y servicios digitales (preguntas en el Paquete legal) y gestoría.

## Preguntas abiertas para el abogado (resumen; el detalle está en el Paquete legal)
- Edad de 14 años: contratación por menores y encaje con un uso «profesional».
- ¿Una beta gratuita ya es actividad económica a efectos del art. 10 LSSI? ¿Es válido el domicilio «a petición» mientras no haya otra dirección?
- ¿Es BrandBara «plataforma en línea» según el DSA?
- Tope de responsabilidad y cláusula de indemnidad.
- Anexo A (encargado de tratamiento) frente a prohibir datos personales de terceros.
- Ventajas de la beta (meses gratis de PRO por la encuesta): redacción de la cláusula.
- Marca: anterioridades y registro.

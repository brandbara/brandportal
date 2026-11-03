// GET /api/og?slug=<enlace>  ->  imagen PNG 1200×630 con el nombre, el logotipo y la portada del portal.
// La dirección de esta imagen la escribe api/portal-meta.js en las etiquetas que leen WhatsApp, Telegram, Slack...
import { fetchOwnImage, fetchPortalPreview, readEnv } from './_lib/network.js';
import { isValidSlug } from './_lib/preview.js';
import { renderCardPng } from './_lib/render.js';

export const config = { runtime: 'edge' };

const FALLBACK = '/og-image.png';

const redirectToGeneric = (req, seconds = 60) =>
  new Response(null, {
    status: 302,
    headers: { location: new URL(FALLBACK, req.url).href, 'cache-control': `public, s-maxage=${seconds}` },
  });

export default async function handler(req) {
  const slug = new URL(req.url).searchParams.get('slug') || '';
  // Nada de personalizar con direcciones raras: se devuelve la imagen genérica de BrandBara.
  if (!isValidSlug(slug)) return redirectToGeneric(req, 3600);

  const env = readEnv(process.env);
  const preview = await fetchPortalPreview(slug, env);
  if (preview.kind === 'none') return redirectToGeneric(req);

  // Un portal con contraseña solo enseña su nombre: ni portada ni logotipo.
  const [hero, logo] = preview.kind === 'ok'
    ? await Promise.all([fetchOwnImage(preview.hero, env.supabaseUrl), fetchOwnImage(preview.logo, env.supabaseUrl)])
    : [null, null];

  try {
    const { png, degraded } = await renderCardPng(preview, { hero, logo });
    // Si faltó alguna imagen que debería estar, la copia guardada dura poco para reintentar pronto.
    const complete = !degraded && (!preview.hero || hero) && (!preview.logo || logo);
    return new Response(png, {
      headers: {
        'content-type': 'image/png',
        'cache-control': complete
          ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
          : 'public, max-age=60, s-maxage=60',
        'x-robots-tag': 'noindex',
      },
    });
  } catch (error) {
    console.error('og: no se pudo dibujar la tarjeta:', error && error.message);
    return redirectToGeneric(req);
  }
}

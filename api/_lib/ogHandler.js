// Lógica de GET /api/og?slug=<enlace> (recibe y devuelve objetos estándar Request/Response, así se prueba sin Vercel).
// La función de Vercel que la usa es api/og.js.
import { fetchOwnImage, fetchPortalPreview, readEnv } from './network.js';
import { isValidSlug } from './preview.js';
import { renderCardPng } from './render.js';

const FALLBACK = '/og-image.png';

// `reason` (código corto, nunca el mensaje de error) queda en una cabecera para saber por qué salió la imagen genérica.
const redirectToGeneric = (req, seconds = 60, reason = 'generic', detail = '') => {
  if (new URL(req.url).searchParams.get('debug') === '1') {
    return new Response(JSON.stringify({ reason, detail: String(detail).slice(0, 600) }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
  return new Response(null, {
    status: 302,
    headers: { location: FALLBACK, 'cache-control': `public, s-maxage=${seconds}`, 'x-og-reason': reason },
  });
};

export const handleOg = async (req) => {
  const slug = new URL(req.url).searchParams.get('slug') || '';
  // Nada de personalizar con direcciones raras: se devuelve la imagen genérica de BrandBara.
  if (!isValidSlug(slug)) return redirectToGeneric(req, 3600, 'bad-slug');

  const env = readEnv(process.env);
  const preview = await fetchPortalPreview(slug, env);
  if (preview.kind === 'none') return redirectToGeneric(req, 60, 'no-portal', JSON.stringify({ hasUrl: Boolean(env.supabaseUrl), hasKey: Boolean(env.anonKey) }));

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
    return redirectToGeneric(req, 60, 'render-failed', error && ((error.stack || error.message) + ' || first: ' + (error.firstError || '')));
  }
};

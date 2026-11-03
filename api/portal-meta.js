// GET /api/portal-meta?slug=<enlace>  ->  HTML mínimo con las etiquetas de vista previa DE ESE PORTAL.
//
// Solo lo reciben los programas que generan tarjetas de enlace (WhatsApp, Telegram, Slack, LinkedIn, X, iMessage...):
// vercel.json los reconoce por su User-Agent y les entrega esto en lugar de la web. Las personas y los buscadores
// siguen recibiendo la web de siempre, sin ningún cambio.
import { fetchPortalPreview, readEnv } from './_lib/network.js';
import { buildMetaHtml, isValidSlug } from './_lib/preview.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug') || '';
  const preview = isValidSlug(slug) ? await fetchPortalPreview(slug, readEnv(process.env)) : { kind: 'none' };

  return new Response(buildMetaHtml({ slug, preview, origin: url.origin }), {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Una consulta fallida (kind none por error de red) se guarda poco; un portal normal, unos minutos.
      'cache-control': preview.kind === 'none' ? 'public, s-maxage=60' : 'public, s-maxage=300, stale-while-revalidate=3600',
      'x-robots-tag': 'noindex',
    },
  });
}

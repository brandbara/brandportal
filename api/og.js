// GET /api/og?slug=<enlace>  ->  imagen PNG 1200×630 con el nombre, el logotipo y la portada del portal.
// La dirección de esta imagen la escribe api/portal-meta.js en las etiquetas que leen WhatsApp, Telegram, Slack...
//
// IMPORTANTE: esta función se ejecuta en el entorno Node.js de Vercel, NO en "edge". El generador de imágenes
// (@vercel/og 0.8.6) compila WebAssembly desde bytes al arrancar y el entorno edge de Vercel lo prohíbe
// («Wasm code generation disallowed by embedder»): allí siempre salía la imagen genérica. Una prueba lo vigila.
import { handleOg } from './_lib/ogHandler.js';

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'brandbara.com';
  const response = await handleOg(new Request(new URL(req.url, `https://${String(host).split(',')[0].trim()}`)));
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

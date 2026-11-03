import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GENERIC, SITE_URL } from './_lib/preview.js';

const root = new URL('../', import.meta.url);
const vercel = JSON.parse(fs.readFileSync(new URL('vercel.json', root), 'utf8'));
const indexHtml = fs.readFileSync(new URL('index.html', root), 'utf8');

const botRule = vercel.rewrites[0];
const botRegex = new RegExp(`^${botRule.has[0].value}$`);
const slugRegex = new RegExp(`^/(${botRule.source.match(/\(([^)]+)\)$/)[1]})$`);

const BOTS = [
  'WhatsApp/2.23.20.0 A',
  'WhatsApp/2.24.3.80 i',
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'facebookexternalhit/1.1;line-poker/1.0',
  'Facebot',
  'Twitterbot/1.0',
  'TelegramBot (like TwitterBot)',
  'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
  'Slackbot 1.0 (+https://api.slack.com/robots)',
  'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
  'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
  'SkypeUriPreview Preview/0.5 skype-url-preview@microsoft.com',
  'Pinterest/0.2 (+http://www.pinterest.com/bot.html)',
  'redditbot/1.0',
  'vkShare; +http://vk.com/dev/Share',
  'http.rb/5.1.1 (Mastodon/4.2.0; +https://mastodon.social/)',
  'Bluesky Cardyb/1.1',
  'Mozilla/5.0 (compatible; Embedly/0.2; +http://support.embed.ly/)',
  'Mozilla/5.0 (compatible; Iframely/1.3.1; +https://iframely.com/docs/about)',
  'Viber',
  'Mattermost-Bot',
];
const HUMANS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
  // navegadores dentro de otras apps: son personas, deben ver la web normal
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 [FBAN/FBIOS;FBAV/450.0]',
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36 Instagram 330.0.0',
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36 MicroMessenger/8.0',
  // buscadores: siguen recibiendo la web de siempre
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)',
  '',
];

test('vercel.json: el desvío especial es la primera regla y la web de siempre sigue como última', () => {
  assert.equal(vercel.rewrites.length, 2);
  assert.equal(botRule.destination, '/api/portal-meta?slug=:slug');
  assert.deepEqual(vercel.rewrites[1], { source: '/(.*)', destination: '/index.html' });
  assert.equal(botRule.has.length, 1);
  assert.equal(botRule.has[0].type, 'header');
  assert.equal(botRule.has[0].key, 'user-agent');
  assert.ok(vercel.headers[0].headers.some((h) => h.key === 'X-Content-Type-Options'), 'las cabeceras de seguridad siguen');
});

test('vercel.json: los programas que generan tarjetas de enlace reciben la versión especial', () => {
  for (const ua of BOTS) assert.ok(botRegex.test(ua), `debería reconocer: ${ua}`);
});

test('vercel.json: personas, navegadores integrados y buscadores NO reciben la versión especial', () => {
  for (const ua of HUMANS) assert.ok(!botRegex.test(ua), `no debería reconocer: ${ua}`);
});

test('vercel.json: el desvío solo afecta a una dirección de un solo tramo (letras, números y guiones)', () => {
  for (const ok of ['/capeo', '/mi-marca-2', '/info', '/a']) assert.ok(slugRegex.test(ok), ok);
  for (const no of ['/', '/capeo/edit', '/legal/privacidad', '/assets/index.js', '/favicon.svg', '/og-image.png', '/robots.txt', '/api/og', '/Capeo', '/a_b', '/a%20b']) {
    assert.ok(!slugRegex.test(no), no);
  }
});

test('las etiquetas genéricas de la función son idénticas a las de index.html', () => {
  const get = (re) => (indexHtml.match(re) || [])[1];
  assert.equal(get(/<title>([^<]*)<\/title>/), GENERIC.title);
  assert.equal(get(/<meta name="description" content="([^"]*)"/), GENERIC.description);
  assert.equal(get(/<meta property="og:title" content="([^"]*)"/), GENERIC.ogTitle);
  assert.equal(get(/<meta property="og:description" content="([^"]*)"/), GENERIC.ogDescription);
  assert.equal(get(/<meta property="og:url" content="([^"]*)"/), GENERIC.ogUrl);
  assert.equal(get(/<meta property="og:image" content="([^"]*)"/), GENERIC.ogImage);
  assert.equal(get(/<meta name="twitter:image" content="([^"]*)"/), GENERIC.ogImage);
  assert.equal(get(/<meta name="theme-color" content="([^"]*)"/), GENERIC.themeColor);
  assert.equal(SITE_URL, 'https://brandbara.com');
});

test('las funciones de Vercel solo están en api/ y los archivos auxiliares viven en api/_lib (no son funciones)', () => {
  const entries = fs.readdirSync(new URL('api/', root), { withFileTypes: true });
  const funciones = entries.filter((e) => e.isFile() && /\.js$/.test(e.name) && !/\.test\.js$/.test(e.name)).map((e) => e.name).sort();
  assert.deepEqual(funciones, ['og.js', 'portal-meta.js']);
});

test('portal-meta se ejecuta en edge (rápido, sin imágenes) y og en Node.js: el generador de imágenes no funciona en edge', () => {
  const read = (f) => fs.readFileSync(new URL(`api/${f}`, root), 'utf8');
  assert.ok(/runtime:\s*'edge'/.test(read('portal-meta.js')));
  const og = read('og.js').replace(/\/\/.*$/gm, '');
  // En edge, Vercel prohíbe compilar WebAssembly desde bytes y @vercel/og 0.8.6 lo hace al arrancar (probado en producción):
  // la imagen salía siempre genérica. Si se cambia de versión o de entorno, hay que volver a probarlo en Vercel.
  assert.ok(!/runtime:\s*'edge'/.test(og), 'api/og.js no debe declarar runtime edge');
  assert.ok(/export default async function handler\(req, res\)/.test(og), 'api/og.js usa la firma clásica (req, res) de Node.js');
  assert.ok(/handleOg\(/.test(og));
});

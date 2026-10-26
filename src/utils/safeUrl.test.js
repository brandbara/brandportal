import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toSafeHref, toSafeMediaUrl, getVideoEmbedUrl, isSafeMediaSrc } from './safeUrl.js';

describe('toSafeHref (enlaces que pulsan los visitantes)', () => {
  it('acepta enlaces normales y completa los que no llevan https://', () => {
    assert.equal(toSafeHref('https://drive.google.com/file/d/1'), 'https://drive.google.com/file/d/1');
    assert.equal(toSafeHref('drive.google.com/file/d/1'), 'https://drive.google.com/file/d/1');
    assert.equal(toSafeHref('www.web.com'), 'https://www.web.com/');
    assert.equal(toSafeHref('mailto:hola@marca.com'), 'mailto:hola@marca.com');
    assert.equal(toSafeHref('tel:+34600000000'), 'tel:+34600000000');
  });

  it('bloquea los esquemas peligrosos, también disfrazados', () => {
    const ataques = [
      'javascript:alert(1)', 'JavaScript:alert(1)', '  javascript:alert(1)', 'java\nscript:alert(1)', 'java\tscript:alert(1)',
      'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)', 'file:///etc/passwd',
    ];
    for (const ataque of ataques) assert.equal(toSafeHref(ataque), '#', ataque);
  });

  it('devuelve # si está vacío o no parece una dirección', () => {
    for (const valor of ['', '   ', null, undefined, 'hola', 'mi enlace de descarga']) assert.equal(toSafeHref(valor), '#');
  });
});

describe('toSafeMediaUrl / isSafeMediaSrc', () => {
  it('solo admite http(s)', () => {
    assert.equal(toSafeMediaUrl('https://x.com/a.png'), 'https://x.com/a.png');
    assert.equal(toSafeMediaUrl('javascript:alert(1)'), null);
    assert.equal(toSafeMediaUrl('mailto:a@b.com'), null);
  });
  it('reconoce los orígenes que puede cargar un <img> o <video>', () => {
    assert.equal(isSafeMediaSrc('blob:https://brandbara.com/abc'), true);
    assert.equal(isSafeMediaSrc('https://x.supabase.co/storage/v1/object/public/a.mp4'), true);
    assert.equal(isSafeMediaSrc('javascript:alert(1)'), false);
    assert.equal(isSafeMediaSrc('data:text/html,hola'), false);
  });
});

describe('getVideoEmbedUrl (solo YouTube y Vimeo)', () => {
  const youtube = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
  it('convierte los formatos habituales', () => {
    assert.equal(getVideoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), youtube);
    assert.equal(getVideoEmbedUrl('https://youtu.be/dQw4w9WgXcQ'), youtube);
    assert.equal(getVideoEmbedUrl('https://youtube.com/shorts/dQw4w9WgXcQ'), youtube);
    assert.equal(getVideoEmbedUrl(youtube), youtube); // datos ya guardados
    assert.equal(getVideoEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ'), youtube); // portales guardados antes del cambio
    assert.equal(getVideoEmbedUrl('https://vimeo.com/76979871'), 'https://player.vimeo.com/video/76979871?dnt=1');
    assert.equal(getVideoEmbedUrl('https://player.vimeo.com/video/76979871'), 'https://player.vimeo.com/video/76979871?dnt=1');
    assert.equal(getVideoEmbedUrl('https://player.vimeo.com/video/76979871?dnt=1'), 'https://player.vimeo.com/video/76979871?dnt=1');
  });
  it('rechaza dominios falsos y esquemas peligrosos', () => {
    assert.equal(getVideoEmbedUrl('javascript:alert(1)//youtube.com/watch?v=dQw4w9WgXcQ'), null);
    assert.equal(getVideoEmbedUrl('https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ'), null);
    assert.equal(getVideoEmbedUrl('https://evil.com/youtube.com/watch?v=dQw4w9WgXcQ'), null);
    assert.equal(getVideoEmbedUrl('https://example.com/video'), null);
  });
});

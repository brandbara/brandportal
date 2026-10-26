import test from 'node:test';
import assert from 'node:assert/strict';
import { LEGAL_CONTENT } from './legal.js';
import { LEGAL_ENTITY, LEGAL_VERSION } from './legalEntity.js';

const PAGINAS = ['notice', 'privacy', 'terms', 'cookies', 'report'];

test('existen las 5 páginas legales en español e inglés', () => {
  for (const pagina of PAGINAS) {
    for (const lang of ['ES', 'EN']) {
      assert.ok(LEGAL_CONTENT[pagina]?.[lang]?.length > 500, `Falta ${pagina} (${lang})`);
    }
  }
});

test('los datos del titular están completos (la calle es opcional: si falta, se dice "a petición")', () => {
  for (const campo of ['name', 'nif', 'city', 'email']) {
    assert.ok(String(LEGAL_ENTITY[campo] || '').trim(), `Falta LEGAL_ENTITY.${campo} en src/data/legalEntity.js`);
  }
  for (const [pagina, idiomas] of Object.entries(LEGAL_CONTENT)) {
    for (const [lang, html] of Object.entries(idiomas)) {
      assert.ok(!html.includes('⟦PENDIENTE⟧'), `${pagina} (${lang}) todavía tiene datos pendientes`);
    }
  }
});

test('los textos no describen cosas que la web no hace', () => {
  const prohibidas = ['Site Inc', 'Stripe', 'Google Cloud', 'SAML', 'Custom Code', 'Standards Privacy', 'Nevada', 'California'];
  for (const [pagina, idiomas] of Object.entries(LEGAL_CONTENT)) {
    for (const [lang, html] of Object.entries(idiomas)) {
      for (const palabra of prohibidas) {
        assert.ok(!html.includes(palabra), `${pagina} (${lang}) menciona «${palabra}»`);
      }
    }
  }
});

test('español e inglés tienen las mismas secciones y el contacto', () => {
  const secciones = (html) => (html.match(/<h3 /g) || []).length;
  for (const pagina of PAGINAS) {
    assert.equal(secciones(LEGAL_CONTENT[pagina].ES), secciones(LEGAL_CONTENT[pagina].EN), `${pagina}: distinto número de secciones`);
    for (const lang of ['ES', 'EN']) {
      assert.ok(LEGAL_CONTENT[pagina][lang].includes(LEGAL_ENTITY.email), `${pagina} (${lang}) no incluye el correo de contacto`);
    }
  }
});

test('la versión legal tiene formato de fecha', () => {
  assert.match(LEGAL_VERSION, /^\d{4}-\d{2}-\d{2}$/);
});

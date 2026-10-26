import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS } from './translations.js';
import { LEGAL_CONTENT } from './legal.js';

// Recorre un objeto de textos y devuelve todas sus "rutas" (p. ej. ui.publish) con su valor.
const leaves = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? leaves(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
  );

const es = new Map(leaves(TRANSLATIONS.ES));
const en = new Map(leaves(TRANSLATIONS.EN));

test('español e inglés tienen exactamente las mismas claves', () => {
  const soloEs = [...es.keys()].filter((k) => !en.has(k));
  const soloEn = [...en.keys()].filter((k) => !es.has(k));
  assert.deepEqual(soloEs, [], `Claves que faltan en inglés: ${soloEs.join(', ')}`);
  assert.deepEqual(soloEn, [], `Claves que faltan en español: ${soloEn.join(', ')}`);
});

test('ningún texto está vacío', () => {
  for (const [lang, mapa] of [['ES', es], ['EN', en]]) {
    const vacios = [...mapa].filter(([, v]) => typeof v === 'string' && v.trim() === '').map(([k]) => k);
    assert.deepEqual(vacios, [], `${lang}: textos vacíos: ${vacios.join(', ')}`);
  }
});

test('las claves con {marcadores} los conservan en los dos idiomas', () => {
  for (const [clave, valorEs] of es) {
    if (typeof valorEs !== 'string') continue;
    const marcadoresEs = (valorEs.match(/\{\w+\}/g) || []).sort();
    const marcadoresEn = ((en.get(clave) || '').match(/\{\w+\}/g) || []).sort();
    assert.deepEqual(marcadoresEn, marcadoresEs, `La clave ${clave} no usa los mismos {marcadores} en ES y EN`);
  }
});

test('los textos legales existen en español e inglés', () => {
  for (const [pagina, idiomas] of Object.entries(LEGAL_CONTENT)) {
    assert.ok(idiomas.ES && idiomas.ES.length > 100, `Falta ${pagina} en español`);
    assert.ok(idiomas.EN && idiomas.EN.length > 100, `Falta ${pagina} en inglés`);
  }
});

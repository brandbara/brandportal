import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { FONT_CATALOG, FONTS, fontStack } from './fonts.js';
import { TRANSLATIONS } from './translations.js';

const css = readFileSync(new URL('../fonts.css', import.meta.url), 'utf8');
const dirFuentes = new URL('../assets/fonts/', import.meta.url);
const licencia = readFileSync(new URL('LICENSE.md', dirFuentes), 'utf8');

// Reglas @font-face del CSS: { familia, peso, archivo }
const reglas = [...css.matchAll(/@font-face\s*\{[^}]*font-family:\s*'([^']+)'[^}]*font-weight:\s*(\d+)[^}]*url\(\.\/assets\/fonts\/([^)]+)\)/g)]
  .map(([, familia, peso, archivo]) => ({ familia, peso: Number(peso), archivo }));

test('el catálogo no tiene nombres repetidos y todos tienen un tipo válido', () => {
  assert.equal(new Set(FONTS).size, FONTS.length);
  for (const f of FONT_CATALOG) assert.ok(['sans', 'serif', 'mono'].includes(f.kind), `${f.name}: tipo desconocido`);
  assert.equal(FONTS[0], 'Inter', 'Inter debe seguir siendo la primera (es la tipografía por defecto)');
});

test('cada tipografía tiene @font-face con los subconjuntos latin y latin-ext en 400 y 700', () => {
  for (const { name } of FONT_CATALOG) {
    for (const peso of [400, 700]) {
      const archivos = reglas.filter((r) => r.familia === name && r.peso === peso).map((r) => r.archivo);
      assert.ok(archivos.some((a) => /-latin-\d+-normal\.woff2$/.test(a)), `${name} ${peso}: falta el subconjunto latin`);
      assert.ok(archivos.some((a) => /-latin-ext-\d+-normal\.woff2$/.test(a)), `${name} ${peso}: falta el subconjunto latin-ext`);
    }
  }
});

test('el CSS no declara familias que no estén en el catálogo', () => {
  const sobrantes = [...new Set(reglas.map((r) => r.familia))].filter((f) => !FONTS.includes(f));
  assert.deepEqual(sobrantes, [], `Familias en fonts.css sin entrada en el catálogo: ${sobrantes.join(', ')}`);
});

test('todos los archivos .woff2 declarados existen y no sobra ninguno', () => {
  const declarados = new Set(reglas.map((r) => r.archivo));
  const faltan = [...declarados].filter((a) => !existsSync(new URL(a, dirFuentes)));
  assert.deepEqual(faltan, [], `Archivos declarados que no existen: ${faltan.join(', ')}`);
  const enDisco = readdirSync(dirFuentes).filter((a) => a.endsWith('.woff2'));
  const huerfanos = enDisco.filter((a) => !declarados.has(a));
  assert.deepEqual(huerfanos, [], `Archivos sin @font-face (pesan en el repositorio sin usarse): ${huerfanos.join(', ')}`);
});

test('cada tipografía tiene descripción en español y en inglés', () => {
  for (const lang of ['ES', 'EN']) {
    const d = TRANSLATIONS[lang].ui.fontDescriptions;
    for (const f of FONTS) assert.ok(typeof d[f] === 'string' && d[f].trim().length > 20, `${lang}: falta la descripción de ${f}`);
    const extra = Object.keys(d).filter((k) => !FONTS.includes(k));
    assert.deepEqual(extra, [], `${lang}: descripciones de tipografías que no existen: ${extra.join(', ')}`);
  }
});

test('cada tipografía figura en LICENSE.md con licencia OFL', () => {
  for (const f of FONTS) {
    const fila = licencia.split('\n').find((l) => l.startsWith(`| ${f} |`));
    assert.ok(fila, `${f}: falta en src/assets/fonts/LICENSE.md`);
    assert.match(fila, /OFL-1\.1/, `${f}: la licencia no es OFL-1.1; revísalo antes de alojarla`);
  }
});

test('fontStack: nombre siempre entre comillas y tipografía genérica de reserva', () => {
  // Sin comillas, «Source Sans 3» sería CSS inválido (un identificador no puede acabar en un número suelto).
  assert.equal(fontStack('Source Sans 3'), '"Source Sans 3", sans-serif');
  assert.equal(fontStack('Playfair Display'), '"Playfair Display", serif');
  assert.equal(fontStack('Roboto Mono'), '"Roboto Mono", monospace');
  assert.equal(fontStack('Inter'), '"Inter", sans-serif');
});

test('fontStack: nombres escritos a mano (tipografía propia) no pueden romper la regla', () => {
  assert.equal(fontStack('Mi "Fuente"; color:red'), '"Mi Fuente color:red", sans-serif');
  assert.equal(fontStack("  Helvetica Neue  "), '"Helvetica Neue", sans-serif');
  assert.equal(fontStack(''), 'sans-serif');
  assert.equal(fontStack(undefined), 'sans-serif');
  assert.equal(fontStack(null), 'sans-serif');
  assert.equal(fontStack('a\\b'), '"ab", sans-serif');
});

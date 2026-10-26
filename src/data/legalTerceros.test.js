import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TERCEROS, HOSTS_IGNORADOS, DEPENDENCIAS_REVISADAS } from './legalTerceros.js';
import { LEGAL_CONTENT } from './legal.js';
import { LEGAL_VERSION } from './legalEntity.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const leer = (...p) => fs.readFileSync(path.join(RAIZ, ...p), 'utf8');

const archivos = (dir, acc = []) => {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) archivos(ruta, acc);
    else if (/\.(jsx?|html|xml|txt|json|css)$/i.test(e.name) && !/\.test\.js$/.test(e.name)) acc.push(ruta);
  }
  return acc;
};

test('todo servicio externo que aparece en el código está registrado en legalTerceros.js', () => {
  const conocidos = [...TERCEROS.flatMap((t) => t.hosts), ...HOSTS_IGNORADOS];
  const encontrados = new Map();
  const ficheros = [...archivos(path.join(RAIZ, 'src')), ...archivos(path.join(RAIZ, 'public')), path.join(RAIZ, 'index.html'), path.join(RAIZ, 'vercel.json')];
  for (const f of ficheros) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/https?:\/\/((?:[a-z0-9-]+\.)+[a-z]{2,})/gi)) {
      encontrados.set(m[1].toLowerCase(), path.relative(RAIZ, f));
    }
  }
  const sinRegistrar = [...encontrados].filter(([host]) => !conocidos.some((c) => host === c || host.endsWith('.' + c)));
  assert.deepEqual(
    sinRegistrar.map(([h, f]) => `${h} (en ${f})`),
    [],
    'Servicio externo nuevo: regístralo en src/data/legalTerceros.js, decláralo en src/data/legal.js y anótalo en docs/LEGAL.md'
  );
});

test('toda librería instalada está revisada desde el punto de vista legal', () => {
  const deps = Object.keys(JSON.parse(leer('package.json')).dependencies || {});
  const sinRevisar = deps.filter((d) => !(d in DEPENDENCIAS_REVISADAS));
  assert.deepEqual(sinRevisar, [], 'Librería nueva: ¿envía datos a terceros o guarda cookies? Añádela a DEPENDENCIAS_REVISADAS (y a TERCEROS si aplica) y revisa los textos legales');
});

test('cada tercero que trata datos o se carga declara en qué apartado de los textos legales aparece', () => {
  for (const t of TERCEROS) {
    if (['encargado', 'incrustado', 'enlace-externo', 'inicio-sesion'].includes(t.tipo)) {
      assert.ok(t.legal.length > 0, `«${t.id}» no indica en qué apartado legal se declara`);
    }
    if (t.tipo === 'encargado') assert.ok(t.dpa, `«${t.id}» es encargado y no indica el estado de su acuerdo (DPA)`);
  }
});

test('los textos legales nombran a los terceros que registramos', () => {
  const texto = Object.values(LEGAL_CONTENT).flatMap((p) => Object.values(p)).join(' ').toLowerCase();
  for (const id of ['supabase', 'vercel', 'github', 'youtube', 'vimeo', 'tally', 'google']) {
    assert.ok(texto.includes(id), `Los textos legales no mencionan a ${id}`);
  }
});

test('la versión de los textos legales consta en el registro docs/LEGAL.md', () => {
  assert.ok(leer('docs', 'LEGAL.md').includes(LEGAL_VERSION), `Añade la versión ${LEGAL_VERSION} al historial de docs/LEGAL.md`);
});

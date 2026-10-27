import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { DRAFT_KEY, safeGet, safeSet, safeRemove, safeGetJSON, safeSetJSON } from './storage.js';

// Almacenamiento falso que funciona como localStorage
const memoria = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
  };
};

// Almacenamiento falso que falla siempre (bloqueado) o al escribir (lleno)
const bloqueado = () => ({
  getItem: () => { throw new DOMException('The operation is insecure.', 'SecurityError'); },
  setItem: () => { throw new DOMException('The operation is insecure.', 'SecurityError'); },
  removeItem: () => { throw new DOMException('The operation is insecure.', 'SecurityError'); },
});
const lleno = () => ({
  ...memoria(),
  setItem: () => { throw new DOMException('The quota has been exceeded.', 'QuotaExceededError'); },
});

describe('almacenamiento normal', () => {
  it('guarda, lee y borra', () => {
    const s = memoria();
    assert.equal(safeSet('a', 'hola', s), true);
    assert.equal(safeGet('a', s), 'hola');
    assert.equal(safeRemove('a', s), true);
    assert.equal(safeGet('a', s), null);
  });

  it('guarda y lee JSON, y devuelve el valor por defecto si no hay nada', () => {
    const s = memoria();
    assert.equal(safeSetJSON('d', { language: 'EN', n: [1, 2] }, s), true);
    assert.deepEqual(safeGetJSON('d', null, s), { language: 'EN', n: [1, 2] });
    assert.deepEqual(safeGetJSON('no-existe', { vacio: true }, s), { vacio: true });
    assert.equal(safeGetJSON('no-existe', undefined, s), null); // sin valor por defecto indicado, devuelve null
  });

  it('la clave del borrador no cambia (la usa también ErrorBoundary.jsx)', () => {
    assert.equal(DRAFT_KEY, 'brandPortalData');
  });
});

describe('almacenamiento bloqueado: nunca lanza', () => {
  it('leer devuelve null / el valor por defecto', () => {
    const s = bloqueado();
    assert.equal(safeGet('a', s), null);
    assert.deepEqual(safeGetJSON('a', { x: 1 }, s), { x: 1 });
  });

  it('escribir y borrar devuelven false', () => {
    const s = bloqueado();
    assert.equal(safeSet('a', '1', s), false);
    assert.equal(safeSetJSON('a', { x: 1 }, s), false);
    assert.equal(safeRemove('a', s), false);
  });
});

describe('almacenamiento lleno', () => {
  it('escribir devuelve false pero leer sigue funcionando', () => {
    const s = lleno();
    assert.equal(safeSet('a', '1', s), false);
    assert.equal(safeGet('a', s), null);
  });
});

describe('valores raros', () => {
  it('un JSON corrupto o vacío devuelve el valor por defecto', () => {
    const s = memoria();
    s.setItem('malo', '{"a":');
    s.setItem('vacio', '');
    assert.deepEqual(safeGetJSON('malo', { ok: 1 }, s), { ok: 1 });
    assert.deepEqual(safeGetJSON('vacio', { ok: 2 }, s), { ok: 2 });
  });

  it('un valor que no se puede convertir a JSON no lanza (referencia circular, undefined, función)', () => {
    const s = memoria();
    const circular = {}; circular.yo = circular;
    assert.equal(safeSetJSON('c', circular, s), false);
    assert.equal(safeSetJSON('u', undefined, s), false);
    assert.equal(safeSetJSON('f', () => 1, s), false);
    assert.equal(safeGet('c', s), null);
  });

  it('el JSON "null" y los números se devuelven tal cual (el que llama decide)', () => {
    const s = memoria();
    s.setItem('n', 'null');
    s.setItem('num', '5');
    assert.equal(safeGetJSON('n', 'por-defecto', s), null);
    assert.equal(safeGetJSON('num', 'por-defecto', s), 5);
  });
});

describe('sin almacenamiento global (como un navegador con el almacenamiento desactivado)', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  afterEach(() => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  });

  it('si solo acceder a localStorage lanza un error de seguridad, devuelve null / false', () => {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new DOMException('denied', 'SecurityError'); } });
    assert.equal(safeGet('a'), null);
    assert.equal(safeSet('a', '1'), false);
    assert.equal(safeRemove('a'), false);
    assert.deepEqual(safeGetJSON('a', { x: 1 }), { x: 1 });
  });

  it('si no existe localStorage (sin navegador), devuelve null / false', () => {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: undefined, writable: true });
    assert.equal(safeGet('a'), null);
    assert.equal(safeSet('a', '1'), false);
  });

  it('usa el localStorage global cuando existe', () => {
    const s = memoria();
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: s, writable: true });
    assert.equal(safeSet('a', 'x'), true);
    assert.equal(s.getItem('a'), 'x');
    assert.equal(safeGet('a'), 'x');
  });
});

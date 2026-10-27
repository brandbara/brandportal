// Catálogo de tipografías del editor. Todas se sirven desde BrandBara (ver src/fonts.css y
// src/assets/fonts/LICENSE.md): ninguna se pide a Google. Para añadir una:
//   1) copiar sus archivos .woff2 y declarar sus @font-face en src/fonts.css,
//   2) añadirla aquí (con su tipo) y escribir su descripción en español e inglés (translations.js),
//   3) anotar su licencia en src/assets/fonts/LICENSE.md.
// La prueba src/data/fonts.test.js falla si falta alguna de esas piezas.

// kind: 'sans' | 'serif' | 'mono'. Decide la tipografía genérica de reserva (si el archivo no carga).
export const FONT_CATALOG = [
  { name: 'Inter', kind: 'sans' },
  { name: 'Montserrat', kind: 'sans' },
  { name: 'Open Sans', kind: 'sans' },
  { name: 'Roboto', kind: 'sans' },
  { name: 'Space Mono', kind: 'mono' },
  { name: 'Nunito', kind: 'sans' },
  { name: 'Outfit', kind: 'sans' },
  { name: 'Work Sans', kind: 'sans' },
  { name: 'Poppins', kind: 'sans' },
  { name: 'Lato', kind: 'sans' },
  { name: 'Noto Sans', kind: 'sans' },
  { name: 'Roboto Condensed', kind: 'sans' },
  { name: 'Oswald', kind: 'sans' },
  { name: 'Roboto Mono', kind: 'mono' },
  { name: 'Source Sans 3', kind: 'sans' },
  { name: 'Raleway', kind: 'sans' },
  { name: 'Playfair Display', kind: 'serif' },
  { name: 'Merriweather', kind: 'serif' },
  { name: 'Lora', kind: 'serif' },
  { name: 'Rubik', kind: 'sans' },
];

export const FONTS = FONT_CATALOG.map((f) => f.name);

const GENERIC = { sans: 'sans-serif', serif: 'serif', mono: 'monospace' };

// Valor para `font-family` de una tipografía: el nombre SIEMPRE entre comillas (un nombre como
// «Source Sans 3» sin comillas es CSS inválido y el navegador lo ignoraría) y una genérica de reserva
// para que, si el archivo no carga, el texto no pase a la serif por defecto del navegador.
// Admite también nombres escritos a mano por el usuario (tipografía propia): se limpian los caracteres
// que romperían la regla.
export function fontStack(name) {
  const clean = String(name ?? '').replace(/["'\\;{}<>\r\n]/g, '').trim();
  const kind = FONT_CATALOG.find((f) => f.name === clean)?.kind ?? 'sans';
  return clean ? `"${clean}", ${GENERIC[kind]}` : GENERIC[kind];
}

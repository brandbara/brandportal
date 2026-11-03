// Dibujo de la tarjeta de vista previa de un portal (1200 × 630 px).
// Solo construye la descripción de la tarjeta (sin dibujarla): así se puede probar sin cargar el generador de imágenes.
import { BRANDBARA_WORDMARK_SVG, BRANDBARA_WORDMARK_SIZE } from './brandData.js';
import { drawableName, fitInside, luminance, normalizeHex, toDataUri } from './preview.js';

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;
const BRAND_DARK = '#0f111a';
const PAD = 64;

// Elemento en el formato que entiende el generador (equivale a JSX, sin necesitar compilarlo).
const h = (type, style, children, extra = {}) => ({ type, props: { style, children, ...extra } });

const wordmarkUri = `data:image/svg+xml;base64,${btoa(BRANDBARA_WORDMARK_SVG)}`;

const nameFontSize = (name) => {
  const n = Array.from(name).length;
  if (n <= 10) return 132;
  if (n <= 16) return 108;
  if (n <= 24) return 84;
  if (n <= 36) return 64;
  return 52;
};

const imageEl = (img, width, height, style = {}) => ({
  type: 'img',
  props: { src: toDataUri(img.bytes, img.type), width, height, style: { width, height, ...style } },
});

// preview: resultado de extractPreview. images: { hero, logo } ya descargadas y validadas (o ausentes).
export const buildCard = (preview, images = {}) => {
  const isOk = preview.kind === 'ok';
  const name = drawableName(preview.name);

  const base = (isOk && normalizeHex(preview.background)) || BRAND_DARK;
  const hasHero = Boolean(images.hero);
  const lightBase = !hasHero && luminance(base) > 0.6;
  const textColor = lightBase ? '#0f111a' : '#ffffff';
  const subtle = lightBase ? 'rgba(15,17,26,0.65)' : 'rgba(255,255,255,0.78)';

  const layers = [];
  if (hasHero) {
    layers.push(imageEl(images.hero, CARD_WIDTH, CARD_HEIGHT, { position: 'absolute', top: 0, left: 0, objectFit: 'cover' }));
    layers.push(h('div', {
      position: 'absolute', top: 0, left: 0, width: CARD_WIDTH, height: CARD_HEIGHT, display: 'flex',
      backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.18) 100%)',
    }, []));
  }

  // Fila superior: logotipo del portal sobre una pastilla blanca (legible sobre cualquier fondo).
  const top = [];
  if (isOk && images.logo) {
    const size = fitInside(images.logo.width, images.logo.height, 380, 120);
    top.push(h('div', {
      display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff',
      borderRadius: 28, padding: 24,
    }, [imageEl(images.logo, size.width, size.height)]));
  }

  // Fila inferior: etiqueta + nombre a la izquierda; marca BrandBara a la derecha.
  const label = 'BRAND PORTAL';
  const nameBlock = [
    h('div', { display: 'flex', fontSize: 30, fontWeight: 700, letterSpacing: 6, color: subtle }, label),
  ];
  if (name) {
    nameBlock.push(h('div', {
      display: 'flex', marginTop: 12, fontSize: nameFontSize(name), fontWeight: 700, lineHeight: 1.05,
      color: textColor, letterSpacing: -2, wordBreak: 'break-word',
    }, name));
  }

  const wm = fitInside(BRANDBARA_WORDMARK_SIZE.width, BRANDBARA_WORDMARK_SIZE.height, 230, 46);
  const bottom = h('div', { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }, [
    h('div', { display: 'flex', flexDirection: 'column', maxWidth: 800 }, nameBlock),
    h('div', {
      display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 999, padding: '18px 30px',
    }, [{ type: 'img', props: { src: wordmarkUri, width: wm.width, height: wm.height, style: { width: wm.width, height: wm.height } } }]),
  ]);

  return h('div', {
    position: 'relative', display: 'flex', width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: base,
    fontFamily: 'Inter, InterExt',
  }, [
    ...layers,
    h('div', {
      position: 'absolute', top: 0, left: 0, width: CARD_WIDTH, height: CARD_HEIGHT, display: 'flex',
      flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', padding: PAD,
    }, [h('div', { display: 'flex', minHeight: 1 }, top), bottom]),
  ]);
};

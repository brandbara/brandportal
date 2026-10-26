// Datos del titular que aparecen en los textos legales (Aviso legal, Privacidad, Términos, Cookies y Denuncias).
// Se rellenan aquí UNA vez y se propagan a todos los textos. Si algo queda vacío, los textos muestran
// «⟦PENDIENTE⟧» y la prueba automática (src/data/legal.test.js) falla: así no se publica nada a medias.
export const LEGAL_ENTITY = {
  name: '',                                // nombre y apellidos del titular (autónomo)
  nif: '',                                 // NIF
  address: '',                             // domicilio de la actividad (es público en el Aviso legal)
  email: 'brandbara.hello@gmail.com',      // contacto para todo: legal, privacidad y denuncias
  domain: 'brandbara.com',
};

// Versión de los textos legales. Cambiarla cuando se modifiquen de forma relevante
// (se guarda junto a la aceptación de cada usuario).
export const LEGAL_VERSION = '2026-10-26';
export const LEGAL_DATE = { ES: '26/10/2026', EN: '26 Oct 2026' };

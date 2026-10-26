// Datos del titular que aparecen en los textos legales (Aviso legal, Privacidad, Términos, Cookies y Denuncias).
// Se rellenan aquí UNA vez y se propagan a todos los textos. Si algo queda vacío, los textos muestran
// «⟦PENDIENTE⟧» y la prueba automática (src/data/legal.test.js) falla: así no se publica nada a medias.
export const LEGAL_ENTITY = {
  name: 'Nazario Moreno Muriel',           // nombre y apellidos del titular (autónomo)
  nif: '26252204G',                        // NIF
  // Domicilio: de momento NO se publica la calle (es la vivienda del titular). Mientras esté vacío, el Aviso legal dice
  // que se facilita a las autoridades y a quien acredite interés legítimo, por correo. Cuando exista una oficina
  // virtual o la dirección que indique la gestoría, ponerla aquí y se muestra sola.
  address: '',
  city: 'Madrid',                          // solo la ciudad (fuero de los tribunales)
  email: 'brandbara.hello@gmail.com',      // contacto para todo: legal, privacidad y denuncias
  domain: 'brandbara.com',
};

// Versión de los textos legales. Cambiarla cuando se modifiquen de forma relevante
// (se guarda junto a la aceptación de cada usuario).
export const LEGAL_VERSION = '2026-10-26.3';
export const LEGAL_DATE = { ES: '26/10/2026', EN: '26 Oct 2026' };

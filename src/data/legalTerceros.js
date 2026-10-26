// Registro legal de terceros y dependencias de BrandBara.
// Cada servicio externo que la web contacte, cargue o enlace, y cada librería que se instale, debe estar aquí
// con el apartado de los textos legales (src/data/legal.js) donde se declara. La prueba automática
// (legalTerceros.test.js) falla si aparece un servicio o una dependencia que no figure: así nada entra sin pasar por legal.
// Proceso completo: docs/LEGAL.md

// tipo: 'encargado'      → trata datos de usuarios por encargo nuestro (necesita acuerdo de encargado, DPA)
//       'incrustado'     → se carga dentro de un portal, solo si el visitante lo pide (clic)
//       'enlace-externo' → solo un enlace que abre otra web (no se carga nada hasta que el usuario lo pulsa)
//       'inicio-sesion'  → proveedor de acceso opcional: el usuario sale a su web y vuelve; actúa como responsable independiente
//       'enlace-sin-carga' → ejemplos o enlaces que el propio usuario pega; BrandBara no los contacta por su cuenta
//       'propio'         → nuestro dominio
export const TERCEROS = [
  { id: 'supabase', tipo: 'encargado', hosts: ['supabase.co'], para: 'Autenticación, base de datos y archivos (UE, Irlanda)', legal: ['privacidad §4', 'privacidad §8', 'términos Anexo A'], dpa: 'pendiente de aceptar en el panel' },
  { id: 'vercel', tipo: 'encargado', hosts: [], para: 'Alojamiento de la web (EE. UU.)', legal: ['privacidad §4', 'privacidad §8'], dpa: 'pendiente de aceptar en el panel' },
  { id: 'github', tipo: 'encargado', hosts: [], para: 'Código y copias de seguridad cifradas de la base de datos (EE. UU.)', legal: ['privacidad §4', 'privacidad §8', 'términos §11'], dpa: 'pendiente de aceptar en el panel' },
  { id: 'google-acceso', tipo: 'inicio-sesion', hosts: ['accounts.google.com'], para: 'Acceso opcional «Continuar con Google» (redirección; nos envía nombre, correo, foto e identificador)', legal: ['privacidad §2', 'privacidad §4', 'privacidad §8', 'términos §3', 'cookies §3'] },
  { id: 'youtube', tipo: 'incrustado', hosts: ['youtube.com', 'youtube-nocookie.com', 'youtu.be'], para: 'Vídeos en portales, solo tras pulsar «Reproducir»', legal: ['privacidad §3', 'cookies §2'] },
  { id: 'vimeo', tipo: 'incrustado', hosts: ['vimeo.com'], para: 'Vídeos en portales, solo tras pulsar «Reproducir» (con dnt=1)', legal: ['privacidad §3', 'cookies §2'] },
  { id: 'tally', tipo: 'enlace-externo', hosts: ['tally.so'], para: 'Encuesta opcional de las funciones PRO (se abre solo si el usuario la pulsa)', legal: ['privacidad §2', 'privacidad §4', 'términos §4'] },
  { id: 'enlaces-de-ejemplo', tipo: 'enlace-sin-carga', hosts: ['drive.google.com', 'figma.com', 'fonts.google.com'], para: 'Ejemplos en campos de texto y enlace a la ficha de una tipografía; no se carga nada', legal: [] },
  { id: 'brandbara', tipo: 'propio', hosts: ['brandbara.com'], para: 'Dominio propio', legal: [] },
];

// Direcciones que aparecen en el código pero no son un servicio (espacios de nombres, textos de licencia, ejemplos).
export const HOSTS_IGNORADOS = ['w3.org', 'sitemaps.org', 'openfontlicense.org', 'example.com'];

// Librerías instaladas (dependencies de package.json) revisadas desde el punto de vista legal.
// Si se añade una nueva: ¿envía datos a un tercero? ¿guarda cookies o almacenamiento? ¿cambia lo que decimos en Privacidad o Cookies?
export const DEPENDENCIAS_REVISADAS = {
  '@supabase/supabase-js': 'Cliente de Supabase (tercero «supabase»)',
  'browser-image-compression': 'Comprime imágenes en el navegador; no envía nada a terceros',
  'dompurify': 'Limpia HTML en el navegador; no envía nada a terceros',
  'idb-keyval': 'Guarda imágenes del borrador en el navegador (IndexedDB); declarado en Cookies §1',
  'lucide-react': 'Iconos; se incluyen en nuestra web',
  'react': 'Interfaz',
  'react-dom': 'Interfaz',
  'react-router-dom': 'Rutas',
};

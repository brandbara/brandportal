// Textos legales de BrandBara (Aviso legal, Privacidad, Términos, Cookies y Denuncias).
// Describen lo que la web hace HOY. Cada vez que se active una función nueva (inicio con Google, avisos por email,
// cobros, «Invítame a un café»…) hay que actualizar el texto correspondiente ANTES de activarla, y subir la versión
// en legalEntity.js. Los datos del titular viven en legalEntity.js.
import { LEGAL_ENTITY as E, LEGAL_DATE } from './legalEntity.js';

const PENDING = '⟦PENDIENTE⟧';
const v = (x) => (x && String(x).trim()) || PENDING;
const mail = `<a class="text-indigo-500 hover:underline font-bold" href="mailto:${E.email}">${E.email}</a>`;
const addressLine = {
  ES: E.address ? E.address : `a disposición de las autoridades competentes y de quien acredite un interés legítimo, previa solicitud a ${mail}`,
  EN: E.address ? E.address : `available to the competent authorities and to anyone with a legitimate interest, on request to ${mail}`,
};

const page = (lang, title, sections) => `
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-black mb-2">${title}</h2>
      <p class="text-xs font-mono opacity-50 uppercase tracking-widest">${lang === 'ES' ? 'Última actualización' : 'Last updated'}: ${LEGAL_DATE[lang]}</p>
    </div>
    ${sections.join('')}
  </div>`;
const sec = (title, ...body) => `<div><h3 class="text-lg font-bold mb-2">${title}</h3>${body.join('')}</div>`;
const p = (text) => `<p class="mb-2">${text}</p>`;
const ul = (items) => `<ul class="list-disc pl-5 space-y-2 mb-2">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const table = (heads, rows) => `
  <div class="overflow-x-auto mb-2">
    <table class="w-full text-left text-xs border-collapse">
      <thead><tr>${heads.map((h) => `<th class="py-2 pr-4 font-bold border-b border-slate-300/60">${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td class="py-2 pr-4 align-top border-b border-slate-200/60">${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  </div>`;

// ──────────────────────────────── AVISO LEGAL ────────────────────────────────
const noticeES = page('ES', 'Aviso Legal', [
  sec('1. Objeto',
    p('BrandBara es una herramienta en línea para crear portales de marca interactivos y publicarlos en una dirección propia. Actualmente se ofrece en fase beta, con plazas limitadas.')),
  sec('2. Acceso y uso',
    p('El acceso a la web es libre. El uso de la herramienta exige crear una cuenta y aceptar los Términos de uso. El titular puede limitar o suspender el acceso, en particular cuando se agoten las plazas de la beta o se incumplan los Términos.')),
  sec('3. Propiedad intelectual e industrial',
    p('El código, el diseño, los textos, el nombre y el logotipo «BrandBara» pertenecen al titular o a sus licenciantes. Los contenidos de cada portal (logotipos, imágenes, textos, tipografías, vídeos) pertenecen a quien los publica, que responde de tener derechos sobre ellos. Queda prohibida su reproducción, distribución o transformación sin autorización, salvo lo permitido por la ley.')),
  sec('4. Contenidos de usuarios y denuncias',
    p('Los portales públicos los crean y publican los usuarios; BrandBara no los revisa antes de su publicación. Si crees que un contenido es ilícito o infringe tus derechos, puedes notificarlo en el apartado «Denunciar contenido» o escribiendo a ' + mail + '.')),
  sec('5. Enlaces',
    p('Los portales pueden contener enlaces a sitios de terceros. BrandBara no controla esos sitios ni responde de su contenido o sus prácticas.')),
  sec('6. Garantías y responsabilidad',
    p('El servicio se presta «tal cual» y en fase beta, sin garantía de disponibilidad continua. El titular no responde de interrupciones, errores ni de los contenidos publicados por los usuarios, salvo en lo que la ley no permita excluir.')),
  sec('7. Protección de datos y cookies',
    p('El tratamiento de datos personales se describe en la Política de privacidad, y el uso de almacenamiento en tu dispositivo, en la Política de cookies.')),
  sec('8. Punto de contacto (Reglamento de Servicios Digitales)',
    p(`Para autoridades y usuarios: ${mail}, en español e inglés.`)),
  sec('9. Legislación y jurisdicción',
    p(`Este aviso se rige por la ley española. Si eres consumidor, será competente el tribunal que la ley te reconozca. En los demás casos, los juzgados y tribunales de ${v(E.city)} (España).`)),
  sec('10. Datos identificativos del titular',
    p(`El sitio web ${E.domain} y la aplicación asociada son titularidad de:`),
    ul([
      `<strong>Titular:</strong> ${v(E.name)} (autónomo)`,
      `<strong>NIF:</strong> ${v(E.nif)}`,
      `<strong>Domicilio:</strong> ${addressLine.ES}`,
      `<strong>Correo electrónico de contacto:</strong> ${mail}`,
    ])),
]);

const noticeEN = page('EN', 'Legal Notice', [
  sec('1. Purpose',
    p('BrandBara is an online tool to create interactive brand portals and publish them at your own web address. It is currently offered as a beta, with limited places.')),
  sec('2. Access and use',
    p('Access to the website is free. Using the tool requires creating an account and accepting the Terms of Use. The owner may limit or suspend access, in particular when the beta places run out or the Terms are breached.')),
  sec('3. Intellectual and industrial property',
    p('The code, design, texts, name and logo of “BrandBara” belong to the owner or its licensors. The content of each portal (logos, images, texts, fonts, videos) belongs to whoever publishes it, who is responsible for holding the rights to it. Reproduction, distribution or transformation without permission is prohibited, except as allowed by law.')),
  sec('4. User content and reports',
    p('Public portals are created and published by users; BrandBara does not review them before publication. If you believe content is unlawful or infringes your rights, you can report it through “Report content” or by writing to ' + mail + '.')),
  sec('5. Links',
    p('Portals may contain links to third-party sites. BrandBara does not control those sites and is not responsible for their content or practices.')),
  sec('6. Warranties and liability',
    p('The service is provided “as is” and in beta, with no guarantee of continuous availability. The owner is not liable for interruptions, errors or content published by users, except where the law does not allow exclusion.')),
  sec('7. Data protection and cookies',
    p('Personal data processing is described in the Privacy Policy, and the use of storage on your device in the Cookie Policy.')),
  sec('8. Point of contact (Digital Services Act)',
    p(`For authorities and users: ${mail}, in Spanish and English.`)),
  sec('9. Governing law and jurisdiction',
    p(`This notice is governed by Spanish law. If you are a consumer, the court that the law grants you will have jurisdiction. In all other cases, the courts of ${v(E.city)} (Spain).`)),
  sec('10. Owner identification',
    p(`The website ${E.domain} and the associated application are owned by:`),
    ul([
      `<strong>Owner:</strong> ${v(E.name)} (self-employed)`,
      `<strong>Tax ID (NIF):</strong> ${v(E.nif)}`,
      `<strong>Address:</strong> ${addressLine.EN}`,
      `<strong>Contact email:</strong> ${mail}`,
    ])),
]);

// ──────────────────────────────── PRIVACIDAD ────────────────────────────────
const privacyES = page('ES', 'Política de Privacidad', [
  sec('1. Responsable del tratamiento',
    p(`${v(E.name)}, titular de BrandBara (identificación completa en el Aviso legal, apartado 10). Correo: ${mail}. No hay delegado de protección de datos designado.`)),
  sec('2. Qué datos tratamos, para qué y con qué base',
    table(['Datos', 'Finalidad', 'Base jurídica (RGPD art. 6.1)', 'Conservación'], [
      ['Email y nombre; si entras con Google, también tu foto de perfil y el identificador de tu cuenta de Google. No usamos contraseñas', 'Crear y gestionar tu cuenta; enviarte el enlace de acceso y los correos del servicio', 'b) ejecución del contrato', 'Mientras la cuenta esté activa'],
      ['Versión y fecha en que aceptas los Términos y la Política de Privacidad', 'Poder demostrar que los aceptaste', 'f) interés legítimo en acreditar tu aceptación', 'Mientras la cuenta esté activa'],
      ['Datos de perfil: plan, estado (activo, en cola o en pausa), faltas, espacio usado, fechas de entrada en cola y de activación', 'Aplicar los límites de la beta, la cola de plazas y las normas de uso', 'b) contrato; f) interés legítimo en evitar abusos', 'Mientras la cuenta esté activa'],
      ['Contenido de tu portal: dirección, nombre de marca, textos, imágenes, vídeos, enlaces, tipografías; huella (hash) de la contraseña del portal si la activas', 'Alojar y mostrar tu portal', 'b) ejecución del contrato', 'Hasta que lo borres o elimines la cuenta'],
      ['Datos técnicos de conexión (IP, fecha, navegador) en los servidores de alojamiento', 'Seguridad y prevención de abusos', 'f) interés legítimo', 'Según las políticas del proveedor de alojamiento'],
      ['Mensajes que nos envías', 'Atender tu consulta o denuncia', 'b) contrato o f) interés legítimo', 'El tiempo necesario para atenderla'],
      ['Respuestas a la encuesta de las funciones PRO (opcional, en Tally), incluidos los datos de contacto que decidas escribir', 'Mejorar el producto y, si lo indicas, avisarte del lanzamiento', 'a) consentimiento', 'Hasta que lo retires o dejemos de necesitarlas'],
    ]),
    p('No tomamos decisiones automatizadas con efectos jurídicos sobre ti. La asignación de plazas de la beta se hace por orden de llegada y no implica elaboración de perfiles.')),
  sec('3. Visitantes de portales públicos',
    p('BrandBara no instala cookies ni herramientas de analítica en los portales y no registra quién los visita para compartirlo con el dueño del portal. Al cargar un portal, los servidores de alojamiento registran datos técnicos como la IP, solo por seguridad. Si el portal tiene contraseña, el navegador calcula la huella de lo que escribes y la compara con la guardada. Los vídeos de YouTube o Vimeo que un usuario incruste solo se cargan cuando el visitante pulsa «reproducir»; a partir de ahí los sirve ese tercero (ver Política de cookies).')),
  sec('4. Destinatarios y encargados del tratamiento',
    ul([
      '<strong>Supabase</strong> (autenticación, incluido el envío de los correos de acceso, base de datos y archivos): región de la UE (Irlanda).',
      '<strong>Vercel</strong> (alojamiento de la web): Estados Unidos.',
      '<strong>GitHub</strong> (código y copias de seguridad cifradas de la base de datos): Estados Unidos.',
      '<strong>Tally</strong> (encuesta opcional de las funciones PRO): solo si decides abrir el enlace y responderla; entonces lo que escribas lo recoge Tally por cuenta nuestra. No es necesaria para usar BrandBara.',
      '<strong>Google</strong> (acceso opcional): solo si eliges «Continuar con Google». Te identificas en la página de Google y nos envía tu nombre, correo, foto de perfil e identificador de cuenta. Google trata tus datos como responsable independiente, según su propia política de privacidad. Si entras con el enlace del correo, no se contacta con Google.',
    ]),
    p('No vendemos tus datos ni los usamos para publicidad. Podemos comunicar datos a autoridades cuando una norma o una orden lo exija.')),
  sec('5. Conservación y eliminación de la cuenta',
    p('Puedes eliminar tu cuenta desde la aplicación: se borran tus archivos, tu usuario, tu perfil y tu portal. Las copias de seguridad cifradas de la base de datos se conservan 30 días y pueden contener tus datos hasta que se renueven. Los archivos subidos (imágenes) no se incluyen en esas copias.')),
  sec('6. Tus derechos',
    p(`Puedes pedir acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${mail}. Respondemos en el plazo de un mes. Si no estás conforme, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es). Puedes eliminar la cuenta tú mismo desde la aplicación; la exportación de tus datos, por ahora, se hace por correo.`)),
  sec('7. Menores',
    p('BrandBara no está dirigido a menores de 14 años. En España, los menores de 14 años no pueden consentir por sí mismos el tratamiento de sus datos. Si detectamos una cuenta de un menor de 14 años, la eliminaremos.')),
  sec('8. Transferencias internacionales',
    p('Vercel y GitHub pueden tratar datos en Estados Unidos. Si entras con Google, Google puede tratar los datos de tu cuenta de Google en Estados Unidos según su propia política. Las transferencias se amparan en las garantías que ofrece cada proveedor (Marco de Privacidad de Datos UE–EE. UU. o cláusulas contractuales tipo de la Comisión Europea).')),
  sec('9. Seguridad y brechas',
    p('Aplicamos controles de acceso por cuenta a nivel de base de datos, límites de uso en el servidor, enlaces y vídeos restringidos, y copias de seguridad cifradas. Si hubiera una brecha con riesgo para tus derechos, la notificaremos a la AEPD en el plazo legal de 72 horas y te informaremos si el riesgo es alto.')),
  sec('10. Cola de espera y avisos',
    p('Si la beta está completa, guardamos tu posición en la cola. Por ahora no enviamos avisos por email cuando se libera una plaza.')),
  sec('11. Contenido con datos de terceros',
    p('Si tu portal incluye datos personales de otras personas (por ejemplo, fotografías de un equipo), tú eres el responsable de ese tratamiento y BrandBara actúa como encargado, según el Anexo A de los Términos de uso.')),
  sec('12. Cambios',
    p('Si cambiamos esta política de forma relevante, te avisaremos en la aplicación antes de que se aplique.')),
]);

const privacyEN = page('EN', 'Privacy Policy', [
  sec('1. Data controller',
    p(`${v(E.name)}, owner of BrandBara (full identification in the Legal Notice, section 10). Email: ${mail}. No data protection officer has been appointed.`)),
  sec('2. What data we process, why and on what legal basis',
    table(['Data', 'Purpose', 'Legal basis (GDPR art. 6.1)', 'Retention'], [
      ['Email and name; if you sign in with Google, also your profile picture and your Google account identifier. We do not use passwords', 'Create and manage your account; send you the sign-in link and service emails', '(b) performance of a contract', 'While the account is active'],
      ['Version and date on which you accept the Terms and the Privacy Policy', 'Be able to show that you accepted them', '(f) legitimate interest in evidencing your acceptance', 'While the account is active'],
      ['Profile data: plan, status (active, queued or paused), strikes, storage used, queue entry and activation dates', 'Apply beta limits, the places queue and the usage rules', '(b) contract; (f) legitimate interest in preventing abuse', 'While the account is active'],
      ['Your portal content: address, brand name, texts, images, videos, links, fonts; hash of the portal password if you enable it', 'Host and display your portal', '(b) performance of a contract', 'Until you delete it or delete your account'],
      ['Technical connection data (IP, date, browser) on the hosting servers', 'Security and abuse prevention', '(f) legitimate interest', 'According to the hosting provider’s policies'],
      ['Messages you send us', 'Handle your enquiry or report', '(b) contract or (f) legitimate interest', 'As long as needed to handle it'],
      ['Answers to the optional PRO features survey (on Tally), including any contact details you choose to write', 'Improve the product and, if you ask, tell you about the launch', '(a) consent', 'Until you withdraw it or we no longer need them'],
    ]),
    p('We do not make automated decisions with legal effects about you. Beta places are assigned in order of arrival and involve no profiling.')),
  sec('3. Visitors to public portals',
    p('BrandBara installs no cookies or analytics tools on portals and does not record who visits them to share with the portal owner. When a portal loads, the hosting servers log technical data such as the IP address, for security only. If the portal has a password, the browser computes a hash of what you type and compares it with the stored one. YouTube or Vimeo videos that a user embeds only load when the visitor presses “play”; from then on they are served by that third party (see Cookie Policy).')),
  sec('4. Recipients and processors',
    ul([
      '<strong>Supabase</strong> (authentication, including sending the sign-in emails, database and files): EU region (Ireland).',
      '<strong>Vercel</strong> (website hosting): United States.',
      '<strong>GitHub</strong> (code and encrypted database backups): United States.',
      '<strong>Tally</strong> (optional PRO features survey): only if you choose to open the link and answer it; then what you write is collected by Tally on our behalf. It is not needed to use BrandBara.',
      '<strong>Google</strong> (optional sign-in): only if you choose “Continue with Google”. You identify yourself on Google’s page and it sends us your name, email, profile picture and account identifier. Google processes your data as an independent controller under its own privacy policy. If you sign in with the emailed link, Google is not contacted.',
    ]),
    p('We do not sell your data or use it for advertising. We may disclose data to authorities when a rule or an order requires it.')),
  sec('5. Retention and account deletion',
    p('You can delete your account from the application: your files, user, profile and portal are erased. Encrypted database backups are kept for 30 days and may contain your data until they are renewed. Uploaded files (images) are not included in those backups.')),
  sec('6. Your rights',
    p(`You can request access, rectification, erasure, objection, restriction and portability by writing to ${mail}. We reply within one month. If you are not satisfied, you can complain to the Spanish Data Protection Agency (aepd.es). You can delete your account yourself from the application; exporting your data is currently done by email.`)),
  sec('7. Minors',
    p('BrandBara is not directed at children under 14. In Spain, children under 14 cannot consent to the processing of their data themselves. If we detect an account belonging to a child under 14, we will delete it.')),
  sec('8. International transfers',
    p('Vercel and GitHub may process data in the United States. If you sign in with Google, Google may process your Google account data in the United States under its own policy. Transfers rely on the safeguards each provider offers (EU–US Data Privacy Framework or the European Commission’s standard contractual clauses).')),
  sec('9. Security and breaches',
    p('We apply per-account access controls at database level, server-side usage limits, restricted links and videos, and encrypted backups. If a breach put your rights at risk, we will notify the Spanish Data Protection Agency within the legal 72 hours and inform you if the risk is high.')),
  sec('10. Waiting list and notices',
    p('If the beta is full, we keep your place in the queue. For now we do not send emails when a place becomes available.')),
  sec('11. Content with third-party data',
    p('If your portal includes personal data of other people (for example, photographs of a team), you are the controller of that processing and BrandBara acts as processor, according to Annex A of the Terms of Use.')),
  sec('12. Changes',
    p('If we change this policy in a relevant way, we will tell you in the application before it applies.')),
]);

// ──────────────────────────────── TÉRMINOS DE USO ────────────────────────────────
const termsES = page('ES', 'Términos de Uso', [
  sec('1. Quiénes somos y qué aceptas',
    p(`Estos Términos regulan el uso de BrandBara, ofrecido por ${v(E.name)} (datos completos en el Aviso legal). Al crear una cuenta los aceptas; guardamos la versión y la fecha de tu aceptación. Si no estás de acuerdo, no uses la herramienta.`)),
  sec('2. Quién puede usar BrandBara',
    p('Debes tener al menos 14 años. Si eres menor de edad, declaras que cuentas con la autorización de tus padres o tutores cuando la ley la exija. Una cuenta por persona y datos de registro veraces. Si actúas en nombre de una empresa, declaras tener poder para obligarla.')),
  sec('3. Tu cuenta',
    p(`Accedes con tu cuenta de Google o con un enlace que te enviamos por correo; no usamos contraseñas. Si entras con Google usando un correo que ya tenía cuenta en BrandBara, accedes a esa misma cuenta. Eres responsable de la seguridad de tu cuenta de Google y de tu correo, y de lo que ocurra con tu cuenta de BrandBara. Avísanos de cualquier acceso no autorizado en ${mail}. No puedes compartir ni ceder tu cuenta.`),
    p('Al empezar, y cada vez que cambiemos estos textos de forma relevante, te pediremos que los aceptes. Guardamos la versión y la fecha de cada aceptación.')),
  sec('4. Beta y cola de espera',
    p('BrandBara está en fase beta, con un número limitado de plazas que podemos cambiar. Si no hay plaza libre, puedes registrarte pero no crear portales ni subir archivos hasta que se libere una; las plazas se asignan por orden de llegada, sin garantía de acceso ni de plazo. Por ahora no enviamos avisos por email. En la beta pueden cambiar o retirarse funciones y puede haber errores o pérdida de datos: no uses BrandBara como única copia de tu manual de marca. Las ventajas que anunciemos durante la beta (por ejemplo, meses gratis de PRO por responder una encuesta) se aplicarán cuando se lance PRO, en las condiciones que comuniquemos entonces; no nos obligan a lanzar PRO ni a hacerlo en una fecha concreta.')),
  sec('5. Tu contenido y la licencia que nos das',
    p('Tu contenido (logotipos, imágenes, textos, vídeos, tipografías, enlaces) sigue siendo tuyo. Nos concedes una licencia no exclusiva, gratuita y mundial, mientras mantengas ese contenido en BrandBara, para alojarlo, copiarlo técnicamente (incluidas las copias de seguridad), adaptarlo técnicamente (por ejemplo, comprimir imágenes) y mostrarlo públicamente cuando publiques un portal. Garantizas que tienes los derechos necesarios sobre todo lo que subes y, si publicas la marca de un cliente, que cuentas con su autorización. Te comprometes a mantenernos indemnes frente a reclamaciones de terceros por tu contenido.')),
  sec('6. Uso aceptable',
    p('No puedes usar BrandBara para:'),
    ul([
      'publicar contenido ilícito o que infrinja derechos de terceros;',
      'difundir contenido que incite al odio, a la violencia o al terrorismo, o que explote o ponga en riesgo a menores;',
      'suplantar a una persona, marca u organismo, ni crear portales para engañar (por ejemplo, falsas webs oficiales o páginas para captar credenciales o pagos);',
      'distribuir malware o código activo, incluido el escondido en archivos SVG;',
      'incluir enlaces engañosos, enviar spam o publicar contenido sexual explícito;',
      'usar el espacio como almacén o red de distribución de archivos ajenos a tu portal;',
      'eludir los límites, las plazas o las medidas de seguridad, abrir varias cuentas, usar bots o extraer datos de forma masiva;',
      'probar la seguridad del servicio sin autorización escrita;',
      'subir datos personales de categorías especiales (salud, ideología, origen…) o de menores.',
    ])),
  sec('7. Portales públicos y contraseñas de portal',
    p('Un portal público lo puede ver cualquiera que tenga el enlace. La etiqueta noindex pide a los buscadores que no lo muestren, pero no impide el acceso ni garantiza que no aparezca. Los archivos subidos tienen una dirección pública: cualquiera que la conozca puede verlos. La contraseña de portal es una protección básica para compartir con clientes, no un sistema de seguridad robusto: no publiques tras ella información confidencial, secretos comerciales ni datos personales protegidos.')),
  sec('8. Tipografías, imágenes y marcas de terceros',
    p('Al subir una tipografía, imagen, icono o vídeo declaras que su licencia permite alojarlo y mostrarlo en la web. BrandBara no comprueba esas licencias y no responde de su incumplimiento.')),
  sec('9. Denuncias, retirada y suspensión',
    p(`Cualquiera puede notificar un contenido que considere ilícito o que infrinja sus derechos en «Denunciar contenido» o en ${mail}. Si recibimos una notificación fundada o tenemos conocimiento de un contenido ilícito, podemos retirarlo o bloquear el portal, sin aviso previo en los casos graves. Te comunicaremos la decisión, los motivos y cómo reclamar. La reincidencia puede llevar a la suspensión o a la baja de la cuenta. Puedes reclamar escribiendo a ${mail} y una persona revisará la decisión; la vía judicial siempre queda abierta.`)),
  sec('10. Datos personales dentro de tu contenido',
    p('Si tu portal incluye datos personales de otras personas, tú eres el responsable de ese tratamiento: necesitas una base legal e informar a esas personas. BrandBara los trata solo como encargado, según el Anexo A.')),
  sec('11. Disponibilidad y copias de seguridad',
    p('No garantizamos que el servicio esté siempre disponible. Hacemos copias diarias cifradas de la base de datos, que conservamos 30 días, para recuperarnos de incidentes; no son un servicio de restauración a petición. Los archivos subidos (imágenes) no se incluyen. Conserva tus propias copias.')),
  sec('12. Propiedad intelectual de BrandBara',
    p('El código, el diseño, los textos, el nombre y el logotipo de BrandBara son nuestros o de nuestros licenciantes. Te damos una licencia limitada, personal, revocable y no transferible para usar el servicio. No puedes copiarlo, revenderlo ni intentar obtener su código salvo lo que la ley permita. Podemos usar sin compensación los comentarios y sugerencias que nos envíes.')),
  sec('13. Responsabilidad',
    p('El servicio se ofrece «tal cual» y según disponibilidad. En la medida en que la ley lo permita, no respondemos de daños indirectos, lucro cesante, pérdida de datos, contenidos de usuarios ni interrupciones, y nuestra responsabilidad total se limita a lo que hayas pagado a BrandBara en los 12 meses anteriores (0 € mientras el servicio sea gratuito). Nada de esto limita la responsabilidad por dolo, por negligencia grave ni en lo que la ley no permita limitar.')),
  sec('14. Baja y eliminación de la cuenta',
    p('Puedes eliminar tu cuenta cuando quieras desde la aplicación. Es irreversible: se borran tus archivos, tu usuario, tu perfil y tu portal; las copias cifradas de la base pueden conservarlos hasta 30 días. Podemos suspender o cerrar una cuenta por incumplimiento de estos Términos, por riesgo de seguridad o por requerimiento legal. Salvo incumplimiento grave, te avisaremos con antelación razonable para que descargues tu contenido.')),
  sec('15. Cambios en los Términos',
    p('Si los cambios son relevantes, te avisaremos en la aplicación con 15 días de antelación. Si sigues usando el servicio, los aceptas; si no estás de acuerdo, elimina tu cuenta.')),
  sec('16. Ley y jurisdicción',
    p(`Derecho español. Si eres consumidor, serán competentes los tribunales que la ley te reconozca; en los demás casos, los juzgados y tribunales de ${v(E.city)} (España).`)),
  sec('17. Contacto', p(mail)),
  sec('Anexo A. Encargado de tratamiento (art. 28 RGPD)',
    p('Se aplica solo cuando el contenido de un portal incluye datos personales de terceros bajo la responsabilidad del usuario.'),
    ul([
      '<strong>Objeto y finalidad:</strong> alojar y mostrar el portal del usuario.',
      '<strong>Duración:</strong> mientras la cuenta esté activa, más 30 días de copias cifradas.',
      '<strong>Datos e interesados:</strong> los que el usuario incluya (por ejemplo, personas de contacto o miembros de un equipo). Quedan prohibidos los datos de categorías especiales y los de menores.',
      '<strong>Instrucciones:</strong> BrandBara trata los datos solo según estos Términos y el uso que el usuario haga de la herramienta, e informará si una instrucción infringe la normativa.',
      '<strong>Confidencialidad:</strong> solo accede a los datos el titular de BrandBara y, en su caso, colaboradores obligados a confidencialidad.',
      '<strong>Seguridad:</strong> las medidas descritas en la Política de privacidad (control de acceso por cuenta, límites en servidor, copias cifradas).',
      '<strong>Subencargados:</strong> el usuario autoriza con carácter general a Supabase, Vercel y GitHub. Avisaremos de cambios con 15 días y el usuario podrá oponerse o eliminar su cuenta.',
      '<strong>Derechos de los interesados:</strong> BrandBara ayudará al usuario a atenderlos y le trasladará las solicitudes que reciba.',
      '<strong>Brechas:</strong> BrandBara avisará al usuario sin dilación indebida y le dará la información necesaria para notificarla.',
      '<strong>Supresión o devolución:</strong> al eliminar la cuenta se borran los datos; las copias de seguridad se renuevan en 30 días.',
      '<strong>Auditoría:</strong> BrandBara facilitará por escrito la información necesaria para demostrar el cumplimiento.',
      '<strong>Transferencias internacionales:</strong> según el apartado 8 de la Política de privacidad.',
    ])),
]);

const termsEN = page('EN', 'Terms of Use', [
  sec('1. Who we are and what you accept',
    p(`These Terms govern the use of BrandBara, offered by ${v(E.name)} (full details in the Legal Notice). By creating an account you accept them; we store the version and date of your acceptance. If you do not agree, do not use the tool.`)),
  sec('2. Who can use BrandBara',
    p('You must be at least 14 years old. If you are a minor, you declare that you have your parents’ or guardians’ permission where the law requires it. One account per person and truthful registration details. If you act on behalf of a company, you declare that you have authority to bind it.')),
  sec('3. Your account',
    p(`You sign in with your Google account or with a link we email you; we do not use passwords. If you sign in with Google using an email that already had a BrandBara account, you access that same account. You are responsible for the security of your Google account and your email, and for what happens with your BrandBara account. Tell us about any unauthorised access at ${mail}. You may not share or transfer your account.`),
    p('When you start, and every time we change these texts in a relevant way, we will ask you to accept them. We keep the version and the date of each acceptance.')),
  sec('4. Beta and waiting list',
    p('BrandBara is in beta, with a limited number of places that we may change. If no place is free, you can sign up but cannot create portals or upload files until one is released; places are assigned in order of arrival, with no guarantee of access or timing. For now we do not send emails. During the beta, features may change or be withdrawn, and there may be errors or data loss: do not use BrandBara as the only copy of your brand manual. Any perks we announce during the beta (for example, free months of PRO for answering a survey) will apply when PRO launches, under the conditions we announce then; they do not oblige us to launch PRO or to do so by a specific date.')),
  sec('5. Your content and the licence you give us',
    p('Your content (logos, images, texts, videos, fonts, links) remains yours. You grant us a non-exclusive, free, worldwide licence, for as long as you keep that content on BrandBara, to host it, technically copy it (including backups), technically adapt it (for example, compress images) and display it publicly when you publish a portal. You warrant that you hold the necessary rights to everything you upload and, if you publish a client’s brand, that you have their authorisation. You agree to hold us harmless against third-party claims about your content.')),
  sec('6. Acceptable use',
    p('You may not use BrandBara to:'),
    ul([
      'publish unlawful content or content infringing third-party rights;',
      'spread content that incites hatred, violence or terrorism, or that exploits or endangers minors;',
      'impersonate a person, brand or institution, or create portals to deceive (for example, fake official sites or pages to harvest credentials or payments);',
      'distribute malware or active code, including code hidden in SVG files;',
      'include deceptive links, send spam or publish sexually explicit content;',
      'use the space as storage or a distribution network for files unrelated to your portal;',
      'circumvent limits, places or security measures, open multiple accounts, use bots or mass-extract data;',
      'test the service’s security without written authorisation;',
      'upload special-category personal data (health, beliefs, origin…) or data of minors.',
    ])),
  sec('7. Public portals and portal passwords',
    p('Anyone with the link can view a public portal. The noindex tag asks search engines not to list it, but it does not prevent access or guarantee it will not appear. Uploaded files have a public address: anyone who knows it can view them. The portal password is basic protection for sharing with clients, not a robust security system: do not publish confidential information, trade secrets or protected personal data behind it.')),
  sec('8. Third-party fonts, images and brands',
    p('By uploading a font, image, icon or video you declare that its licence allows hosting and displaying it on the web. BrandBara does not check those licences and is not liable for any breach.')),
  sec('9. Reports, removal and suspension',
    p(`Anyone can report content they consider unlawful or infringing through “Report content” or at ${mail}. If we receive a well-founded notice or become aware of unlawful content, we may remove it or block the portal, without prior notice in serious cases. We will tell you the decision, the reasons and how to appeal. Repeat offences may lead to suspension or closure of the account. You can appeal by writing to ${mail} and a person will review the decision; legal action always remains open.`)),
  sec('10. Personal data inside your content',
    p('If your portal includes personal data of other people, you are the controller of that processing: you need a legal basis and must inform those people. BrandBara processes it only as processor, according to Annex A.')),
  sec('11. Availability and backups',
    p('We do not guarantee that the service is always available. We make encrypted daily backups of the database, kept for 30 days, to recover from incidents; they are not an on-demand restore service. Uploaded files (images) are not included. Keep your own copies.')),
  sec('12. BrandBara’s intellectual property',
    p('The code, design, texts, name and logo of BrandBara are ours or our licensors’. We give you a limited, personal, revocable, non-transferable licence to use the service. You may not copy or resell it or try to obtain its code except as the law permits. We may use any feedback and suggestions you send us without compensation.')),
  sec('13. Liability',
    p('The service is offered “as is” and as available. To the extent the law allows, we are not liable for indirect damages, loss of profit, data loss, user content or interruptions, and our total liability is limited to what you have paid BrandBara in the previous 12 months (€0 while the service is free). None of this limits liability for wilful misconduct, gross negligence or anything the law does not allow to be limited.')),
  sec('14. Leaving and deleting your account',
    p('You can delete your account at any time from the application. It is irreversible: your files, user, profile and portal are erased; encrypted database backups may keep them for up to 30 days. We may suspend or close an account for breach of these Terms, security risk or legal requirement. Except in serious breaches, we will give you reasonable notice to download your content.')),
  sec('15. Changes to the Terms',
    p('If the changes are relevant, we will notify you in the application 15 days in advance. If you keep using the service you accept them; if you disagree, delete your account.')),
  sec('16. Governing law and jurisdiction',
    p(`Spanish law. If you are a consumer, the courts that the law grants you will have jurisdiction; in all other cases, the courts of ${v(E.city)} (Spain).`)),
  sec('17. Contact', p(mail)),
  sec('Annex A. Data processor terms (GDPR art. 28)',
    p('Applies only when a portal’s content includes third-party personal data under the user’s responsibility.'),
    ul([
      '<strong>Subject and purpose:</strong> hosting and displaying the user’s portal.',
      '<strong>Duration:</strong> while the account is active, plus 30 days of encrypted backups.',
      '<strong>Data and data subjects:</strong> whatever the user includes (for example, contact persons or team members). Special-category data and data of minors are prohibited.',
      '<strong>Instructions:</strong> BrandBara processes the data only according to these Terms and the user’s use of the tool, and will say if an instruction infringes the rules.',
      '<strong>Confidentiality:</strong> only BrandBara’s owner and, where applicable, collaborators bound by confidentiality access the data.',
      '<strong>Security:</strong> the measures described in the Privacy Policy (per-account access control, server-side limits, encrypted backups).',
      '<strong>Sub-processors:</strong> the user gives general authorisation to Supabase, Vercel and GitHub. We will announce changes 15 days ahead and the user may object or delete their account.',
      '<strong>Data subject rights:</strong> BrandBara will help the user respond to them and forward any requests it receives.',
      '<strong>Breaches:</strong> BrandBara will tell the user without undue delay and provide the information needed to notify it.',
      '<strong>Deletion or return:</strong> deleting the account erases the data; backups renew within 30 days.',
      '<strong>Audit:</strong> BrandBara will provide in writing the information needed to demonstrate compliance.',
      '<strong>International transfers:</strong> as in section 8 of the Privacy Policy.',
    ])),
]);

// ──────────────────────────────── COOKIES Y ALMACENAMIENTO ────────────────────────────────
const cookiesES = page('ES', 'Política de Cookies', [
  sec('Qué usamos y qué no',
    p('BrandBara no usa cookies de analítica, de publicidad ni de seguimiento, ni herramientas de terceros que midan tu actividad. Solo guarda en tu dispositivo la información técnica imprescindible para que la herramienta funcione. Según la normativa (LSSI, art. 22.2), ese almacenamiento estrictamente necesario no requiere tu consentimiento; por eso no te pedimos que aceptes cookies. Las tipografías se sirven desde BrandBara, sin peticiones a Google.')),
  sec('1. Qué guardamos en tu dispositivo',
    table(['Qué', 'Para qué', 'Dónde y cuánto dura'], [
      ['Sesión de autenticación (Supabase)', 'Mantenerte con la sesión iniciada', 'Almacenamiento local del navegador; hasta que cierres sesión'],
      ['brandPortalData', 'Tu borrador del editor, el idioma y el modo claro u oscuro', 'Almacenamiento local; hasta que lo borres'],
      ['Imágenes del borrador (IndexedDB)', 'Guardar imágenes pendientes de subir', 'Almacenamiento del navegador; hasta que se publiquen o se borren'],
      ['brandbara_cookies_status', 'Recordar que ya viste el aviso informativo', 'Almacenamiento local; hasta que lo borres'],
    ])),
  sec('2. Vídeos incrustados en portales',
    p('Los usuarios pueden incrustar vídeos de YouTube o Vimeo en sus portales. Esos servicios son de terceros y pueden guardar cookies o identificar a quien reproduce el vídeo. Por eso el vídeo no se carga al abrir el portal: solo cuando pulsas «Reproducir», tras un aviso. Si no lo pulsas, YouTube y Vimeo no reciben nada de ti.')),
  sec('3. Acceso con Google',
    p('Si eliges «Continuar con Google», tu navegador va a la página de Google, que puede usar sus propias cookies según su política; BrandBara no las controla ni las recibe. Si entras con el enlace del correo, no se contacta con Google.')),
  sec('4. Cómo gestionarlo',
    p('Puedes borrar los datos del sitio desde tu navegador. Ojo: eso cierra tu sesión y elimina el borrador que no hayas publicado.')),
  sec('5. Cambios',
    p(`Si algún día añadimos analítica u otras cookies no necesarias, pediremos tu consentimiento antes de activarlas y actualizaremos esta política. Dudas: ${mail}.`)),
]);

const cookiesEN = page('EN', 'Cookie Policy', [
  sec('What we use and what we do not',
    p('BrandBara does not use analytics, advertising or tracking cookies, nor third-party tools that measure your activity. It only stores on your device the technical information that is essential for the tool to work. Under the rules (Spanish LSSI, art. 22.2), such strictly necessary storage does not require your consent; that is why we do not ask you to accept cookies. Fonts are served from BrandBara, with no requests to Google.')),
  sec('1. What we store on your device',
    table(['What', 'Why', 'Where and for how long'], [
      ['Authentication session (Supabase)', 'Keep you signed in', 'Browser local storage; until you sign out'],
      ['brandPortalData', 'Your editor draft, language and light/dark mode', 'Local storage; until you delete it'],
      ['Draft images (IndexedDB)', 'Keep images waiting to be uploaded', 'Browser storage; until published or deleted'],
      ['brandbara_cookies_status', 'Remember that you saw the information notice', 'Local storage; until you delete it'],
    ])),
  sec('2. Videos embedded in portals',
    p('Users can embed YouTube or Vimeo videos in their portals. Those services are third parties and may store cookies or identify whoever plays the video. That is why the video does not load when the portal opens: only when you press “Play”, after a notice. If you do not press it, YouTube and Vimeo receive nothing from you.')),
  sec('3. Sign-in with Google',
    p('If you choose “Continue with Google”, your browser goes to Google’s page, which may use its own cookies under its policy; BrandBara does not control or receive them. If you sign in with the emailed link, Google is not contacted.')),
  sec('4. How to manage it',
    p('You can clear site data from your browser. Note that this signs you out and deletes any draft you have not published.')),
  sec('5. Changes',
    p(`If we ever add analytics or other non-essential cookies, we will ask for your consent before enabling them and update this policy. Questions: ${mail}.`)),
]);

// ──────────────────────────────── DENUNCIAR CONTENIDO ────────────────────────────────
const reportES = page('ES', 'Denunciar contenido', [
  sec('Cómo notificar un contenido ilícito',
    p('Los portales públicos los crean y publican los usuarios. Si crees que un portal contiene contenido ilícito o que infringe tus derechos (por ejemplo, derechos de autor, suplantación, phishing, contenido que explote a menores, odio o terrorismo), escríbenos a ' + mail + ' con:'),
    ul([
      'la <strong>dirección exacta (URL)</strong> del portal o del archivo;',
      'una <strong>explicación razonada</strong> de por qué consideras que es ilícito o infringe tus derechos;',
      'tu <strong>nombre y correo electrónico</strong> (no son necesarios si denuncias delitos de explotación sexual infantil);',
      'una <strong>declaración de buena fe</strong> de que la información que das es exacta y completa.',
    ])),
  sec('Qué hacemos con tu denuncia',
    ul([
      'Te confirmamos la recepción si dejaste un correo.',
      'Si es grave y evidente (explotación de menores, terrorismo, amenazas, phishing activo), bloqueamos el portal de inmediato como medida cautelar.',
      'En los demás casos lo evaluamos de forma diligente, objetiva y no arbitraria, normalmente en unos 3 días, y podemos pedir aclaraciones al usuario.',
      'Decidimos: retirar el contenido, bloquear el portal, rechazar la denuncia o no actuar. Te comunicamos la decisión y las vías de recurso, y al usuario afectado, los motivos y cómo reclamar.',
      'Si el usuario reincide, puede ser suspendido o dado de baja.',
    ])),
  sec('Autoridades',
    p(`Los requerimientos de autoridades competentes también llegan a ${mail}. Si sospechamos un delito que amenace la vida o la seguridad de las personas, lo comunicaremos a las autoridades.`)),
]);

const reportEN = page('EN', 'Report content', [
  sec('How to report unlawful content',
    p('Public portals are created and published by users. If you believe a portal contains unlawful content or infringes your rights (for example copyright, impersonation, phishing, content exploiting minors, hate or terrorism), write to us at ' + mail + ' with:'),
    ul([
      'the <strong>exact address (URL)</strong> of the portal or file;',
      'a <strong>reasoned explanation</strong> of why you consider it unlawful or infringing;',
      'your <strong>name and email address</strong> (not required if you report child sexual exploitation offences);',
      'a <strong>good-faith statement</strong> that the information you give is accurate and complete.',
    ])),
  sec('What we do with your report',
    ul([
      'We confirm receipt if you left an email address.',
      'If it is serious and obvious (exploitation of minors, terrorism, threats, active phishing), we block the portal immediately as a precaution.',
      'In other cases we assess it diligently, objectively and non-arbitrarily, normally within about 3 days, and may ask the user for clarification.',
      'We decide: remove the content, block the portal, reject the report or take no action. We tell you the decision and how to appeal, and tell the affected user the reasons and how to complain.',
      'Repeat offenders may be suspended or have their account closed.',
    ])),
  sec('Authorities',
    p(`Orders from competent authorities also reach ${mail}. If we suspect an offence that threatens people’s life or safety, we will report it to the authorities.`)),
]);

export const LEGAL_CONTENT = {
  notice: { ES: noticeES, EN: noticeEN },
  privacy: { ES: privacyES, EN: privacyEN },
  terms: { ES: termsES, EN: termsEN },
  cookies: { ES: cookiesES, EN: cookiesEN },
  report: { ES: reportES, EN: reportEN },
};

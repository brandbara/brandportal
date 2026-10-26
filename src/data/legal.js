// Textos legales (privacidad, términos, cookies). Extraído de App.jsx sin cambios de contenido.
export const LEGAL_CONTENT = {
  privacy: {
    EN: `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-black mb-2">Standards Privacy Policy</h2>
          <p class="text-xs font-mono opacity-50 uppercase tracking-widest">Last Updated: 03.09.26</p>
        </div>
        
        <div>
          <h3 class="text-lg font-bold mb-2">How This Privacy Policy Applies</h3>
          <p class="mb-2">BrandBara Site Inc. (“BrandBara,” “we,” “us,” or “our”) operates the BrandBara platform, including the website at brandbara.com, the application at app.brandbara.com, and related services and APIs (collectively, the “Services”). This Privacy Policy describes what information we collect, how we use it, when we share it, and your rights regarding your data.</p>
          <p>For customers who have entered into a separate Software as a Service Agreement with BrandBara Site Inc., this Privacy Policy is incorporated into that agreement by reference, and in the event of any conflict, the terms of the SaaS Agreement will prevail. By accessing or using our Services, you accept the practices outlined in this policy, including future updates.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">What Information We Collect and Receive</h3>
          <p class="mb-2">We collect information in the following ways:</p>
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>Account Information.</strong> When you create an account, we collect your name, email address, and authentication credentials. If you sign in through a third-party provider (such as Google, Microsoft, or SAML SSO), we receive basic profile information from that provider.</li>
            <li><strong>Billing Information.</strong> When you subscribe to a paid plan, payment information is collected and processed by our payment processor, Stripe. We do not store full credit card numbers on our servers.</li>
            <li><strong>Content and Files.</strong> We store the content you create, upload, or manage through the platform, including documents, images, fonts, and other assets.</li>
            <li><strong>Usage Information.</strong> We collect information about how you interact with our Services, including pages visited, features used, IP addresses, browser type, and device information.</li>
            <li><strong>API Data.</strong> If you access our Services through our API, we collect API credentials, request logs (including timestamps, endpoints accessed, and IP addresses), and usage metrics for the purposes of security, rate limiting, and abuse prevention.</li>
            <li><strong>Published Project Visitor Data.</strong> When visitors access a published project, we may collect their email address (if authentication is required), IP address, the time of their visit, and interaction data such as page views, downloads, and other engagement events. This data is made available to the workspace owner.</li>
            <li><strong>Communications.</strong> We retain messages you send to our support team or through other communication channels.</li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Types of Cookies We Utilize</h3>
          <p>BrandBara uses cookies for Security, Localization, Site Features, Performance, and Analytics. Users can control cookies through browser settings, though blocking them may limit website functionality.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Custom Code on Published Projects</h3>
          <p>Our platform allows users to embed custom code and third-party scripts on their published projects. BrandBara does not control, review, or assume responsibility for the data practices of user-embedded code or for how visitor data made available through our platform tools is used by that code.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">California & Nevada Users</h3>
          <p class="mb-2"><strong>California:</strong> Under California Civil Code Section 1798.83, we do not sell or transfer personal information to third parties for direct marketing purposes without your consent.</p>
          <p><strong>Nevada:</strong> Nevada residents have specific rights under Nevada Revised Statutes Chapter 603A to opt out of the sale of covered information. We do not currently sell covered information. Contact: brandbara.hello@gmail.com.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">European Union Users</h3>
          <p>EU data protection law requires a lawful basis for processing personal data. BrandBara relies on Consent, Contract Performance, and Legitimate Interests. We do not share email addresses, IP addresses, or API credentials publicly.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Data Sub-processors</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li>Google Cloud (US/EU) - Hosting and infrastructure</li>
            <li>Supabase (US/EU) - Database and Auth</li>
            <li>Vercel (US) - Networking and CDN</li>
            <li>Stripe (US) - Payment processing</li>
          </ul>
        </div>
      </div>
    `,
    ES: `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-black mb-2">Política de Privacidad</h2>
          <p class="text-xs font-mono opacity-50 uppercase tracking-widest">Última actualización: 03.09.26</p>
        </div>
        
        <div>
          <h3 class="text-lg font-bold mb-2">Aplicación de esta Política</h3>
          <p class="mb-2">BrandBara Site Inc. (“BrandBara”, “nosotros”, “nuestro”) opera la plataforma BrandBara, incluyendo brandbara.com y servicios relacionados. Esta política describe la información que recopilamos, cómo la usamos y sus derechos.</p>
          <p>Al usar nuestros Servicios, acepta estas prácticas. Para clientes con acuerdos SaaS por separado, prevalecerán los términos de dicho acuerdo.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Información que Recopilamos</h3>
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>Información de Cuenta:</strong> Recopilamos nombre, email y credenciales.</li>
            <li><strong>Información de Facturación:</strong> Procesada por Stripe. No almacenamos datos de tarjetas.</li>
            <li><strong>Contenido y Archivos:</strong> Almacenamos documentos, imágenes, fuentes y activos que usted sube al sistema.</li>
            <li><strong>Información de Uso:</strong> Direcciones IP, navegador, y comportamiento en la herramienta.</li>
            <li><strong>Datos de la API:</strong> Logs y métricas para prevención de abusos.</li>
            <li><strong>Visitantes de Proyectos:</strong> Recopilamos IP e interacciones en portales públicos, datos que se proporcionan al dueño del Workspace.</li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Código Personalizado</h3>
          <p>Nuestra plataforma permite incrustar código de terceros. BrandBara no asume responsabilidad por las prácticas de datos de dichos scripts insertados por el usuario.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Usuarios de la Unión Europea (RGPD)</h3>
          <p>Cumplimos con las leyes de protección de datos de la UE basándonos en: Consentimiento, Ejecución de Contrato e Intereses Legítimos. Los residentes tienen derecho a acceder, rectificar, borrar y portar sus datos.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Sub-procesadores de Datos</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li>Google Cloud (US/EU) - Infraestructura</li>
            <li>Supabase (US/EU) - Base de datos y Autenticación</li>
            <li>Vercel (US) - Redes y Seguridad</li>
            <li>Stripe (US) - Procesamiento de Pagos</li>
          </ul>
        </div>
      </div>
    `
  },
  terms: {
    EN: `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-black mb-2">Terms of Service</h2>
          <p class="text-xs font-mono opacity-50 uppercase tracking-widest">Last Updated: 4.14.26</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Agreement To Terms</h3>
          <p>These Terms of Service constitute a legally binding agreement made between you and BrandBara Site Inc. concerning your access to and use of the brandbara.com website. We are registered in Madrid, Spain. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Intellectual Property Rights</h3>
          <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site are owned or controlled by us. You are granted a limited license to access and use the Site.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">User Responsibility for Font Licensing</h3>
          <p>By using the Site and uploading fonts files directly to the Company’s website/app, you represent and warrant that you have obtained all necessary rights and licenses to the fonts you upload. You are solely responsible for ensuring that your use of uploaded fonts complies with all applicable licenses. You hereby agree to indemnify, defend, and hold Company harmless from any claims, damages, liabilities, costs, losses, and expenses arising from or related to any breach of font licenses.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">API Usage & Custom Code</h3>
          <p>You may use the API solely to access and manage your own data. You may not use the API to build a competing product or exceed rate limits. You are solely responsible for any Custom Code you embed on your published projects, including its functionality, performance, and legality.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Prohibited Activities</h3>
          <p>As a user, you agree not to: systematically retrieve data to compile a database; circumvent security features; engage in unauthorized framing; or use automated scripts or data mining tools. We reserve the right to block IP addresses and terminate accounts immediately for violations.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Dispute Resolution & Governing Law</h3>
          <p>These Terms of Service and your use of the Site are governed by and construed in accordance with the laws of Spain. Any legal action or proceeding related to the Site shall be brought exclusively in the courts located in Madrid, Spain.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Limitations of Liability & Indemnification</h3>
          <p>THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. IN NO EVENT WILL WE BE LIABLE FOR DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES. You agree to defend, indemnify, and hold us harmless from any loss, damage, or claim made by any third party due to your use of the Site or breach of these Terms.</p>
        </div>
      </div>
    `,
    ES: `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-black mb-2">Términos de Servicio</h2>
          <p class="text-xs font-mono opacity-50 uppercase tracking-widest">Última actualización: 14.04.26</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Acuerdo de los Términos</h3>
          <p>Estos Términos constituyen un acuerdo legalmente vinculante entre usted y BrandBara Site Inc. con sede en Madrid, España. SI NO ESTÁ DE ACUERDO CON TODOS ESTOS TÉRMINOS, TIENE PROHIBIDO EL USO DEL SITIO Y DEBE SUSPENDER SU USO INMEDIATAMENTE.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Responsabilidad del Usuario sobre Licencias de Fuentes</h3>
          <p>Al utilizar el Sitio y cargar archivos de fuentes, usted declara y garantiza que ha obtenido todos los derechos y licencias necesarios. Usted es el único responsable de asegurar el cumplimiento normativo. Acepta indemnizar y eximir de responsabilidad a la Empresa frente a reclamaciones de terceros derivadas del incumplimiento de licencias de fuentes tipográficas.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Actividades Prohibidas (Cláusula Anti-Abuso)</h3>
          <p>Usted acepta no: recuperar datos sistemáticamente para compilar bases de datos, eludir medidas de seguridad, realizar "framing" no autorizado o usar herramientas de minería de datos. Nos reservamos el derecho a denegar el acceso, bloquear la IP y eliminar cuentas sin previo aviso ante conductas abusivas.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Limitación de Responsabilidad</h3>
          <p>EL SITIO SE PROPORCIONA "TAL CUAL". EN NINGÚN CASO SEREMOS RESPONSABLES POR DAÑOS DIRECTOS, INDIRECTOS O CONSECUENTES (INCLUYENDO PÉRDIDA DE DATOS O BENEFICIOS). Su recurso exclusivo es dejar de usar la plataforma.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-2">Ley Aplicable y Jurisdicción</h3>
          <p>Estos Términos se rigen por las leyes de España. Cualquier acción o procedimiento legal relacionado con el Sitio se llevará a cabo exclusivamente en los juzgados y tribunales de la ciudad de Madrid, España.</p>
        </div>
      </div>
    `
  },
cookies: {
    EN: `
      <h2>Cookie Policy</h2>
      <p><em>Last Updated: 04.16.26</em></p>

      <h3>What Are Cookies</h3>
      <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website or use an app. BrandBara Site Inc. uses cookies and similar tracking technologies to recognize you, remember your preferences, and provide a secure and seamless experience on our platform.</p>

      <h3>How We Use Cookies</h3>
      <p>We use cookies for the following purposes:</p>
      <ul>
        <li><strong>Strictly Necessary Cookies:</strong> These are required for the operation of the BrandBara platform. They include cookies that enable you to log into secure areas, such as Supabase authentication tokens, and make use of our core design tools.</li>
        <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our platform. This enables us to personalize our content for you and remember your preferences (such as your choice of language, light/dark mode, or region).</li>
        <li><strong>Analytical/Performance Cookies:</strong> These allow us to recognize and count the number of visitors and see how visitors move around our platform. This helps us improve the way our website works.</li>
      </ul>

      <h3>Third-Party Cookies</h3>
      <p>In addition to our own cookies, we may also use various third-party cookies to report usage statistics and process payments. Key third-party providers include:</p>
      <ul>
        <li><strong>Supabase:</strong> Essential for secure user authentication and session management.</li>
        <li><strong>Stripe:</strong> Strictly necessary for processing secure payments and managing your PRO subscription. Stripe sets its own cookies for fraud prevention.</li>
      </ul>

      <h3>Controlling Cookies and Do Not Track</h3>
      <p>Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience or lose the ability to access your BrandBara account, as essential authentication cookies will be blocked.</p>
      <p>Some browsers have a "Do Not Track" (DNT) feature. Currently, there is no industry standard for how DNT signals should be recognized, so BrandBara does not respond to these signals.</p>

      <h3>Changes and Contact</h3>
      <p>We may update this Cookie Policy from time to time. If you have any questions, please contact us at brandbara.hello@gmail.com.</p>
    `,
    ES: `
      <h2>Política de Cookies</h2>
      <p><em>Última actualización: 16.04.26</em></p>

      <h3>¿Qué son las Cookies?</h3>
      <p>Las cookies son pequeños archivos de texto que se almacenan en su ordenador o dispositivo móvil cuando visita un sitio web o utiliza una aplicación. BrandBara Site Inc. utiliza cookies y tecnologías de seguimiento similares para reconocerle, recordar sus preferencias y ofrecer una experiencia segura en nuestra plataforma.</p>

      <h3>Cómo Usamos las Cookies</h3>
      <p>Utilizamos cookies para los siguientes propósitos:</p>
      <ul>
        <li><strong>Cookies Estrictamente Necesarias:</strong> Son esenciales para el funcionamiento de la plataforma BrandBara. Incluyen cookies que le permiten iniciar sesión en áreas seguras, como los tokens de autenticación de Supabase, y utilizar nuestro editor de manera ininterrumpida.</li>
        <li><strong>Cookies de Funcionalidad:</strong> Se utilizan para reconocerle cuando vuelve a nuestra plataforma. Esto nos permite personalizar nuestro contenido y recordar sus preferencias (como su elección de idioma o el modo claro/oscuro de la interfaz).</li>
        <li><strong>Cookies Analíticas y de Rendimiento:</strong> Nos permiten reconocer y contar el número de visitantes, y ver cómo se mueven por nuestra plataforma. Esto nos ayuda a mejorar el funcionamiento de nuestro sitio web.</li>
      </ul>

      <h3>Cookies de Terceros</h3>
      <p>Además de nuestras propias cookies, también podemos utilizar varias cookies de terceros para informar sobre estadísticas de uso y procesar pagos. Los principales proveedores externos incluyen:</p>
      <ul>
        <li><strong>Supabase:</strong> Esencial para la autenticación segura de usuarios, encriptación y la gestión de sesiones activas.</li>
        <li><strong>Stripe:</strong> Estrictamente necesarias para procesar pagos seguros y gestionar su suscripción PRO. Stripe establece sus propias cookies para la prevención del fraude internacional.</li>
      </ul>

      <h3>Control de Cookies y "Do Not Track"</h3>
      <p>La mayoría de los navegadores web le permiten controlar las cookies a través de sus preferencias de configuración. Sin embargo, si limita la capacidad de los sitios web para establecer cookies, es posible que no pueda acceder a su cuenta de BrandBara, ya que se bloquearán las cookies esenciales de autenticación que lo mantienen logueado.</p>
      <p>Algunos navegadores tienen una función de "Do Not Track" (No Rastrear). Actualmente, no existe un estándar en la industria sobre cómo deben reconocerse estas señales, por lo que BrandBara no responde a ellas de forma predeterminada.</p>

      <h3>Cambios y Contacto</h3>
      <p>Podemos actualizar esta Política de Cookies de vez en cuando para reflejar cambios legales o técnicos. Si tiene alguna pregunta, póngase en contacto con nuestro equipo legal en brandbara.hello@gmail.com.</p>
    `
    }
};

import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  Wand2, Coffee, Type, Image as ImageIcon,
  LayoutGrid, Globe, Sun, Moon, Eye, ChevronDown, 
  Plus, Trash2, X, Upload, Check, AlertCircle, Grid, Smartphone,
  Layers, Palette, Hash, FileText, ImagePlus, 
  PaintBucket, Copy, ExternalLink,
  ChevronUp, Shuffle, LayoutTemplate, Menu, Anchor,
  ArrowUpDown, RectangleHorizontal, Edit3, Tablet, Laptop,
  Instagram, Youtube, Users, Share2, Download,
  Home, Search, User, Settings, Bell, Mail, Twitter, Linkedin, Facebook,
  Link2, SunMoon, Grid3X3, Columns, Video,
  Sliders, CreditCard, LogOut, Lock, Cookie,
 Fingerprint, Target, Shield, Award, Zap, Heart, Star, Lightbulb, Smile, Flag, Key,
  FileArchive, DownloadCloud, Loader2, Save
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase } from './supabaseClient';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// ==========================================
// 1. CONSTANTES Y CONFIGURACIÓN (GLOBAL)
// ==========================================

const COLOR_PALETTES = [
  { name: 'Ocean', primary: 'text-blue-700', accent: 'bg-blue-700', border: 'border-blue-200' },
  { name: 'Nature', primary: 'text-emerald-800', accent: 'bg-emerald-700', border: 'border-emerald-200' },
  { name: 'Sunset', primary: 'text-orange-700', accent: 'bg-orange-600', border: 'border-orange-200' },
  { name: 'Berry', primary: 'text-rose-700', accent: 'bg-rose-700', border: 'border-rose-200' },
  { name: 'Midnight', primary: 'text-indigo-900', accent: 'bg-indigo-900', border: 'border-indigo-200' },
];

const PRESET_COLORS = ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#fee2e2', '#ffedd5', '#fef3c7', '#d9f99d', '#dbeafe', '#e0e7ff', '#fae8ff', '#fce7f3'];
const SPACING_OPTIONS = { compact: { id: 'compact', name: 'Compact', value: 'mb-8' }, normal: { id: 'normal', name: 'Normal', value: 'mb-16' }, relaxed: { id: 'relaxed', name: 'Relaxed', value: 'mb-32' } };
const FONTS = ['Inter', 'Montserrat', 'Open Sans', 'Roboto', 'Space Mono', 'Nunito', 'Outfit', 'Work Sans'];
const DESIGN_STYLES = {
  crystal: { 
    name: 'Pure Crystal', id: 'crystal', radius: 'rounded-3xl', border: 'border border-white/40 hover:border-white/60 transition-colors duration-300', 
    shadow: 'shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] backdrop-blur-xl',
    cardBg: 'bg-white/20 hover:bg-white/30 transition-all duration-300',
    cardBgDark: 'bg-white/5 border-white/10 hover:bg-white/10'
  },
  sapphire: { 
    name: 'Sapphire Quantum', id: 'sapphire', radius: 'rounded-sm', border: 'border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-500', 
    shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-xl',
    cardBg: 'bg-gradient-to-br from-cyan-500/5 to-blue-600/5 hover:from-cyan-500/10 hover:to-blue-600/10 transition-all duration-500',
    cardBgDark: 'bg-slate-900/80 border-cyan-500/40 hover:border-cyan-400/70 hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]'
  },
  rose: { 
    name: 'Rose Quartz', id: 'rose', radius: 'rounded-[2rem]', border: 'border border-rose-200/40 hover:border-rose-300/60 transition-colors duration-300', 
    shadow: 'shadow-[0_20px_40px_-15px_rgba(244,63,94,0.05)] hover:shadow-rose-100/40 backdrop-blur-md',
    cardBg: 'bg-rose-50/10 hover:bg-rose-50/20 transition-all duration-300',
    cardBgDark: 'bg-rose-900/10 border-rose-500/20 hover:bg-rose-900/20'
  },
  obsidian: { 
    name: 'Obsidian', id: 'obsidian', radius: 'rounded-xl', border: 'border border-gray-900/10 hover:border-gray-900/20 transition-colors duration-300', 
    shadow: 'shadow-xl hover:shadow-2xl backdrop-blur-2xl', cardBg: 'bg-gray-900/5 hover:bg-gray-900/10 transition-all duration-300',
    cardBgDark: 'bg-black/60 border-white/10 hover:bg-black/80 shadow-[0_0_40px_rgba(0,0,0,0.5)]'
  },
  aurora: { 
    name: 'Aurora', id: 'aurora', radius: 'rounded-3xl', border: 'border border-white/50 hover:border-white/70 transition-colors duration-300', 
    shadow: 'shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] backdrop-blur-lg',
    cardBg: 'bg-gradient-to-br from-white/40 via-white/20 to-transparent hover:from-white/50 hover:via-white/30 transition-all duration-500',
    cardBgDark: 'bg-gradient-to-br from-white/10 via-white/5 to-transparent border-white/10 hover:from-white/15'
  }
};

const SOCIAL_SIZES = {
  post: { w: 'w-[220px] sm:w-[260px]', h: 'h-[275px] sm:h-[325px]', dim: '1080 x 1350 px' },
  reel: { w: 'w-[160px] sm:w-[180px]', h: 'h-[280px] sm:h-[320px]', dim: '1080 x 1920 px' },
  youtube: { w: 'w-[320px] sm:w-[400px]', h: 'h-[180px] sm:h-[225px]', dim: '1920 x 1080 px' },
  avatar: { w: 'w-32', h: 'h-32', dim: '400 x 400 px', style: 'rounded-full' },
  x_header: { w: 'w-full max-w-[480px]', h: 'h-32', dim: '1500 x 500 px', style: 'rounded-xl' },
  yt_header: { w: 'w-full max-w-[480px]', h: 'h-40', dim: '2560 x 1440 px', style: 'rounded-xl' },
  laptop: { w: 'w-[400px] sm:w-[460px]', h: 'h-[250px] sm:h-[280px]', dim: '1440 x 900 px' }, 
  tablet: { w: 'w-[200px] sm:w-[240px]', h: 'h-[280px] sm:h-[320px]', dim: '834 x 1112 px' },
  mobile: { w: 'w-[120px] sm:w-[140px]', h: 'h-[240px] sm:h-[280px]', dim: '390 x 844 px' },
};

const FONT_DESCRIPTIONS = {
  'Inter': 'Una tipografía sans-serif diseñada específicamente para interfaces de usuario, con un enfoque en la legibilidad máxima en pantallas.',
  'Roboto': 'Tiene una naturaleza dual: esqueleto mecánico y formas geométricas abiertas y amigables. Excelente para lectura rápida.',
  'Open Sans': 'Una tipografía humanista con una estética neutra pero amigable. Optimizada para impresión, web y móvil.',
  'Montserrat': 'Inspirada en los carteles y señales de Buenos Aires. Una sans-serif geométrica con gran personalidad para titulares.',
  'Space Mono': 'Una tipografía monoespaciada original y ecléctica, perfecta para marcas tecnológicas o con carácter editorial moderno.',
  'Nunito': 'Una sans-serif bien equilibrada con terminaciones redondeadas que aporta calidez y cercanía a la marca.',
  'Outfit': 'Una tipografía geométrica sans-serif diseñada para marcas modernas. Limpia, versátil y con ligaduras únicas.'
};

const TRANSLATIONS = {
  ES: {
    ui: {
      generate: "Remix Mágico", coffee: "Invítame a un café", tools: "Herramientas", styles: "Estilos Globales",
      publish: "Publicar", preview: "Vista Previa", backToEdit: "Volver a Editar", addText: "Añadir texto",
      upload: "Subir", change: "Cambiar", uploadMedia: "Subir Media", pasteLink: "Pegar enlace...",
      add: "Añadir", cancel: "Cancelar", navigate: "Navegar", noModules: "Sin módulos activos",
      colors: "Tintas", hex: "Hex", bgImage: "Imagen", bgColor: "Fondo Color", addBlock: "Añadir Bloque",
      addDevice: "Añadir Formato", addPartner: "Añadir Caso", addExample: "Añadir Ejemplo", duplicate: "Duplicar",
      downloadTemplate: "Descargar Plantilla", downloadFamily: "Descargar Familia", addIcon: "Añadir Icono",
      iconName: "Nombre del icono", text1Col: "Texto 1 Columna", text2Col: "Texto 2 Columnas",
      text3Col: "Texto 3 Columnas", imageExtra: "Imagen Multimedia", watermark: "Creado con",
      logo: "Logotipo", color: "Color", typography: "Tipografía", image: "Imagen", bento: "Bento Box",
      editorial: "Editorial", icons: "Iconos", web: "Web", social: "Redes Sociales", cobranding: "Co-branding",
      footer: "Pie de Página", profile: "Perfil", layout: "Layout", identity: "Identidad", assets: "Materiales",
      placeholders: { text: "Escribe aquí tu contenido...", bento: "Contenido Bento", caption: "Pie de foto...", copyright: "© 2026 BrandBara. Todos los derechos reservados.", website: "www.brandbara.com" },
      settings: { layout: "Diseño", font: "Tipografía", spacing: "Espaciado" }
    },
    modules: {
      header: { title: "Portal de Marca", subtitle: "Guía Oficial" },
      hero: { title: "Identidad de Marca", subtitle: "Un sistema visual diseñado para escalar." },
      identity: { 
        title: "Nuestra Identidad", 
        desc: "Los valores fundamentales que definen quiénes somos y cómo operamos.",
        precision: "Precisión", precisionDesc: "Apuntamos a resultados exactos en cada proyecto que emprendemos.",
        integrity: "Integridad", integrityDesc: "La honestidad y los estándares éticos son la base de nuestras operaciones.",
        innovation: "Innovación", innovationDesc: "Siempre buscando el próximo horizonte en tecnología y servicio.",
        excellence: "Excelencia", excellenceDesc: "Estableciendo el punto de referencia de calidad en el panorama moderno."
      },
      logo: { title: "Logotipo", desc: "Versiones principales y permitidas de la marca.", uploadLabel: "Logotipo (2MB)", safeArea: "Area de Seguridad", correct: "Usos Correctos", incorrect: "Usos Incorrectos", addVariant: "Añadir Versión" },
      color: { title: "Paleta de Color", desc: "Colores corporativos para uso digital e impreso.", addColor: "Añadir Color" },
      typography: { title: "Tipografía", desc: "Jerarquía visual y escala tipográfica.", size: "Tamaño", weight: "Peso", addLevel: "Añadir Nivel", showMore: "Ver todos los estilos", showLess: "Ver menos" },
      image: { title: "Moodboard", desc: "Inspiración visual y fotografía.", addImage: "Añadir Imagen" },
      editorial: { title: "Editorial Kit", desc: "Contenido mixto para narrativa de marca.", btnText: "Texto", btnImage: "Imagen", downloadText: "Descargar Kit Editorial", toggleDownload: "Activar descarga" },
      layout: { title: "Sistema de Layout", desc: "Retículas base 8px para consistencia espacial.", grid1: "12 Columnas", grid2: "Modular", grid3: "Línea Base", grid4: "Jerárquico", uploadLabel: "Ejemplo de uso", downloadText: "Descargar Plantilla", toggleDownload: "Link de descarga", usageTitle: "Casos de Estudio & Aplicación", usageDesc: "Visualización detallada de la estructura gráfica." },
      bento: { title: "Bento Box", desc: "Galería multimedia con distribución flexible." },
      icons: { title: "Iconografía", desc: "Set de iconos para interfaz y comunicación.", googleOutlined: "Material Outlined", googleRounded: "Material Rounded", googleSharp: "Material Sharp", custom: "Import Custom", downloadGoogle: "Descargar de Google Fonts", downloadCustom: "Descargar Kit de Iconos", toggleDownload: "Link de descarga" },
      web: { title: "Web", laptop: "Laptop", tablet: "Tablet", mobile: "Mobile" },
      social: { title: "Social Media", desc: "Style guide for social media content.", post: "Post (4:5)", reel: "Reel (9:16)", youtube: "YouTube (16:9)" },
      cobranding: { title: "Co-branding & Partners", desc: "Guías para coexistencia con otras marcas y casos de uso conjunto." },
      assets: { title: "Artes Finales", desc: "Descarga los materiales oficiales de la marca listos para usar en diferentes formatos.", addAsset: "Añadir Material", download: "Descargar", formatLabel: "Formato (Ej: ZIP, 5MB)" },
      footer: { title: "Footer", desc: "Elementos legales y de navegación." }
    },
    defaults: { 
        logoDos: "Fondo blanco", logoDonts: "Distort", 
        logoMain: "Logo Principal", logoMainDesc: "Versión preferente en color.", 
        logoDark: "Sobre Negro", logoDarkDesc: "Versión negativa.", 
        logoSymbol: "Símbolo", logoSymbolDesc: "Isotipo o elemento gráfico.", 
        colorPrimaryName: "Color Principal", colorPrimaryUsage: "Color dominante de la marca.", 
        colorSecondaryName: "Color Secundario", colorSecondaryUsage: "Soporte y validaciones.", 
        colorAccentName: "Color de Acento", colorAccentUsage: "Destacados y llamadas a la acción.",
        colorNeutralName: "Neutro", colorNeutralUsage: "Textos y bordes.", 
        colorErrorName: "Error", colorErrorUsage: "Alertas y estados críticos.",
        editorialContent: "Example editorial content...", 
        typoSamples: { Display: "Titular", H1: "Encabezado", H2: "Subtítulo", Body: "Cuerpo de texto legible.", Caption: "Texto auxiliar." }, 
        partnerCaption: "Descripción del acuerdo." 
    },
    cookie: { title: "Valoramos tu privacidad", desc: "Utilizamos cookies propias y de terceros para personalizar el contenido, analizar nuestro tráfico y ofrecerte una experiencia increíble. Al hacer clic en 'Aceptar todas', das tu consentimiento.", manage: "Solo Necesarias", reject: "Rechazar", accept: "Aceptar Todas" },
    auth: { loginTitle: "Bienvenido de nuevo", registerTitle: "Crea tu cuenta", loginDesc: "Inicia sesión para publicar tu portal.", registerDesc: "Regístrate para guardar y publicar tu progreso.", loginBtn: "Iniciar Sesión", registerBtn: "Registrarse", name: "Nombre completo", namePlaceholder: "Tu nombre", email: "Correo Electrónico", emailPlaceholder: "ejemplo@correo.com", password: "Contraseña", termsPre: "He leído y acepto los", termsLink: "Términos de Uso", privacyAnd: "y la", privacyLink: "Política de Privacidad", success: "¡Sesión iniciada con éxito! Ahora puedes publicar tu portal." },
    profileTabs: { title: "Ajustes", public: "Perfil Público", publicDesc: "Información visible para otros usuarios y en tus proyectos compartidos.", account: "Cuenta", accountDesc: "Gestiona tus credenciales y seguridad.", preferences: "Preferencias", prefDesc: "Personaliza tu experiencia en BrandBara.", space: "Espacio", filesMsg: "Archivos subidos al portal.", logout: "Cerrar Sesión", changePass: "Cambiar contraseña", lang: "Idioma", langDesc: "Selecciona el idioma de la interfaz.", notif: "Notificaciones por Email", notifDesc: "Recibe novedades y alertas de seguridad.", cookies: "Cookies de Análisis", cookiesDesc: "Ayúdanos a mejorar la plataforma de forma anónima.", role: "Rol / Cargo", bio: "Biografía" }
  },
  EN: {
    ui: {
      generate: "Magic Remix", coffee: "Buy me a coffee", tools: "Tools", styles: "Global Styles",
      publish: "Publish", preview: "Preview", backToEdit: "Back to Edit", addText: "Add text",
      upload: "Upload", change: "Change", uploadMedia: "Upload Media", pasteLink: "Paste link...",
      add: "Add", cancel: "Cancel", navigate: "Navigate", noModules: "No active modules",
      colors: "Colors", hex: "Hex", bgImage: "Image", bgColor: "Bg Color", addBlock: "Add Block",
      addDevice: "Add Format", addPartner: "Add Case", addExample: "Add Example", duplicate: "Duplicate",
      downloadTemplate: "Download Template", downloadFamily: "Download Family", addIcon: "Add Icon",
      iconName: "Icon name", text1Col: "1 Column Text", text2Col: "2 Columns Text",
      text3Col: "3 Columns Text", imageExtra: "Media Image", watermark: "Created with",
      logo: "Logo", color: "Color", typography: "Typography", image: "Image", bento: "Bento Box",
      editorial: "Editorial", icons: "Icons", web: "Web", social: "Social Media", cobranding: "Co-branding",
      footer: "Footer", profile: "Profile", layout: "Layout", identity: "Identity", assets: "Assets",
      placeholders: { text: "Type your content here...", bento: "Bento Content", caption: "Caption...", copyright: "© 2026 BrandBara. All rights reserved.", website: "www.brandbara.com" },
      settings: { layout: "Layout", font: "Typography", spacing: "Spacing" }
    },
    modules: {
      header: { title: "Brand Portal", subtitle: "Official Guide" },
      hero: { title: "Brand Identity", subtitle: "A visual system designed to scale." },
      identity: { 
        title: "Our Identity", 
        desc: "The core values that define who we are and how we operate.",
        precision: "Precision", precisionDesc: "We aim for exact results in every project we undertake.",
        integrity: "Integrity", integrityDesc: "Honesty and ethical standards are the bedrock of our operations.",
        innovation: "Innovation", innovationDesc: "Always looking for the next horizon in technology and service.",
        excellence: "Excellence", excellenceDesc: "Setting the benchmark for quality in the modern landscape."
      },
      logo: { title: "Logo", desc: "Main and allowed brand versions.", uploadLabel: "Logo (2MB)", safeArea: "Safe Area", correct: "Do's", incorrect: "Don'ts", addVariant: "Add Version" },
      color: { title: "Color Palette", desc: "Corporate colors for digital and print use.", addColor: "Add Color" },
      typography: { title: "Typography", desc: "Visual hierarchy and typographic scale.", size: "Size", weight: "Weight", addLevel: "Add Level", showMore: "View all styles", showLess: "View less" },
      image: { title: "Moodboard", desc: "Visual inspiration and photography.", addImage: "Add Image" },
      editorial: { title: "Editorial Kit", desc: "Mixed content for brand narrative.", btnText: "Text", btnImage: "Image", downloadText: "Download Editorial Kit", toggleDownload: "Enable download" },
      layout: { title: "Layout System", desc: "8px base grids for spatial consistency.", grid1: "12 Columns", grid2: "Modular", grid3: "Baseline", grid4: "Hierarchical", uploadLabel: "Usage example", downloadText: "Download Template", toggleDownload: "Download link", usageTitle: "Study Cases & Application", usageDesc: "Detailed visualization of graphic structure." },
      bento: { title: "Bento Box", desc: "Multimedia gallery with flexible distribution." },
      icons: { title: "Iconography", desc: "Icon set for interface and communication.", googleOutlined: "Material Outlined", googleRounded: "Material Rounded", googleSharp: "Material Sharp", custom: "Import Custom", downloadGoogle: "Download from Google Fonts", downloadCustom: "Download Icon Kit", toggleDownload: "Download link" },
      web: { title: "Web", laptop: "Laptop", tablet: "Tablet", mobile: "Mobile" },
      social: { title: "Social Media", desc: "Style guide for social media content.", post: "Post (4:5)", reel: "Reel (9:16)", youtube: "YouTube (16:9)" },
      cobranding: { title: "Co-branding & Partners", desc: "Guidelines for coexistence with other brands and joint use cases." },
      assets: { title: "Final Assets", desc: "Download official brand materials ready to use in different formats.", addAsset: "Add Asset", download: "Download", formatLabel: "Format (e.g. ZIP, 5MB)" },
      footer: { title: "Footer", desc: "Legal and navigation elements." }
    },
    defaults: { 
        logoDos: "White background", logoDonts: "Distort", 
        logoMain: "Main Logo", logoMainDesc: "Preferred color version.", 
        logoDark: "On Black", logoDarkDesc: "Negative version.", 
        logoSymbol: "Symbol", logoSymbolDesc: "Isotype or graphic element.", 
        colorPrimaryName: "Primary Color", colorPrimaryUsage: "Brand's dominant color.", 
        colorSecondaryName: "Secondary Color", colorSecondaryUsage: "Support and validations.", 
        colorAccentName: "Accent Color", colorAccentUsage: "Highlights and call to actions.",
        colorNeutralName: "Neutral", colorNeutralUsage: "Texts and borders.", 
        colorErrorName: "Error", colorErrorUsage: "Alertas y estados críticos.",
        editorialContent: "Example editorial content...", 
        typoSamples: { Display: "Headline", H1: "Header", H2: "Subtitle", Body: "Readable body text.", Caption: "Auxiliary text." }, 
        partnerCaption: "Agreement description." 
    },
    cookie: { title: "We value your privacy", desc: "We use first and third-party cookies to personalize content, analyze our traffic, and offer you an incredible experience. By clicking 'Accept all', you give your consent.", manage: "Only Necessary", reject: "Reject", accept: "Accept All" },
    auth: { loginTitle: "Welcome back", registerTitle: "Create your account", loginDesc: "Log in to publish your portal.", registerDesc: "Sign up to save and publish your progress.", loginBtn: "Log In", registerBtn: "Sign Up", name: "Full name", namePlaceholder: "Your name", email: "Email", emailPlaceholder: "example@email.com", password: "Password", termsPre: "I have read and accept the", termsLink: "Terms of Use", privacyAnd: "and the", privacyLink: "Privacy Policy", success: "Successfully logged in! You can now publish your portal." },
    profileTabs: { title: "Settings", public: "Public Profile", publicDesc: "Information visible to other users and in your shared projects.", account: "Account", accountDesc: "Manage your credentials and security.", preferences: "Preferences", prefDesc: "Customize your BrandBara experience.", space: "Storage", filesMsg: "Files uploaded to the portal.", logout: "Log Out", changePass: "Change password", lang: "Language", langDesc: "Select the interface language.", notif: "Email Notifications", notifDesc: "Receive news and security alerts.", cookies: "Analytics Cookies", cookiesDesc: "Help us improve the platform anonymously.", role: "Role / Title", bio: "Biography" }
  }
};

// ==============================================================================
// BLINDAJE LEGAL GLOBAL - NIVEL EMPRESARIAL (ADAPTACIÓN STANDARDS V2.0)
// ==============================================================================
const LEGAL_CONTENT = {
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

// --- 2. UTILIDADES ---

const triggerFileInput = (id) => { const element = document.getElementById(id); if (element) element.click(); };

const getEmbedUrl = (url) => {
  if (!url) return null;
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
  
  const ytMatch = url.match(youtubeRegex);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  
  return url; 
};

const isVideoUrl = (url) => {
  return url && (url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo'));
};

// ==============================================================================
// === FILE: UserProfileModal.tsx === (O donde tengas el EditableText)
// ==============================================================================

const EditableText = ({ text, className = '', tag = 'div', placeholder = '', isDarkMode, onChange, isPreview, style = {} }) => {
  const Tag = tag;
  const safeText = (typeof text === 'string' || typeof text === 'number') ? String(text) : '';
  const defaultColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const finalClass = className.includes('text-') ? className : `${className} ${defaultColor}`;
  
  if (isPreview) { return <Tag className={finalClass} style={style}>{safeText}</Tag>; }
  
  return (
    <Tag 
      contentEditable
      suppressContentEditableWarning
      role="textbox" 
      aria-multiline="true"
      // CAMBIOS AQUÍ: Añadimos hover:bg y hover:ring para que se vea que es editable al pasar el ratón
      className={`outline-none empty:before:content-[attr(placeholder)] empty:before:text-slate-400 focus:bg-indigo-500/10 hover:bg-slate-500/5 dark:hover:bg-white/5 hover:ring-1 hover:ring-dashed hover:ring-slate-400/50 rounded px-2 -mx-2 transition-all cursor-text ${finalClass} break-words max-w-full`}
      placeholder={placeholder}
      style={style}
      onBlur={(e) => onChange && onChange(e.currentTarget.textContent)}
    >
      {safeText}
    </Tag>
  );
};

// ==============================================================================
// === FILE: ModuleHeader.tsx ===
// ==============================================================================

const ModuleHeader = ({ title, desc, onTitleChange, onDescChange, children, isDarkMode, isPreview, isCenterLayout }) => {
  const alignClass = isCenterLayout ? 'items-center text-center' : 'items-start text-left';
  
  return (
    <div className={`flex flex-col ${alignClass} mb-8 w-full relative`}>
      <div className={`w-full ${!isPreview && !isCenterLayout ? 'pr-20' : ''}`}>
        <EditableText 
          text={title} 
          className="text-3xl md:text-4xl font-bold mb-2 leading-tight" 
          tag="h3" 
          isDarkMode={isDarkMode} 
          isPreview={isPreview} 
          onChange={onTitleChange}
        />
                {(desc || onDescChange) && (
          <EditableText 
            text={desc} 
            className={`text-base leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} 
            tag="p" 
            isDarkMode={isDarkMode} 
            isPreview={isPreview} 
            onChange={onDescChange}
          />
        )}
      </div>
      
      {!isPreview && children && (
        <div className={`mt-4 flex flex-wrap gap-3 ${isCenterLayout ? 'justify-center' : 'justify-start'}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// ==============================================================================
// === FILE: AddContentFooter.tsx ===
// ==============================================================================

const AddContentFooter = ({ onAdd, isDarkMode, t, isPreview }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (isPreview) return null;
  return (
    <div className="mt-12 relative flex flex-col items-center">
      <div className={`absolute top-1/2 w-full h-px ${isDarkMode ? 'bg-white/5' : 'bg-slate-200'}`} />
      <div className="relative z-10">
        {!isOpen ? (
          <button 
            onClick={() => setIsOpen(true)} 
            className={`group px-6 py-2.5 rounded-full border shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${isDarkMode ? 'bg-[#1e2330] border-white/10 text-slate-300 hover:text-white hover:border-white/20' : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200'}`} 
            title={t.ui.addBlock}
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-xs font-bold uppercase tracking-widest">{t.ui.addBlock}</span>
          </button>
        ) : (
          <div className={`flex flex-wrap justify-center items-center gap-2 p-2 pr-4 rounded-full border shadow-xl animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1e2330] border-white/10' : 'bg-white border-slate-200'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest ml-4 mr-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.ui.addText}</span>
            <button onClick={() => { onAdd('text', 1); setIsOpen(false); }} className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`} title={t.ui.text1Col}><RectangleHorizontal size={18} /></button>
            <button onClick={() => { onAdd('text', 2); setIsOpen(false); }} className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`} title={t.ui.text2Col}><Columns size={18} /></button>
            <button onClick={() => { onAdd('text', 3); setIsOpen(false); }} className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`} title={t.ui.text3Col}><Grid3X3 size={18} /></button>
            <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
            <button onClick={() => { onAdd('image'); setIsOpen(false); }} className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`} title={t.ui.imageExtra}><ImagePlus size={18} /></button>
            <button onClick={() => setIsOpen(false)} className={`p-2.5 rounded-full hover:bg-rose-500/10 text-rose-500 ml-1`}><X size={18} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==============================================================================
// === FILE: FileUploadPlaceholder.tsx ===
// ==============================================================================

const FileUploadPlaceholder = ({ id, label, design, onUpload, isDarkMode, preview, t, isPreview, small }) => {
  if (isPreview && !preview) return null;
  return (
    <div onClick={() => !isPreview && triggerFileInput(id)} className={`w-full h-full min-h-[200px] ${design?.radius || 'rounded-xl'} ${!preview && !isPreview ? 'border-2 border-dashed' : 'border-0'} flex flex-col items-center justify-center ${!isPreview ? 'cursor-pointer' : ''} transition-all group p-4 relative overflow-hidden active:scale-[0.98] transform duration-150 ${!isPreview && (isDarkMode ? 'border-white/20 hover:border-indigo-400' : 'border-slate-300 hover:border-indigo-600')} ${preview ? 'p-0' : ''}`}>
      {!isPreview && <input id={id} type="file" className="hidden" accept="image/*" onChange={onUpload} />}
      {preview ? (
        <>
          <img src={preview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
          {!isPreview && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg touch-manipulation">{t.ui.change}</span></div>}
        </>
      ) : (
        !isPreview && <><div className={`p-4 rounded-full mb-3 transition-colors ${isDarkMode ? 'bg-white/10 group-hover:bg-indigo-500/30' : 'bg-slate-100 group-hover:bg-indigo-100'}`}><Upload size={24} className={isDarkMode ? 'text-slate-300 group-hover:text-indigo-300' : 'text-slate-600 group-hover:text-indigo-700'} /></div><span className={`text-xs font-bold uppercase tracking-widest text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span></>
      )}
    </div>
  );
};

// ==============================================================================
// === FILE: BentoEmptyCell.tsx ===
// ==============================================================================

const BentoEmptyCell = ({ id, isDarkMode, t, isPreview, onUpdate }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkVal, setLinkVal] = useState('');

  if (showLinkInput) {
     return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 z-10 absolute inset-0">
           <input 
              type="text" 
              placeholder={t.ui.pasteLink} 
              className="w-full text-xs p-3 rounded-lg border mb-3 outline-none dark:bg-slate-700 dark:text-white"
              value={linkVal}
              onChange={(e) => setLinkVal(e.target.value)}
              autoFocus
           />
           <div className="flex gap-2">
              <button 
                 onClick={() => {
                     const embed = getEmbedUrl(linkVal);
                     const type = isVideoUrl(linkVal) ? 'video' : 'image';
                     onUpdate(id, type, embed);
                 }}
                 className="px-4 py-2 bg-indigo-600 text-white text-xs rounded-lg font-bold touch-manipulation"
              >
                 {t.ui.add}
              </button>
              <button onClick={() => setShowLinkInput(false)} className="px-4 py-2 bg-slate-200 text-slate-600 text-xs rounded-lg font-bold touch-manipulation">{t.ui.cancel}</button>
           </div>
        </div>
     );
  }

  return (
     <div className="w-full h-full flex flex-col items-center justify-center relative min-h-[140px]">
         <div 
            onClick={() => !isPreview && document.getElementById(`bento-up-${id}`).click()} 
            className={`flex flex-col items-center justify-center ${!isPreview ? 'cursor-pointer' : ''} p-6 w-full h-full`}
         >
            <ImageIcon size={32} className={`mb-3 opacity-20 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
            <span className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.ui.uploadMedia}</span>
         </div>
         {!isPreview && (
            <button 
               onClick={() => setShowLinkInput(true)} 
               className={`absolute top-2 left-2 p-3 rounded-full z-10 touch-manipulation ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
               title={t.ui.pasteLink}
            >
               <Link2 size={18} />
            </button>
         )}
     </div>
  );
};

// ==============================================================================
// === FILE: DeviceMockup.tsx ===
// ==============================================================================

const DeviceMockup = ({ type, src, onUpload, onDelete, isDarkMode, label, isPreview }) => {
  const currentSize = SOCIAL_SIZES[type] || SOCIAL_SIZES.post;

  let Icon = ImageIcon;
  if (type === 'laptop') Icon = Laptop;
  if (type === 'tablet') Icon = Tablet;
  if (type === 'mobile' || type === 'reel') Icon = Smartphone;
  if (type === 'youtube') Icon = Youtube; // YouTube uses Laptop-style frame
  if (type === 'post') Icon = Instagram;
  if (type === 'avatar') Icon = User;

  // Use circular frame for avatars, standard device frame for others
  const isAvatar = type === 'avatar';
  const isHeader = type.includes('header');
  const frameClass = currentSize.style || `bg-slate-800 rounded-[2rem] border-8 border-slate-700 shadow-xl`;
  const innerClass = isAvatar ? 'rounded-full' : (currentSize.style ? 'rounded-lg' : 'rounded-[1.5rem]');
  const isDevice = !isAvatar && !isHeader;

  // Function to handle image download
  const handleDownload = (e) => {
    e.stopPropagation();
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = `${type}_mockup.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFrame = () => {
    return (
      <div onClick={() => !isPreview && onUpload()} className={`relative ${currentSize.w} ${currentSize.h} ${frameClass} overflow-hidden group/dev ${!isPreview ? 'cursor-pointer' : ''} transition-transform hover:scale-105 shrink-0 ${isAvatar || isHeader ? 'border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-md' : ''}`}>
         <div className={`w-full h-full ${isAvatar || isHeader ? '' : 'bg-white'} relative ${innerClass} overflow-hidden`}>
            {src ? <img src={src} className="w-full h-full object-cover" alt={label} /> : <div className={`w-full h-full flex items-center justify-center ${isAvatar || isHeader ? 'text-slate-300' : 'bg-slate-100 text-slate-300'}`}><Icon size={32} /></div>}
            {!isPreview && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/dev:opacity-100 flex flex-col items-center justify-center transition-opacity"><div className="bg-white/20 p-3 rounded-full mb-2"><Upload size={24} className="text-white" /></div><span className="text-[10px] text-white font-bold uppercase tracking-widest">Subir</span></div>}
         </div>
         {isDevice && (type === 'mobile' || type === 'tablet' || type === 'reel') && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-700 rounded-b-xl pointer-events-none"></div>}
         
         {!isPreview && (
            <>
                {src && <button onClick={handleDownload} className="absolute bottom-2 left-2 p-2 bg-indigo-600 text-white rounded-full opacity-0 group-hover/dev:opacity-100 transition-opacity shadow-lg z-20 hover:scale-110" title="Descargar"><Download size={14}/></button>}
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover/dev:opacity-100 transition-opacity shadow-lg z-20 hover:scale-110"><Trash2 size={14}/></button>
            </>
         )}
      </div>
    );
  }
  
  return (<div className="flex flex-col items-center gap-4 snap-center shrink-0">{renderFrame()}<span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span><span className={`block text-[10px] font-mono opacity-50 -mt-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{currentSize.dim}</span></div>);
};

// ==============================================================================
// === FILE: DynamicBlocks.tsx ===
// ==============================================================================

const DynamicBlocks = React.memo(({ blocks, update, isDarkMode, design, t, isPreview }) => {
  if (!blocks || blocks.length === 0) return null;
  const removeBlock = (index) => update(blocks.filter((_, i) => i !== index));
  const updateBlock = (index, field, value) => {
    const newBlocks = blocks.map((block, i) => i === index ? { ...block, [field]: value } : block);
    if (newBlocks[index].type === 'text' && field === 'cols') { const oldTexts = newBlocks[index].content || []; newBlocks[index].content = Array(value).fill('').map((_, i) => oldTexts[i] || ''); }
    update(newBlocks);
  };
  const updateTextContent = (rowIndex, colIndex, value) => { const newBlocks = blocks.map((block, i) => i === rowIndex ? { ...block, content: block.content.map((c, j) => j === colIndex ? value : c) } : block); update(newBlocks); };
  const handleImageUpload = (e, index) => { const file = e.target.files[0]; if (file) { const url = URL.createObjectURL(file); updateBlock(index, 'src', url); } };

  return (
    <div className="space-y-8 mt-8 w-full pt-2">
      {blocks.map((block, i) => (
        <div key={block.id || `block-${i}`} className="relative group/row">
          {!isPreview && (
            <div className="absolute -top-4 right-0 opacity-100 md:opacity-0 group-hover/row:opacity-100 transition-opacity z-10 bg-white/90 dark:bg-black/90 backdrop-blur border border-slate-200 dark:border-white/10 rounded-full p-1.5 flex items-center gap-2 shadow-lg">
              {block.type === 'text' && (<><button onClick={() => updateBlock(i, 'cols', 1)} className={`p-2 rounded-full ${block.cols === 1 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-400'}`}><RectangleHorizontal size={16}/></button><button onClick={() => updateBlock(i, 'cols', 2)} className={`p-2 rounded-full ${block.cols === 2 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-400'}`}><Columns size={16}/></button><button onClick={() => updateBlock(i, 'cols', 3)} className={`p-2 rounded-full ${block.cols === 3 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-400'}`}><Grid3X3 size={16}/></button><div className="w-px h-4 bg-slate-300 dark:bg-white/20 mx-1" /></>)}
              <button onClick={() => removeBlock(i)} className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-full"><Trash2 size={16}/></button>
            </div>
          )}
          {block.type === 'text' ? (
            <div className={`grid gap-6 ${block.cols === 1 ? 'grid-cols-1' : block.cols === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>{block.content.map((text, colIndex) => (isPreview ? <div key={`col-${colIndex}`} className={`w-full p-4 text-sm whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{String(text)}</div> : <textarea key={`col-${colIndex}`} value={text} onChange={(e) => updateTextContent(i, colIndex, e.target.value)} placeholder={t.ui.placeholders.text} className={`w-full bg-transparent p-4 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[120px] text-sm ${isDarkMode ? 'text-slate-300 bg-white/5 placeholder-slate-600' : 'text-slate-600 bg-slate-50 placeholder-slate-400'}`} />))}</div>
          ) : (
            <div className="w-full"><FileUploadPlaceholder id={`extra-img-${block.id}`} label={t.ui.imageExtra} design={design} isDarkMode={isDarkMode} onUpload={(e) => handleImageUpload(e, i)} preview={block.src} t={t} isPreview={isPreview} /></div>
          )}
        </div>
      ))}
    </div>
  );
});

const GridOverlay = ({ type }) => (
  <div className="absolute inset-0 z-20 pointer-events-none opacity-30">
    {type === 'grid1' && <div className="w-full h-full grid grid-cols-12 gap-4 px-4">{Array(12).fill(0).map((_, i) => <div key={`g1-${i}`} className="h-full bg-rose-500/10 border-x border-rose-500/20"></div>)}</div>}
    {type === 'grid2' && <div className="w-full h-full grid grid-cols-6 grid-rows-4 gap-4 p-4">{Array(24).fill(0).map((_, i) => <div key={`g2-${i}`} className="w-full h-full bg-indigo-500/10 border border-indigo-500/20"></div>)}</div>}
    {type === 'grid3' && <div className="w-full h-full flex flex-col justify-between py-4">{Array(20).fill(0).map((_, i) => <div key={`g3-${i}`} className="w-full h-px bg-cyan-500/30"></div>)}</div>}
    {type === 'grid4' && <div className="w-full h-full grid grid-cols-12 gap-4 p-4"><div className="col-span-8 row-span-2 bg-emerald-500/10 border border-emerald-500/20"></div><div className="col-span-4 row-span-1 bg-emerald-500/10 border border-emerald-500/20"></div><div className="col-span-4 row-span-1 bg-emerald-500/10 border border-emerald-500/20"></div></div>}
  </div>
);

// --- 5. MÓDULOS DE CONTENIDO ---

const HeroModule = React.memo(({ content, update, design, isDarkMode, t, isPreview }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('bg'); // 'bg' o 'text'
  const [showTextMenu, setShowTextMenu] = useState(false);

  const updateContent = (changes) => { update({ ...content, ...changes }); };
  
  const handleImageUpload = (e) => { 
      const file = e.target.files[0]; 
      if (file) { 
          const url = URL.createObjectURL(file); 
          updateContent({ bgType: 'image', bgValue: url });
          setShowColorPicker(false); 
      } 
  };

  let bgStyle = {}; 
  if (content?.bgType === 'image' && content?.bgValue) {
      bgStyle = { backgroundImage: `url(${content.bgValue})`, backgroundSize: 'cover', backgroundPosition: 'center' }; 
  } else if (content?.bgType === 'color' && content?.bgValue) {
      bgStyle = { backgroundColor: content.bgValue };
  }

  const isDarkBg = isDarkMode || content?.bgType === 'image';
  const titleColorClass = isDarkBg ? 'text-white' : 'text-slate-900';
  const subtitleColorClass = isDarkBg ? 'text-white/90' : 'text-slate-600';

  const customTextColor = content?.textColor ? { color: content.textColor } : {};

  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-12 text-center relative group overflow-hidden" style={bgStyle}>
      {!content?.bgType && <div className={`absolute inset-0 z-0 ${isDarkMode ? 'bg-gradient-to-b from-indigo-900/10' : 'bg-gradient-to-b from-slate-50'}`} />}
      {content?.bgType === 'image' && <div className="absolute inset-0 bg-black/40 z-0" />}
      
{!isPreview && (
        <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          
          {/* CONTENEDOR PRINCIPAL DEL MENÚ */}
          <div className="bg-white/95 dark:bg-slate-950/90 text-slate-700 dark:text-slate-200 backdrop-blur-xl p-1 rounded-full shadow-2xl border border-slate-200/60 dark:border-white/5 flex gap-0.5 relative">
            
            {/* Botón Brocha (Color) */}
            <button onClick={() => { setShowColorPicker(!showColorPicker); setShowTextMenu(false); }} className={`p-2.5 rounded-full transition-colors ${showColorPicker ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}><PaintBucket size={18} /></button>
            
            {/* Botón Imagen (Fondo) */}
            <button onClick={() => triggerFileInput('hero-bg-upload')} className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"><ImagePlus size={18} /></button>
            <input id="hero-bg-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            
            <div className="w-px h-6 bg-slate-300 dark:bg-white/20 mx-1 my-auto"></div>
            
            {/* NUEVO BOTÓN TEXTO (Tamaño y Kerning) */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowTextMenu(!showTextMenu);
                  setShowColorPicker(false);
                }} 
                className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${showTextMenu ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
                title="Opciones de texto"
              >
                <Type size={18} />
              </button>

{showTextMenu && (
                <div className="absolute top-full right-0 mt-3 p-4 bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-white/5 w-64 z-50 flex flex-col gap-4 animate-in fade-in slide-in-from-top-3 duration-200">
                  
                  {/* Selector de Tamaño */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 block">Tamaño</span>
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                      <button onClick={() => updateContent({ textSize: 'medium' })} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${content?.textSize === 'medium' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Mediano</button>
                      <button onClick={() => updateContent({ textSize: 'large' })} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${content?.textSize !== 'medium' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Grande</button>
                    </div>
                  </div>

                  {/* NUEVO: Selector de Peso */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 block">Grosor (Peso)</span>
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                      <button onClick={() => updateContent({ textWeight: 'regular' })} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${content?.textWeight === 'regular' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Regular</button>
                      <button onClick={() => updateContent({ textWeight: 'semibold' })} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${content?.textWeight === 'semibold' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Semi</button>
                      <button onClick={() => updateContent({ textWeight: 'black' })} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${!content?.textWeight || content?.textWeight === 'black' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Bold</button>
                    </div>
                  </div>

                  {/* Selector de Kerning */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 block">Separación (Kerning)</span>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => updateContent({ textSpacing: 'tight' })} className={`px-3 py-2 text-xs text-left rounded-lg transition-colors ${content?.textSpacing === 'tight' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                        Apretado
                      </button>
                      <button onClick={() => updateContent({ textSpacing: 'normal' })} className={`px-3 py-2 text-xs text-left rounded-lg transition-colors ${!content?.textSpacing || content?.textSpacing === 'normal' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                        Normal
                      </button>
                      <button onClick={() => updateContent({ textSpacing: 'wide' })} className={`px-3 py-2 text-xs text-left rounded-lg transition-colors ${content?.textSpacing === 'wide' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                        Separado
                      </button>
                    </div>
                  </div>

                </div>
              )}
                          </div>

            {/* EL SUBMENÚ DE COLOR ORIGINAL */}
            {showColorPicker && (
              <div className="absolute top-full right-0 mt-3 p-5 bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-white/5 w-64 z-50 flex flex-col gap-5 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-full flex gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <button onClick={() => setActiveTab('bg')} className={`flex-1 px-4 py-2 rounded-full transition-all ${activeTab === 'bg' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow' : 'hover:text-slate-700 dark:hover:text-slate-300'}`}>{t.modules.hero.background || 'Fondo'}</button>
                    <button onClick={() => setActiveTab('text')} className={`flex-1 px-4 py-2 rounded-full transition-all ${activeTab === 'text' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow' : 'hover:text-slate-700 dark:hover:text-slate-300'}`}>{t.modules.hero.text || 'Texto'}</button>
                </div>

                {activeTab === 'bg' && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                        <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                            <input type="color" value={content?.bgType === 'color' ? (content?.bgValue || '#ffffff') : '#ffffff'} onChange={(e) => updateContent({ bgType: 'color', bgValue: e.target.value })} className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0" />
                            <input type="text" value={content?.bgType === 'color' ? content?.bgValue : ''} onChange={(e) => updateContent({ bgType: 'color', bgValue: e.target.value })} placeholder="#HEX" className="flex-1 text-xs p-2 rounded-lg bg-transparent text-slate-900 dark:text-white outline-none uppercase font-mono" />
                        </div>
                        <div>
                           <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 block">Presets</span>
                           <div className="grid grid-cols-8 gap-1.5">
                             {PRESET_COLORS.map(c => <button key={c} onClick={() => {updateContent({ bgType: 'color', bgValue: c }); setShowColorPicker(false);}} className={`w-5 h-5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm hover:scale-110 transition-transform ${content?.bgValue === c && content?.bgType === 'color' ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' : ''}`} style={{backgroundColor:c}} />)}
                           </div>
                        </div>
                    </div>
                )}

                {activeTab === 'text' && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                        <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                            <input type="color" value={content?.textColor || (isDarkBg ? '#ffffff' : '#111111')} onChange={(e) => updateContent({ textColor: e.target.value })} className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0" />
                            <input type="text" value={content?.textColor || ''} onChange={(e) => updateContent({ textColor: e.target.value })} placeholder="Auto" className="flex-1 text-xs p-2 rounded-lg bg-transparent text-slate-900 dark:text-white outline-none uppercase font-mono" />
                        </div>
                        {content?.textColor && (
                            <button onClick={() => updateContent({ textColor: null })} className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 rounded-xl text-xs font-bold transition-colors">
                                <X size={14}/> {t.ui.reset || 'Restaurar automático'}
                            </button>
                        )}
                        {!content?.textColor && (
                            <div className="text-center py-6 px-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                              <span className="text-3xl block mb-2"></span>
                              <p className="text-xs text-slate-500 dark:text-slate-400">El color del texto se ajusta automáticamente según el fondo.</p>
                            </div>
                        )}
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}      
      <div className="relative z-10 max-w-5xl w-full">
       
<EditableText 
         text={content?.title || t.modules.hero.title} 
         className={`${content?.textWeight === 'regular' ? 'font-normal' : content?.textWeight === 'semibold' ? 'font-semibold' : 'font-black'} mb-7 transition-all duration-300 ${content?.textColor ? '' : titleColorClass} ${content?.textSize === 'medium' ? 'text-4xl md:text-5xl lg:text-7xl' : 'text-5xl md:text-7xl lg:text-9xl'} ${content?.textSpacing === 'tight' ? 'tracking-tighter' : content?.textSpacing === 'wide' ? 'tracking-widest' : 'tracking-normal'}`} 
         tag="h1"
            isPreview={isPreview} 
            onChange={(v) => update({...content, title: v})} 
            style={customTextColor} 
        />
                <EditableText 
            text={content?.subtitle || t.modules.hero.subtitle} 
            className={`text-lg md:text-3xl font-medium max-w-4xl mx-auto leading-relaxed ${content?.textColor ? '' : subtitleColorClass}`} 
            tag="p" 
            isPreview={isPreview} 
            onChange={(v) => update({...content, subtitle: v})} 
            style={content?.textColor ? { color: content.textColor, opacity: 0.9 } : {}} 
        />
      </div>
    </div>
  );
});
const IdentityModule = React.memo(({ content, update, design, isDarkMode, t, isPreview }) => {
  const [editingIconId, setEditingIconId] = useState(null);

  const defaultItems = [
    { id: 1, icon: 'target', title: t.modules.identity.precision, desc: t.modules.identity.precisionDesc },
    { id: 2, icon: 'shield', title: t.modules.identity.integrity, desc: t.modules.identity.integrityDesc },
    { id: 3, icon: 'globe', title: t.modules.identity.innovation, desc: t.modules.identity.innovationDesc },
  ];
  
  const items = content.items || defaultItems;

  const AVAILABLE_ICONS = [
    { id: 'fingerprint', component: Fingerprint },
    { id: 'target', component: Target },
    { id: 'shield', component: Shield },
    { id: 'award', component: Award },
    { id: 'globe', component: Globe },
    { id: 'zap', component: Zap },
    { id: 'heart', component: Heart },
    { id: 'star', component: Star },
    { id: 'lightbulb', component: Lightbulb },
    { id: 'smile', component: Smile },
    { id: 'flag', component: Flag },
    { id: 'key', component: Key },
  ];

  const updateItem = (id, field, value) => {
    const newItems = items.map(item => item.id === id ? { ...item, [field]: value } : item);
    update({ ...content, items: newItems });
  };

  const addItem = () => {
    const newItem = { 
      id: Date.now(), 
      icon: 'star', 
      title: 'Nuevo Valor', 
      desc: 'Descripción del valor corporativo.' 
    };
    update({ ...content, items: [...items, newItem] });
  };

  const removeItem = (id) => {
    update({ ...content, items: items.filter(item => item.id !== id) });
  };

  const handleIconSelect = (itemId, iconId) => {
    updateItem(itemId, 'icon', iconId);
    setEditingIconId(null);
  };

  const getIconComponent = (iconId) => {
    const iconObj = AVAILABLE_ICONS.find(i => i.id === iconId);
    return iconObj ? iconObj.component : Fingerprint;
  };

  const handleAddExtra = (type, param) => { const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null }; update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); };

return (
    <div className="p-6 md:p-10 relative">
      <ModuleHeader 
        title={content.title || t.modules.identity.title} 
        onTitleChange={(v) => update({ ...content, title: v })}
        desc={content.desc || t.modules.identity.desc} 
        onDescChange={(v) => update({ ...content, desc: v })}
        isDarkMode={isDarkMode} 
        isPreview={isPreview}
      >
         <button onClick={addItem} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-colors flex-shrink-0 shadow-sm ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'}`}>            <Plus size={14}/> {t.ui.add}
         </button>
      </ModuleHeader>
      
      {/* Grid Ajustado: 1 col (movil), 2 cols (tablet), 3 cols (desktop - más anchos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {items.map((item) => {
          const Icon = getIconComponent(item.icon);
          return (
            <div key={item.id} className={`group/card relative p-8 rounded-[2rem] transition-all duration-300 hover:-translate-y-1 flex flex-col h-full ${isDarkMode ? 'bg-white/5 border border-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-white hover:shadow-xl border border-slate-100'}`}>
              
              {/* Icon Container */}
              <div className="relative mb-6 self-start">
                 <button 
                    onClick={() => !isPreview && setEditingIconId(editingIconId === item.id ? null : item.id)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 transition-colors ${!isPreview ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-white shadow-sm border border-indigo-100 hover:border-indigo-300'}`}
                 >
                    <Icon size={28} strokeWidth={2} />
                 </button>

                 {/* Icon Selector Popover */}
                 {!isPreview && editingIconId === item.id && (
                    <div className={`absolute top-full left-0 mt-2 p-3 rounded-2xl shadow-2xl border z-50 w-64 grid grid-cols-6 gap-2 animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1e2330] border-white/10' : 'bg-white border-slate-200'}`}>
                       {AVAILABLE_ICONS.map((iconOption) => {
                          const OptionIcon = iconOption.component;
                          return (
                             <button
                                key={iconOption.id}
                                onClick={() => handleIconSelect(item.id, iconOption.id)}
                                className={`p-2 rounded-lg flex items-center justify-center transition-colors ${item.icon === iconOption.id ? 'bg-indigo-600 text-white' : (isDarkMode ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600')}`}
                             >
                                <OptionIcon size={18} />
                             </button>
                          );
                       })}
                    </div>
                 )}

                 {/* Click outside closer helper (transparent) */}
                 {!isPreview && editingIconId === item.id && (
                    <div className="fixed inset-0 z-40" onClick={() => setEditingIconId(null)} />
                 )}
              </div>

              <EditableText 
                text={item.title} 
                className={`text-xl font-black mb-3 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`} 
                isDarkMode={isDarkMode} 
                isPreview={isPreview} 
                onChange={(v) => updateItem(item.id, 'title', v)} 
              />
              <EditableText 
                text={item.desc} 
                className={`text-base leading-relaxed opacity-80 flex-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} 
                isDarkMode={isDarkMode} 
                isPreview={isPreview} 
                onChange={(v) => updateItem(item.id, 'desc', v)} 
              />

              {!isPreview && (
                 <button 
                    onClick={() => removeItem(item.id)} 
                    className="absolute top-4 right-4 p-2 text-rose-400 opacity-0 group-hover/card:opacity-100 transition-all hover:bg-rose-500/10 hover:text-rose-500 rounded-full"
                    title="Eliminar"
                 >
                    <Trash2 size={16} />
                 </button>
              )}
            </div>
          );
        })}
      </div>

      <DynamicBlocks blocks={content?.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

const HeaderModule = React.memo(({ content, update, design, isDarkMode, allItems, t, isPreview }) => {
  const handleLogoUpload = (e) => { const file = e.target.files[0]; if (file) update({ ...content, logo: URL.createObjectURL(file) }); };
  const scrollToModule = (id) => { const element = document.getElementById(`module-${id}`); if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  
  // 1. Filtramos módulos activos (quitamos cabecera y pie) [cite: 1758]
  const navItems = allItems.filter(i => i.type !== 'header' && i.type !== 'footer');

  // 2. Lógica para obtener el nombre exacto que el usuario ve en el portal [cite: 1614-1621]
  const getModuleDisplayName = (item) => {
    // Si el usuario editó el título manualmente en el módulo, usamos ese
    if (item.content?.title && typeof item.content.title === 'string' && item.content.title.trim() !== "") return item.content.title;
    // Si no, buscamos el título oficial en la traducción de módulos (Ej: "Iconografía", "Web")
    if (t.modules[item.type]?.title) return t.modules[item.type].title;
    // Fallback: Nombre de la herramienta en UI o tipo capitalizado
    return t.ui[item.type] || item.type.charAt(0).toUpperCase() + item.type.slice(1);
  };
  
  return (
    <div className={`w-full p-4 md:p-5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-20 transition-all duration-500 backdrop-blur-xl ${design.radius} ${design.border} ${design.shadow} ${isDarkMode ? 'bg-slate-950/80 border-white/10 shadow-2xl' : 'bg-white/80 border-white/40 shadow-xl'}`}>
      <div className={`flex items-center gap-4 flex-shrink-0`}>
        <div onClick={() => !isPreview && document.getElementById('header-logo-upload').click()} className={`relative h-12 w-12 md:h-14 md:w-14 flex-shrink-0 cursor-pointer group rounded-xl overflow-hidden border flex items-center justify-center transition-all ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
          {content?.logo ? <img src={content.logo} alt="Logo" className="w-full h-full object-contain p-1.5" style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }} /> : <ImageIcon size={20} className="opacity-40" />}
          {!isPreview && <input id="header-logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />}
        </div>
        <div className="flex flex-col">
            <EditableText text={content?.title || t.modules.header.title} className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`} onChange={(val) => update({...content, title: val})} isDarkMode={isDarkMode} isPreview={isPreview} />
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-50">{t.modules.header.subtitle}</span>
        </div>
      </div>

      <div className="w-full md:w-auto relative group z-30 lg:ml-4">
        <button className={`w-full md:w-56 flex items-center justify-between px-5 py-2.5 rounded-full border text-left transition-all ${isDarkMode ? 'bg-black/20 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
          <div className="flex items-center gap-2">
            <Anchor size={14} className="opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-wide">{t.ui.navigate}</span>
          </div>
          <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform" />
        </button>
        
        {/* LISTADO DINÁMICO MEJORADO */}
        <div className={`absolute top-full right-0 mt-2 w-full py-2 rounded-2xl border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            {navItems.map((item, i) => (
              <button 
                key={item.id} 
                onClick={() => scrollToModule(item.id)} 
                className={`w-full text-left px-4 py-2.5 text-xs font-bold border-l-4 border-transparent hover:border-indigo-500 transition-all flex items-center gap-3 ${isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
              >
                <span className="opacity-30 font-mono text-[10px] w-4">{String(i + 1).padStart(2, '0')}</span> 
                <span className="truncate">{getModuleDisplayName(item)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});const LayoutModule = React.memo(({ content, update, design, isDarkMode, t, isPreview }) => {
  const handleAddExtra = (type, param) => { const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null }; update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); };
  const toggleDownload = () => update({ ...content, showDownload: !content.showDownload });
  const updateLink = (val) => update({ ...content, downloadUrl: val });
  const handlePreviewUpload = (e) => { const file = e.target.files[0]; if(file) update({ ...content, previewImage: URL.createObjectURL(file) }); };
  
  const selectedGrid = content?.selectedGrid || 'grid1';
  const grids = [
    { id: 'grid1', label: t.modules.layout.grid1, cols: 12 },
    { id: 'grid2', label: t.modules.layout.grid2, cols: 6 }, // Modular
    { id: 'grid3', label: t.modules.layout.grid3, cols: 1 }, // Baseline
    { id: 'grid4', label: t.modules.layout.grid4, cols: 4 }, // Hierarchical
  ];

  // Robust initialization
  const usageExamples = content?.usageExamples || [];
  const usageTitle = content?.usageTitle || t.modules.layout.usageTitle; // Editable Title
  const usageDesc = content?.usageDesc || t.modules.layout.usageDesc;   // Editable Desc
  
  const addExample = () => update({ ...content, usageExamples: [...usageExamples, { id: Date.now(), src: null, title: 'Nuevo Caso', desc: 'Descripción del caso...', selectedGrid: 'grid1', templateUrl: '' }] });
  
  const updateExample = (id, field, value) => {
    // Immutable update pattern using map
    const newExamples = usageExamples.map(e => e.id === id ? { ...e, [field]: value } : e);
    update({ ...content, usageExamples: newExamples });
  };
  const handleExampleUpload = (e, id) => { const file = e.target.files[0]; if (file) updateExample(id, 'src', URL.createObjectURL(file)); };
  
  const duplicateExample = (id) => {
      const index = usageExamples.findIndex(e => e.id === id);
      if (index === -1) return;
      const exampleToCopy = usageExamples[index];
      const newExample = { ...exampleToCopy, id: Date.now() + Math.random() };
      const newExamples = [...usageExamples];
      newExamples.splice(index + 1, 0, newExample);
      update({ ...content, usageExamples: newExamples });
  };

  return (
    <div className="p-6 md:p-10 relative">
      <ModuleHeader title={t.modules.layout.title} desc={t.modules.layout.desc} isDarkMode={isDarkMode} isPreview={isPreview}>
         <div className="flex gap-2">
             {!isPreview && (
              <button 
                onClick={toggleDownload} 
                className={`p-2 rounded-full border transition-colors ${content.showDownload ? 'bg-indigo-100 border-indigo-200 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400' : (isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-600')}`} 
                title={t.modules.layout.toggleDownload}
              >
                <Download size={16}/>
              </button>
            )}
            {!isPreview && <button onClick={addExample} className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 bg-indigo-600 text-white rounded-full transition-all active:scale-95 shadow-lg shadow-indigo-500/20"><Plus size={14}/> {t.ui.addExample}</button>}
         </div>
      </ModuleHeader>

      <div className="flex flex-wrap gap-2 mb-6">
        {grids.map(g => (
            <button 
                key={g.id}
                onClick={() => update({...content, selectedGrid: g.id})}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${selectedGrid === g.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : (isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600')}`}
            >
                {g.label}
            </button>
        ))}
      </div>

      <div className={`w-full aspect-video rounded-2xl border relative overflow-hidden group ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
          {content?.previewImage ? (
              <img src={content.previewImage} className="w-full h-full object-cover" alt="Layout Preview" />
          ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <LayoutGrid size={48} className={`mb-2 opacity-20 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
                  <span className={`text-xs font-bold uppercase tracking-widest opacity-40 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.modules.layout.uploadLabel}</span>
              </div>
          )}
          <GridOverlay type={selectedGrid} />
          {!isPreview && (<> <div onClick={() => document.getElementById('layout-up').click()} className="absolute inset-0 cursor-pointer hover:bg-black/10 transition-colors z-0"></div> <input id="layout-up" type="file" className="hidden" accept="image/*" onChange={handlePreviewUpload} /> </>)}
      </div>

      <div className="space-y-12 mt-12">
         <div className="flex flex-col gap-2 border-l-4 border-indigo-500 pl-6 mb-8">
            <EditableText 
                text={usageTitle} 
                className="text-2xl font-black tracking-tight uppercase" 
                isDarkMode={isDarkMode} 
                isPreview={isPreview} 
                onChange={(v) => update({...content, usageTitle: v})} 
            />
            <EditableText 
                text={usageDesc} 
                className="text-sm opacity-60 max-w-2xl" 
                isDarkMode={isDarkMode} 
                isPreview={isPreview} 
                onChange={(v) => update({...content, usageDesc: v})} 
            />
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {usageExamples.map(example => (
              <div key={example.id} className={`group relative flex flex-col p-6 transition-all duration-300 ${design.radius} border hover:shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200 hover:border-indigo-500/50 shadow-sm'}`}>
                 {!isPreview && (
                    <div className="flex flex-wrap gap-1.5 mb-4 p-1.5 bg-white/50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10">
                        {grids.map(g => (
                            <button key={g.id} onClick={() => updateExample(example.id, 'selectedGrid', g.id)} className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${example.selectedGrid === g.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-indigo-600'}`}>{g.label.split(' ')[0]}</button>
                        ))}
                    </div>
                 )}

                 <div onClick={() => !isPreview && document.getElementById(`ex-up-${example.id}`).click()} className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 mb-6 relative flex items-center justify-center cursor-pointer shadow-inner">
                    {example.src ? <img src={example.src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={example.title} /> : <ImageIcon className="opacity-20" size={48} />}
                    <GridOverlay type={example.selectedGrid} />
                    {!isPreview && <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white backdrop-blur-[2px] z-30"><Upload size={24}/><span className="text-xs font-bold mt-2 uppercase">Subir</span></div>}
                 </div>

                 {!isPreview && <input id={`ex-up-${example.id}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleExampleUpload(e, example.id)} />}
                 
                 <div className="space-y-2 flex-1">
                    <EditableText text={example.title} className="font-black text-xl md:text-2xl uppercase tracking-tight" isDarkMode={isDarkMode} isPreview={isPreview} onChange={(v) => updateExample(example.id, 'title', v)} />
                    <EditableText text={example.desc} className="text-sm md:text-base leading-relaxed opacity-70" isDarkMode={isDarkMode} isPreview={isPreview} onChange={(v) => updateExample(example.id, 'desc', v)} />
                 </div>

                 <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
                    {!isPreview && (
                        <input 
                            type="text" 
                            value={example.templateUrl || ''} 
                            onChange={(e) => updateExample(example.id, 'templateUrl', e.target.value)}
                            placeholder="URL de la plantilla (Figma, Drive...)"
                            className={`w-full text-[10px] p-2 rounded border bg-transparent mb-2 outline-none transition-colors ${isDarkMode ? 'border-white/20 text-slate-300 focus:border-indigo-500' : 'border-slate-300 text-slate-600 focus:border-indigo-500'}`}
                        />
                    )}
                    <a 
                        href={example.templateUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            !example.templateUrl && !isPreview ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
                        } ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                        <Download size={14} /> {t.modules.layout.downloadText || "Descargar Plantilla"}
                    </a>
                 </div>

                 {!isPreview && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-40">
                        <button onClick={() => duplicateExample(example.id)} className="p-2 bg-white text-indigo-600 rounded-full hover:scale-110 shadow-lg" title={t.ui.duplicate}><Copy size={16}/></button>
                        <button onClick={() => update({...content, usageExamples: usageExamples.filter(e => e.id !== example.id)})} className="p-2 bg-rose-500 text-white rounded-full hover:scale-110 shadow-lg"><Trash2 size={16}/></button>
                    </div>
                 )}
              </div>
            ))}

            {!isPreview && usageExamples.length % 2 !== 0 && (
                <div onClick={addExample} className={`flex flex-col items-center justify-center p-12 border-4 border-dashed rounded-3xl transition-all hover:bg-indigo-500/5 group/add ${isDarkMode ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-300'} cursor-pointer`}>
                   <Plus size={48} className="mb-4 opacity-20 group-hover/add:opacity-100 transition-opacity group-hover/add:scale-110 duration-300" />
                   <span className="text-sm font-bold uppercase tracking-widest">{t.ui.addExample}</span>
                </div>
            )}
         </div>
      </div>

      {content.showDownload && (
          <div className={`mt-8 pt-6 border-t border-dashed ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              {!isPreview && (
                  <input 
                      type="text" 
                      value={content.downloadUrl || ''} 
                      onChange={(e) => updateLink(e.target.value)} 
                      placeholder="https://figma.com/file/..." 
                      className={`w-full p-3 text-xs rounded-lg mb-4 outline-none border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-600 focus:border-indigo-500'}`}
                  />
              )}
              <a 
                  href={content.downloadUrl || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${!content.downloadUrl && !isPreview ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                  <Download size={16} />
                  {t.modules.layout.downloadText}
              </a>
          </div>
      )}

      <DynamicBlocks blocks={content.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

const LogoModule = React.memo(({ content, update, design, isDarkMode, t, isPreview }) => {
  const addRule = (type) => { const current = content[type] || []; update({ ...content, [type]: [...current, { text: '...', image: null }] }); };
  const removeRule = (type, i) => { const current = content[type] || []; update({ ...content, [type]: current.filter((_, idx) => idx !== i) }); };
  const updateRuleText = (type, i, val) => { const current = [...(content[type] || [])]; current[i].text = val; update({ ...content, [type]: current }); };
  const handleRuleImageUpload = (e, type, index) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newRules = [...(content[type] || [])];
      newRules[index] = { ...newRules[index], image: url };
      update({ ...content, [type]: newRules });
    }
  };
  const dos = content.dos || []; const donts = content.donts || [];
  const variations = content.variations || [{ id: 1, label: t.defaults.logoMain, desc: t.defaults.logoMainDesc, bg: 'light' }, { id: 2, label: t.defaults.logoDark, desc: t.defaults.logoDarkDesc, bg: 'dark' }, { id: 3, label: t.defaults.logoSymbol, desc: t.defaults.logoSymbolDesc, bg: 'light' }];
  
  const addVariation = () => update({...content, variations: [...variations, { id: Date.now(), label: 'Versión...', desc: 'Descripción...', bg: 'light', src: null }]});
  const removeVariation = (id) => update({...content, variations: variations.filter(v => v.id !== id)});
  const updateVariation = (id, field, value) => update({...content, variations: variations.map(v => v.id === id ? {...v, [field]: value} : v)});
  const handleVariationUpload = (e, id) => { const file = e.target.files[0]; if(file) updateVariation(id, 'src', URL.createObjectURL(file)); };

  const handleLogoDownload = (e, src, label) => {
    e.stopPropagation();
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = `${label.replace(/\s+/g, '_')}_logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddExtra = (type, param) => {
    const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null };
    update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] });
  };
  
  const handleSafeAreaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      update({ ...content, safeAreaImage: url });
    }
  };

  const isCenterLayout = content.layout === 'center';

  return (
    <div className="p-6 md:p-10 relative">
      <ModuleHeader 
        title={t.modules.logo.title} 
        desc={t.modules.logo.desc} 
        isDarkMode={isDarkMode} 
        isPreview={isPreview}
        isCenterLayout={isCenterLayout}
      >
        <button onClick={addVariation} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-colors flex-shrink-0 shadow-sm ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'}`}>
          <Plus size={14}/> {t.modules.logo.addVariant}
        </button>
      </ModuleHeader>

      <div className={`flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-10 mt-10 md:items-start ${isCenterLayout ? 'items-center' : ''}`}>
         {variations.map((variant) => (
             <div key={variant.id} className={`space-y-4 group w-full ${isCenterLayout ? 'text-center' : ''}`}>
                 <div className={`aspect-video md:aspect-square w-full rounded-3xl border relative flex items-center justify-center overflow-hidden transition-colors shadow-sm ${variant.bg === 'dark' ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'}`}>
                    {variant.src ? <img src={variant.src} className="w-2/3 h-2/3 object-contain" alt={variant.label} /> : <div className={`text-center p-4 opacity-30 font-bold ${variant.bg === 'dark' ? 'text-white' : 'text-slate-900'}`}>LOGO</div>}
                    
                    {variant.src && (
                        <div className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => handleLogoDownload(e, variant.src, variant.label)}
                                className="p-2.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110"
                                title="Descargar Logotipo"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    )}

                    {!isPreview && (
                        <>
<div className="absolute top-3 right-3 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
            onClick={() => updateVariation(variant.id, 'bg', variant.bg === 'light' ? 'dark' : 'light')} 
            className={`p-2 backdrop-blur-md rounded-full shadow-md touch-manipulation transition-colors ${variant.bg === 'dark' ? 'bg-white/20 text-white hover:bg-white/40' : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
            title="Cambiar fondo"
        >
            <SunMoon size={16}/>
        </button>
        <button onClick={() => removeVariation(variant.id)} className="p-2 bg-rose-500 rounded-full text-white hover:bg-rose-600 shadow-md touch-manipulation" title="Eliminar"><Trash2 size={16}/></button>
    </div>                            <div onClick={() => document.getElementById(`var-up-${variant.id}`).click()} className="absolute inset-0 cursor-pointer hover:bg-black/5 transition-colors z-0"></div>
                            <input id={`var-up-${variant.id}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleVariationUpload(e, variant.id)} />
                        </>
                    )}
                 </div>
                 <div className="space-y-1 px-1">
                     <EditableText text={variant.label} className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`} isDarkMode={isDarkMode} isPreview={isPreview} onChange={(v) => updateVariation(variant.id, 'label', v)} />
                     <EditableText text={variant.desc} className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} isDarkMode={isDarkMode} isPreview={isPreview} onChange={(v) => updateVariation(variant.id, 'desc', v)} />
                 </div>
             </div>
         ))}
      </div>
      
      <div className="mt-16">
        <h4 className={`text-xs font-bold uppercase tracking-widest mb-6 opacity-50 px-1 ${isCenterLayout ? 'text-center' : ''}`}>{t.modules.logo.safeArea}</h4>
        <div className={`w-full aspect-[2/1] md:aspect-[3/1] ${design.radius} border flex flex-col items-center justify-center relative ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} p-12`}>
            {/* Safe Area Container */}
            <div className="relative group/safe">
                {/* The Logo Box */}
                <div 
                    onClick={() => !isPreview && document.getElementById('safe-area-upload').click()}
                    className={`w-40 h-20 border border-dashed border-indigo-500/50 flex items-center justify-center relative ${!isPreview ? 'cursor-pointer hover:bg-indigo-500/5 transition-colors' : ''}`}
                >
                    {content.safeAreaImage ? (
                        <img src={content.safeAreaImage} alt="Safe Area Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                        <span className="text-sm font-mono font-bold text-indigo-500">LOGO</span>
                    )}
                    {!isPreview && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/safe:opacity-100 transition-opacity"><Upload size={16} className="text-indigo-500" /></div>}
                </div>
                {!isPreview && <input id="safe-area-upload" type="file" className="hidden" accept="image/*" onChange={handleSafeAreaUpload} />}

                {/* X Value Top */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-indigo-400 font-mono flex flex-col items-center">
                   <div className="h-4 border-l border-indigo-300/50 mb-1"></div>
                   <EditableText 
                      text={content.safeAreaXValue || "30px"} 
                      className="text-center min-w-[30px] whitespace-nowrap" 
                      isDarkMode={isDarkMode} 
                      isPreview={isPreview} 
                      onChange={(v) => update({...content, safeAreaXValue: v})} 
                   />
                </div>
                
                {/* X Value Right */}
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-xs text-indigo-400 font-mono flex items-center">
                   <div className="w-4 border-t border-indigo-300/50 mr-1"></div>
                   <EditableText 
                      text={content.safeAreaXValue || "30px"} 
                      className="text-center min-w-[30px] whitespace-nowrap" 
                      isDarkMode={isDarkMode} 
                      isPreview={isPreview} 
                      onChange={(v) => update({...content, safeAreaXValue: v})} 
                   />
                </div>
                
                {/* Corner Markers */}
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-indigo-500/30"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t border-r border-indigo-500/30"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b border-l border-indigo-500/30"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-indigo-500/30"></div>
            </div>

            {/* Description Text */}
            <div className={`mt-12 ${isCenterLayout ? 'text-center' : 'text-center'}`}>
                <EditableText 
                    text={content.safeAreaDescription || "El área de seguridad es el espacio vital que debe rodear al logotipo para asegurar su legibilidad y prominencia."} 
                    className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} max-w-lg mx-auto`}
                    tag="p"
                    isDarkMode={isDarkMode} 
                    isPreview={isPreview}
                    onChange={(v) => update({...content, safeAreaDescription: v})}
                />
            </div>
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-2 gap-8 mt-16">
        <div className={`p-6 md:p-8 ${design.radius} border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-3"><Check size={20} /> {t.modules.logo.correct}</h4>
            {!isPreview && <button onClick={() => addRule('dos')} className="p-2 hover:bg-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 transition-colors"><Plus size={20}/></button>}
          </div>
          <div className="space-y-8">
            {dos.map((rule, i) => (
              <div key={`do-${i}`} className="group relative">
                 <div 
                    onClick={() => !isPreview && document.getElementById(`rule-dos-${i}`).click()}
                    className={`w-full aspect-[4/3] md:aspect-video ${design.radius} bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-transparent mb-3 transition-colors ${!isPreview ? 'cursor-pointer hover:border-indigo-500 border-dashed' : ''}`}
                 >
                    {rule.image ? <img src={rule.image} alt="Rule" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2 opacity-30"><ImageIcon size={24} /><span className="text-[10px] font-bold uppercase">Subir</span></div>}
                 </div>
                 {!isPreview && <input id={`rule-dos-${i}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleRuleImageUpload(e, 'dos', i)} />}
                 
                 <EditableText text={rule.text} className="w-full text-sm leading-relaxed font-medium" isDarkMode={isDarkMode} isPreview={isPreview} onChange={(v) => updateRuleText('dos', i, v)} />
                 
                 {!isPreview && <button onClick={() => removeRule('dos', i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-black/90 text-rose-500 p-2 rounded-full shadow-sm hover:scale-110 transition-all z-10"><Trash2 size={16}/></button>}
              </div>
            ))}
          </div>
        </div>
        <div className={`p-6 md:p-8 ${design.radius} border ${isDarkMode ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-50 border-rose-200'}`}>
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-3"><AlertCircle size={20} /> {t.modules.logo.incorrect}</h4>
            {!isPreview && <button onClick={() => addRule('donts')} className="p-2 hover:bg-rose-500/20 rounded-full text-rose-600 dark:text-rose-400 transition-colors"><Plus size={20}/></button>}
          </div>
          <div className="space-y-8">
            {donts.map((rule, i) => (
              <div key={`dont-${i}`} className="group relative">
                 <div 
                    onClick={() => !isPreview && document.getElementById(`rule-donts-${i}`).click()}
                    className={`w-full aspect-[4/3] md:aspect-video ${design.radius} bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-transparent mb-3 transition-colors ${!isPreview ? 'cursor-pointer hover:border-indigo-500 border-dashed' : ''}`}
                 >
                    {rule.image ? <img src={rule.image} alt="Rule" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2 opacity-30"><ImageIcon size={24} /><span className="text-[10px] font-bold uppercase">Subir</span></div>}
                 </div>
                 {!isPreview && <input id={`rule-donts-${i}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleRuleImageUpload(e, 'donts', i)} />}
                 
                 <EditableText text={rule.text} className="w-full text-sm leading-relaxed font-medium" isDarkMode={isDarkMode} isPreview={isPreview} onChange={(v) => updateRuleText('donts', i, v)} />
                 
                 {!isPreview && <button onClick={() => removeRule('donts', i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-black/90 text-rose-500 p-2 rounded-full shadow-sm hover:scale-110 transition-all z-10"><Trash2 size={16}/></button>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <DynamicBlocks blocks={content.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

const ColorModule = React.memo(({ content, update, design, isDarkMode, t, isPreview }) => {
  const colors = (content.colors && content.colors.length > 0) ? content.colors : [
      { name: t.defaults.colorPrimaryName, hex: '#4F46E5', usage: t.defaults.colorPrimaryUsage }, 
      { name: t.defaults.colorSecondaryName, hex: '#10B981', usage: t.defaults.colorSecondaryUsage }, 
      { name: t.defaults.colorAccentName, hex: '#F43F5E', usage: t.defaults.colorAccentUsage },
      { name: t.defaults.colorNeutralName, hex: '#64748B', usage: t.defaults.colorNeutralUsage }
  ];
  const addColor = () => update({ ...content, colors: [...colors, { name: 'New', hex: '#000000', usage: '...' }] });
  const removeColor = (i) => update({ ...content, colors: colors.filter((_, idx) => idx !== i) });
  const updateColorValue = (i, f, v) => { const n = [...colors]; n[i][f] = v; update({ ...content, colors: n }); };
  const handleAddExtra = (type, param) => { const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null }; update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); };

  const isListLayout = content.layout === 'list';

  return (
    <div className="p-6 md:p-10 relative">
      <ModuleHeader title={t.modules.color.title} desc={t.modules.color.desc} isDarkMode={isDarkMode} isPreview={isPreview}>
         <button onClick={addColor} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-colors flex-shrink-0 shadow-sm ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'}`}><Plus size={14}/> {t.modules.color.addColor}</button>
      </ModuleHeader>

      {isListLayout ? (
        <div className="space-y-4">
           {colors.map((color, i) => (
             <div key={`color-${i}`} className={`flex items-center gap-6 p-4 ${design.radius} border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`w-20 h-20 ${design.radius} shadow-inner flex-shrink-0 relative overflow-hidden`} style={{ backgroundColor: color.hex }}>
                     {!isPreview && <input type="color" value={color.hex} onChange={(e) => updateColorValue(i, 'hex', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />}
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-4 mb-2">
                       <EditableText text={color.name} className="font-bold text-xl" isDarkMode={isDarkMode} onChange={(val) => updateColorValue(i, 'name', val)} isPreview={isPreview} />
                       <span className={`font-mono text-sm uppercase opacity-50 ${isDarkMode ? 'text-white' : 'text-black'}`}>{color.hex}</span>
                   </div>
                   <EditableText text={color.usage} className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} isDarkMode={isDarkMode} onChange={(val) => updateColorValue(i, 'usage', val)} isPreview={isPreview} />
                </div>
                {!isPreview && <button onClick={() => removeColor(i)} className="p-2 opacity-50 hover:opacity-100 hover:bg-rose-500 hover:text-white rounded-full transition-all"><Trash2 size={16} /></button>}
             </div>
           ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-6 px-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:pb-0 md:mx-0 md:px-0 scrollbar-hide">
          {colors.map((color, i) => (
              <div key={`color-${i}`} className={`snap-center min-w-[85vw] md:min-w-0 group relative p-6 ${design.radius} border flex flex-col gap-5 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  {!isPreview && <button onClick={() => removeColor(i)} className="absolute top-3 right-3 p-2 opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white text-slate-400 rounded-full transition-all z-10"><Trash2 size={16} /></button>}
                  <div className={`w-full h-40 ${design.radius} shadow-inner relative overflow-hidden`} style={{ backgroundColor: color.hex }}>
                      {!isPreview && <input type="color" value={color.hex} onChange={(e) => updateColorValue(i, 'hex', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />}
                  </div>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center"><EditableText text={color.name} className="font-bold text-xl" isDarkMode={isDarkMode} onChange={(val) => updateColorValue(i, 'name', val)} isPreview={isPreview} /></div>
                      <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-black/30' : 'bg-white'} border border-transparent hover:border-indigo-200 transition-colors`}>
                          <span className="font-mono text-sm uppercase opacity-70">{color.hex}</span>
                          <button onClick={() => navigator.clipboard.writeText(color.hex)} className="p-1 hover:text-indigo-500 transition-colors text-slate-400" title="Copiar HEX"><Copy size={14} /></button>
                      </div>
                      <EditableText text={color.usage} className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} isDarkMode={isDarkMode} onChange={(val) => updateColorValue(i, 'usage', val)} isPreview={isPreview} />
                  </div>
              </div>
          ))}
        </div>
      )}
      <DynamicBlocks blocks={content.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

const TypographyModule = React.memo(({ content, update, design, isDarkMode, t, isPreview }) => {
  const defaultLevels = [{ tag: 'Display', size: '64px', weight: '900', sample: t.defaults.typoSamples.Display }, { tag: 'H1', size: '40px', weight: '700', sample: t.defaults.typoSamples.H1 }, { tag: 'H2', size: '32px', weight: '600', sample: t.defaults.typoSamples.H2 }, { tag: 'Body', size: '16px', weight: '400', sample: t.defaults.typoSamples.Body }, { tag: 'Caption', size: '12px', weight: '500', sample: t.defaults.typoSamples.Caption }];
  const levels = (content.levels && content.levels.length > 0) ? content.levels : defaultLevels;
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Nuevo estado para controlar el modo (Google Fonts vs Custom)
  const isCustom = content.isCustom || false;

  const addLevel = () => update({ ...content, levels: [...levels, { tag: 'H3', size: '24px', weight: 'Medium', sample: 'Nuevo', image: null }] });
  const removeLevel = (i) => update({ ...content, levels: levels.filter((_, idx) => idx !== i) });
  const updateLevel = (i, f, v) => { const n = [...levels]; n[i] = { ...n[i], [f]: v }; update({ ...content, levels: n }); };
  const moveLevel = (i, dir) => { const n = [...levels]; if (dir === 'up' && i > 0) [n[i], n[i-1]] = [n[i-1], n[i]]; if (dir === 'down' && i < n.length - 1) [n[i], n[i+1]] = [n[i+1], n[i]]; update({ ...content, levels: n }); };
  
  const handleAddExtra = (type, param) => { const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null }; update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); };
  
  // Manejador para subir imágenes de muestra en modo Custom
  const handleSampleUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateLevel(index, 'image', url);
    }
  };

  const visibleLevels = isExpanded ? levels : levels.slice(0, 2); 
  const currentFontName = isCustom ? (content.customFontName || 'Nombre Tipografía') : (design?.font || 'Inter');
  const googleFontUrl = `https://fonts.google.com/specimen/${currentFontName.replace(/\s+/g, '+')}`;

  return (
    <div className="p-6 md:p-10 relative">
      <ModuleHeader title={t.modules.typography.title} desc={t.modules.typography.desc} isDarkMode={isDarkMode} isPreview={isPreview}>
         <div className="flex items-center gap-3">
             {!isPreview && (
                 <div className={`flex p-1 rounded-lg border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                    <button 
                        onClick={() => update({...content, isCustom: false})} 
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${!isCustom ? 'bg-white shadow text-indigo-600 dark:bg-indigo-600 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        Google
                    </button>
                    <button 
                        onClick={() => update({...content, isCustom: true})} 
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${isCustom ? 'bg-white shadow text-indigo-600 dark:bg-indigo-600 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        Custom
                    </button>
                 </div>
             )}
             {!isCustom && <div className="px-4 py-2 text-sm font-bold shadow-sm rounded-lg bg-white border border-slate-200 text-slate-900">{currentFontName}</div>}
         </div>
      </ModuleHeader>

      <div className={`mb-8 p-6 rounded-2xl border flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex-1 text-center md:text-left w-full">
              {isCustom ? (
                  <EditableText 
                    text={content.customFontName || "Nombre de la Tipografía"} 
                    className={`text-3xl md:text-5xl font-black tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} 
                    isDarkMode={isDarkMode}
                    isPreview={isPreview}
                    onChange={(v) => update({...content, customFontName: v})}
                    placeholder="Escribe el nombre..."
                  />
              ) : (
                  <h2 className={`text-5xl font-black tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: currentFontName }}>{currentFontName}</h2>
              )}
              
              <EditableText 
                text={isCustom ? (content.customFontDesc || "Descripción de la tipografía personalizada.") : FONT_DESCRIPTIONS[currentFontName]} 
                className={`text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} 
                isDarkMode={isDarkMode}
                isPreview={isPreview}
                onChange={(v) => update({...content, customFontDesc: v})}
              />
          </div>
          
          {!isCustom ? (
            <a 
                href={googleFontUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-full border transition-all shrink-0 shadow-sm ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 hover:shadow-md'}`}
            >
                <Download size={14} /> 
                <span>Google Fonts</span>
            </a>
          ) : (
            <div className="flex flex-col gap-2 shrink-0 w-full md:w-64">
                {!isPreview && (
                    <input 
                        type="text" 
                        value={content.customFontUrl || ''} 
                        onChange={(e) => update({ ...content, customFontUrl: e.target.value })} 
                        placeholder="Enlace de descarga (Drive, Dropbox...)" 
                        className={`w-full p-2.5 text-[10px] rounded-xl outline-none border transition-colors ${isDarkMode ? `bg-black/20 border-white/10 text-white focus:border-${design.palette?.base || 'indigo'}-500` : `bg-slate-50 border-slate-200 text-slate-700 focus:border-${design.palette?.base || 'indigo'}-500`}`}
                    />
                )}
                {(content.customFontUrl || !isPreview) && (
                    <a 
                        href={content.customFontUrl || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`flex items-center justify-center gap-2 text-xs font-bold px-6 py-3 rounded-full border transition-all shadow-sm ${!content.customFontUrl && !isPreview ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'}`}
                    >
                        <Download size={14} /> 
                        <span>{t.ui.downloadFamily || "Descargar Familia"}</span>
                    </a>
                )}
            </div>
          )}
      </div>

      {!isCustom && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b py-8 border-slate-200 dark:border-white/10 mb-8">
            <div><h5 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-50">Alfabeto</h5><p className="text-3xl break-all leading-relaxed" style={{ fontFamily: currentFontName }}>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</p></div>
            <div><h5 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-50">Numeros & Simbolos</h5><p className="text-3xl break-all leading-relaxed" style={{ fontFamily: currentFontName }}>1234567890<br/>!@#$%^&*()_+=?</p></div>
        </div>
      )}

      <div className="space-y-6">
        {(window.innerWidth < 768 && !isExpanded ? visibleLevels : levels).map((level, i) => (
            <div key={`level-${i}`} className={`flex flex-col md:flex-row md:items-start gap-6 group border-b pb-8 last:border-0 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                <div className={`w-full md:w-56 flex-shrink-0 space-y-3 p-5 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-2">{isPreview ? <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{level.tag}</span> : <><input value={level.tag} onChange={(e) => updateLevel(i, 'tag', e.target.value)} className={`w-20 bg-transparent font-bold text-lg outline-none border-b border-transparent focus:border-indigo-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} /><div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => moveLevel(i, 'up')} disabled={i === 0} className="text-slate-400 hover:text-indigo-500 disabled:opacity-30 p-1"><ChevronUp size={16} /></button><button onClick={() => moveLevel(i, 'down')} disabled={i === levels.length - 1} className="text-slate-400 hover:text-indigo-500 disabled:opacity-30 p-1"><ChevronDown size={16} className="rotate-180"/></button><button onClick={() => removeLevel(i)} className="text-slate-400 hover:text-rose-500 transition-colors p-1"><Trash2 size={16}/></button></div></>}</div>
                    <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 block">{t.modules.typography.size}</label>{isPreview ? <span className={`text-sm font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{level.size}</span> : <input value={level.size} onChange={(e) => updateLevel(i, 'size', e.target.value)} className={`w-full bg-transparent text-sm font-mono outline-none border-b border-white/10 focus:border-indigo-500 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />}</div><div className="space-y-1"><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 block">{t.modules.typography.weight}</label>{isPreview ? <span className={`text-sm font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{level.weight}</span> : <input value={level.weight} onChange={(e) => updateLevel(i, 'weight', e.target.value)} className={`w-full bg-transparent text-sm font-mono outline-none border-b border-white/10 focus:border-indigo-500 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />}</div></div>
                </div>
                <div className="flex-1 min-w-0">
                    {isCustom ? (
                        <div className={`relative w-full h-auto min-h-[100px] rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all group/upload ${isDarkMode ? 'border-white/10 hover:border-indigo-500/50 bg-white/5' : 'border-slate-200 hover:border-indigo-300 bg-slate-50'}`}>
                            {level.image ? (
                                <img src={level.image} alt={level.tag} className="w-full h-full object-contain p-2" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 opacity-40">
                                    <ImageIcon size={24} />
                                    <span className="text-[10px] font-bold uppercase">Subir muestra de {level.tag}</span>
                                </div>
                            )}
                            {!isPreview && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 group-hover/upload:opacity-100 transition-opacity">
                                    <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                        <Upload size={14} /> Cambiar
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSampleUpload(e, i)} />
                                    </label>
                                </div>
                            )}
                        </div>
                    ) : (
                        isPreview ? 
                        <div style={{ fontSize: level.size, fontWeight: level.weight, lineHeight: '1.2' }} className={`w-full break-words ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{level.sample || `Texto de ejemplo para ${level.tag}`}</div> 
                        : 
                        <textarea value={level.sample || `Texto de ejemplo para ${level.tag}`} onChange={(e) => updateLevel(i, 'sample', e.target.value)} style={{ fontSize: level.size, fontWeight: level.weight, lineHeight: '1.2' }} className={`w-full bg-transparent outline-none resize-none overflow-hidden transition-all min-h-[80px] ${isDarkMode ? 'text-white placeholder-slate-600' : 'text-slate-900 placeholder-slate-300'}`} rows={i >= 3 ? 3 : 1} />
                    )}
                    <div className={`mt-3 text-[10px] font-mono opacity-40 uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{level.size} • {level.weight} • {currentFontName}</div>
                </div>
            </div>
        ))}
        <div className="md:hidden text-center mt-4"><button onClick={() => setIsExpanded(!isExpanded)} className={`text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full border ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-600'}`}>{isExpanded ? t.modules.typography.showLess || "Ver menos" : t.modules.typography.showMore}</button></div>
        {!isPreview && <button onClick={addLevel} className={`w-full py-5 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'border-white/20 text-slate-400 hover:border-indigo-400 hover:text-indigo-400' : 'border-slate-300 text-slate-500 hover:border-indigo-600 hover:text-indigo-600'}`}><Plus size={20} /> {t.modules.typography.addLevel}</button>}
      </div>
      <DynamicBlocks blocks={content.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

const ImageModule = React.memo(({ content, update, design, isDarkMode, t, isPreview }) => {
  const images = content.images || [1, 2, 3, 4];
  const addImage = () => update({ ...content, images: [...images, { id: Date.now() }] });
  const removeImage = (idx) => update({ ...content, images: images.filter((_, i) => i !== idx) });
  const handleAddExtra = (type, param) => { const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null }; update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); };
  const handleImageUpload = (e, idx) => { const file = e.target.files[0]; if (file) { const url = URL.createObjectURL(file); const newImages = [...images]; newImages[idx] = { ...newImages[idx], src: url }; update({ ...content, images: newImages }); } };

  return (
    <div className="p-6 md:p-10 relative">
      <ModuleHeader title={t.modules.image.title} desc={t.modules.image.desc} isDarkMode={isDarkMode} isPreview={isPreview}>
         <button onClick={addImage} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-colors flex-shrink-0 shadow-sm ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'}`}><Plus size={14}/> {t.modules.image.addImage}</button>
      </ModuleHeader>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10">{images.map((img, i) => (<div key={img.id || `img-${i}`} className={`aspect-square ${design.radius} border flex items-center justify-center relative group overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}><input id={`mood-img-${i}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, i)} />{img.src ? <img src={img.src} className="w-full h-full object-cover" alt="Mood" /> : <ImageIcon size={32} className={`mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-300'}`} />}{!isPreview && <div className={`absolute inset-0 bg-black/10 transition-opacity flex items-center justify-center gap-2 ${img.src ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}><button onClick={() => document.getElementById(`mood-img-${i}`).click()} className="bg-white px-3 py-1.5 rounded shadow text-xs font-bold text-slate-900 hover:bg-slate-100">{img.src ? t.ui.change : t.ui.upload}</button><button onClick={() => removeImage(i)} className="bg-rose-500 p-1.5 rounded shadow text-white hover:bg-rose-600"><Trash2 size={14}/></button></div>}</div>))}</div>
      <DynamicBlocks blocks={content.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

// ==========================================
// MÓDULO: Editorial (Texto, Imágenes y Columnas)
// ==========================================
const EditorialModule = React.memo(({ content, update, design, isDarkMode, t, isPreview }) => {
  // 1. Extraemos el layout elegido por el usuario (o 'default')
  const layout = content.layout || 'default';
  
  const blocks = content.blocks || [{ type: 'text', content: 'Contenido editorial de ejemplo...' }];
  const toggleDownload = () => update({ ...content, showDownload: !content.showDownload });
  const updateLink = (val) => update({ ...content, downloadUrl: val });
  const addBlock = (type) => update({ ...content, blocks: [...blocks, { type, content: '' }] });
  const updateBlock = (i, val) => { const newBlocks = [...blocks]; newBlocks[i].content = val; update({ ...content, blocks: newBlocks }); };
  const removeBlock = (i) => update({ ...content, blocks: blocks.filter((_, idx) => idx !== i) });
  
  const handleAddExtra = (type, param) => { 
    const newBlock = type === 'text' 
      ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } 
      : { id: Date.now(), type: 'image', src: null }; 
    update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); 
  };
  
  const handleImageUpload = (e, index) => { 
    const file = e.target.files[0]; 
    if(file) { 
      const url = URL.createObjectURL(file); 
      const newBlocks = [...blocks]; 
      newBlocks[index].src = url; 
      update({ ...content, blocks: newBlocks }); 
    } 
  };

  // Render principal del Módulo Editorial
  return (
    <div className="w-full relative group/edit">
      
      {/* 2. Contenedor que reacciona a la propiedad 'layout' */}
      <div className={`
        w-full transition-all duration-300 
        ${layout === 'default' ? 'flex flex-col gap-6' : ''}
        ${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : ''}
        ${layout === 'stack' ? 'flex flex-col-reverse gap-4 border-l-4 pl-4 md:pl-8 border-slate-200 dark:border-white/10' : ''}
        ${layout === 'bento' ? 'grid grid-cols-1 md:grid-cols-3 gap-4 [&>*:first-child]:md:col-span-2' : ''}
      `}>
        {blocks.map((block, index) => (
          <div key={index} className={`relative group/block ${layout === 'bento' ? 'bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/10' : ''}`}>
            
            {/* Botón borrar bloque individual */}
            {!isPreview && blocks.length > 1 && (
              <button 
                onClick={() => removeBlock(index)} 
                className="absolute -right-2 -top-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover/block:opacity-100 transition-opacity z-10 shadow-lg"
              >
                <X size={14} />
              </button>
            )}

            {block.type === 'text' ? (
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(index, e.target.value)}
                placeholder="Escribe algo inspirador..."
                className={`w-full bg-transparent resize-none outline-none leading-relaxed transition-all placeholder:opacity-30 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                style={{ 
                  fontFamily: design.font, 
                  minHeight: '100px',
                  fontSize: layout === 'stack' ? '1.25rem' : '1rem' 
                }}
                readOnly={isPreview}
              />
            ) : (
              <div className="w-full relative">
                {block.src ? (
                  <img src={block.src} alt="Editorial block" className="w-full h-auto rounded-xl object-cover" />
                ) : (
                  <div className={`w-full aspect-[16/9] flex items-center justify-center rounded-xl border-2 border-dashed ${isDarkMode ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-slate-100'}`}>
                    <label className="cursor-pointer flex flex-col items-center gap-2 p-8 hover:opacity-70 transition-opacity">
                      <ImagePlus size={32} className="opacity-50" />
                      <span className="text-sm font-bold opacity-50">Subir imagen</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, index)} disabled={isPreview} />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controles de añadido (Solo modo edición) */}
      {!isPreview && (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 opacity-0 group-hover/edit:opacity-100 transition-opacity">
          <div className={`flex items-center gap-2 p-2 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white border-slate-200'}`}>
            <button onClick={() => addBlock('text')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
              <Type size={16}/> Texto
            </button>
            <div className={`w-px h-6 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>
            <button onClick={() => addBlock('image')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
              <ImageIcon size={16}/> Imagen
            </button>
            <div className={`w-px h-6 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>
            <button onClick={toggleDownload} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${content.showDownload ? 'bg-indigo-500/20 text-indigo-500' : (isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100')}`}>
              <DownloadCloud size={16}/> Link Externo
            </button>
          </div>
        </div>
      )}

      {/* Botón de Descarga/Enlace */}
      {content.showDownload && (
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
          {!isPreview && (
             <input
               type="url"
               placeholder="https://drive.google.com/..."
               value={content.downloadUrl || ''}
               onChange={(e) => updateLink(e.target.value)}
               className={`flex-1 p-3 rounded-xl border outline-none text-sm w-full md:w-auto ${isDarkMode ? 'bg-black/50 border-white/20' : 'bg-slate-50 border-slate-200'}`}
             />
          )}
          <a
            href={content.downloadUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all w-full md:w-auto justify-center ${!content.downloadUrl && isPreview ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} ${isDarkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}
          >
            <DownloadCloud size={18} />
            Descargar Material
          </a>
        </div>
      )}
    </div>
  );
}); // <-- Fíjate que aquí cerramos perfectamente el componente

// ==========================================
// MÓDULO: Footer (Navegación, Copyright y Redes)
// ==========================================
const FooterModule = React.memo(({ content, update, design, isDarkMode, t, isPreview }) => {
  const layout = content.layout || 0; // 0: Centered, 1: Split, 2: Stack
  const [activeSocialEdit, setActiveSocialEdit] = useState(null);
  
  const toggleField = (field) => update({ ...content, [field]: !content[field] });
  const handleLogoUpload = (e) => { const file = e.target.files[0]; if(file) update({ ...content, logo: URL.createObjectURL(file) }); };
  const cycleLayout = () => { const next = (layout + 1) % 3; update({ ...content, layout: next }); };
  
  const socialPlatforms = [
    { id: 'instagram', icon: Instagram },
    { id: 'twitter', icon: Twitter },
    { id: 'linkedin', icon: Linkedin },
    { id: 'facebook', icon: Facebook }
  ];

  const updateSocialLink = (id, url) => {
    const currentLinks = content.socialLinks || {};
    update({ ...content, socialLinks: { ...currentLinks, [id]: url } });
  };

  const safeT = t || TRANSLATIONS.ES;
  const copyrightText = content?.copyright || safeT.ui?.placeholders?.copyright || "© 2026 BrandBara. Todos los derechos reservados.";
  const websiteText = content?.website || safeT.ui?.placeholders?.website || "www.brandbara.com";

  // Colores dinámicos personalizados (O por defecto los del tema)
  const footerBg = content.bgColor || (isDarkMode ? '#0a0c10' : '#f8fafc');
  const footerTextColor = content.textColor || (isDarkMode ? '#ffffff' : '#0f111a');

  return (
    <div 
      className="group relative w-full py-16 px-6 md:px-10 mt-auto transition-colors duration-500 flex flex-col"
      style={{ backgroundColor: footerBg, color: footerTextColor }}
    >
      {/* TOOLBAR UNIFICADA (Igual a los demás módulos) */}
      {!isPreview && (
        <div className="absolute top-4 right-4 flex gap-1 z-30 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 bg-white/90 dark:bg-black/80 backdrop-blur rounded-lg shadow-sm border border-slate-200 dark:border-white/10">
           
           {/* Botón de Layout Estándar */}
           <button onClick={cycleLayout} className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded text-slate-500 hover:text-indigo-500 transition-colors" title="Cambiar estructura">
             <LayoutTemplate size={14}/>
           </button>

           <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1 self-center"></div>

           {/* Toggles de Contenido */}
           <button onClick={() => toggleField('showLogo')} className={`p-1 rounded transition-colors ${content.showLogo !== false ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`} title="Mostrar/Ocultar Logo"><ImageIcon size={14}/></button>
           <button onClick={() => toggleField('showWebsite')} className={`p-1 rounded transition-colors ${content.showWebsite !== false ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`} title="Mostrar/Ocultar Web"><Globe size={14}/></button>
           <button onClick={() => toggleField('showSocials')} className={`p-1 rounded transition-colors ${content.showSocials !== false ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`} title="Mostrar/Ocultar Redes"><Share2 size={14}/></button>

           <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1 self-center"></div>

           {/* Selectores de Color */}
           <div className="relative flex items-center justify-center p-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 rounded" title="Color de Fondo">
              <PaintBucket size={14} className="text-slate-500" />
              <input type="color" value={content.bgColor || (isDarkMode?'#0a0c10':'#f8fafc')} onChange={(e) => update({...content, bgColor: e.target.value})} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
           </div>
           <div className="relative flex items-center justify-center p-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 rounded" title="Color del Texto">
              <Type size={14} className="text-slate-500" />
              <input type="color" value={content.textColor || (isDarkMode?'#ffffff':'#0f111a')} onChange={(e) => update({...content, textColor: e.target.value})} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
           </div>
           
           {/* Resetear Colores */}
           {(content.bgColor || content.textColor) && (
              <button onClick={() => update({...content, bgColor: null, textColor: null})} className="p-1 rounded text-rose-500 hover:bg-rose-50 ml-1 transition-colors" title="Restaurar colores"><X size={14}/></button>
           )}
        </div>
      )}

      {/* CONTENIDO DEL FOOTER (Basado en Captura UX) */}
      <div className={`flex w-full max-w-5xl mx-auto gap-8 md:gap-12 transition-all duration-500 ${layout === 0 ? 'flex-col items-center text-center' : layout === 1 ? 'flex-col md:flex-row justify-between items-center' : 'flex-col items-start text-left'}`}>
         
         {/* BLOQUE LOGO */}
         {content.showLogo !== false && (
            <div className="flex-shrink-0">
                <div 
                    className={`h-12 md:h-16 w-auto min-w-[120px] relative flex items-center justify-center ${!isPreview ? 'cursor-pointer hover:opacity-60 transition-opacity' : ''}`} 
                    onClick={() => !isPreview && document.getElementById('footer-logo-up').click()}
                >
                    {content.logo ? (
                        <img src={content.logo} className="h-full w-auto object-contain" alt="Footer Logo"/>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                           <div className="flex gap-2">
                              <Upload size={18} />
                              <Link2 size={18} />
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-widest">Logo / SVG</span>
                        </div>
                    )}
                    {!isPreview && <input id="footer-logo-up" type="file" className="hidden" accept="image/*,image/svg+xml" onChange={handleLogoUpload} />}
                </div>
            </div>
         )}
         
         <div className={`flex gap-6 md:gap-10 ${layout === 0 ? 'flex-col items-center' : layout === 1 ? 'flex-col md:flex-row items-center' : 'flex-col items-start'}`}>
            
            {/* BLOQUE WEBSITE */}
            {content.showWebsite !== false && (
                <EditableText 
                    text={websiteText} 
                    className="text-lg md:text-xl font-bold whitespace-nowrap" 
                    style={{ color: footerTextColor }}
                    onChange={(v)=>update({...content, website: v})} 
                    isDarkMode={isDarkMode} 
                    isPreview={isPreview} 
                />
            )}
            
            {/* BLOQUE REDES SOCIALES */}
            {content.showSocials !== false && (
                <div className="flex gap-4">
                    {socialPlatforms.map((platform) => {
                        const Icon = platform.icon;
                        const link = content.socialLinks?.[platform.id] || '';
                        
                        if (isPreview && !link) return null;

                        return (
                            <div key={platform.id} className="relative group/social">
                                {isPreview ? (
                                    <a 
                                        href={link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block p-3 rounded-full transition-transform hover:scale-110"
                                        style={{ backgroundColor: 'rgba(128,128,128,0.08)' }}
                                    >
                                        <Icon size={20} style={{ color: footerTextColor }} />
                                    </a>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => setActiveSocialEdit(activeSocialEdit === platform.id ? null : platform.id)}
                                            className={`p-3 rounded-full transition-all border ${link ? 'border-current' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                            style={{ color: footerTextColor, backgroundColor: 'rgba(128,128,128,0.05)' }}
                                            title={link || "Añadir enlace"}
                                        >
                                            <Icon size={20} />
                                        </button>
                                        
                                        {/* Editor Popover Redes */}
                                        {activeSocialEdit === platform.id && (
                                            <div className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-2 rounded-xl shadow-2xl border z-50 w-64 flex gap-2 animate-in fade-in slide-in-from-bottom-2 ${isDarkMode ? 'bg-[#1e2330] border-white/10' : 'bg-white border-slate-200'}`}>
                                                <input 
                                                    type="text" 
                                                    value={link} 
                                                    onChange={(e) => updateSocialLink(platform.id, e.target.value)}
                                                    placeholder="https://..." 
                                                    className={`w-full text-xs p-2.5 rounded-lg border bg-transparent outline-none ${isDarkMode ? 'border-white/10 text-white focus:border-indigo-500' : 'border-slate-200 text-slate-700 focus:border-indigo-500'}`}
                                                    autoFocus
                                                />
                                                <button onClick={() => setActiveSocialEdit(null)} className="p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"><Check size={16} /></button>
                                            </div>
                                        )}
                                        {activeSocialEdit === platform.id && <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveSocialEdit(null); }} />}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
         </div>
      </div>

      {/* BLOQUE COPYRIGHT */}
      {content.showCopyright !== false && (
        <div className={`w-full max-w-5xl mx-auto mt-12 pt-8 border-t ${layout === 0 ? 'text-center' : 'text-left'}`} style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <EditableText 
            text={copyrightText} 
            className="text-sm font-medium opacity-60" 
            style={{ color: footerTextColor }} 
            onChange={(v)=>update({...content, copyright: v})} 
            isDarkMode={isDarkMode} 
            isPreview={isPreview} 
          />
        </div>
      )}
    </div>
  );
});

const CobrandingModule = React.memo(({ isDarkMode, design, content, update, t, isPreview }) => {
  const handleAddExtra = (type, param) => { const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null }; update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); };
  const addPartner = () => { const newItem = { id: Date.now(), src: null, type: 'image', caption: '', templateUrl: '' }; update({ ...content, partners: [...(content.partners || []), newItem] }); };
  const removePartner = (id) => update({ ...content, partners: (content.partners || []).filter(item => item.id !== id) });
  const updatePartner = (id, field, value) => { const newItems = (content.partners || []).map(item => item.id === id ? { ...item, [field]: value } : item); update({ ...content, partners: newItems }); };
  const handlePartnerUpload = (e, id) => { const file = e.target.files[0]; if (file) { const url = URL.createObjectURL(file); const type = file.type.startsWith('video') ? 'video' : 'image'; const newItems = (content.partners || []).map(item => item.id === id ? { ...item, src: url, type: type } : item); update({ ...content, partners: newItems }); } };
  useEffect(() => { if (!content.partners) { update({ ...content, partners: [ { id: 1, src: null, type: 'image', caption: '', templateUrl: '' }, { id: 2, src: null, type: 'image', caption: '', templateUrl: '' } ]}); } }, []);

  return (
    <div className="p-6 md:p-10 relative">
<ModuleHeader 
        title={content.title || t.modules.cobranding.title} 
        onTitleChange={(v) => update({ ...content, title: v })}
        desc={content.desc || t.modules.cobranding.desc} 
        onDescChange={(v) => update({ ...content, desc: v })}
        isDarkMode={isDarkMode} 
        isPreview={isPreview}
      >
                 <button onClick={addPartner} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'}`}><Plus size={14}/> {t.ui.addPartner}</button>
      </ModuleHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {(content.partners || []).map((partner) => (
          <div key={partner.id} className={`group relative p-5 ${design.radius} border flex flex-col gap-4 transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:shadow-lg'}`}>
             <div onClick={() => !isPreview && document.getElementById(`pt-up-${partner.id}`).click()} className={`aspect-video w-full rounded-xl overflow-hidden bg-white dark:bg-black/20 flex items-center justify-center relative ${!isPreview ? 'cursor-pointer' : ''}`}>
                {partner.src ? (partner.type === 'video' ? <video src={partner.src} className="w-full h-full object-cover" autoPlay loop muted playsInline /> : <img src={partner.src} className="w-full h-full object-contain p-2" alt="Case Study" />) : (<Users size={32} className={`opacity-20 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />)}
                {!isPreview && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-bold uppercase backdrop-blur-sm"><Upload size={20} className="mb-2"/> {t.ui.uploadMedia}</div>}
             </div>
             <input id={`pt-up-${partner.id}`} type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handlePartnerUpload(e, partner.id)} />
             <div className="space-y-3 flex-1 flex flex-col">
               <EditableText text={partner.caption} placeholder={t.ui.placeholders.caption} className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} isDarkMode={isDarkMode} isPreview={isPreview} onChange={(v) => updatePartner(partner.id, 'caption', v)} />
               <div className="mt-auto pt-2">
                   {!isPreview && (<input type="text" placeholder="URL Plantilla (https://...)" value={partner.templateUrl || ''} onChange={(e) => updatePartner(partner.id, 'templateUrl', e.target.value)} className={`w-full p-2 mb-2 text-[10px] rounded border bg-transparent outline-none ${isDarkMode ? 'border-white/10 text-slate-400 focus:border-indigo-500' : 'border-slate-300 text-slate-600 focus:border-indigo-500'}`} />)}
                   <a href={partner.templateUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold border rounded-lg transition-all ${!partner.templateUrl && !isPreview ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'} ${isDarkMode ? 'border-white/10 hover:bg-white/10 text-white' : 'border-slate-200 hover:bg-white text-slate-900 bg-white/50'}`}><Download size={14}/> {t.ui.downloadTemplate}</a>
               </div>
             </div>
             {!isPreview && <button onClick={() => removePartner(partner.id)} className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10"><Trash2 size={14}/></button>}
          </div>
        ))}
      </div>
      <DynamicBlocks blocks={content?.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

const AssetsModule = React.memo(({ content, update, design, isDarkMode, t, isPreview }) => {
  const colorBase = design.palette?.base || 'indigo';
  const assets = content.assets || [
    { id: 1, title: 'Plantillas de Presentación', desc: 'Plantillas corporativas para Keynote y PowerPoint.', format: 'PPTX / KEY, 25MB', url: '' },
    { id: 2, title: 'Documentos corporativos', desc: 'Membretes, tarjetas de visita y carpetas.', format: 'ZIP / PDF, 15MB', url: '' },
    { id: 3, title: 'Brand guidelines', desc: 'Manual de identidad visual corporativa completo.', format: 'PDF, 30MB', url: '' }
  ];

  const addAsset = () => {
    const newAsset = { id: Date.now(), title: 'Nuevo Material', desc: 'Descripción del archivo...', format: 'PDF, 1MB', url: '' };
    update({ ...content, assets: [...assets, newAsset] });
  };

  const removeAsset = (id) => update({ ...content, assets: assets.filter(a => a.id !== id) });
  
  const updateAsset = (id, field, value) => {
    update({ ...content, assets: assets.map(a => a.id === id ? { ...a, [field]: value } : a) });
  };
  
  const handleAddExtra = (type, param) => { const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null }; update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); };

  return (
    <div className="p-6 md:p-10 relative">
<ModuleHeader 
        title={content.title || t.modules.assets.title} 
        onTitleChange={(v) => update({ ...content, title: v })}
        desc={content.desc || t.modules.assets.desc} 
        onDescChange={(v) => update({ ...content, desc: v })}
        isDarkMode={isDarkMode} 
        isPreview={isPreview}
      >
                 {!isPreview && (
             <button onClick={addAsset} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg hover:bg-${colorBase}-100 transition-colors ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'}`}>
                <Plus size={14}/> {t.modules.assets.addAsset}
             </button>
         )}
      </ModuleHeader>

      <div className="flex flex-col gap-4 mt-8">
        {assets.map((asset) => (
          <div key={asset.id} className={`group relative flex flex-col md:flex-row items-start md:items-center gap-6 p-6 ${design.radius} border transition-all hover:-translate-y-1 hover:shadow-lg ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200'}`}>
            
            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? `bg-${colorBase}-500/20 text-${colorBase}-400` : `bg-white shadow-sm border border-${colorBase}-100 text-${colorBase}-600`}`}>
              <FileArchive size={28} strokeWidth={1.5} />
            </div>

            <div className="flex-1 space-y-2 w-full">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                <EditableText text={asset.title} className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`} isDarkMode={isDarkMode} isPreview={isPreview} onChange={(v) => updateAsset(asset.id, 'title', v)} />
                <div className="flex items-center gap-2">
                   <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${isDarkMode ? 'bg-black/30 border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                      <EditableText text={asset.format} isDarkMode={isDarkMode} isPreview={isPreview} onChange={(v) => updateAsset(asset.id, 'format', v)} placeholder={t.modules.assets.formatLabel} tag="span" />
                   </span>
                </div>
              </div>
              <EditableText text={asset.desc} className={`text-sm opacity-80 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} isDarkMode={isDarkMode} isPreview={isPreview} onChange={(v) => updateAsset(asset.id, 'desc', v)} />
              
              {!isPreview && (
                 <div className="pt-3">
                    <input 
                        type="text" 
                        placeholder="URL de descarga (Enlace de Google Drive, Dropbox, etc.)" 
                        value={asset.url || ''} 
                        onChange={(e) => updateAsset(asset.id, 'url', e.target.value)} 
                        className={`w-full max-w-md p-2 text-xs rounded border bg-transparent outline-none transition-colors ${isDarkMode ? `border-white/10 text-slate-300 focus:border-${colorBase}-500` : `border-slate-300 text-slate-600 focus:border-${colorBase}-500`}`} 
                    />
                 </div>
              )}
            </div>

            <div className="w-full md:w-auto shrink-0 flex items-center justify-end mt-4 md:mt-0">
              <a 
                href={asset.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${(!asset.url && !isPreview) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${isDarkMode ? `bg-${colorBase}-600 hover:bg-${colorBase}-500 text-white shadow-lg shadow-${colorBase}-500/20` : `bg-${colorBase}-600 hover:bg-${colorBase}-700 text-white shadow-lg shadow-${colorBase}-500/30`}`}
              >
                 <DownloadCloud size={18} /> {t.modules.assets.download}
              </a>
            </div>

            {!isPreview && (
               <button onClick={() => removeAsset(asset.id)} className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-10"><Trash2 size={14}/></button>
            )}
          </div>
        ))}
      </div>

      <DynamicBlocks blocks={content?.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

const BentoModule = React.memo(({ content, update, design, isDarkMode, t, isPreview }) => {
  // Matemáticas exactas de CSS Grid. Mobile = 2 cols. Escritorio (md) = 4 cols. Cero huecos.
  const bentoLayouts = [
      // Diseño 1: Hero Izquierda (Escritorio: 4x2, Móvil: 2x3)
      ['col-span-2 md:col-span-2 row-span-1 md:row-span-2', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1'],
      
      // Diseño 2: Hero Derecha (Escritorio: 4x2, Móvil: 2x3)
      ['col-span-1 md:col-span-1 row-span-1 md:row-span-1', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1', 'col-span-2 md:col-span-2 row-span-1 md:row-span-2', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1'],
      
      // Diseño 3: Simétrico (Escritorio: 4x2, Móvil: 2x3)
      ['col-span-1 md:col-span-1 row-span-1 md:row-span-2', 'col-span-2 md:col-span-2 row-span-1 md:row-span-1', 'col-span-1 md:col-span-1 row-span-1 md:row-span-2', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1'],
      
      // Diseño 4: Panorámico inferior (Escritorio: 4x3, Móvil: 2x3)
      ['col-span-1 md:col-span-1 row-span-1 md:row-span-1', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1', 'col-span-1 md:col-span-1 row-span-1 md:row-span-1', 'col-span-2 md:col-span-4 row-span-1 md:row-span-2']
  ];
  const [currentLayoutIdx, setCurrentLayoutIdx] = useState(content.layoutIndex || 0);  useEffect(() => { 
      if (!content.items || content.items.length !== 5) { 
          const existing = content.items || []; 
          const newItems = Array(5).fill(null).map((_, i) => ({ id: existing[i]?.id || `bento-${Date.now()}-${i}`, type: existing[i]?.type || 'image', src: existing[i]?.src || null })); 
          update({ ...content, items: newItems, layoutIndex: 0 }); 
      } else if (content.layoutIndex !== undefined && content.layoutIndex !== currentLayoutIdx) { 
          setCurrentLayoutIdx(content.layoutIndex); 
      } 
  }, [content.items, content.layoutIndex]);
  
  const items = content.items || [];
  const toggleLayout = () => { const nextIdx = (currentLayoutIdx + 1) % bentoLayouts.length; setCurrentLayoutIdx(nextIdx); update({ ...content, layoutIndex: nextIdx }); };
  const handleItemUpdate = (id, type, value) => { const newItems = items.map(it => it.id === id ? { ...it, type: type, src: value } : it); update({ ...content, items: newItems }); };
  const handleItemUpload = (e, id) => { const file = e.target.files[0]; if (file) { const url = URL.createObjectURL(file); const type = file.type.startsWith('video') ? 'video' : 'image'; handleItemUpdate(id, type, url); } };
  const handleAddExtra = (type, param) => { const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null }; update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); };
  const activeLayoutClasses = bentoLayouts[currentLayoutIdx] || bentoLayouts[0];

return (
    <div className="p-6 md:p-10 relative">
      <ModuleHeader 
        title={content.title || t.modules.bento.title} 
        onTitleChange={(v) => update({ ...content, title: v })}
        desc={content.desc || t.modules.bento.desc} 
        onDescChange={(v) => update({ ...content, desc: v })}
        isDarkMode={isDarkMode} 
        isPreview={isPreview}
      >
         <div className="flex gap-2">
                      {!isPreview && (<button onClick={toggleLayout} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition-all active:scale-95 shadow-sm hover:shadow-md ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-white border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600'}`}><Shuffle size={14}/> <span>Cambiar Diseño</span></button>)}
         </div>
</ModuleHeader>
      <div className={`grid grid-flow-row-dense grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-4 mt-8 transition-all duration-500 ease-in-out`}>
        {items.map((item, index) => (
          <div key={item.id || `bento-item-${index}`} className={`${activeLayoutClasses[index] || 'col-span-1 row-span-1'} ${design.radius} border relative group overflow-hidden flex flex-col items-center justify-center p-0 transition-all duration-500 shadow-sm hover:shadow-md ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            {item.src ? (<div className="absolute inset-0 w-full h-full">{item.type === 'video' || isVideoUrl(item.src) ? (<iframe src={getEmbedUrl(item.src) || item.src} className="w-full h-full object-cover pointer-events-none" title={`Video ${item.id}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>) : (<img src={item.src} alt="Bento Item" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />)}{!isPreview && <div className="absolute inset-0 bg-transparent z-10" />}</div>) : (<BentoEmptyCell id={item.id} isDarkMode={isDarkMode} t={t} isPreview={isPreview} onUpdate={handleItemUpdate} />)}
            {!isPreview && <input id={`bento-up-${item.id}`} type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleItemUpload(e, item.id)} />}
            {!isPreview && (<div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20 ${!item.src ? 'pointer-events-none' : ''}`}>{item.src && (<button onClick={() => { handleItemUpdate(item.id, item.type, null); }} className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg text-xs font-bold text-slate-900 hover:bg-white hover:scale-105 transition-all">{t.ui.change}</button>)}</div>)}
          </div>
        ))}
      </div>
      <DynamicBlocks blocks={content.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

const IconsModule = React.memo(({ isDarkMode, design, content, update, t, isPreview }) => {
  const [selectedLib, setSelectedLib] = useState(content.selectedLibrary || 'outlined');
  const [showLibSelector, setShowLibSelector] = useState(false);
  const handleAddExtra = (type, param) => { const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null }; update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); };
  const libraries = [{ id: 'outlined', label: t.modules.icons.googleOutlined }, { id: 'rounded', label: t.modules.icons.googleRounded }, { id: 'sharp', label: t.modules.icons.googleSharp }, { id: 'custom', label: t.modules.icons.custom }];
  const googleIcons = [Home, Search, User, Settings, Bell, Mail]; 
  const addCustomIcon = () => { const newIcon = { id: Date.now(), src: null, name: 'Icon Name' }; update({ ...content, customIcons: [...(content.customIcons || []), newIcon] }); };
  const removeCustomIcon = (id) => update({ ...content, customIcons: (content.customIcons || []).filter(i => i.id !== id) });
  const updateCustomIcon = (id, field, value) => { const newIcons = (content.customIcons || []).map(icon => icon.id === id ? { ...icon, [field]: value } : icon); update({ ...content, customIcons: newIcons }); };
  const handleCustomUpload = (e, id) => { const file = e.target.files[0]; if(file) { const url = URL.createObjectURL(file); updateCustomIcon(id, 'src', url); } };
  const toggleDownload = () => update({ ...content, showDownload: !content.showDownload });
  const updateLink = (val) => update({ ...content, downloadUrl: val });
  useEffect(() => { if(selectedLib === 'custom' && (!content.customIcons || content.customIcons.length === 0)) { update({ ...content, customIcons: Array(6).fill(null).map((_,i) => ({ id: Date.now()+i, src: null, name: t.ui.iconName })) }); } }, [selectedLib]);
  const renderGoogleIcons = () => (<div className="grid grid-cols-6 gap-6 mt-10">{googleIcons.map((Icon, i) => (<div key={`google-icon-${i}`} className={`aspect-square ${design.radius} border flex items-center justify-center ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}><Icon size={28} strokeWidth={selectedLib === 'outlined' ? 1.5 : selectedLib === 'rounded' ? 2.5 : 2} className={isDarkMode ? 'text-white' : 'text-slate-900'} /></div>))}</div>);
  const renderCustomIcons = () => (<div className="grid grid-cols-3 md:grid-cols-6 gap-6 mt-10">{(content.customIcons || []).map((icon) => (<div key={icon.id} className="relative group/icon"><div onClick={() => !isPreview && document.getElementById(`cust-icon-${icon.id}`).click()} className={`aspect-square ${design.radius} border flex items-center justify-center relative overflow-hidden mb-2 ${!isPreview ? 'cursor-pointer' : ''} ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}><input id={`cust-icon-${icon.id}`} type="file" className="hidden" accept="image/svg+xml,image/png" onChange={(e) => handleCustomUpload(e, icon.id)} />{icon.src ? <img src={icon.src} className="w-2/3 h-2/3 object-contain" alt="icon" /> : <div className={`text-xs text-center p-2 opacity-50 ${isDarkMode?'text-white':'text-slate-900'}`}>{t.ui.upload}</div>}</div><EditableText text={icon.name} className={`text-[10px] text-center font-mono ${isDarkMode?'text-slate-400':'text-slate-500'}`} onChange={(v)=>updateCustomIcon(icon.id, 'name', v)} isDarkMode={isDarkMode} isPreview={isPreview} />{!isPreview && <button onClick={()=>removeCustomIcon(icon.id)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover/icon:opacity-100 transition-opacity"><X size={10}/></button>}</div>))}{!isPreview && <button onClick={addCustomIcon} className={`aspect-square ${design.radius} border border-dashed flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${isDarkMode ? 'border-white/20 text-slate-400' : 'border-slate-300 text-slate-500'}`}><Plus size={20} /><span className="text-[10px] uppercase font-bold">{t.ui.addText}</span></button>}</div>);

  return (
    <div className="p-10 relative">
<ModuleHeader 
        title={content.title || t.modules.icons.title} 
        onTitleChange={(v) => update({ ...content, title: v })}
        desc={content.desc || t.modules.icons.desc} 
        onDescChange={(v) => update({ ...content, desc: v })}
        isDarkMode={isDarkMode} 
        isPreview={isPreview}
      >         <div className="relative inline-flex items-center gap-2">
            {!isPreview && (<button onClick={toggleDownload} className={`p-2 rounded-full border transition-colors ${content.showDownload ? 'bg-indigo-100 border-indigo-200 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400' : (isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-600')}`} title={t.modules.icons.toggleDownload}><Link2 size={16}/></button>)}
            <div className="relative">
                <button onClick={() => setShowLibSelector(!showLibSelector)} className={`flex items-center gap-3 px-4 py-2 rounded-full border text-xs font-bold ${isDarkMode ? 'bg-white/5 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>{libraries.find(l => l.id === selectedLib)?.label} <ChevronDown size={14} /></button>
                {showLibSelector && (<div className={`absolute top-full right-0 mt-2 w-48 rounded-xl shadow-xl border z-20 py-2 ${isDarkMode ? 'bg-[#1e2330] border-white/10' : 'bg-white border-slate-200'}`}>{libraries.map(lib => (<button key={lib.id} onClick={() => { setSelectedLib(lib.id); update({...content, selectedLibrary: lib.id}); setShowLibSelector(false); }} className={`w-full text-left px-4 py-2 text-xs hover:bg-indigo-500 hover:text-white transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{lib.label}</button>))}</div>)}
            </div>
         </div>
      </ModuleHeader>
      {selectedLib === 'custom' ? renderCustomIcons() : renderGoogleIcons()}
      {content.showDownload && (<div className={`mt-8 pt-6 border-t border-dashed ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>{selectedLib === 'custom' ? (<>{!isPreview && (<input type="text" value={content.downloadUrl || ''} onChange={(e) => updateLink(e.target.value)} placeholder="https://drive.google.com/icons..." className={`w-full p-3 text-xs rounded-lg mb-4 outline-none border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-600 focus:border-indigo-500'}`} />)}<a href={content.downloadUrl || '#'} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${!content.downloadUrl && !isPreview ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}><Download size={16} />{t.modules.icons.downloadCustom}</a></>) : (<a href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 hover:scale-105 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}><ExternalLink size={16} />{t.modules.icons.downloadGoogle}</a>)}</div>)}
      <DynamicBlocks blocks={content?.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

const WebModule = React.memo(({ isDarkMode, design, content, update, t, isPreview }) => {
  const handleAddExtra = (type, param) => { const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null }; update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); };
  const handleWebUpload = (e, idx) => { const file = e.target.files[0]; if (file) { const url = URL.createObjectURL(file); const newDevices = content.devices ? [...content.devices] : [null, null, null]; newDevices[idx] = url; update({ ...content, devices: newDevices }); } };
  const devices = content.items || [];
  const addDevice = (type) => { const newItem = { id: Date.now(), type, src: null }; update({ ...content, items: [...(content.items || []), newItem] }); };
  const removeDevice = (id) => update({ ...content, items: (content.items || []).filter(item => item.id !== id) });
  const handleDeviceUpload = (e, id) => { const file = e.target.files[0]; if (file) { const url = URL.createObjectURL(file); const newItems = (content.items || []).map(item => item.id === id ? { ...item, src: url } : item); update({ ...content, items: newItems }); } };
  useEffect(() => { if (!content.items) { update({ ...content, items: [ { id: 1, type: 'laptop', src: null }, { id: 2, type: 'tablet', src: null }, { id: 3, type: 'mobile', src: null } ]}); } }, []);

  const description = content.description || "Descripción del proyecto web y sus objetivos principales.";

  return (
    <div className="p-6 md:p-10 relative">
<ModuleHeader 
        title={content.title || t.modules.web.title} 
        onTitleChange={(v) => update({ ...content, title: v })}
        desc={description} 
        onDescChange={(v) => update({ ...content, description: v })}
        isDarkMode={isDarkMode} 
        isPreview={isPreview}
      >
                  <div className="flex gap-2">
             <button onClick={() => addDevice('laptop')} className={`p-2 rounded-full border transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'}`}><Laptop size={16}/></button>
             <button onClick={() => addDevice('tablet')} className={`p-2 rounded-full border transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'}`}><Tablet size={16}/></button>
             <button onClick={() => addDevice('mobile')} className={`p-2 rounded-full border transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'}`}><Smartphone size={16}/></button>
          </div>
      </ModuleHeader>

      <div className="flex flex-wrap items-end justify-center gap-8 mt-6 mb-8">{devices.map((device) => (<div key={device.id} className={`${device.type === 'laptop' ? 'w-full flex justify-center mb-4 md:mb-0 order-first md:order-none' : ''}`}><input id={`web-dev-${device.id}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleDeviceUpload(e, device.id)} /><DeviceMockup type={device.type} src={device.src} label={t.modules.web[device.type]} isDarkMode={isDarkMode} isPreview={isPreview} onUpload={() => document.getElementById(`web-dev-${device.id}`).click()} onDelete={() => removeDevice(device.id)} /></div>))}</div>
      <DynamicBlocks blocks={content?.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

const SocialModule = React.memo(({ isDarkMode, design, content, update, t, isPreview }) => {
  const handleAddExtra = (type, param) => { const newBlock = type === 'text' ? { id: Date.now(), type: 'text', cols: param, content: Array(param).fill('') } : { id: Date.now(), type: 'image', src: null }; update({ ...content, extraBlocks: [...(content.extraBlocks || []), newBlock] }); };
  const addDevice = (type) => { const newItem = { id: Date.now(), type, src: null }; update({ ...content, items: [...(content.items || []), newItem] }); };
  const removeDevice = (id) => update({ ...content, items: (content.items || []).filter(item => item.id !== id) });
  const handleDeviceUpload = (e, id) => { const file = e.target.files[0]; if (file) { const url = URL.createObjectURL(file); const newItems = (content.items || []).map(item => item.id === id ? { ...item, src: url } : item); update({ ...content, items: newItems }); } };
  const items = content.items || [];
  useEffect(() => { if (!content.items) { update({ ...content, items: [ { id: 1, type: 'post', src: null }, { id: 2, type: 'reel', src: null }, { id: 3, type: 'youtube', src: null } ]}); } }, []);

  return (
    <div className="p-6 md:p-10 relative">
<ModuleHeader 
        title={content.title || t.modules.social.title} 
        onTitleChange={(v) => update({ ...content, title: v })}
        desc={content.desc || t.modules.social.desc} 
        onDescChange={(v) => update({ ...content, desc: v })}
        isDarkMode={isDarkMode} 
        isPreview={isPreview}
      >
                  <div className="flex gap-2">
             <button onClick={() => addDevice('post')} className={`p-2 rounded-full border transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'}`} title="Post (4:5)"><Instagram size={16}/></button>
             <button onClick={() => addDevice('reel')} className={`p-2 rounded-full border transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'}`} title="Reel (9:16)"><Smartphone size={16}/></button>
             <button onClick={() => addDevice('youtube')} className={`p-2 rounded-full border transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'}`} title="YouTube (16:9)"><Youtube size={16}/></button>
             <button onClick={() => addDevice('avatar')} className={`p-2 rounded-full border transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'}`} title="Avatar"><User size={16}/></button>
             <button onClick={() => addDevice('x_header')} className={`p-2 rounded-full border transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'}`} title="X Header"><RectangleHorizontal size={16}/></button>
             <button onClick={() => addDevice('yt_header')} className={`p-2 rounded-full border transition-colors ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600'}`} title="YT Header"><RectangleHorizontal size={16}/></button>
          </div>
      </ModuleHeader>
      <div className="flex flex-wrap items-end justify-center gap-8 mt-6 mb-8">{items.map((device) => (<div key={device.id} className={`${(device.type === 'youtube' || device.type === 'x_header' || device.type === 'yt_header') ? 'w-full flex justify-center mb-4 md:mb-0 order-first md:order-none' : ''}`}><input id={`soc-dev-${device.id}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleDeviceUpload(e, device.id)} /><DeviceMockup type={device.type} src={device.src} label={t.modules.social[device.type]} isDarkMode={isDarkMode} isPreview={isPreview} onUpload={() => document.getElementById(`soc-dev-${device.id}`).click()} onDelete={() => removeDevice(device.id)} /></div>))}</div>
      <DynamicBlocks blocks={content?.extraBlocks} update={(newBlocks) => update({...content, extraBlocks: newBlocks})} isDarkMode={isDarkMode} design={design} t={t} isPreview={isPreview} />
      <AddContentFooter onAdd={handleAddExtra} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
    </div>
  );
});

// ==============================================================================
// === FILE: UserProfileModal.tsx ===
// ==============================================================================

const UserProfileModal = React.memo(({ isOpen, onClose, onLogout, isDarkMode, t, content, update, usedSpace, userPlan, showWatermark, setShowWatermark, onResetCanvas, slugStatus, handleSlugChange }) => {  const [activeTab, setActiveTab] = useState('profile');
  const [showDangerZone, setShowDangerZone] = useState(false);
  const safeT = t || TRANSLATIONS.ES;
  
  useEffect(() => {
    // Solo rellenamos datos de relleno si el perfil está completamente vacío (usuario nuevo sin registro)
    if (!content.name && !content.email) {
      update({
        ...content, 
        name: content.name || "Tu Nombre / Marca", 
        role: content.role || "Diseño / Marketing",
        location: content.location || "Madrid, Spain",
        bio: content.bio || "Creando experiencias digitales.",
        joinDate: content.joinDate || new Date().toLocaleDateString(),
        notifications: content.notifications || { email: true, push: false },
        language: content.language || 'ES'
      });
    }
  }, []);

  const handleAvatarUpload = (e) => { 
    const file = e.target.files[0]; 
    if (file) update({ ...content, avatar: URL.createObjectURL(file) }); 
  };
  
  const updateData = (field, value) => update({ ...content, [field]: value });
  const toggleNotification = (type) => update({ ...content, notifications: { ...content.notifications, [type]: !content.notifications?.[type] } });

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: safeT.profileTabs.public, icon: User },
    { id: 'account', label: safeT.profileTabs.account, icon: Settings },
    { id: 'preferences', label: safeT.profileTabs.preferences, icon: Sliders },
  ];

  const maxSpace = userPlan === 'FREE' ? 20 : 1024;
  const usagePercent = Math.min((usedSpace / maxSpace) * 100, 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row ${isDarkMode ? 'bg-[#0f111a] border border-white/10 text-slate-300' : 'bg-white text-slate-900'}`}>
        
        <div className={`w-full md:w-64 p-6 border-b md:border-b-0 md:border-r ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
           <h2 className="text-xl font-bold mb-8 flex items-center gap-2"><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><User size={18}/></div> {safeT.profileTabs.title}</h2>
  
           <nav className="space-y-2">
              {tabs.map(tab => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : (isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-white hover:text-indigo-600')}`}><tab.icon size={18} /> {tab.label}</button>
              ))}
           </nav>
           <div className="mt-auto pt-8">
              <div className={`p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'}`}>
                  <div className="flex justify-between items-end mb-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-500">{safeT.profileTabs.space}</h4>
                      <span className={`text-[10px] font-bold ${usagePercent > 90 ? 'text-rose-500' : 'text-indigo-500'}`}>{usedSpace}MB / {maxSpace}MB</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                     <div className={`h-full rounded-full transition-all duration-500 ${usagePercent > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${usagePercent}%` }}></div>
                  </div>
                  <p className="text-[10px] opacity-70">{safeT.profileTabs.filesMsg}</p>
              </div>
              <button onClick={() => { 
                  if(window.confirm("¿Seguro que quieres cerrar sesión? Si tienes cambios sin 'Publicar', podrían perderse.")) {
                      if(onLogout) onLogout(); 
                      onClose(); 
                  }
              }} className="flex items-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors px-4">
                  <LogOut size={16} /> {safeT.profileTabs.logout}
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
           <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10"><X size={24} className={isDarkMode ? 'text-white' : 'text-slate-900'} /></button>

           <div className="p-8 md:p-12 max-w-3xl">
              {activeTab === 'profile' && (
                 <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div><h3 className="text-2xl font-bold mb-2">{safeT.profileTabs.public}</h3><p className="opacity-60 text-sm">{safeT.profileTabs.publicDesc}</p></div>
                  
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <div className="relative group/avatar shrink-0">
                            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-xl ${isDarkMode ? 'border-indigo-500/30' : 'border-indigo-500/10'}`}>
                                {content.avatar ? <img src={content.avatar} className="w-full h-full object-cover"/> : <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400'}`}><User size={48}/></div>}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2.5 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg border-4 border-white dark:border-[#0f111a]"><Upload size={16}/><input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload}/></label>
                        </div>
                        <div className="flex-1 space-y-6 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider opacity-50">{safeT.auth.name}</label><input type="text" value={content.name || ''} onChange={(e) => updateData('name', e.target.value)} className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDarkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} /></div>
                                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider opacity-50">{safeT.profileTabs.role}</label><input type="text" value={content.role || ''} onChange={(e) => updateData('role', e.target.value)} className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDarkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} /></div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-wider opacity-50">URL Personalizada</label>
<div className={`flex items-center px-4 rounded-xl border overflow-hidden transition-all ${
                                slugStatus === 'taken' ? 'border-rose-500 ring-2 ring-rose-500/20' : 
                                slugStatus === 'available' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 
                                (isDarkMode ? 'bg-black/20 border-white/10 focus-within:border-indigo-500' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-500')
                              }`}>
                                <span className="opacity-50 text-sm mr-1 hidden sm:inline">brandbara.com/</span>
                                <span className="opacity-50 text-sm mr-1 sm:hidden">.../</span>
                       
                                <input 
                                  type="text" 
                                  value={content.slug || ''} 
                                  // ¡Llamamos a nuestra nueva función!
                                  onChange={(e) => handleSlugChange(e.target.value)} 
                                  placeholder="mi-agencia" 
                                  className={`w-full py-3 bg-transparent outline-none font-bold flex-1 ${
                                    slugStatus === 'taken' ? 'text-rose-500' : 
                                    (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                                  }`} 
                                />

                                {/* Iconitos de estado (Verde, Rojo o Cargando) */}
                                <div className="pl-3 flex items-center justify-center">
                                  {slugStatus === 'checking' && <Loader2 size={16} className="animate-spin text-slate-400" />}
                                  {slugStatus === 'available' && <Check size={16} className="text-emerald-500" />}
                                  {slugStatus === 'taken' && <X size={16} className="text-rose-500" />}
                                </div>
                              </div>
                              
                              {/* Mensajes de ayuda o error */}
                              {slugStatus === 'taken' ? (
                                <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                                  <AlertCircle size={10} /> Este enlace ya está ocupado.
                                </p>
                              ) : (
                                <p className="text-[10px] opacity-60 mt-1">Este será el enlace público que compartirás con tus clientes.</p>
                              )}
                                                          </div>

                            <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider opacity-50">{safeT.profileTabs.bio}</label><textarea value={content.bio || ''} onChange={(e) => updateData('bio', e.target.value)} rows={4} className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none ${isDarkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} /></div>
                        </div>
                    </div>
                 </div>
              )}

              {activeTab === 'account' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div><h3 className="text-2xl font-bold mb-2">{safeT.profileTabs.account}</h3><p className="opacity-60 text-sm">{safeT.profileTabs.accountDesc}</p></div>
                      <div className="space-y-6 max-w-lg">
                          
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider opacity-50">{safeT.auth.email}</label>
                            <div className={`flex items-center px-4 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                              <Mail size={18} className="opacity-50 mr-3"/>
                              <input type="email" value={content.email || ''} readOnly className={`w-full py-3 bg-transparent outline-none opacity-70 cursor-not-allowed ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
                            </div>
                            <p className="text-[10px] opacity-60">El email no se puede cambiar por motivos de seguridad.</p>
                          </div>
                          
                          <div className="pt-6 border-t border-dashed border-slate-200 dark:border-white/10">
                            <h4 className="font-bold mb-4 flex items-center gap-2"><Lock size={16}/> {safeT.auth.password}</h4>
                            <button onClick={() => alert("Se enviaría un email a " + content.email + " para restablecer la contraseña.")} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                              {safeT.profileTabs.changePass}
                            </button>
                          </div>

                          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10">
<button 
                                onClick={() => setShowDangerZone(!showDangerZone)}
                                className="w-full flex items-center justify-between group"
                            >
                                <h4 className={`font-bold flex items-center gap-2 transition-colors ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                    <Settings size={16} className="opacity-50" /> Ajustes Avanzados
                                </h4>
                                <ChevronDown size={16} className={`transition-transform duration-300 opacity-50 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} ${showDangerZone ? 'rotate-180' : ''}`} />
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ${showDangerZone ? 'max-h-80 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className={`p-5 rounded-2xl border space-y-5 shadow-inner ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                    {/* BOTÓN NARANJA AÑADIDO AQUÍ */}
                                    <div>
                                        <p className={`text-[10px] opacity-70 mb-2 font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Reiniciar Diseño</p>
                                        <button 
                                            onClick={onResetCanvas}
                                            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-bold text-xs transition-all shadow-sm active:scale-95"
                                        >
                                            <Wand2 size={14} /> Empezar de cero (Resetear)
                                        </button>
                                    </div>
                                    <div className={`pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                                        <p className={`text-[10px] opacity-70 mb-3 font-bold uppercase tracking-widest ${isDarkMode ? 'text-rose-400' : 'text-rose-500'}`}>Zona Crítica</p>                                        <button onClick={() => {
                                          if(window.confirm("¿Estás 100% seguro de que quieres borrar tu cuenta y todos tus portales? Esta acción es irreversible.")) {
                                            alert("Cuenta borrada con éxito (Simulación)");
                                            if(onLogout) onLogout();
                                            onClose();
                                          }
                                        }} className="w-full px-4 py-2 bg-rose-500 text-white hover:bg-rose-600 rounded-lg text-sm font-bold transition-colors shadow-sm">
                                          Eliminar mi cuenta definitivamente
                                        </button>
                                    </div>
                                </div>
                            </div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'preferences' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div><h3 className="text-2xl font-bold mb-2">{safeT.profileTabs.preferences}</h3><p className="opacity-60 text-sm">{safeT.profileTabs.prefDesc}</p></div>
                      <div className="space-y-6">
                          
                          <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'} ${userPlan !== 'PRO' ? 'opacity-50' : ''}`}>
                              <div className="flex items-center gap-4"><div className={`p-2 rounded-lg ${isDarkMode ? 'bg-black/30' : 'bg-white'}`}><Fingerprint size={20} className="text-indigo-500"/></div><div><h4 className="font-bold text-sm">Marca de agua "BrandBara"</h4><p className="text-[10px] opacity-60">{userPlan === 'PRO' ? "Muestra u oculta el crédito en el footer." : "Solo disponible en el Plan PRO."}</p></div></div>
                              <button disabled={userPlan !== 'PRO'} onClick={() => setShowWatermark(!showWatermark)} className={`w-12 h-6 rounded-full p-1 transition-colors ${showWatermark ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'}`}><div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${showWatermark ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                          </div>
                          
                          <div className={`p-4 rounded-xl border flex flex-col gap-4 ${isDarkMode ? 'border-white/10 bg-white/5' : 'bg-slate-50 border-slate-200'} ${userPlan !== 'PRO' ? 'opacity-50' : ''}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-black/30' : 'bg-white'}`}>
                                  <Lock size={20} className="text-indigo-500"/>
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm">Acceso Privado</h4>
                                  <p className="text-[10px] opacity-60">{userPlan === 'PRO' ? "Protege tu portal con una clave global para visitantes." : "Solo disponible en el Plan PRO."}</p>
                                </div>
                              </div>
                              <button 
                                disabled={userPlan !== 'PRO'} 
                                onClick={() => updateData('isPasswordProtected', !content.isPasswordProtected)} 
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${content.isPasswordProtected ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-white/20'}`}
                              >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${content.isPasswordProtected ? 'translate-x-6' : 'translate-x-0'}`} />
                              </button>
                            </div>
                            {content.isPasswordProtected && userPlan === 'PRO' && (
                              <div className="relative group animate-in slide-in-from-top-2 duration-200">
                                <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-indigo-500" />
                                <input 
                                  type="password" 
                                  value={content.portalPassword || ''} 
                                  onChange={(e) => updateData('portalPassword', e.target.value)} 
                                  placeholder="Define la contraseña de acceso..." 
                                  className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border outline-none transition-all ${isDarkMode ? 'bg-black/20 border-white/10 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'}`}
                                />
                              </div>
                            )}
                          </div>

                          <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                              <div className="flex items-center gap-4"><div className={`p-2 rounded-lg ${isDarkMode ? 'bg-black/30' : 'bg-white'}`}><Globe size={20}/></div><div><h4 className="font-bold text-sm">{safeT.profileTabs.lang}</h4><p className="text-xs opacity-60">{safeT.profileTabs.langDesc}</p></div></div>
                              <select value={content.language || 'ES'} onChange={(e) => updateData('language', e.target.value)} className={`px-3 py-1.5 rounded-lg text-sm font-bold border outline-none ${isDarkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}><option value="ES">Español</option><option value="EN">English</option></select>
                          </div>
                          
                          <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                              <div className="flex items-center gap-4"><div className={`p-2 rounded-lg ${isDarkMode ? 'bg-black/30' : 'bg-white'}`}><Bell size={20}/></div><div><h4 className="font-bold text-sm">{safeT.profileTabs.notif}</h4><p className="text-xs opacity-60">{safeT.profileTabs.notifDesc}</p></div></div>
                              <button onClick={() => toggleNotification('email')} className={`w-12 h-6 rounded-full p-1 transition-colors ${content.notifications?.email ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'}`}><div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${content.notifications?.email ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                          </div>
                          
                          <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                              <div className="flex items-center gap-4"><div className={`p-2 rounded-lg ${isDarkMode ? 'bg-black/30' : 'bg-white'}`}><Cookie size={20}/></div><div><h4 className="font-bold text-sm">{safeT.profileTabs.cookies}</h4><p className="text-xs opacity-60">{safeT.profileTabs.cookiesDesc}</p></div></div>
                              <button onClick={() => toggleNotification('cookies')} className={`w-12 h-6 rounded-full p-1 transition-colors ${content.notifications?.cookies !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'}`}><div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${content.notifications?.cookies !== false ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                          </div>
                      </div>
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
});

const CookieBanner = ({ isDarkMode, onAccept, onReject, onManage, t }) => {
  const safeT = t || TRANSLATIONS.ES;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] w-[calc(100%-2rem)] max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className={`p-6 rounded-[2rem] shadow-2xl backdrop-blur-2xl border flex flex-col lg:flex-row gap-6 items-center justify-between ${isDarkMode ? 'bg-[#151924]/80 border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : 'bg-white/80 border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.08)]'}`}>
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-3 rounded-2xl shrink-0 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <Cookie size={28} />
          </div>
          <div>
            <h3 className={`font-black text-lg mb-1 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{safeT.cookie.title}</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {safeT.cookie.desc}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto shrink-0 justify-end">
          <button onClick={onManage} className={`px-5 py-3 text-xs font-bold rounded-xl border transition-all ${isDarkMode ? 'border-white/20 text-slate-300 hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
            {safeT.cookie.manage}
          </button>
          <button onClick={onReject} className={`px-5 py-3 text-xs font-bold rounded-xl transition-all ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
            {safeT.cookie.reject}
          </button>
          <button onClick={onAccept} className="px-6 py-3 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 active:scale-95 transition-all w-full sm:w-auto">
            {safeT.cookie.accept}
          </button>
        </div>
      </div>
    </div>
  );
};
const AuthModal = ({ isOpen, onClose, onAuthenticate, isDarkMode, t }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const safeT = t || TRANSLATIONS.ES;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!isLogin && !acceptedTerms) return;

    if (!supabase) {
      setErrorMsg("Error: Supabase no está conectado.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        // LOGIN REAL
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthenticate(data.user);
      } else {
        // REGISTRO REAL
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name } }
        });
        if (error) throw error;
        onAuthenticate(data.user);
      }
    } catch (error) {
      setErrorMsg(error.message === "Invalid login credentials" ? "Credenciales incorrectas." : error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md p-8 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-[#151924] border border-white/10 text-slate-300' : 'bg-white border border-slate-200 text-slate-900'}`}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10">
          <X size={20} className={isDarkMode ? 'text-white' : 'text-slate-900'} />
        </button>

        <div className="text-center mb-8">
          <h2 className={`text-2xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {isLogin ? safeT.auth.loginTitle : safeT.auth.registerTitle}
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isLogin ? safeT.auth.loginDesc : safeT.auth.registerDesc}
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-black/30 p-1 rounded-xl mb-6">
          <button type="button" onClick={() => {setIsLogin(true); setErrorMsg('');}} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-[#1e2330] shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {safeT.auth.loginBtn}
          </button>
          <button type="button" onClick={() => {setIsLogin(false); setErrorMsg('');}} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-[#1e2330] shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {safeT.auth.registerBtn}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider opacity-60">{safeT.auth.name}</label>
              <div className={`flex items-center px-4 rounded-xl border focus-within:border-indigo-500 transition-colors ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <User size={18} className="opacity-50 mr-3" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={safeT.auth.namePlaceholder} className={`w-full py-3 bg-transparent outline-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`} required />
              </div>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider opacity-60">{safeT.auth.email}</label>
            <div className={`flex items-center px-4 rounded-xl border focus-within:border-indigo-500 transition-colors ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Mail size={18} className="opacity-50 mr-3" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={safeT.auth.emailPlaceholder} className={`w-full py-3 bg-transparent outline-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider opacity-60">{safeT.auth.password}</label>
            <div className={`flex items-center px-4 rounded-xl border focus-within:border-indigo-500 transition-colors ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Lock size={18} className="opacity-50 mr-3" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} className={`w-full py-3 bg-transparent outline-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`} required />
            </div>
          </div>

          {errorMsg && <p className="text-xs text-rose-500 font-bold bg-rose-500/10 p-3 rounded-lg">{errorMsg}</p>}

          {!isLogin && (
            <label className="flex items-start gap-3 mt-4 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="peer sr-only" />
                <div className={`w-5 h-5 rounded border-2 transition-all ${acceptedTerms ? 'bg-indigo-600 border-indigo-600' : (isDarkMode ? 'border-white/30 group-hover:border-white/50' : 'border-slate-300 group-hover:border-slate-400')}`}></div>
                <Check size={14} className={`absolute text-white transition-transform scale-0 peer-checked:scale-100`} strokeWidth={3} />
              </div>
              <span className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {safeT.auth.termsPre} <a href="#" className="text-indigo-500 hover:underline font-bold">{safeT.auth.termsLink}</a> {safeT.auth.privacyAnd} <a href="#" className="text-indigo-500 hover:underline font-bold">{safeT.auth.privacyLink}</a>.
              </span>
            </label>
          )}

          <button 
            type="submit" 
            disabled={isLoading || (!isLogin && !acceptedTerms)}
            className={`w-full mt-6 py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${(isLoading || (!isLogin && !acceptedTerms)) ? 'opacity-50 cursor-not-allowed bg-slate-300 dark:bg-slate-700 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'}`}
          >
            {isLoading ? "Cargando..." : (isLogin ? safeT.auth.loginBtn : safeT.auth.registerBtn)}
          </button>
        </form>
      </div>
    </div>
  );
};
const LegalModal = ({ isOpen, page, onClose, isDarkMode }) => {
  const [lang, setLang] = useState('ES');
  if (!isOpen) return null;
  
  const currentHTML = LEGAL_CONTENT[page]?.[lang] || LEGAL_CONTENT.privacy.ES;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Contenedor principal idéntico a ManageSubscriptionModal y AuthModal */}
      <div 
        role="dialog" 
        aria-modal="true"
        className={`relative w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden ${
          isDarkMode ? 'bg-[#151924] border border-white/10 text-slate-300' : 'bg-white border border-slate-200 text-slate-900'
        }`}
      >
        {/* Cabecera idéntica a AuthModal (padding, close button, selector de idioma nativo) */}
        <div className="flex-shrink-0 p-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Documentación Legal
          </h2>
          
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 dark:bg-black/30 p-1 rounded-xl">
              <button 
                onClick={() => setLang('ES')} 
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'ES' ? 'bg-white dark:bg-[#1e2330] shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                aria-pressed={lang === 'ES'}
              >
                ES
              </button>
              <button 
                onClick={() => setLang('EN')} 
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'EN' ? 'bg-white dark:bg-[#1e2330] shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                aria-pressed={lang === 'EN'}
              >
                EN
              </button>
            </div>
            
            <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <X size={20} className={isDarkMode ? 'text-white' : 'text-slate-900'} />
            </button>
          </div>
        </div>

        {/* Zona de contenido con select-text para permitir copiado y VoiceOver */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10 select-text">
          <div 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: currentHTML }} 
          />
        </div>
      </div>
    </div>
  );
};

const ManageSubscriptionModal = ({ isOpen, onClose, isDarkMode, onUpgrade, t }) => {
  if (!isOpen) return null;
  const isES = t?.ui?.publish === "Publicar";
  const btnText = isES ? "Estoy interesado" : "I'm interested";
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row ${isDarkMode ? 'bg-[#151924] border border-white/10' : 'bg-white border border-slate-200'} rounded-3xl`}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
          <X size={20} className={isDarkMode ? 'text-white' : 'text-slate-900'} />
        </button>
        <div className={`w-full md:w-5/12 p-8 flex flex-col justify-center ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
          <div className="flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400">
            <Zap size={20} fill="currentColor" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">PRO Plan</span>
          </div>
          <h2 className={`text-3xl font-black mb-4 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Desbloquea todo el potencial.
          </h2>
        </div>
        <div className="w-full md:w-7/12 p-8 flex flex-col justify-center items-center">
          <table className={`w-full mb-8 text-left text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="pb-4 font-bold opacity-40 uppercase text-[10px]">Características</th>
                <th className="pb-4 font-bold text-center">FREE</th>
                <th className="pb-4 font-bold text-center text-indigo-600">PRO</th>
              </tr>
            </thead>
<tbody className="divide-y divide-slate-100 dark:divide-white/5">
              <tr>
                <td className="py-4 font-medium opacity-80">Espacio máximo</td>
                <td className="py-4 text-center">20MB</td>
                <td className="py-4 text-center font-bold text-indigo-600">1GB (1024MB)</td>
              </tr>
              <tr>
                <td className="py-4 font-medium opacity-80">Marca de agua</td>
                <td className="py-4 text-center">Sí</td>
                <td className="py-4 text-center font-bold text-indigo-600">No</td>
              </tr>
              {/* NUEVA FILA: PROTECCIÓN CON CONTRASEÑA */}
              <tr>
                <td className="py-4 font-medium opacity-80">Protección con contraseña</td>
                <td className="py-4 text-center">No</td>
                <td className="py-4 text-center font-bold text-indigo-600">Sí</td>
              </tr>
            </tbody>
                      </table>
<div className="flex gap-4 w-full">
            <button onClick={() => { onUpgrade(); onClose(); }} className={`w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}>
              <Zap size={16} fill="currentColor"/> {btnText}
            </button>
          </div>
         </div>
      </div>
    </div>
  );
};

const Editor = () => {
    const [design, setDesign] = useState({ style: DESIGN_STYLES.crystal, palette: COLOR_PALETTES[0], font: 'Inter', canvasBg: 'bg-slate-50', spacing: SPACING_OPTIONS.normal });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userPlan, setUserPlan] = useState('FREE');
  const [showWatermark, setShowWatermark] = useState(true);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [activeLegalPage, setActiveLegalPage] = useState(null);
  const [limitMessage, setLimitMessage] = useState("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
const [showBetaModal, setShowBetaModal] = useState(false);
const [pendingUpgrade, setPendingUpgrade] = useState(false);
const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessInput, setAccessInput] = useState("");
  const [isPublicView, setIsPublicView] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [notFound, setNotFound] = useState(false);
  // 1. Añade este estado para el candado del Remix Mágico
  const [isRemixLocked, setIsRemixLocked] = useState(false);

// 2. Función INTELIGENTE que cambia el diseño de los módulos
  const cycleModuleLayout = (moduleId, moduleType) => {
    setCanvasItems(prevItems => prevItems.map(mod => {
      if (mod.id === moduleId) {
        const c = mod.content || {};
        
        // A) Módulos con arquitectura propia ya programada
        if (moduleType === 'bento') {
          return { ...mod, content: { ...c, layoutIndex: ((c.layoutIndex || 0) + 1) % 4 } };
        }
        if (moduleType === 'footer') {
          return { ...mod, content: { ...c, layout: ((c.layout || 0) + 1) % 3 } };
        }
        if (moduleType === 'layout') {
          const grids = ['grid1', 'grid2', 'grid3', 'grid4'];
          const nextIdx = (grids.indexOf(c.selectedGrid || 'grid1') + 1) % grids.length;
          return { ...mod, content: { ...c, selectedGrid: grids[nextIdx] } };
        }
        if (moduleType === 'color') {
          return { ...mod, content: { ...c, layout: c.layout === 'list' ? 'grid' : 'list' } };
        }

        // B) Módulos genéricos (Identidad, Editorial, Assets...)
        let layouts = ['default', 'grid', 'stack'];
        if (moduleType === 'editorial') layouts = ['default', 'grid', 'stack', 'bento'];
        
        const currentIndex = layouts.indexOf(c.layout || layouts[0]);
        const nextIndex = (currentIndex + 1) % layouts.length;
        return { ...mod, content: { ...c, layout: layouts[nextIndex] } };
      }
      return mod;
    }));
  };

  // --- ESTADOS PARA VALIDACIÓN DEL SLUG ---
  const [slugStatus, setSlugStatus] = useState(null); // 'checking', 'available', 'taken', null
  const [slugCheckTimeout, setSlugCheckTimeout] = useState(null);

  // Detección automática del idioma al cargar si no hay guardado en local
  const [language, setLanguage] = useState(() => {
    try {
      const savedData = localStorage.getItem('brandPortalData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.language) return parsed.language;
      }
    } catch (e) {}
    // Detecta el idioma del navegador, y si no existe asume español
    const browserLang = (navigator.language || navigator.userLanguage || 'ES').toLowerCase();
    // Si empieza por 'es', configuramos 'ES', para el resto configuramos 'EN'
    return browserLang.startsWith('es') ? 'ES' : 'EN';
  });

  const [currentFont, setCurrentFont] = useState('Inter');
  const [showDonations, setShowDonations] = useState(false);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [showSpacingSelector, setShowSpacingSelector] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const [activeDropIndex, setActiveDropIndex] = useState(null);
  
  const safeLanguage = typeof language === 'string' ? language.toUpperCase() : 'ES';
  const t = TRANSLATIONS[safeLanguage] || TRANSLATIONS['ES']; 
  
  const [activeAccordion, setActiveAccordion] = useState(null); 
  const [showFontSelector, setShowFontSelector] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
const [currentUser, setCurrentUser] = useState(null);
const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'

// --- FUNCIÓN DE CIERRE DE SESIÓN TOTAL ---
  const handleSignOut = async () => {
    try {
      if (supabase) await supabase.auth.signOut();
    } catch (error) {
      console.error("Error cerrando sesión en Supabase:", error);
    } finally {
      // 1. Limpiamos Supabase
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      // 2. Limpiamos el LocalStorage para que no recargue datos viejos al refrescar
      localStorage.removeItem('brandPortalData');
      
      // 3. Restauramos el Perfil a blanco
      setProfileContent({});
      
      // 4. Restauramos el Diseño por defecto
      setDesign({ 
        style: DESIGN_STYLES.crystal, 
        palette: COLOR_PALETTES[0], 
        font: 'Inter', 
        canvasBg: 'bg-slate-50', 
        spacing: SPACING_OPTIONS.normal 
      });
      setCurrentFont('Inter');
      
      // 5. Restauramos los módulos del Canvas por defecto
      setCanvasItems([
        { id: 'header-1', type: 'header', content: { title: "Portal de Marca", logo: null, layout: 'standard' } },
        { id: 'hero', type: 'hero', content: { subtitle: "Un sistema visual diseñado para escalar." } },
        { id: 'identity', type: 'identity', content: {} },
        { id: 'logo', type: 'logo', content: {} },
        { id: 'color', type: 'color', content: { colors: [] } },
        { id: 'typography', type: 'typography', content: { levels: [] } },
        { id: 'image', type: 'image', content: { images: [1, 2, 3, 4] } },
        { id: 'layout', type: 'layout', content: { selectedGrid: 'grid1', usageExamples: [] } },
        { id: 'bento', type: 'bento', content: { items: Array(5).fill(null).map((_, i) => ({ id: `bento-${i}`, type: 'image', src: null })), layoutIndex: 0 } },
        { id: 'editorial', type: 'editorial', content: { blocks: [{type:'text', content: "Contenido editorial de ejemplo..." }] } },
        { id: 'icons', type: 'icons', content: {} },
        { id: 'web', type: 'web', content: {} },
        { id: 'social', type: 'social', content: {} },
        { id: 'cobranding', type: 'cobranding', content: {} },
        { id: 'assets', type: 'assets', content: {} },
        { id: 'footer-1', type: 'footer', content: { copyright: "" } }
      ]);

      // 6. Avisamos al usuario
      showToast("Sesión cerrada correctamente.");
    }
  };

// 1. EFECTO DE AUTENTICACIÓN (Supabase)
  useEffect(() => {
    if (!supabase) return;
    
    const handleSession = (session) => {
      if (session) { 
        setCurrentUser(session.user); 
        setIsAuthenticated(true);
        
        // Magia UX: Extraemos el nombre con el que se acaba de registrar
        const fullName = session.user.user_metadata?.full_name || '';
        
        setProfileContent(prev => {
          const isDefaultName = !prev.name || prev.name === 'Alex Designer' || prev.name === 'Tu Nombre / Marca';
          return {
            ...prev, 
            email: session.user.email,
            // Si no tiene nombre o tiene el por defecto, le ponemos su nombre real
            name: (isDefaultName && fullName) ? fullName : (prev.name || 'Mi Marca'),
            // Autogeneramos una URL amigable (slug) basada en su nombre si no tiene una
            slug: (!prev.slug && fullName) ? fullName.toLowerCase().replace(/[^a-z0-9-]/g, '-') : (prev.slug || '')
          };
        }); 
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session));
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // 2. LÓGICA DE VISTA PÚBLICA (READ-ONLY)
  useEffect(() => {
    const path = window.location.pathname.replace('/', '');
    
    if (path && path !== '') {
      setIsPublicView(true);
      setIsPreview(true);
      setIsLoadingPortal(true);
      
      const fetchPortal = async () => {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('portals')
          .select('*')
          .eq('slug', path)
          .single();
          
        if (error || !data) {
          setNotFound(true);
        } else {
          const canvasData = data.canvas_data || {};
          if (canvasData.items) setCanvasItems(canvasData.items);
          if (canvasData.design) setDesign(canvasData.design);
          if (canvasData.profile) setProfileContent(canvasData.profile);
          
          if (data.is_protected) {
            setProfileContent(prev => ({
              ...prev, 
              isPasswordProtected: true, 
              portalPassword: data.password_hash || prev.portalPassword 
            }));
          }
        }
        setIsLoadingPortal(false);
      };
      fetchPortal();
    }
  }, []);

  // Estado para el banner de cookies
const [showCookieBanner, setShowCookieBanner] = useState(false);
const [profileContent, setProfileContent] = useState({}); // <--- AÑADE ESTA LÍNEA

  // --- ESCÁNER MÁGICO DE IMÁGENES (Con Compresión Automática) ---
  const processBlobsInObject = async (obj, userId) => {
    let hasChanges = false;
    const traverse = async (node) => {
      if (!node) return node;
      
      if (typeof node === 'string' && node.startsWith('blob:')) {
        hasChanges = true;
        try {
          const response = await fetch(node);
          let blob = await response.blob();
          
          // COMPRESIÓN: Solo si es una imagen (y no un SVG vectorial)
          if (blob.type.startsWith('image/') && blob.type !== 'image/svg+xml') {
            const file = new File([blob], "temp_image", { type: blob.type });
            const options = {
              maxSizeMB: 0.8, // Máximo 800 KB por imagen (calidad HD, peso pluma)
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            try {
              blob = await imageCompression(file, options);
            } catch (compressError) {
              console.error("Error comprimiendo, se usará la original.", compressError);
            }
          }

          const fileExt = blob.type.split('/')[1] || 'png';
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${userId}/${fileName}`; 
          
          const { error } = await supabase.storage.from('portals_assets').upload(filePath, blob);
          if (error) throw error;
          
          const { data } = supabase.storage.from('portals_assets').getPublicUrl(filePath);
          return data.publicUrl; 
        } catch (e) {
          console.error("Error subiendo imagen:", e);
          return node;
        }
      }
      if (Array.isArray(node)) {
        const newArr = [];
        for (let item of node) newArr.push(await traverse(item));
        return newArr;
      }
      if (typeof node === 'object') {
        const newObj = {};
        for (let key in node) newObj[key] = await traverse(node[key]);
        return newObj;
      }
      return node;
    };
    const result = await traverse(obj);
    return { result, hasChanges };
  };
const savePortalData = async (isManual = false) => {
    // 1. Guardado en LocalStorage (Copia de seguridad instantánea anti-pérdidas)
    const dataToSave = { canvasItems, design, profileContent, isDarkMode, language, currentFont };
    localStorage.setItem('brandPortalData', JSON.stringify(dataToSave));

    // Si es un autoguardado y no está logueado, no hacemos nada en la DB
    if (!isManual && (!isAuthenticated || !currentUser)) return;
    
    // Si le dio a "Publicar" a mano y no está logueado, abrimos modal
    if (isManual && (!isAuthenticated || !currentUser)) {
        setIsAuthModalOpen(true);
        return;
    }

    // INICIO DEL CHIVATO
    setSaveStatus('saving');

    if (supabase) {
      try {
        if (isManual) showToast("Procesando imágenes y publicando portal...");
        
        // Pasa el escáner para subir las imágenes nuevas solo cuando pulsamos "Publicar" o guardar
        const processedCanvas = isManual ? await processBlobsInObject(canvasItems, currentUser.id) : { result: canvasItems, hasChanges: false };
        const processedProfile = isManual ? await processBlobsInObject(profileContent, currentUser.id) : { result: profileContent, hasChanges: false };

        // --- SOLUCIÓN AL ERROR FOREIGN KEY ---
        // 1. Nos aseguramos de que el usuario exista en la tabla profiles con formato ISO
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: currentUser.id,
            updated_at: new Date().toISOString() 
          });
          
        if (profileError) throw new Error("Error al verificar perfil: " + profileError.message);
        // ------------------------------------

        // 2. Guardamos el portal con total seguridad y formato ISO
        const { error } = await supabase
          .from('portals')
          .upsert({ 
            id: currentUser.id,
            user_id: currentUser.id,
            slug: processedProfile.result?.slug || currentUser.id,
            brand_name: processedProfile.result?.name || 'Mi Marca',
            canvas_data: {
              items: processedCanvas.result,
              design: design,
              profile: processedProfile.result
            },
            is_protected: processedProfile.result?.isPasswordProtected || false,
            password_hash: processedProfile.result?.portalPassword || null, // Soluciona el bug del muro de contraseña
            updated_at: new Date().toISOString() // Formato estricto para evitar fallos de Supabase
          });

        if (error) throw error;
        
        // Actualizamos la UI si el escáner cambió blobs locales por URLs de Supabase
        if (processedCanvas.hasChanges) setCanvasItems(processedCanvas.result);
        if (processedProfile.hasChanges) setProfileContent(processedProfile.result);

        // Feedback Visual
        setSaveStatus('saved');
        if (isManual) {
           showToast("¡Portal publicado y sincronizado con éxito!");
        } 
        
        // Ocultar el check verde después de 2.5 segundos
        setTimeout(() => setSaveStatus('idle'), 2500);

      } catch (err) {
        console.error("Error de sincronización:", err.message);
        setSaveStatus('error');
        if (isManual) showToast("Error al publicar: " + err.message);
      }
    }
  };
  const [canvasItems, setCanvasItems] = useState([
        { id: 'header-1', type: 'header', content: { title: "Portal de Marca", logo: null, layout: 'standard' } },
    { id: 'hero', type: 'hero', content: { subtitle: "Un sistema visual diseñado para escalar." } },
    { id: 'identity', type: 'identity', content: {} }, // Nuevo módulo insertado aquí
    { id: 'logo', type: 'logo', content: {} },
    { id: 'color', type: 'color', content: { colors: [] } },
    { id: 'typography', type: 'typography', content: { levels: [] } },
    { id: 'image', type: 'image', content: { images: [1, 2, 3, 4] } },
    { id: 'layout', type: 'layout', content: { selectedGrid: 'grid1', usageExamples: [] } },
    // Ensure bento has 5 items with unique IDs from the start
    { id: 'bento', type: 'bento', content: { items: Array(5).fill(null).map((_, i) => ({ id: `bento-${i}`, type: 'image', src: null })), layoutIndex: 0 } },
    { id: 'editorial', type: 'editorial', content: { blocks: [{type:'text', content: "Contenido editorial de ejemplo..." }] } },
    { id: 'icons', type: 'icons', content: {} },
    { id: 'web', type: 'web', content: {} },
    { id: 'social', type: 'social', content: {} },
    { id: 'cobranding', type: 'cobranding', content: {} },
    { id: 'footer-1', type: 'footer', content: { copyright: "" } }
  ]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('brandPortalData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.canvasItems) setCanvasItems(parsed.canvasItems);
        if (parsed.design) setDesign(parsed.design);
        if (parsed.profileContent) setProfileContent(parsed.profileContent);
        if (parsed.isDarkMode !== undefined) setIsDarkMode(parsed.isDarkMode);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.currentFont) setCurrentFont(parsed.currentFont);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    
    // Check Cookies status
    const cookiesStatus = localStorage.getItem('brandbara_cookies_status');
    if (!cookiesStatus) {
      // Retraso de 1.5s para no agobiar al usuario nada más entrar
      const timer = setTimeout(() => setShowCookieBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCookieAction = (status) => {
    localStorage.setItem('brandbara_cookies_status', status);
    setShowCookieBanner(false);
    
    if (status === 'managed') {
      setIsProfileOpen(true); // Abre el modal de configuración como fallback
    }
  };

// NUEVO BLOQUE (PASO 3 - GUARDADO GLOBAL MEJORADO)
  const isInitialMount = useRef(true);

  useEffect(() => {
    // 1. Evitamos que guarde una página vacía nada más actualizar (El borrado fantasma)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // 2. Esperamos 1.5 segundos después de la última tecla antes de guardar (Debounce)
    const debounceTimer = setTimeout(() => {
      savePortalData();
    }, 1500);

    // Si el usuario vuelve a teclear antes de 1.5s, cancelamos el temporizador anterior
    return () => clearTimeout(debounceTimer);
  }, [canvasItems, design, profileContent, isDarkMode, language, currentFont, isAuthenticated]);

// Calculate used storage dynamically based on content - Moved AFTER canvasItems declaration and wrapped in useMemo
  const usedStorage = React.useMemo(() => {
    let size = 0;
    // Profile Avatar (approx 0.5MB)
    if (profileContent.avatar) size += 0.5;

    canvasItems.forEach(item => {
        const c = item.content || {};
        // Images ~0.8MB, Videos ~5MB, Icons ~0.1MB
        if (c.logo) size += 0.5; // Header/Footer
        if (c.bgType === 'image' && c.bgValue) size += 1.2; // Hero
        if (c.variations) size += (c.variations || []).filter(v => v.src).length * 0.6; // Logo Vars
        if (c.safeAreaImage) size += 0.5; // Safe Area
        if (c.dos) size += (c.dos || []).filter(d => d.image).length * 0.5; // Dos
        if (c.donts) size += (c.donts || []).filter(d => d.image).length * 0.5; // Donts
        if (c.images) size += (c.images || []).filter(i => i.src).length * 0.8; // Image Module
        if (c.previewImage) size += 0.8; // Layout Preview
        if (c.usageExamples) size += (c.usageExamples || []).filter(e => e.src).length * 0.8; // Layout Examples
        
        // Items (Bento, Web, Social) - FIXED Logic using reduce
        if (c.items) {
            size += (c.items || []).reduce((acc, curr) => {
                if (curr.src) {
                    // Check if explicit video type OR if the module type implies video (reel, youtube)
                    const isVideo = curr.type === 'video' || curr.type === 'reel' || curr.type === 'youtube';
                    return acc + (isVideo ? 5 : 0.8);
                }
                return acc;
            }, 0);
        }
        
        // Editorial Blocks
        if (c.blocks) size += (c.blocks || []).filter(b => b.type === 'image' && b.src).length * 0.8;
        
        // Icons
        if (c.customIcons) size += (c.customIcons || []).filter(i => i.src).length * 0.1;
        
        // Partners - FIXED Logic using reduce
        if (c.partners) {
            size += (c.partners || []).reduce((acc, curr) => {
                if (curr.src) {
                    const isVideo = curr.type === 'video';
                    return acc + (isVideo ? 5 : 0.8);
                }
                return acc;
            }, 0);
        }
        
        // Extra Blocks
        if (c.extraBlocks) size += (c.extraBlocks || []).filter(b => b.type === 'image' && b.src).length * 0.8;
    });
    
    // --- CÁLCULO DEL LÍMITE SEGÚN EL PLAN ---
    const limit = userPlan === 'FREE' ? 20 : 1024;
    return Math.min(size, limit).toFixed(1);
}, [canvasItems, profileContent, userPlan]);
  // --- INTERCEPTOR DE SUBIDAS (BLOQUEADOR) ---
// --- INTERCEPTOR DE SUBIDAS INVULNERABLE ---
  useEffect(() => {
    const originalCreateObjectURL = window.URL.createObjectURL;

    window.URL.createObjectURL = function(file) {
      if (file instanceof File || file instanceof Blob) {
        const fileSizeMB = file.size / (1024 * 1024);
        const currentLimit = userPlan === 'FREE' ? 20 : 1024;
        const currentUsed = parseFloat(usedStorage);
        const remainingSpace = currentLimit - currentUsed;

        if (currentUsed >= currentLimit || fileSizeMB > remainingSpace) {
          setLimitMessage(`El archivo pesa ${fileSizeMB.toFixed(1)} MB y solo tienes ${Math.max(0, remainingSpace).toFixed(1)} MB disponibles.`);
          setIsManageModalOpen(true);
          return ""; 
        }
      }
      return originalCreateObjectURL.apply(this, arguments);
    };

    return () => {
      window.URL.createObjectURL = originalCreateObjectURL;
    };
  }, [userPlan, usedStorage]);
  
  // Actualizador de traducciones DEEP
  useEffect(() => {
     setCanvasItems(prev => prev.map(item => {
        if(item.type === 'header') return { ...item, content: { ...item.content, title: t.modules.header.title } };
        if(item.type === 'hero') return { ...item, content: { ...item.content, subtitle: t.modules.hero.subtitle } };
        if(item.type === 'color' && item.content.colors) {
           const newColors = item.content.colors.map((c, i) => {
              if (i === 0) return { ...c, name: t.defaults.colorPrimaryName, usage: t.defaults.colorPrimaryUsage };
              if (i === 1) return { ...c, name: t.defaults.colorSecondaryName, usage: t.defaults.colorSecondaryUsage };
              if (i === 2) return { ...c, name: t.defaults.colorAccentName, usage: t.defaults.colorAccentUsage };
              if (i === 3) return { ...c, name: t.defaults.colorNeutralName, usage: t.defaults.colorNeutralUsage };
              return c;
           });
           return { ...item, content: { ...item.content, colors: newColors } };
        }
        if(item.type === 'logo') {
           return { ...item, content: { ...item.content, dos: [{text: t.defaults.logoDos}], donts: [{text: t.defaults.logoDonts}] } };
        }
        if(item.type === 'editorial' && item.content.blocks) {
           return { ...item, content: { ...item.content, blocks: [{type:'text', content: t.defaults.editorialContent }] } };
        }
        return item;
     }));
  }, [language, t]);

  // --- FUNCIÓN QUE COMPRUEBA SI EL ENLACE ESTÁ LIBRE ---
  const handleSlugChange = (newSlug) => {
    // 1. Limpiamos: solo minúsculas, números y guiones
    const sanitizedSlug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    // Guardamos lo que teclea
    setProfileContent({ ...profileContent, slug: sanitizedSlug });

    if (!sanitizedSlug) {
      setSlugStatus(null);
      return;
    }

    setSlugStatus('checking'); // Icono dando vueltas

    // 2. Si el usuario sigue tecleando, paramos el reloj
    if (slugCheckTimeout) clearTimeout(slugCheckTimeout);

    // 3. Esperamos medio segundo a que termine y preguntamos a Supabase
    const timeoutId = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('portals') // Tu tabla de portales
          .select('slug, user_id')
          .eq('slug', sanitizedSlug)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignoramos si no encuentra nada

        // Si encontró datos, y el dueño NO es el usuario actual, ¡está pillado!
        if (data && data.user_id !== currentUser?.id) {
          setSlugStatus('taken'); 
        } else {
          setSlugStatus('available'); 
        }
      } catch (err) {
        console.error("Error verificando el slug:", err);
        setSlugStatus(null);
      }
    }, 500);

    setSlugCheckTimeout(timeoutId);
  };

const generateRandomStyle = () => {
    const styleKeys = Object.keys(DESIGN_STYLES);
    const randomStyleKey = styleKeys[Math.floor(Math.random() * styleKeys.length)];
    const randomStyle = DESIGN_STYLES[randomStyleKey];
    const randomPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    const randomFont = FONTS[Math.floor(Math.random() * FONTS.length)];
    
    setDesign({ 
        style: randomStyle, 
        palette: randomPalette, 
        font: randomFont, 
        canvasBg: design.canvasBg,
        spacing: design.spacing
    });
    setCurrentFont(randomFont);

    setCanvasItems(prevItems => prevItems.map(item => {
if (item.type === 'footer') return { ...item, content: { ...item.content, layout: Math.floor(Math.random() * 3) } };
        if (item.type === 'bento') {
            // Asignamos uno de los 4 diseños bento predefinidos y matemáticamente perfectos
            return { ...item, content: { ...item.content, layoutIndex: Math.floor(Math.random() * 4) } };
        }
        return item;          }));
  };  
  const changeLayout = (layoutKey) => {
    const selectedLayout = DESIGN_STYLES[layoutKey];
    setDesign(prev => ({ ...prev, style: selectedLayout, font: selectedLayout.font }));
    setCurrentFont(selectedLayout.font);
    setShowLayoutSelector(false);
    setActiveAccordion(null); // Close accordion on selection
  };

  const toggleAccordion = (id) => {
      setActiveAccordion(activeAccordion === id ? null : id);
  };

  const handleToolClick = (type) => {
    // Si es perfil, abrir modal
    if (type === 'profile') {
        setIsProfileOpen(true);
        return;
    }
    const scrollContainer = document.getElementById('canvas-scroll-area');
    let insertIndex = canvasItems.length;
    if (scrollContainer) {
      const scrollPos = scrollContainer.scrollTop + (scrollContainer.clientHeight / 2);
      const modules = Array.from(scrollContainer.children[0].children);
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        if (module.offsetTop + module.offsetHeight > scrollPos) { insertIndex = i + 1; break; }
      }
    }
    addComponent(type, insertIndex);
    setMobileMenuOpen(false);
    setTimeout(() => { 
        if (type !== 'profile') {
            const newModule = document.getElementById(`module-${canvasItems[insertIndex]?.id}`); 
            if (scrollContainer) scrollContainer.scrollBy({ top: 300, behavior: 'smooth' }); 
        }
    }, 100);
  };

  const addComponent = (type, index) => {
    const newItem = { id: Math.random().toString(36).substr(2, 9), type, content: getDefaultContent(type) };
    const newItems = [...canvasItems];
    const safeIndex = (index !== null && index !== undefined && index >= 0 && index <= newItems.length) ? index : newItems.length;
    newItems.splice(safeIndex, 0, newItem);
    setCanvasItems(newItems);
  };

  const moveComponent = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= canvasItems.length) return;
    const newItems = [...canvasItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    setCanvasItems(newItems);
  };

  const getDefaultContent = (type) => {
    switch(type) {
      case 'identity': return { items: [
          { id: 1, icon: 'target', title: t.modules.identity.precision, desc: t.modules.identity.precisionDesc },
          { id: 2, icon: 'shield', title: t.modules.identity.integrity, desc: t.modules.identity.integrityDesc },
          { id: 3, icon: 'globe', title: t.modules.identity.innovation, desc: t.modules.identity.innovationDesc },
          { id: 4, icon: 'award', title: t.modules.identity.excellence, desc: t.modules.identity.excellenceDesc },
      ]};
      case 'logo': return { dos: [{text: t.defaults.logoDos}], donts: [{text: t.defaults.logoDonts}] };
      case 'typography': return { levels: [] };
      case 'color': return { colors: [
          {name: t.defaults.colorPrimaryName, hex:'#4F46E5', usage: t.defaults.colorPrimaryUsage}, 
          {name: t.defaults.colorSecondaryName, hex:'#10B981', usage: t.defaults.colorSecondaryUsage}, 
          {name: t.defaults.colorAccentName, hex:'#F43F5E', usage: t.defaults.colorAccentUsage},
          {name: t.defaults.colorNeutralName, hex:'#64748B', usage: t.defaults.colorNeutralUsage}
      ]};
      case 'editorial': return { blocks: [{type:'text', content: t.defaults.editorialContent}] };
      case 'image': return { images: [1,2,3,4] };
case 'bento': return { items: Array(5).fill(null).map((_, i) => ({ id: `bento-${Date.now()}-${i}`, type: 'image', src: null })), layoutIndex: 0 };      case 'header': return { title: t.modules.header.title, logo: null };
      case 'layout': return { selectedGrid: 'grid1' };
      case 'cobranding': return {};
      case 'assets': return { assets: [
        { id: 1, title: 'Plantillas de Presentación', desc: 'Plantillas corporativas para Keynote y PowerPoint.', format: 'PPTX / KEY, 25MB', url: '' },
        { id: 2, title: 'Documentos corporativos', desc: 'Membretes, tarjetas de visita y carpetas.', format: 'ZIP / PDF, 15MB', url: '' },
        { id: 3, title: 'Brand guidelines', desc: 'Manual de identidad visual corporativa completo.', format: 'PDF, 30MB', url: '' }
      ]};
      case 'footer': return {};
      case 'profile': return {};
      default: return {};
    }
  };

  const removeComponent = (id) => setCanvasItems(canvasItems.filter(i => i.id !== id));
  const updateComponent = (id, c) => setCanvasItems(canvasItems.map(i => i.id === id ? { ...i, content: c } : i));

  const renderCanvasItem = (item, index) => {
    // Create a safe composite design object with defaults
    const style = design.style || DESIGN_STYLES.crystal;
    const palette = design.palette || COLOR_PALETTES[0];
    const spacingClass = design.spacing?.value || 'mb-16';
    const font = design.font || 'Inter';
    
    // Mix the font into the style object so modules can access design.font if needed
    const activeDesign = { ...style, font };

    const currentBg = isDarkMode ? (style.cardBgDark || 'bg-[#161b26] border-white/5') : style.cardBg;
    const currentShadow = style.shadow;
    const cardClasses = `relative group transition-all duration-500 ease-in-out ${style.radius} ${style.border} ${currentShadow} ${currentBg} ${isDarkMode ? 'border-white/5' : palette.border} ${spacingClass} overflow-hidden`;

if (item.type === 'header') {
      return null;
    }

if (item.type === 'footer') {
        return (
          <React.Fragment key={item.id}>
             {/* Eliminamos 'pointer-events-none' para que se pueda clicar */}
             <div className="w-full flex justify-center py-8 select-none">
                <a 
                  href="/info" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-2 px-5 py-2 rounded-full border shadow-sm transition-all hover:scale-105 pointer-events-auto ${isDarkMode ? 'bg-[#1e2330] border-white/10 text-slate-300 hover:border-white/20' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:shadow-md'}`}
                >
                   <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t.ui.watermark}</span> 
                   <span className="text-xs font-black text-indigo-500 group-hover:text-indigo-600 transition-colors">BrandBara</span>
                   <ExternalLink size={10} className="opacity-0 group-hover:opacity-40 transition-opacity ml-0.5" />
                </a>
             </div>
             <div id={`module-${item.id}`} className="mt-0">
                <FooterModule content={item.content} update={(c)=>updateComponent(item.id, c)} design={activeDesign} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />
             </div>
          </React.Fragment>
        );
    }

    if (item.type === 'profile') return null;

return (
      <div id={`module-${item.id}`} key={item.id} className={cardClasses}>
        {!isPreview && item.type !== 'hero' && (
          <div className="absolute top-3 right-3 flex gap-1 z-30 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 bg-white/90 dark:bg-black/80 backdrop-blur rounded-lg shadow-sm border border-slate-200 dark:border-white/10">
            
            {/* ✨ NUEVO BOTÓN: CAMBIAR ESTRUCTURA ✨ */}
            <button 
              onClick={(e) => { e.stopPropagation(); cycleModuleLayout(item.id, item.type); }} 
              className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded text-slate-500 hover:text-indigo-500 transition-colors mr-1"
              title="Cambiar estructura"
            >
              <LayoutTemplate size={14} />
            </button>

            {/* BOTONES DE MOVER */}
            <div className="flex border-r border-slate-200 dark:border-white/10 pr-1 mr-1">
              <button onClick={() => moveComponent(index, index - 1)} disabled={index <= 1} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-500 disabled:opacity-30"><ChevronUp size={14} /></button>
              <button onClick={() => moveComponent(index, index + 1)} disabled={index >= canvasItems.length - 2} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-500 disabled:opacity-30"><ChevronDown size={14} /></button>
            </div>
            
            {/* BOTÓN ELIMINAR */}
            <button onClick={(e) => { e.stopPropagation(); removeComponent(item.id); }} className="p-1 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded text-rose-500"><Trash2 size={16} /></button>
          </div>
        )}
        {(() => {
                              switch(item.type) {
            case 'hero': return <HeroModule content={item.content} update={(c) => updateComponent(item.id, c)} design={activeDesign} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />;
            case 'identity': return <IdentityModule content={item.content} update={(c) => updateComponent(item.id, c)} design={activeDesign} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />;
            case 'logo': return <LogoModule content={item.content} update={(c) => updateComponent(item.id, c)} design={activeDesign} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />;
            case 'typography': return <TypographyModule content={item.content} update={(c) => updateComponent(item.id, c)} design={activeDesign} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />;
            case 'color': return <ColorModule content={item.content} update={(c) => updateComponent(item.id, c)} design={activeDesign} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />;
            case 'image': return <ImageModule content={item.content} update={(c) => updateComponent(item.id, c)} design={activeDesign} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />;
            case 'editorial': return <EditorialModule content={item.content} update={(c) => updateComponent(item.id, c)} design={activeDesign} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />;
            case 'bento': return <BentoModule content={item.content} update={(c) => updateComponent(item.id, c)} design={activeDesign} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />;
            case 'layout': return <LayoutModule content={item.content} update={(c) => updateComponent(item.id, c)} design={activeDesign} isDarkMode={isDarkMode} t={t} isPreview={isPreview} />;
            case 'icons': return <IconsModule design={activeDesign} isDarkMode={isDarkMode} content={item.content} update={(c) => updateComponent(item.id, c)} t={t} isPreview={isPreview} />;
            case 'web': return <WebModule design={activeDesign} isDarkMode={isDarkMode} content={item.content} update={(c) => updateComponent(item.id, c)} t={t} isPreview={isPreview} />;
            case 'social': return <SocialModule design={activeDesign} isDarkMode={isDarkMode} content={item.content} update={(c) => updateComponent(item.id, c)} t={t} isPreview={isPreview} />;
            case 'cobranding': return <CobrandingModule design={activeDesign} isDarkMode={isDarkMode} content={item.content} update={(c) => updateComponent(item.id, c)} t={t} isPreview={isPreview} />;
            case 'assets': return <AssetsModule design={activeDesign} isDarkMode={isDarkMode} content={item.content} update={(c) => updateComponent(item.id, c)} t={t} isPreview={isPreview} />;
            case 'profile': return null;
            default: return <div className="p-16 text-center opacity-50 uppercase tracking-widest text-sm">Módulo {item.type}</div>;
          }
        })()}
      </div>
    );
  };

  const DraggableTool = ({ type, icon: Icon, label }) => (
    <div onClick={() => handleToolClick(type)} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer hover:scale-105 active:scale-95 group select-none ${isDarkMode ? 'bg-[#151924] border-white/5 hover:bg-[#1a1f2e] hover:border-indigo-500/40' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-indigo-500/40 hover:shadow-sm'}`}>
      <Icon className={`w-6 h-6 mb-2 transition-colors ${isDarkMode ? 'text-slate-400 group-hover:text-indigo-400' : 'text-slate-500 group-hover:text-indigo-600'}`} />
      <span className={`text-[10px] font-bold uppercase tracking-widest text-center transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-900'}`}>{label}</span>
    </div>
  );

  // =========================================================================
  // PANTALLAS DE INTERCEPCIÓN (VISTA PÚBLICA Y MURO DE CONTRASEÑA)
  // =========================================================================

  if (isLoadingPortal) {
    return <div className={`flex h-screen w-full items-center justify-center ${isDarkMode ? 'bg-[#0a0c10] text-white' : 'bg-slate-50 text-slate-900'}`}><Wand2 className="animate-spin text-indigo-500 mb-4" size={40} /><p className="font-bold">Cargando portal...</p></div>;
  }

  if (notFound) {
    return <div className={`flex h-screen w-full items-center justify-center flex-col ${isDarkMode ? 'bg-[#0a0c10] text-white' : 'bg-slate-50 text-slate-900'}`}><AlertCircle size={60} className="text-rose-500 mb-4"/><h1 className="text-2xl font-black mb-2">Portal no encontrado</h1><p className="opacity-60">Esta URL no existe o ha sido eliminada.</p></div>;
  }

  // EL MURO DE CONTRASEÑA (Ruta 2)
  if (isPublicView && profileContent?.isPasswordProtected && !isUnlocked) {
    return (
      <div className={`flex h-screen w-full items-center justify-center ${isDarkMode ? 'bg-[#0a0c10] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-[#151924] border-white/10' : 'bg-white border-slate-200'} text-center animate-in zoom-in-95 duration-300`}>
          <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-indigo-500" />
          </div>
          <h2 className="text-2xl font-black mb-2">Portal Privado</h2>
          <p className={`text-sm mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Este portal está protegido. Introduce la contraseña de acceso proporcionada por la marca.
          </p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (accessInput === profileContent.portalPassword) {
              setIsUnlocked(true);
            } else {
              showToast("Contraseña incorrecta");
              setAccessInput("");
            }
          }} className="space-y-4">
            <input
              type="password"
              value={accessInput}
              onChange={(e) => setAccessInput(e.target.value)}
              placeholder="Escribe la contraseña..."
              className={`w-full p-4 rounded-xl text-center font-mono tracking-widest outline-none border transition-all ${isDarkMode ? 'bg-black/20 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'}`}
              autoFocus
            />
            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
              <Key size={18} /> Desbloquear Portal
            </button>
          </form>
        </div>
        {/* Renderizamos el Toast aquí por si fallan la contraseña */}
        {toastMessage && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className={`px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm border ${isDarkMode ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <div className="bg-rose-500/20 p-1 rounded-full"><AlertCircle size={14} className="text-rose-500" /></div>
              {toastMessage}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-sans overflow-hidden select-none ${isDarkMode ? 'bg-[#0a0c10] text-slate-300' : 'bg-white text-slate-900'}`}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />}

      {/* Cookie Banner */}
      {showCookieBanner && (
        <CookieBanner 
          isDarkMode={isDarkMode} 
          onAccept={() => handleCookieAction('accepted_all')}
          onReject={() => handleCookieAction('rejected_all')}
          onManage={() => handleCookieAction('managed')}
          t={t}
        />
      )}

{/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
onLogout={handleSignOut}
        // ...        isDarkMode={isDarkMode} 
        t={t} 
        content={profileContent} 
        update={setProfileContent}
        design={design.style}
        usedSpace={usedStorage}
        userPlan={userPlan}
        slugStatus={slugStatus}
        handleSlugChange={handleSlugChange}
        onResetCanvas={() => {
          if(window.confirm("¿Estás seguro de que quieres empezar de cero? Esto vaciará todo tu diseño actual y restaurará los valores de fábrica.")) {
            // 1. Restaurar todos los módulos por defecto
            const defaultCanvas = [
                { id: 'header-1', type: 'header', content: { title: profileContent.name || "Portal de Marca", logo: null, layout: 'standard' } },
                { id: 'hero', type: 'hero', content: { subtitle: "Un sistema visual diseñado para escalar." } },
                { id: 'identity', type: 'identity', content: {} },
                { id: 'logo', type: 'logo', content: {} },
                { id: 'color', type: 'color', content: { colors: [] } },
                { id: 'typography', type: 'typography', content: { levels: [] } },
                { id: 'image', type: 'image', content: { images: [1, 2, 3, 4] } },
                { id: 'layout', type: 'layout', content: { selectedGrid: 'grid1', usageExamples: [] } },
                { id: 'bento', type: 'bento', content: { items: Array(5).fill(null).map((_, i) => ({ id: `bento-${i}`, type: 'image', src: null })), layoutIndex: 0 } },
                { id: 'editorial', type: 'editorial', content: { blocks: [{type:'text', content: "Contenido editorial de ejemplo..." }] } },
                { id: 'icons', type: 'icons', content: {} },
                { id: 'web', type: 'web', content: {} },
                { id: 'social', type: 'social', content: {} },
                { id: 'cobranding', type: 'cobranding', content: {} },
                { id: 'assets', type: 'assets', content: {} },
                { id: 'footer-1', type: 'footer', content: { copyright: `© ${new Date().getFullYear()} ${profileContent.name || 'BrandBara'}` } }
            ];
            setCanvasItems(defaultCanvas);
            // 2. Restaurar diseño (Color, bordes, sombras)
            setDesign({ 
                style: DESIGN_STYLES.crystal, 
                palette: COLOR_PALETTES[0], 
                font: 'Inter', 
                canvasBg: 'bg-slate-50', 
                spacing: SPACING_OPTIONS.normal 
            });
            // 3. Restaurar tipografía
            setCurrentFont('Inter');
            // 4. Cerrar modal y avisar
            setIsProfileOpen(false);
            if(showToast) showToast(" Portal restaurado a su estado de fábrica.");
          }
        }}
      />

      {/* MODAL DE AUTENTICACION - CONECTOR FAKE DOOR */}      <AuthModal
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingUpgrade(false);
        }} 
        onAuthenticate={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
          
          // Si venia de intentar comprar, mostramos la Beta ahora que tiene sesion
          if (pendingUpgrade) {
            setShowBetaModal(true);
            setPendingUpgrade(false);
          } else {
            showToast("Sesion iniciada con exito");
          }
        }}
        isDarkMode={isDarkMode} 
        t={t}
      />

      {/* MODAL DE SUSCRIPCION - INTERCEPTOR DE SEGURIDAD */}
      <ManageSubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
        onUpgrade={() => { 
          setShowSubscriptionModal(false);
          
          if (!isAuthenticated) {
            // OBLIGATORIO: Si no hay login, guardamos intencion y abrimos login
            setPendingUpgrade(true);
            setIsAuthModalOpen(true);
          } else {
            // SI YA ESTA LOGUEADO: Directo al mensaje de Beta
            setShowBetaModal(true);
          }
        }} 
        isDarkMode={isDarkMode}
      />
            {/* NOTIFICACIONES BONITAS (TOAST) */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm border ${isDarkMode ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="bg-emerald-500/20 p-1 rounded-full"><Check size={14} className="text-emerald-500" /></div>
            {toastMessage}
          </div>
        </div>
      )}

{/* MODAL DE AVISO DE LÍMITE EXCEDIDO */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} border p-8 rounded-3xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="text-amber-500" size={32} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Límite de espacio</h3>
              <p className={`text-sm mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {limitMessage}
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => {
                    setIsManageModalOpen(false);
                    setShowSubscriptionModal(true); // Esto abre la tabla de precios
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                  Gestionar Plan
                </button>
                <button 
                  onClick={() => setIsManageModalOpen(false)}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${isDarkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

{/* MODAL DE SUSCRIPCIÓN (LA TABLA) */}
      <ManageSubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
        t={t}
        onUpgrade={() => {
                    setShowSubscriptionModal(false); // Cerramos la tabla
          
          if (!isAuthenticated) {
            // SI NO ESTÁ LOGUEADO: Recordamos la intención y pedimos registro
            setPendingUpgrade(true);
            setIsAuthModalOpen(true);
            showToast("🔒 Crea una cuenta para continuar con el Plan PRO.");
          } else {
            // SI YA ESTÁ LOGUEADO: Directo al mensaje de Beta Cerrada
            setShowBetaModal(true);
          }
        }} 
        isDarkMode={isDarkMode}
      />
            {/* MODAL BONITO DE BETA CERRADA (FAKE DOOR) */}
      {showBetaModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} border p-8 rounded-3xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200`}>
<div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <span className="text-4xl">🎁</span>
              </div>
              <h3 className={`text-2xl font-black mb-3 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {t.ui.publish === "Publicar" ? "¡Gracias por tu interés!" : "Thanks for your interest!"}
              </h3>
              <p className={`text-sm mb-6 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.ui.publish === "Publicar" 
                  ? "Actualmente las funciones PRO están en Beta Cerrada. Ayúdanos a mejorar rellenando una breve encuesta y te regalaremos 2 meses gratis cuando lancemos." 
                  : "PRO features are currently in Closed Beta. Help us improve by taking a short survey and get 2 months free when we launch!"}
              </p>
              
              <div className="space-y-3 w-full">
<a 
                  href="https://tally.so/r/EkJ4dN" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 active:scale-95 uppercase tracking-widest text-xs"
                  onClick={() => setShowBetaModal(false)}
                >
                  {t.ui.publish === "Publicar" ? "Ir a la encuesta" : "Take the survey"}
                </a>
                                <button 
                  onClick={() => setShowBetaModal(false)}
                  className={`w-full py-3.5 rounded-xl font-bold transition-colors text-xs uppercase tracking-widest ${isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {t.ui.publish === "Publicar" ? "Quizás más tarde" : "Maybe later"}
                </button>
              </div>
            </div>              <h3 className={`text-2xl font-black mb-3 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Beta Cerrada</h3>
              <p className={`text-sm mb-8 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                ¡Nos encanta tu interés! Actualmente estamos en fase de Beta Cerrada y las plazas <strong>PRO</strong> están llenas. Te avisaremos en cuanto abramos nuevos cupos.
              </p>
              
              <button 
                onClick={() => setShowBetaModal(false)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 active:scale-95 uppercase tracking-widest text-xs"
              >
                Entendido
              </button>
            </div>
          </div>
      )}

      {/* MODAL DE TEXTOS LEGALES */}
      <LegalModal
        isOpen={!!activeLegalPage} 
        page={activeLegalPage} 
        onClose={() => setActiveLegalPage(null)} 
        isDarkMode={isDarkMode} 
      />
{/* SIDEBAR */}
      {!isPreview && (
       <aside className={`fixed inset-y-0 left-0 z-50 w-[300px] flex flex-col h-full border-r transition-transform duration-300 lg:relative lg:translate-x-0 shrink-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-[#0f111a] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="p-8 flex flex-col h-full">
{/* Logo que recarga la herramienta */}
          <div className="flex items-center justify-between mb-8">
              <div 
                onClick={() => window.location.href = '/'} 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Recargar BrandBara"
              >
                <h1 className={`text-xl font-black tracking-tighter italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  BRANDBARA
                </h1>
                <span className={`px-1.5 py-0.5 text-[8px] font-black rounded border tracking-widest ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                  BETA
                </span>
              </div>
          </div>
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            {/* ZONA SUPERIOR FIJA */}
            <div className="shrink-0 space-y-4">
              <button onClick={generateRandomStyle} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
                <Wand2 size={18} /><span>{t.ui.generate}</span>
              </button>

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <DownloadCloud size={14} />
                    <span className="text-[10px] font-black uppercase">Storage</span>
                  </div>
                  <span className={`text-[10px] font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{usedStorage} / {userPlan === 'FREE' ? '20.0' : '1024.0'} MB</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(parseFloat(usedStorage) / (userPlan === 'FREE' ? 12 : 60)) * 100}%` }}></div>
                </div>
                <button onClick={() => setIsManageModalOpen(true)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all">
                  Gestionar Plan
                </button>
              </div>
            </div>

            {/* ZONA INFERIOR CON SCROLL (EVITA CORTES) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col mt-2 pt-2 border-t border-slate-200 dark:border-white/5 space-y-6 pb-6 pr-2">
              
              {/* STYLES SECTION */}
              <div>
                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.ui.styles}</h3>
                <div className="space-y-2">
                  
                  {/* Layout Selector */}
                  <div className={`rounded-xl border transition-colors ${isDarkMode ? 'border-white/5 bg-[#151924]' : 'border-slate-200 bg-slate-50'}`}>
                    <button onClick={() => toggleAccordion('layout')} className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="flex items-center gap-3"><LayoutTemplate size={16} /><span className="text-xs font-bold uppercase tracking-widest">{design.style.name}</span></div>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${activeAccordion === 'layout' ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'layout' ? 'max-h-[500px]' : 'max-h-0'}`}>
                      <div className={`p-2 space-y-1 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                        {Object.keys(DESIGN_STYLES).map(k => (
                          <button key={k} onClick={() => changeLayout(k)} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${design.style.id === k ? 'bg-indigo-100 text-indigo-600 font-bold dark:bg-indigo-500/20 dark:text-indigo-400' : (isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white')}`}>{DESIGN_STYLES[k].name}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Font Selector */}
                  <div className={`rounded-xl border transition-colors ${isDarkMode ? 'border-white/5 bg-[#151924]' : 'border-slate-200 bg-slate-50'}`}>
                    <button onClick={() => toggleAccordion('font')} className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="flex items-center gap-3"><Type size={16} /><span className="text-xs font-bold uppercase tracking-widest">{currentFont}</span></div>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${activeAccordion === 'font' ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'font' ? 'max-h-[500px]' : 'max-h-0'}`}>
                      <div className={`p-2 space-y-1 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                        {FONTS.map(f => (
                          <button key={f} onClick={() => { setCurrentFont(f); setDesign(prev => ({ ...prev, font: f })); setActiveAccordion(null); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${currentFont === f ? 'bg-indigo-100 text-indigo-600 font-bold dark:bg-indigo-500/20 dark:text-indigo-400' : (isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white')}`} style={{ fontFamily: f }}>{f}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Spacing Selector */}
                  <div className={`rounded-xl border transition-colors ${isDarkMode ? 'border-white/5 bg-[#151924]' : 'border-slate-200 bg-slate-50'}`}>
                    <button onClick={() => toggleAccordion('spacing')} className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="flex items-center gap-3"><ArrowUpDown size={16} /><span className="text-xs font-bold uppercase tracking-widest">{design.spacing.name}</span></div>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${activeAccordion === 'spacing' ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'spacing' ? 'max-h-[500px]' : 'max-h-0'}`}>
                      <div className={`p-2 space-y-1 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                        {Object.values(SPACING_OPTIONS).map(s => (
                          <button key={s.id} onClick={() => { setDesign(prev => ({ ...prev, spacing: s })); setActiveAccordion(null); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${design.spacing.id === s.id ? 'bg-indigo-100 text-indigo-600 font-bold dark:bg-indigo-500/20 dark:text-indigo-400' : (isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white')}`}>{s.name}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Selector de Fondo Personalizado */}
                  <div className={`rounded-xl border transition-colors ${isDarkMode ? 'border-white/5 bg-[#151924]' : 'border-slate-200 bg-slate-50'}`}>
                    <button onClick={() => toggleAccordion('bg')} className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="flex items-center gap-3"><PaintBucket size={16} /><span className="text-xs font-bold uppercase tracking-widest">Fondo Canvas</span></div>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${activeAccordion === 'bg' ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'bg' ? 'max-h-[500px]' : 'max-h-0'}`}>
                      <div className={`p-4 space-y-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>

                        {/* Color Modo Claro */}
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1.5"><Sun size={12}/> Modo Claro</label>
                           <div className="flex items-center gap-2 p-1 bg-white dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
                              <input type="color" value={design.customBgLight || '#f8fafc'} onChange={(e) => setDesign(prev => ({...prev, customBgLight: e.target.value}))} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
                              <input type="text" value={design.customBgLight || ''} onChange={(e) => setDesign(prev => ({...prev, customBgLight: e.target.value}))} placeholder="Por defecto" className="flex-1 text-xs p-2 rounded-lg bg-transparent outline-none uppercase font-mono" />
                           </div>
                        </div>

                        {/* Color Modo Oscuro */}
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1.5"><Moon size={12}/> Modo Oscuro</label>
                           <div className="flex items-center gap-2 p-1 bg-white dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
                              <input type="color" value={design.customBgDark || '#0a0c10'} onChange={(e) => setDesign(prev => ({...prev, customBgDark: e.target.value}))} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
                              <input type="text" value={design.customBgDark || ''} onChange={(e) => setDesign(prev => ({...prev, customBgDark: e.target.value}))} placeholder="Por defecto" className="flex-1 text-xs p-2 rounded-lg bg-transparent outline-none uppercase font-mono" />
                           </div>
                        </div>

                        {/* Botón Restaurar */}
                        {(design.customBgLight || design.customBgDark) && (
                           <button onClick={() => setDesign(prev => ({...prev, customBgLight: null, customBgDark: null}))} className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                              Restaurar por defecto
                           </button>
                        )}
                      </div>
                    </div>
                  </div>

{/* TOOLS SECTION */}
              <div>
                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.ui.tools}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <DraggableTool type="identity" icon={Fingerprint} label={t.ui.identity} />
                  <DraggableTool type="logo" icon={Layers} label={t.ui.logo} />
                  <DraggableTool type="color" icon={Palette} label={t.ui.color} />
                  <DraggableTool type="typography" icon={Type} label={t.ui.typography} />
                  <DraggableTool type="image" icon={ImageIcon} label={t.ui.image} />
                  <DraggableTool type="bento" icon={LayoutGrid} label={t.ui.bento} />
                  <DraggableTool type="editorial" icon={FileText} label={t.ui.editorial} />
                  <DraggableTool type="icons" icon={Smile} label={t.ui.icons} />
                  <DraggableTool type="web" icon={Laptop} label={t.ui.web} />
                  <DraggableTool type="social" icon={Instagram} label={t.ui.social} />
                  <DraggableTool type="cobranding" icon={Users} label={t.ui.cobranding} />
                  <DraggableTool type="assets" icon={FileArchive} label={t.ui.assets} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      )}

{/* CANVAS */}
      <main 
        className="flex-1 flex flex-col relative transition-colors duration-700 overflow-x-hidden" 
        style={{ 
          fontFamily: currentFont, 
          backgroundColor: isDarkMode ? (design.customBgDark || '#0a0c10') : (design.customBgLight || '#f8fafc') 
        }}
      >        
{/* --- HEADER RESPONSIVE (ESTILO WETRANSFER MINIMALISTA) --- */}
        {(() => {
          const headerItem = canvasItems.find(i => i.type === 'header') || { id: 'header-1', content: {} };
          const updateHeader = (newContent) => updateComponent(headerItem.id, newContent);
          const navItems = canvasItems.filter(i => i.type !== 'header' && i.type !== 'footer');
          const getModuleDisplayName = (item) => {
              if (item.content?.title && typeof item.content.title === 'string' && item.content.title.trim() !== "") return item.content.title;
              if (t.modules[item.type]?.title) return t.modules[item.type].title;
              return t.ui[item.type] || item.type.charAt(0).toUpperCase() + item.type.slice(1);
          };

          return (
            <div className="absolute top-4 lg:top-8 left-0 right-0 z-[60] flex justify-center pointer-events-none px-4 lg:px-8">
              
{/* === VERSIÓN COMPACTA (Móviles y Tablets) === */}
              <div className={`lg:hidden flex items-center justify-between w-full max-w-md h-[56px] p-2 rounded-2xl shadow-xl border pointer-events-auto backdrop-blur-xl transition-all ${isDarkMode ? 'bg-[#151924]/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`h-full w-10 flex items-center justify-center rounded-xl transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'} ${mobileMenuOpen ? (isDarkMode ? 'bg-white/10' : 'bg-slate-200') : ''}`}>
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                  <div onClick={() => !isPreview && document.getElementById('unified-logo-upload').click()} className={`h-10 w-10 shrink-0 rounded-xl overflow-hidden flex items-center justify-center ${isDarkMode ? 'bg-black/30' : 'bg-slate-50'}`}>
                    {headerItem.content?.logo ? <img src={headerItem.content.logo} alt="Logo" className="w-full h-full object-contain p-1.5" style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }} /> : <ImageIcon size={16} className="opacity-40" />}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-auto">
                  {/* Botón de Idioma (Añadido para móvil) */}
                  <button onClick={() => setLanguage(prev => prev === 'ES' ? 'EN' : 'ES')} className={`h-10 w-10 flex items-center justify-center rounded-xl text-[11px] font-black transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}>
                    {language}
                  </button>

                  {/* Botón Modo Oscuro */}
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${isDarkMode ? 'text-amber-400 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}>
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  
                  {!isPreview && (
                    <button onClick={() => { if (!isAuthenticated) setIsAuthModalOpen(true); else savePortalData(true); }} className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${isDarkMode ? 'text-emerald-400 hover:bg-white/10' : 'text-emerald-600 hover:bg-slate-100'}`}>
                      <Save size={18} />
                    </button>
                  )}
                  
                  <button onClick={() => setIsPreview(!isPreview)} className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${isPreview ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : (isDarkMode ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100')}`}>
                    {isPreview ? <Edit3 size={18} /> : <Eye size={18} />}
                  </button>

                  {!isPreview && (
                    <button onClick={() => { if (!isAuthenticated) setIsAuthModalOpen(true); else setIsProfileOpen(true); }} className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors overflow-hidden ${isDarkMode ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}>
                      {currentUser && profileContent.avatar ? (
                        <img src={profileContent.avatar} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} />
                      )}
                    </button>
                  )}
                </div>
              </div>
              {/* === VERSIÓN ESCRITORIO (3 Píldoras Minimalistas) === */}
              <div className="hidden lg:flex flex-nowrap justify-center gap-6 xl:gap-8 w-full max-w-[1000px] pointer-events-auto">
                
                {/* 1. PÍLDORA NAVEGACIÓN (Sin el texto largo, solo Logo + Dropdown) */}
                <div className={`h-[60px] flex items-center gap-1 p-2.5 pr-4 rounded-2xl shadow-sm border transition-all ${isDarkMode ? 'bg-[#151924]/90 border-white/10 shadow-black/50' : 'bg-white/90 border-slate-200/70 shadow-slate-200/50 backdrop-blur-xl'}`}>
                  
                  {/* Botón Logo */}
                  <div onClick={() => !isPreview && document.getElementById('unified-logo-upload').click()} className={`relative h-full aspect-square shrink-0 rounded-xl overflow-hidden flex items-center justify-center transition-colors ${!isPreview ? 'cursor-pointer hover:opacity-80' : ''} ${isDarkMode ? 'bg-black/30' : 'bg-slate-50'}`}>
                    {headerItem.content?.logo ? <img src={headerItem.content.logo} alt="Logo" className="w-full h-full object-contain p-1.5" style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }} /> : <ImageIcon size={16} className="opacity-40" />}
                  </div>
                  
                  {/* Separador fino */}
                  <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2"></div>

                  {/* Dropdown Navegación */}
                  <div className="relative group h-full">
                    <button className={`h-full flex items-center gap-3 px-4 rounded-xl transition-colors text-[13px] font-medium ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}>
                      <Anchor size={15} className="opacity-50" /> {t.ui.navigate} <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform" />
                    </button>
                    <div className={`absolute top-full left-0 mt-4 w-60 py-2 rounded-2xl border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top z-[70] ${isDarkMode ? 'bg-[#151924] border-white/10' : 'bg-white border-slate-100'}`}>
                      <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2.5">
                        {navItems.map((item, i) => (
                          <button key={item.id} onClick={() => { const el = document.getElementById(`module-${item.id}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center gap-3 ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                            <span className="opacity-30 font-mono text-[11px] w-5">{String(i + 1).padStart(2, '0')}</span> 
                            <span className="truncate">{getModuleDisplayName(item)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. PÍLDORA CONFIGURACIÓN */}
                {!isPreview && (
                  <div className={`h-[60px] flex items-center p-2.5 gap-1 rounded-2xl shadow-sm border transition-all ${isDarkMode ? 'bg-[#151924]/90 border-white/10' : 'bg-white/90 border-slate-200/70 backdrop-blur-xl'}`}>
                    <button onClick={() => setLanguage(prev => prev === 'ES' ? 'EN' : 'ES')} className={`h-full px-5 flex items-center justify-center rounded-xl text-[13px] font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}>{language}</button>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className={`h-full px-5 flex items-center justify-center rounded-xl transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}>{isDarkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2"></div>
                    {isAuthenticated && (
                      <div className="flex items-center">
                        {saveStatus === 'saving' && <span className="hidden xl:flex items-center gap-2 mx-3 text-[11px] font-bold uppercase tracking-widest text-amber-500"><Loader2 size={14} className="animate-spin" /> Auto</span>}
                        {saveStatus === 'saved' && <span className="hidden xl:flex items-center gap-2 mx-3 text-[11px] font-bold uppercase tracking-widest text-emerald-500"><Check size={14} /> Listo</span>}
                        <button onClick={() => savePortalData(true)} className={`h-full px-5 flex items-center gap-2.5 rounded-xl transition-colors text-[13px] font-medium ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`} title="Guardar manual">
                           Guardar
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. PÍLDORA ACCIONES */}
                <div className={`h-[60px] flex items-center p-2.5 gap-1.5 rounded-2xl shadow-sm border transition-all ${isDarkMode ? 'bg-[#151924]/90 border-white/10' : 'bg-white/90 border-slate-200/70 backdrop-blur-xl'}`}>
                  <button onClick={() => { if (!isAuthenticated) setIsAuthModalOpen(true); else setIsProfileOpen(true); }} className={`h-full w-12 flex items-center justify-center rounded-xl transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`} title={t.ui.profile}><User size={16} /></button>
                  <button onClick={() => setIsPreview(!isPreview)} className={`h-full px-5 flex items-center justify-center gap-2.5 rounded-xl transition-colors text-[13px] font-medium ${isPreview ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : (isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50')}`}>
                    <span className="hidden sm:inline">{isPreview ? 'Volver a Editar' : t.ui.preview}</span>
                    {isPreview ? <Edit3 size={16} className="sm:hidden" /> : <Eye size={16} className="sm:hidden" />}
                  </button>
                  {!isPreview && (
                    <button onClick={() => { if (!isAuthenticated) setIsAuthModalOpen(true); else savePortalData(true); }} className="h-full px-7 flex items-center justify-center gap-3 rounded-xl bg-[#1a1a1a] dark:bg-white text-white dark:text-slate-900 text-[13px] font-medium shadow-sm hover:opacity-80 transition-opacity">
                      <span>{t.ui.publish}</span>
                      <Upload size={14} />
                    </button>
                  )}
                </div>

                <input id="unified-logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f) updateHeader({...headerItem.content, logo: URL.createObjectURL(f)}); }} />
              </div>
            </div>
          );
        })()}
        {/* --- FIN HEADER UNIFICADO --- */}

        {isPreview && !isPublicView && (
           <button onClick={() => setIsPreview(false)} className="fixed bottom-8 right-8 z-50 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all animate-in fade-in slide-in-from-bottom-4">
              <Edit3 size={16} /> {t.ui.backToEdit}
           </button>
        )}

<div id="canvas-scroll-area" className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 pb-12 pt-32 custom-scrollbar">          <div className="max-w-7xl mx-auto min-h-[500px]">
            {canvasItems.map((item, index) => (
              <React.Fragment key={item.id}>
                {renderCanvasItem(item, index)}
              </React.Fragment>
            ))}
          </div>

          {/* Footer Legal Global */}
          <div className={`max-w-7xl mx-auto mt-20 pt-8 pb-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs select-none ${isDarkMode ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
             <div className="text-center md:text-left">
                &copy; {new Date().getFullYear()} BrandBara. Todos los derechos reservados.
             </div>
             <div className="flex flex-wrap justify-center gap-4 md:gap-8 font-semibold">
                <button onClick={() => setActiveLegalPage('privacy')} className={`transition-colors ${isDarkMode ? 'hover:text-slate-300' : 'hover:text-slate-600'}`}>Política de Privacidad</button>
                <button onClick={() => setActiveLegalPage('terms')} className={`transition-colors ${isDarkMode ? 'hover:text-slate-300' : 'hover:text-slate-600'}`}>Términos de Uso</button>
                <button onClick={() => setActiveLegalPage('cookies')} className={`transition-colors ${isDarkMode ? 'hover:text-slate-300' : 'hover:text-slate-600'}`}>Política de Cookies</button>
             </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Montserrat:wght@400;500;600;700;900&family=Open+Sans:wght@400;500;600;700;800&family=Roboto:wght@400;500;700;900&family=Space+Mono:wght@400;700&family=Nunito:wght@400;700;900&family=Outfit:wght@400;700;900&family=Work+Sans:wght@400;500;600;700;900&display=swap');        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); }
        body { font-family: 'Open Sans', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

// ==========================================
// LANDING PAGE (Estética UX 2026 + Logo Oficial)
// ==========================================
const LandingPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('ES');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const content = {
    ES: {
      nav: "Abrir Editor",
      badge: "EL NUEVO ESTÁNDAR DE GESTIÓN DE MARCA",
      hero1: "El PDF está obsoleto.",
      hero2: "Tus brand guidelines,",
      hero3: "ahora vivas.",
      subtitle: "Construye y protege el capital de tu marca. Centraliza tus activos digitales y haz que el trabajo creativo sea impecable, seguro y accesible para agencias y stakeholders.",
      cta: "Comenzar gratis",
      ctaSub: "No requiere tarjeta de crédito",
      bento1Title: "Protección absoluta de tus Assets.",
      bento1Desc: "Se acabó enviar archivos sueltos. Una única fuente de la verdad donde logotipos, fuentes y componentes están blindados y siempre actualizados.",
      bento2Title: "Sincronización Total",
      bento2Desc: "Alinea a equipos internos y agencias externas al instante. Un cambio se refleja en tiempo real para todos.",
      bento3Title: "Entregables Impecables",
      bento3Desc: "Despídete de las presentaciones estáticas. Entrega portales interactivos que elevan el valor de tu trabajo creativo.",
      footer: "BrandBara Site Inc. © 2026 — Madrid, Spain."
    },
    EN: {
      nav: "Open Editor",
      badge: "THE NEW STANDARD FOR BRAND MANAGEMENT",
      hero1: "The PDF is obsolete.",
      hero2: "Your brand guidelines,",
      hero3: "now alive.",
      subtitle: "Build and protect your brand equity. Centralize your digital assets and make creative work flawless, secure, and always accessible for agencies and stakeholders.",
      cta: "Start for free",
      ctaSub: "No credit card required",
      bento1Title: "Absolute Asset Protection.",
      bento1Desc: "Stop sending loose files. A single source of truth where logos, fonts, and components are shielded and always up to date.",
      bento2Title: "Total Synchronization",
      bento2Desc: "Align internal teams and external agencies instantly. One change reflects in real-time for everyone.",
      bento3Title: "Flawless Deliverables",
      bento3Desc: "Say goodbye to static presentations. Deliver interactive portals that elevate the value of your creative work.",
      footer: "BrandBara Site Inc. © 2026 — Madrid, Spain."
    }
  };

  const t = content[lang];

  return (
    <div className={`min-h-screen font-sans selection:bg-violet-500 selection:text-white flex flex-col overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0c10] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* NAVEGACIÓN - LOGO EXACTO AL DEL EDITOR */}
      <nav className="flex justify-between items-center px-6 py-6 md:px-12 md:py-8 w-full max-w-[1400px] mx-auto shrink-0 z-50">
        
        {/* LOGO OFICIAL BRANDBARA */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className={`text-2xl md:text-3xl font-black tracking-tighter italic ${isDarkMode ? 'text-white' : 'text-[#0f111a]'}`}>
            BRANDBARA
          </span>
          <span className={`px-1.5 py-0.5 text-[10px] font-black rounded border tracking-widest ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            BETA
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Toggle Light/Dark Mode */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'text-amber-400 bg-white/5 hover:bg-white/10' : 'text-slate-600 bg-slate-200/50 hover:bg-slate-200'}`}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Selector de Idioma */}
          <div className={`hidden md:flex p-1 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <button onClick={() => setLang('ES')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${lang === 'ES' ? 'bg-violet-600 text-white' : (isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-800')}`}>ES</button>
            <button onClick={() => setLang('EN')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${lang === 'EN' ? 'bg-violet-600 text-white' : (isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-800')}`}>EN</button>
          </div>

          <button 
            onClick={() => navigate('/')} 
            className={`hidden md:block px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-md hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-white text-[#0a0c10]' : 'bg-[#0f111a] text-white'}`}
          >
            {t.nav}
          </button>
        </div>
      </nav>

      <main className="w-full flex-1 flex flex-col items-center">
        
        {/* HERO SECTION - TIPOGRAFÍA FIEL A LA CAPTURA */}
        <div className="w-full max-w-[1200px] px-6 pt-20 md:pt-32 pb-24 flex flex-col items-center text-center">
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-widest mb-8 ${isDarkMode ? 'border-violet-500/20 bg-violet-500/10 text-violet-400' : 'border-violet-200 bg-violet-50 text-violet-600'}`}>
            <Zap size={14} fill="currentColor" />
            {t.badge}
          </div>
          
          <h1 className="text-[3.5rem] md:text-[6rem] lg:text-[8rem] font-black tracking-tighter leading-[0.85] mb-8 flex flex-col items-center">
            {/* 1. Gris */}
            <span className={`block ${isDarkMode ? 'text-slate-500' : 'text-[#8a94a6]'}`}>
              {t.hero1}
            </span>
            {/* 2. Negro / Blanco puro */}
            <span className={`block ${isDarkMode ? 'text-white' : 'text-[#0f111a]'}`}>
              {t.hero2}
            </span>
            {/* 3. Degradado Violeta a Rosa exacto al de la captura */}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-rose-500 pb-4">
              {t.hero3}
            </span>
          </h1>
          
          <p className={`text-lg md:text-2xl max-w-3xl leading-relaxed mb-12 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {t.subtitle}
          </p>

          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="px-10 py-5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-lg md:text-xl font-black transition-all hover:scale-105 shadow-xl shadow-violet-600/20 flex items-center gap-3"
            >
              {t.cta}
            </button>
            <span className={`text-xs font-bold tracking-widest uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.ctaSub}</span>
          </div>
        </div>

        {/* BENTO GRID EDITORIAL */}
        <div className="w-full max-w-[1400px] px-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[400px]">
            
            {/* Bento 1: Protección de Assets */}
            <div className={`md:col-span-2 rounded-[2.5rem] border p-10 md:p-16 flex flex-col justify-between relative overflow-hidden group transition-colors ${isDarkMode ? 'bg-[#151924] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
              <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3 transition-colors duration-700 pointer-events-none ${isDarkMode ? 'bg-violet-600/20 group-hover:bg-violet-600/30' : 'bg-violet-400/10 group-hover:bg-violet-400/20'}`}></div>
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${isDarkMode ? 'bg-white/5 border border-white/10 text-violet-400' : 'bg-violet-50 border border-violet-100 text-violet-600'}`}>
                <Lock size={32} />
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
                  {t.bento1Title}
                </h3>
                <p className={`text-lg md:text-xl font-medium max-w-xl leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.bento1Desc}
                </p>
              </div>
            </div>

            {/* Bento 2: Sincronización */}
            <div className={`rounded-[2.5rem] border p-10 flex flex-col justify-between transition-colors ${isDarkMode ? 'bg-[#151924] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-white/5 border border-white/10 text-rose-400' : 'bg-rose-50 border border-rose-100 text-rose-600'}`}>
                <Globe size={28} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
                  {t.bento2Title}
                </h3>
                <p className={`font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.bento2Desc}
                </p>
              </div>
            </div>

            {/* Bento 3: Entregables */}
            <div className={`rounded-[2.5rem] border p-10 flex flex-col justify-between transition-colors ${isDarkMode ? 'bg-[#151924] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-white/5 border border-white/10 text-emerald-400' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'}`}>
                <LayoutTemplate size={28} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
                  {t.bento3Title}
                </h3>
                <p className={`font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.bento3Desc}
                </p>
              </div>
            </div>

            {/* Bento 4: Decorativo Minimalista */}
            <div className={`md:col-span-2 rounded-[2.5rem] border p-10 flex items-center justify-center overflow-hidden relative ${isDarkMode ? 'bg-[#151924] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
              <div className={`w-[120%] md:w-[80%] aspect-video border rounded-[2rem] shadow-2xl flex flex-col p-6 transform rotate-2 hover:rotate-0 transition-transform duration-700 ${isDarkMode ? 'bg-[#0a0c10] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`flex items-center gap-3 mb-6 border-b pb-4 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                  {/* Logo miniatura en el mockup */}
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span className={`text-sm font-black tracking-tighter italic ${isDarkMode ? 'text-white' : 'text-[#0f111a]'}`}>
                      BRANDBARA
                    </span>
                    <span className={`px-1 py-0.5 text-[6px] font-black rounded border ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                      BETA
                    </span>
                  </div>
                  <div className={`w-24 h-2 rounded-full ml-auto ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-6">
                  <div className={`col-span-2 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}></div>
                  <div className={`col-span-1 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}></div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className={`w-full py-12 flex flex-col items-center justify-center gap-6 border-t ${isDarkMode ? 'border-white/5 bg-[#0a0c10]' : 'border-slate-200 bg-[#f8fafc]'}`}>
        <div className={`flex items-center gap-1.5 ${isDarkMode ? 'opacity-40 text-white' : 'opacity-50 text-slate-900'}`}>
          <span className="font-black tracking-tighter italic text-lg">BRANDBARA</span>
          <span className="px-1 py-0.5 text-[8px] font-black rounded border bg-transparent tracking-widest">
            BETA
          </span>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'opacity-30' : 'opacity-40 text-slate-900'}`}>{t.footer}</span>
      </footer>
    </div>
  );
};

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mb-8 rotate-12">
        <AlertCircle size={48} />
      </div>
      <h1 className="text-4xl md:text-6xl font-black mb-4 dark:text-white">Este portal no existe</h1>
      <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-md mb-10">
        Parece que el enlace es incorrecto o el diseñador ha retirado el manual de marca.
      </p>
      
      <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 max-w-md w-full">
        <h3 className="text-xl font-bold mb-2 dark:text-white">¿Eres diseñador?</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Crea portales de marca profesionales y deja de enviar PDFs que se pierden en el Drive.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
        >
          Descubre BrandBara
        </button>
      </div>
    </div>
  );
};

// ==========================================
// ENRUTADOR PRINCIPAL (EL CEREBRO DE LA WEB)
// ==========================================
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PRIORIDAD 1: El Editor directo en la Home */}
        <Route path="/" element={<Editor isPublicView={false} />} />
        
        {/* PRIORIDAD 2: La Landing Page solo como apoyo SEO */}
        <Route path="/info" element={<LandingPage />} />
        
        {/* PRIORIDAD 3: Los portales de clientes (brandbara.com/nike) */}
        <Route path="/:slug" element={<Editor isPublicView={true} />} />

        {/* 404: Si algo falla */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
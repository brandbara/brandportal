# BrandBara

Brand portals interactivos: sustituye el PDF de brand guidelines por una web que se comparte con un enlace (`brandbara.com/tu-marca`).

**Stack:** React 18 + Vite 5 + Tailwind 3 · Supabase (auth, base de datos, almacenamiento) · Vercel (publicación).

## Arrancar en tu ordenador

```bash
git clone https://github.com/brandbara/brandportal.git
cd brandportal
npm install
cp .env.example .env.local   # y rellena las dos claves de Supabase
npm run dev                  # abre el enlace "Local:" que aparece
```

> Guarda el proyecto fuera de carpetas sincronizadas con iCloud/Dropbox (por ejemplo `~/Developer`): borran archivos del disco y rompen `node_modules` y `.env.local`.

## Comandos

| Comando | Para qué |
|---|---|
| `npm run dev` | Servidor local con recarga automática |
| `npm run lint` | Revisa el código (errores y avisos) |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run check` | `lint` + `build`: lo mismo que comprueba GitHub en cada Pull Request |

## Estructura

- `src/App.jsx` – editor, módulos del portal, landing y vistas públicas.
- `src/data/translations.js` – textos de la interfaz (ES/EN). Cualquier texto nuevo debe tener las dos versiones.
- `src/data/legal.js` – políticas legales.
- `src/supabaseClient.js` – conexión con Supabase (lee `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
- `public/` – logo, favicon e imagen para compartir.
- `vercel.json` – cabeceras de seguridad y reglas de rutas.

## Base de datos (Supabase)

- Tablas: `profiles` y `portals` (con RLS activado). El público abre los portales solo mediante la función `get_portal_secure`; la comprobación de enlaces usa `is_slug_available`.
- Los cambios de esquema se aplican como **migraciones** (nombre descriptivo, SQL revisado) y se prueban con un usuario normal y con un visitante anónimo antes de darlos por buenos.
- El plan y el almacenamiento usado de cada cuenta solo los modifica el servidor, nunca el navegador.

## Cómo se trabaja

1. Cada mejora va en una rama y un Pull Request (nunca directo a `main`).
2. GitHub ejecuta la **Revisión automática** (lint + build); Vercel crea un enlace de prueba.
3. Se verifica en el enlace de prueba y se pulsa *Merge*; Vercel publica `main` en producción solo.

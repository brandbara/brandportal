# Tipografías

Archivos `.woff2` procedentes de los paquetes npm `@fontsource/*` (Inter, Montserrat, Open Sans, Roboto, Space Mono, Nunito, Outfit, Work Sans).
Todas con licencia **SIL Open Font License 1.1**, que permite alojarlas y redistribuirlas libremente: https://openfontlicense.org

Solo se incluyen los subconjuntos `latin` y `latin-ext` y los pesos que usa BrandBara (ver `src/fonts.css`).
Para añadir un peso o una fuente: instalar el paquete `@fontsource/<fuente>` temporalmente, copiar el `.woff2` aquí y añadir su `@font-face` en `src/fonts.css`.

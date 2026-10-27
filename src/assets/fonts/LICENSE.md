# Tipografías

Archivos `.woff2` procedentes de los paquetes npm `@fontsource/*`. Las 20 tienen licencia **SIL Open Font License 1.1** (comprobado en el `package.json` de cada paquete), que permite alojarlas y redistribuirlas libremente: https://openfontlicense.org

| Tipografía | Paquete (versión de origen) | Licencia |
|---|---|---|
| Inter | `@fontsource/inter` 5.3.0 | OFL-1.1 |
| Montserrat | `@fontsource/montserrat` 5.3.0 | OFL-1.1 |
| Open Sans | `@fontsource/open-sans` 5.3.0 | OFL-1.1 |
| Roboto | `@fontsource/roboto` 5.3.0 | OFL-1.1 |
| Space Mono | `@fontsource/space-mono` 5.3.0 | OFL-1.1 |
| Nunito | `@fontsource/nunito` 5.3.0 | OFL-1.1 |
| Outfit | `@fontsource/outfit` 5.3.0 | OFL-1.1 |
| Work Sans | `@fontsource/work-sans` 5.3.0 | OFL-1.1 |
| Poppins | `@fontsource/poppins` 5.3.0 | OFL-1.1 |
| Lato | `@fontsource/lato` 5.3.0 | OFL-1.1 |
| Noto Sans | `@fontsource/noto-sans` 5.3.0 | OFL-1.1 |
| Roboto Condensed | `@fontsource/roboto-condensed` 5.3.0 | OFL-1.1 |
| Oswald | `@fontsource/oswald` 5.3.0 | OFL-1.1 |
| Roboto Mono | `@fontsource/roboto-mono` 5.3.0 | OFL-1.1 |
| Source Sans 3 | `@fontsource/source-sans-3` 5.3.1 | OFL-1.1 |
| Raleway | `@fontsource/raleway` 5.3.0 | OFL-1.1 |
| Playfair Display | `@fontsource/playfair-display` 5.3.0 | OFL-1.1 |
| Merriweather | `@fontsource/merriweather` 5.3.0 | OFL-1.1 |
| Lora | `@fontsource/lora` 5.3.0 | OFL-1.1 |
| Rubik | `@fontsource/rubik` 5.3.0 | OFL-1.1 |

Solo se incluyen los subconjuntos `latin` y `latin-ext` y los pesos que usa BrandBara (ver `src/fonts.css`). Cada archivo solo se descarga cuando la página usa esa fuente, ese peso y esos caracteres (`unicode-range`).

**Para añadir una tipografía:**
1. Comprobar que su licencia es OFL 1.1 (o equivalente que permita alojarla; si no lo es, consultarlo antes: p. ej. Roboto Slab es Apache 2.0 y exige conservar su aviso, por eso no se incluyó).
2. Instalar el paquete `@fontsource/<fuente>` en una carpeta temporal (no en el proyecto), copiar los `.woff2` aquí y declarar sus `@font-face` en `src/fonts.css`.
3. Añadirla a `src/data/fonts.js`, escribir su descripción en español e inglés en `src/data/translations.js` (`ui.fontDescriptions`) y listarla en esta tabla.

La prueba `src/data/fonts.test.js` falla si falta alguna de esas piezas.

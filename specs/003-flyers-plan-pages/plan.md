# Implementation Plan: Carrusel de flyers, sección de servicios y páginas propias de planes

**Branch**: `003-flyers-plan-pages` | **Date**: 2026-11-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-flyers-plan-pages/spec.md`

## Summary

La página principal se reorganiza en este orden: carrusel de flyers, barra "Preguntas
frecuentes", hero, "Nuestros servicios", "Cómo funciona", preguntas y footer. Los catálogos pasan
a dos páginas propias, `firma.html` y `facturacion.html`, con el estilo de las referencias pero la
marca y los textos de Tari's.

**Carrusel**:
- Es propio y accesible (patrón APG): avanza solo cada 6 s, se puede pausar y respeta "reducir
  movimiento".
- Muestra primero una diapositiva generada para cada promoción vigente, con precios del dato
  único, y después los flyers de imagen de `siteData.flyers`.
- El responsable publica un flyer copiando la imagen a `img/flyers/` y agregando un objeto a los
  datos.

**Páginas de planes**:
- Reutilizan el render, las descripciones y el modal existentes.
- Las formas de pago salen de un `siteData.bancos` único.
- Los requisitos de facturación son Persona Natural y Representante Legal, con los textos de
  noviembre.

**Navegación**: cabecera, footer y modal idénticos en las cinco páginas, vigilados por una
prueba, y redirección de las anclas antiguas.

**Datos**: la entidad certificadora queda como Uanataca.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2015+ en script clásico, sin cambios.

**Primary Dependencies**:
- **En el sitio**: sin cambios (Tailwind 3.4 precompilado, Inter local y Font Awesome 6.5.1 con
  SRI). Sin librerías de carrusel (research R3).
- **Solo en desarrollo**: `npx sharp-cli` para convertir el flyer inicial a WebP. La alternativa,
  si no funciona, está en research R6.

**Storage**: N/A. Los datos son estáticos en `script.js`.

**Testing**: `node --test` (147 pruebas hoy) más el [quickstart](quickstart.md). Pruebas nuevas o
ampliadas:
- `carousel.test.js`
- `flyers.test.js`
- `layout.test.js`
- `navigation.test.js`
- `html.test.js`
- `metadata.test.js`
- `data.test.js`
- `description.test.js`
- `analytics.test.js`

**Target Platform**: sin cambios (2 últimas versiones de Chrome, Edge, Firefox y Safari; `file://`
y Vercel).

**Project Type**: sitio estático de cinco páginas.

**Performance Goals**: SC-001, con el primer flyer visible en menos de 3 s en 4G lenta.
- La primera imagen es WebP de ≤ 250 KB con `fetchpriority="high"`; las demás, diferidas.
- El JavaScript nuevo del carrusel y de la navegación suma menos de 6 KB sin comprimir.

**Constraints**:
- Sin build, sin servidor y sin dependencias nuevas en el sitio.
- Las páginas se abren por `file://`.
- Ningún texto, foto o cifra de los sitios de referencia.
- Los precios salen del dato único.

**Scale/Scope**:
- 5 páginas;
- 1 promoción y 1 flyer inicial;
- 7 planes de firma y 6 de comprobantes;
- 4 bancos;
- 33 FR y 6 historias.

Sin incógnitas abiertas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / regla | Antes del diseño | Tras el diseño |
|-------------------|------------------|----------------|
| I. Sitio estático, sin build, abrible por `file://` | ✅ | ✅ las páginas nuevas son HTML estático; los enlaces son relativos (`firma.html`) y funcionan por `file://` |
| I. Estructura raíz; archivos nuevos justificados | ⚠️ páginas e imágenes nuevas | ✅ justificados en Project Structure |
| I. Sin framework, backend ni dependencias nuevas | ⚠️ un carrusel suele traer librería | ✅ carrusel propio (R3); el panel de administración se descartó (aclaración Q1 = A) |
| I. IDs y anclas se mantienen o migran en el mismo cambio | ⚠️ los catálogos cambian de página | ✅ tabla de migración en [dom-hooks](contracts/dom-hooks.md) y redirección de las anclas antiguas (R2) |
| I. Estilos con Tailwind y tokens `taris-*` | ✅ | ✅ los colores de los bancos son una clave cerrada traducida a clases fijas (R7); sin hexadecimales nuevos sueltos |
| II. Español, JSDoc, funciones pequeñas y puras | ✅ | ✅ `buildCarouselSlides`, `getNextIndex`, `formatSlideLabel`, `isValidFlyerPage`, `mapLegacyHash`, `getCurrentNavPage`, `formatValidityLabel` |
| II. Fuente única de catálogo y contacto | ⚠️ formas de pago en dos páginas | ✅ `siteData.bancos` (R7); el marcado repetido de la cabecera no contiene datos (R1) |
| III. Sin datos personales; `innerHTML` escapado; `data-*` + `addEventListener` | ✅ | ✅ los datos de los flyers se escapan y los destinos se validan con lista blanca (R5) |
| III. Mensajes de WhatsApp sin datos del visitante | ✅ | ✅ `flyer:<id>` usa un mensaje fijo de los datos |
| III. Scripts de terceros / CSP | ✅ | ✅ sin scripts nuevos; la CSP de las páginas nuevas es igual a la actual |
| IV. Verificación manual y pruebas de la lógica nueva | ✅ | ✅ 9 archivos de prueba nuevos o ampliados; quickstart §1–7 |
| IV. Marcado válido W3C | ✅ | ✅ quickstart §7 en las cinco páginas |
| V. Precio con IVA, mismo dato en tarjeta, modal y mensaje | ✅ | ✅ la diapositiva de promoción y las tarjetas se generan desde los datos; se desaconsejan los precios dentro de imágenes ([flyers](contracts/flyers.md)) |
| V. Promociones con vigencia y retiro automático | ✅ | ✅ también para los flyers (fechas opcionales con la misma regla) |
| V. Afirmaciones de servicio confirmadas | ⚠️ beneficios nuevos | ✅ solo los confirmados en las aclaraciones; los demás quedan en las Assumptions para que los confirme el responsable (FR-033) |
| Restricciones: imágenes WebP/AVIF/SVG y carga diferida | ✅ | ✅ R6; `tests/flyers.test.js` vigila el formato y el peso |
| Restricciones: accesibilidad | ✅ | ✅ patrón APG, pausa (WCAG 2.2.2), `alt` obligatorio, `aria-current` |

**Resultado**: el gate **pasa**. Queda una sola concesión, la repetición del marcado de la
cabecera, el footer y el modal, justificada abajo. No hace falta enmendar la constitución.

## Project Structure

### Documentation (this feature)

```text
specs/003-flyers-plan-pages/
├── plan.md
├── research.md            # R1–R13
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── dom-hooks.md       # páginas, migración de IDs, ganchos del carrusel, invariantes 13–19
│   ├── flyers.md          # cómo publica el responsable un flyer
│   ├── whatsapp-links.md  # claves flyer:<id> y facturacion:<tipo>
│   ├── analytics-events.md
│   └── page-metadata.md
├── checklists/requirements.md
└── tasks.md               # /speckit-tasks
```

### Source Code (repository root)

```text
index.html          # MODIFICADO: carrusel (#promociones con respaldo estático), barra de
                    #   preguntas, #servicios; se quitan el banner de promoción, los catálogos,
                    #   los requisitos y las formas de pago; cabecera, footer y modal compartidos
firma.html          # NUEVO: hero de firma, beneficios, #firma-electronica, #requisitos,
                    #   #formas-de-pago
facturacion.html    # NUEVO: banner de beneficios, #facturacion, #requisitos (2 tarjetas),
                    #   #formas-de-pago
privacidad.html     # MODIFICADO: cabecera, footer y modal compartidos (FR-026)
terminos.html       # MODIFICADO: ídem
script.js           # MODIFICADO
                    #   1. DATOS: flyers, bancos, legal.entidadCertificadora = 'Uanataca'
                    #   2. PURAS: buildCarouselSlides, getActiveFlyers, isValidFlyerPage,
                    #      getNextIndex, formatSlideLabel, formatValidityLabel, mapLegacyHash,
                    #      getCurrentNavPage; buildProductDescription (flyer:, facturacion:)
                    #   3. DOM: renderCarousel e initCarousel (controles, avance, pausa,
                    #      deslizar, teclado), renderBanks, markCurrentNav, redirectLegacyHash;
                    #      renderFirmaCards con la plantilla nueva; applyPromotions vuelve a
                    #      dibujar el carrusel
                    #   4. ARRANQUE: llamadas nuevas, tolerantes a páginas sin contenedores
img/flyers/
├── recomendacion-clave.webp        # NUEVO: flyer inicial 1920×600 (FR-008)
└── recomendacion-clave-movil.webp  # NUEVO: versión móvil 1080×1080
tailwind.css        # REGENERADO
README.md           # MODIFICADO: sección "Publicar un flyer" (contracts/flyers.md) y las
                    #   páginas nuevas
tests/
├── carousel.test.js    # NUEVO: buildCarouselSlides, getNextIndex, formatSlideLabel
├── flyers.test.js      # NUEVO: cada flyer existe, es WebP/AVIF/SVG, pesa ≤ 250 KB y tiene alt
├── layout.test.js      # NUEVO: invariante 13 (cabecera, footer y modal idénticos)
├── navigation.test.js  # NUEVO: mapLegacyHash, getCurrentNavPage, invariante 14
├── html.test.js        # AMPLIADO: invariantes 15–19; pruebas de US1/US4/US9 de 002 movidas
│                       #   a la página correcta
├── metadata.test.js    # AMPLIADO: firma.html y facturacion.html
├── data.test.js        # AMPLIADO: reglas de Flyer, Destino y Banco
├── description.test.js # AMPLIADO: flyer:<id>, facturacion:<tipo>
└── analytics.test.js   # AMPLIADO: clic-flyer
```

**Structure Decision**: se mantienen los tres archivos raíz del Principio I. Los archivos nuevos
se justifican así:
- las **dos páginas** las exigen FR-015 y FR-021 y la aclaración "páginas propias";
- las **imágenes del flyer inicial** las exige FR-008;
- `img/flyers/` es la carpeta del mecanismo de publicación (aclaración Q1);
- las **pruebas** las exige el Principio IV.

## Orden de implementación sugerido

1. **Datos y funciones puras con sus pruebas**: flyers, bancos, entidad, carrusel, navegación y
   descripciones.
2. **Plantilla compartida**: cabecera con el menú nuevo, footer y modal; `layout.test.js`;
   aplicarla a `privacidad.html` y `terminos.html`.
3. **`firma.html` (US4)**: mover los planes de firma, los requisitos y las formas de pago;
   aplicar la plantilla nueva de tarjetas.
4. **`facturacion.html` (US5)**: mover los planes de comprobantes y el selector; crear las tarjetas
   de requisitos y el banner.
5. **`index.html` (US1, US3)**: carrusel, barra de preguntas y servicios; quitar lo que se mudó;
   redirección de las anclas antiguas.
6. **Flyer inicial**: imagen WebP y `flyers.test.js`.
7. **US2**: sección del README y prueba de publicación de un flyer de prueba (quickstart §3).
8. Metadatos, medición, regenerar estilos, validador W3C y quickstart completo.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| La cabecera, el footer, los botones flotantes y el modal se repiten en cinco páginas | El sitio no tiene build ni plantillas (Principio I) y las páginas deben verse y navegarse sin JavaScript. La repetición es solo de marcado, sin datos; `tests/layout.test.js` exige que sean idénticos | Inyectarlos con JavaScript deja las páginas sin menú cuando no se ejecutan scripts y produce un salto visual; un generador de sitios requiere un build y una enmienda MAJOR |

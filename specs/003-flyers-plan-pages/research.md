# Research: Carrusel de flyers, sección de servicios y páginas propias de planes

Fase 0 de [plan.md](plan.md). Cada decisión resuelve un punto técnico abierto. Formato:
Decisión, Justificación y Alternativas.

---

## R1. Páginas propias con cabecera, footer y modal compartidos

**Decisión**:
- Dos páginas estáticas nuevas en la raíz: `firma.html` y `facturacion.html`.
- La cabecera, el footer, los botones flotantes y el modal de asesores se **repiten como marcado
  idéntico** en las cinco páginas (`index.html`, `firma.html`, `facturacion.html`,
  `privacidad.html` y `terminos.html`).
- Una prueba, `tests/layout.test.js`, compara ese marcado entre páginas y falla si alguna se
  desincroniza.
- El enlace del menú que corresponde a la página actual recibe `aria-current="page"` desde
  `script.js`, con la función pura `getCurrentNavPage(pathname)`. Así el marcado queda idéntico
  en todas las páginas.

**Justificación**:
- El sitio no tiene build (Principio I), así que no hay plantillas ni *includes*.
- Generar la cabecera con JavaScript dejaría las páginas sin menú cuando el navegador no ejecuta
  scripts, y los rastreadores no verían los enlaces.
- La repetición es solo de marcado: los teléfonos, el horario y la URL de Facebook siguen saliendo
  de `siteData` mediante los ganchos `data-*`, así que la fuente única se conserva (Principio
  II). La prueba de igualdad reemplaza la garantía que daría un sistema de plantillas.

**Alternativas**:
- Cabecera inyectada por `script.js`: no funciona sin JavaScript y produce un salto visual al
  cargar. Rechazada.
- `<iframe>` o `fetch` de un fragmento: no funciona por `file://` y complica la CSP. Rechazada.
- Agregar un generador de sitio estático: requiere un paso de build y una enmienda MAJOR.
  Rechazada.

## R2. Anclas antiguas y migración de IDs (FR-027, Principio I)

**Decisión**:
- Los IDs que usa `script.js` se **migran** a su nueva página:
  - `firma-cards-container` → `firma.html`;
  - `comprobantes-cards-container`, `btn-natural`, `btn-juridica` → `facturacion.html`;
  - `advisor-modal`, `modal-product-text`, `link-asesor-1`, `link-asesor-2`, `mobile-menu` y
    `mobile-menu-btn` → en todas las páginas.
- Las anclas también se migran:
  - `#firma-electronica`: sección de planes de `firma.html`;
  - `#facturacion`: sección de planes de `facturacion.html`;
  - `#requisitos`: requisitos de cada una de las dos páginas;
  - `#promociones`: el carrusel de `index.html`.
- Los enlaces antiguos a la página principal (`index.html#firma-electronica`, `#facturacion` y
  `#requisitos`) se redirigen al cargar.
  - La función pura `mapLegacyHash(hash)` devuelve la URL nueva:
    - `#firma-electronica` → `firma.html#firma-electronica`;
    - `#facturacion` → `facturacion.html#facturacion`;
    - `#requisitos` → `firma.html#requisitos`.
  - `script.js` la aplica con `location.replace`.

**Justificación**:
- El fragmento de una URL no llega al servidor, así que un hosting estático no puede redirigir
  `index.html#firma-electronica`. Solo el navegador puede hacerlo.
- La constitución exige que los IDs y las anclas "se mantengan o migren en el mismo cambio en
  ambos archivos"; esta migración la cumple y queda documentada en
  [contracts/dom-hooks.md](contracts/dom-hooks.md).
- Se usa `location.replace` para que el botón "Atrás" no vuelva a la URL antigua.

**Alternativas**:
- Dejar secciones vacías con esos IDs en la principal: confunde y no cumple FR-013. Rechazada.
- Redirecciones del hosting: no ven el fragmento. Rechazada.

## R3. Carrusel accesible propio, sin librerías

**Decisión**: un carrusel en JavaScript propio que sigue el patrón *Carousel* de las WAI-ARIA
Authoring Practices.
- **Estructura**: `section` con `aria-roledescription="carrusel"` y `aria-label`; cada flyer es un
  `div` con `role="group"`, `aria-roledescription="diapositiva"` y `aria-label="2 de 3"`, que sale
  de la función pura `formatSlideLabel`.
- **Controles**:
  - botones «Anterior» y «Siguiente»;
  - un indicador por flyer, que también es un botón;
  - un botón de pausa con `aria-pressed`, que satisface WCAG 2.2.2;
  - las flechas izquierda y derecha cuando el foco está dentro del carrusel;
  - deslizar con el dedo, mediante eventos *pointer* y un umbral de 40 px.
- **Avance automático**: cada 6 segundos.
  - Se detiene con el puntero encima, con el foco dentro, cuando la pestaña está oculta y al
    pulsar pausa.
  - **No arranca** si `prefers-reduced-motion: reduce`.
  - Durante el avance automático, la región viva queda en `aria-live="off"`; al navegar a mano
    cambia a `"polite"`, como indican las APG.
- **Funciones puras**:
  - `getNextIndex(actual, total, paso)`, que da la vuelta al llegar al final;
  - `formatSlideLabel(indice, total)`;
  - `buildCarouselSlides(...)`, ver R4.
- **Un solo flyer**: sin controles ni avance.
- **Ningún flyer**: la sección se oculta.

**Justificación**: no hay que agregar ninguna dependencia, prohibido sin justificar en el
Principio I, y el patrón APG cubre el teclado, el lector de pantalla y la pausa que exigen
FR-003, FR-004 y SC-006.

**Alternativas**:
- Swiper o Splide desde un CDN: suman 40–100 KB y un script de terceros que habría que justificar
  y fijar con SRI. Rechazada.
- Desplazamiento solo con CSS (`scroll-snap`): no da avance automático, pausa ni anuncio "2 de 3".
  Rechazada.

## R4. Datos de los flyers y orden del carrusel (FR-002, FR-007, FR-009)

**Decisión**:
- Nuevo arreglo `siteData.flyers` con objetos
  `{ id, imagen, imagenMovil?, alt, destino?, inicio?, fin? }`. El orden del arreglo es el orden
  del carrusel. Detalle en [data-model.md](data-model.md).
- `buildCarouselSlides(promociones, flyers, ahora)` arma la lista final:
  1. primero, una diapositiva generada por cada **promoción vigente**, con sus datos de siempre
     (FR-007);
  2. después, los **flyers vigentes** en su orden.
- La vigencia de un flyer usa la misma regla de fechas que las promociones: hora de Ecuador y el
  día de fin completo. Si no tiene fechas, el flyer es permanente.
- La diapositiva de una promoción se genera desde `siteData.promociones`. Sus precios salen de
  `getActiveVariants`, así que coinciden con el modal y con el mensaje (Principio V).
- La sección `#promociones-container` de la feature 002 desaparece: el carrusel la reemplaza.

**Justificación**: los flyers propios del responsable son imágenes, pero la promoción tiene que
mostrar precios que salgan del dato único, así que se genera como HTML y no como imagen. El
responsable solo agrega objetos al arreglo, que es el mecanismo elegido en la aclaración Q1 = A.

## R5. Destinos de los flyers y seguridad (FR-006, Principio III)

**Decisión**: hay dos tipos de destino.
- `{ tipo: 'contacto', mensaje: '…' }`: el flyer se vuelve un botón con
  `data-open-advisor="flyer:<id>"`. `buildProductDescription('flyer:<id>')` devuelve el `mensaje`,
  así que el pedido pasa por el mismo modal y el mismo mensaje de siempre. No se aceptan datos del
  visitante.
- `{ tipo: 'pagina', pagina: '…' }`: el flyer es un enlace. El valor se valida contra una **lista
  blanca** (`index.html`, `firma.html`, `facturacion.html`, con o sin `#ancla` válida), mediante la
  función pura `isValidFlyerPage`.
- Un destino que no pasa la validación se descarta y el flyer queda sin enlace.
  `tests/data.test.js` lo detecta antes de publicar.
- `imagen`, `alt` y `mensaje` se insertan escapados (`escapeHtml`) o con atributos. `imagen` debe
  ser una ruta relativa dentro de `img/flyers/`.

**Justificación**: los datos de los flyers los edita el responsable. La lista blanca impide
enlaces `javascript:` o externos por error y mantiene la regla de `innerHTML` solo con datos
escapados.

## R6. Imágenes de los flyers (FR-005, FR-008, FR-030)

**Decisión**:
- **Formato**: WebP (constitución → Rendimiento), 1920×600 px para escritorio y, de forma
  opcional, 1080×1080 px para móvil (`imagenMovil`). Se sirven con `<picture>` y
  `<source media="(max-width: 640px)">`. Peso máximo de 250 KB por archivo, que vigila
  `tests/flyers.test.js`.
- **Carga**: la imagen del primer flyer carga con `fetchpriority="high"` y sin `lazy`, porque está
  en la primera pantalla (SC-001); las demás con `loading="lazy"`.
- **Flyer inicial** (FR-008): `img/flyers/recomendacion-clave.webp` y su versión móvil, con el
  mensaje "Tu firma es personal: nunca compartas tu archivo P12 ni tu contraseña", el logo y los
  colores de la marca, sin precios.
  - Se compone en HTML, se renderiza con Chrome headless y se convierte a WebP con la CLI de
    `sharp` (`npx sharp-cli`, solo en desarrollo).
  - **A verificar al implementar**: si `sharp-cli` no funciona en el equipo, la conversión se hace
    exportando con `canvas.toDataURL('image/webp')` en Chrome headless.
- **Imágenes del responsable**: el README explica cómo convertirlas a WebP (por ejemplo, con
  squoosh.app) y con qué tamaño.

**Justificación**: la constitución exige WebP, AVIF o SVG y carga diferida fuera de la primera
pantalla. El texto del flyer va también en `alt`, porque el que está dentro de la imagen no lo
lee un lector de pantalla.

**Alternativa**: el flyer inicial en SVG con texto. Las fuentes no cargan dentro de un `<img>` SVG
salvo que se incrusten, y eso pesa más que el WebP. Rechazada.

## R7. Formas de pago desde una sola definición (FR-014)

**Decisión**:
- Los cuatro bancos pasan a `siteData.bancos` (`{ sigla, nombre, estilo }`).
- `renderBanks()` los dibuja en cada contenedor `[data-bancos]` de `firma.html` y de
  `facturacion.html`.
- `estilo` es una clave cerrada (`rosa`, `amarillo`, `turquesa` y `esmeralda`) que se traduce a
  clases fijas en `script.js`, para que Tailwind las vea y no se escriban clases desde los datos.

**Justificación**: la aclaración Q3 pide las formas de pago en las dos páginas sin duplicar datos.
Una clave cerrada evita meter clases arbitrarias desde los datos y mantiene vigente la prueba de
estilos.

## R8. Requisitos de facturación por tipo de cliente (FR-024, FR-025)

**Decisión**:
- Dos tarjetas estáticas en `facturacion.html`, "Persona Natural" y "Representante Legal", con
  los textos confirmados en noviembre (aclaración Q2 = A). Cada una indica "Vigencia: 1 año" y
  lleva el botón "Solicítalo aquí".
- Los botones usan claves nuevas, `facturacion:natural` y `facturacion:juridica`.
  `buildProductDescription` las traduce a "Sistema de Facturación Electrónica (Persona Natural) -
  Consulta de requisitos" y "… (Persona Jurídica) …".

**Justificación**: los requisitos son contenido, no datos comerciales (research R5 de la feature
002), y escritos en el HTML se leen sin JavaScript. Las claves nuevas siguen el contrato de
mensajes existente.

## R9. Tarjetas de firma con el estilo de la referencia (FR-018 a FR-020)

**Decisión**:
- `renderFirmaCards` cambia su plantilla:
  - cabecera "Más popular" en el plan destacado;
  - etiqueta "Persona Natural" y una píldora "Vigencia 1 año" o "Vigencia 10 días";
  - precio grande con "IVA incluido";
  - costo por año y ahorro (feature 002);
  - aviso de promoción (feature 002);
  - enlace "Ver requisitos" a `#requisitos`;
  - botón "Comprar ahora" con `data-plan`.
- El texto de la vigencia sale de `formatValidityLabel(plan)` ("Vigencia 1 año", "Vigencia 10
  días"), derivado de `duracion` y `anios`.
- La descripción que recibe el asesor **no cambia**.

**Justificación**: solo cambia la presentación, y las pruebas de descripción y de WhatsApp de la
feature 002 siguen protegiendo el texto del pedido.

## R10. Barra de preguntas y sección de servicios (FR-010, FR-012)

**Decisión**:
- **Barra "Preguntas frecuentes"**: un enlace a `#preguntas` que ocupa todo el ancho, con
  `gold-gradient`, icono de Font Awesome y texto en `taris-dark`. Va justo debajo del carrusel y
  equivale al verde de la referencia.
- **"Nuestros servicios"**: sección estática con las tarjetas Firma Electrónica y Facturación
  Electrónica, con el contenedor translúcido sobre `taris-navy` de la referencia. "Saber más"
  enlaza a `firma.html` y `facturacion.html`.

**Justificación**: no tiene datos variables, así que es marcado estático, legible sin
JavaScript.

## R11. Metadatos de las páginas nuevas (FR-028)

**Decisión**:
- `firma.html` y `facturacion.html` llevan cada una su `<title>`, `description` (150–160
  caracteres), `canonical` y `og:*`.
- Reutilizan `img/og-tari.jpg`.
- `tests/metadata.test.js` pasa a recorrer las tres páginas de venta y exige que el dominio de
  todas coincida con `siteData.medicion.dominio`.

## R12. Entidad certificadora (FR-029)

**Decisión**: `siteData.negocio.legal.entidadCertificadora = 'Uanataca'`. Los ganchos
`data-legal` de la feature 002 ya la muestran en el hero, en el aviso de privacidad y en los
términos, y el texto alternativo se oculta solo. Esto cierra uno de los cuatro pendientes de
`tests/publicacion.test.js`.

## R13. Medición de los flyers

**Decisión**: un evento nuevo, `clic-flyer`, con `{ flyer: '<id>' }` para los flyers propios y
`{ flyer: 'promo:<id>' }` para la diapositiva de promoción. Se agrega a
[contracts/analytics-events.md](contracts/analytics-events.md). Las páginas nuevas envían su
`pageview` porque cargan `script.js`.

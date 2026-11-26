---

description: "Task list for feature 003: carrusel de flyers y páginas propias de planes"
---

# Tasks: Carrusel de flyers, sección de servicios y páginas propias de planes

**Input**: Design documents from `/specs/003-flyers-plan-pages/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: se incluyen. El Principio IV exige pruebas automatizadas (`node --test`) para la lógica
nueva, y plan.md lista los archivos de prueba. Se escriben antes de la implementación y deben
fallar primero.

**Organization**: por historia de usuario (spec.md), con fases previas compartidas.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo, sin dependencias pendientes).
- **[Story]**: historia de la spec (US1…US6).
- Rutas relativas a la raíz del repositorio.

## Convenciones para todas las tareas

- Se mantienen las de la feature 002: español, JSDoc, 4 espacios, `const`/`let`, sin
  `console.log` ni `style=""`. Toda función pura nueva va a la sección 2 de `script.js` y a
  `module.exports`.
- **Regenerar estilos** =
  `npx tailwindcss@3.4 -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify`.
- **Marcado compartido** = la `<header>` (con el menú móvil), el `<footer>`, los botones
  flotantes y `#advisor-modal`. MUST copiarse **idéntico** desde `index.html` a cada página nueva
  o modificada (research R1; invariante 13 de contracts/dom-hooks.md).
- Toda página nueva copia el `<head>` de `index.html`: CSP, `tailwind.css`, Font Awesome con SRI,
  `styles.css` e iconos. Sus metadatos propios se completan en US6.
- Para experimentar con archivos se usa una copia de seguridad en el scratchpad, nunca
  `git checkout` sobre cambios sin commit.
- Las citas `data-model.md → Entidad.campo` remiten a la regla canónica del campo.

---

## Phase 1: Setup

**Purpose**: dejar listas la herramienta de imágenes y la carpeta de flyers (research R6).

- [ ] T001 Comprobar que `npx -y sharp-cli --version` funciona en el equipo de desarrollo. Si no funciona, probar la conversión alternativa con `canvas.toDataURL('image/webp')` en Chrome headless. Anotar el método que funcionó en `specs/003-flyers-plan-pages/research.md` → R6
- [ ] T002 Crear la carpeta `img/flyers/` (las imágenes llegan en T021)

---

## Phase 2: Foundational (plantilla compartida y datos comunes)

**Purpose**: cabecera, menú, footer y modal comunes a las cinco páginas; bancos y entidad
certificadora. US3, US4, US5 y US6 dependen de esta fase.

**⚠️ CRITICAL**: ninguna historia empieza antes de completar esta fase.

### Tests

- [ ] T003 [P] Crear `tests/layout.test.js` (invariante 13 de contracts/dom-hooks.md): para cada `*.html` de la raíz, extraer `<header>…</header>`, `<footer>…</footer>`, el bloque de botones flotantes y `#advisor-modal`, normalizar los espacios y afirmar que son iguales a los de `index.html`
- [ ] T004 [P] Crear `tests/navigation.test.js`:
  - `getCurrentNavPage` con `/`, `/index.html`, `/firma.html`, `/facturacion.html`, `/privacidad.html`, `/terminos.html` y una ruta desconocida (→ `index`), según data-model.md → Páginas;
  - `mapLegacyHash` con `#firma-electronica`, `#facturacion`, `#requisitos`, `#preguntas` (→ `null`) y `''` (→ `null`), según research R2;
  - invariante 14: en cada página, el menú de escritorio y el móvil enlazan a `index.html`, `firma.html`, `facturacion.html`, `index.html#como-funciona` e `index.html#preguntas`
- [ ] T005 [P] Ampliar `tests/data.test.js` con las reglas de `data-model.md → Banco.sigla`, `Banco.nombre` y `Banco.estilo`, con los cuatro valores actuales, y con `data-model.md → Datos del negocio.negocio.legal.entidadCertificadora` = `'Uanataca'`

### Implementation

- [ ] T006 En `script.js`, agregar las funciones puras `getCurrentNavPage(pathname)` y `mapLegacyHash(hash)` y las funciones DOM:
  - `markCurrentNav()`, que pone `aria-current="page"` en los `[data-nav]` de la página actual;
  - `redirectLegacyHash()`, que solo actúa en `index.html` y usa `location.replace`.

  Llamarlas en el arranque, antes de dibujar el resto
- [ ] T007 En `script.js`, agregar `siteData.bancos` con `data-model.md → Banco.sigla`, `Banco.nombre` y `Banco.estilo`; la traducción cerrada `estilo` → clases (research R7) y la función DOM `renderBanks()`, que dibuja cada `[data-bancos]` con el mismo diseño de tarjeta de banco actual. Llamarla en el arranque
- [ ] T008 En `script.js`, fijar `data-model.md → Datos del negocio.negocio.legal.entidadCertificadora` en `'Uanataca'` (FR-029, research R12)
- [ ] T009 En la cabecera de `index.html`, reescribir el menú de escritorio y el móvil con enlaces a `index.html` (Inicio), `firma.html`, `facturacion.html`, `index.html#como-funciona` e `index.html#preguntas`, más el enlace "Promociones" a `index.html#promociones` (sigue con `data-promo-any`). Cada enlace de página lleva `data-nav="index|firma|facturacion"`. En los enlaces del logo y del footer, cambiar `href="#"` por `href="index.html"`
- [ ] T010 En `privacidad.html` y `terminos.html`, reemplazar la cabecera simplificada y el footer por el marcado compartido de `index.html` y agregar los botones flotantes y `#advisor-modal`, para que `script.js` funcione igual (FR-026)
- [ ] T011 Regenerar `tailwind.css` y ejecutar `node --test` sobre `tests/`: 0 fail. `tests/publicacion.test.js` muestra 3 pendientes (sale la entidad)
- [ ] T012 Verificar en Chrome por `file://` que el menú de `index.html`, `privacidad.html` y `terminos.html` lleva a sus destinos y que `aria-current` marca la página actual

**Checkpoint**: plantilla compartida lista. El hero ya dice "Emitida por Uanataca, entidad
certificadora acreditada".

---

## Phase 3: User Story 1 - Ver primero las promociones y novedades (Priority: P1) 🎯 MVP

**Goal**: carrusel de flyers como primer contenido, con la promoción generada de los datos, el
flyer inicial y la barra "Preguntas frecuentes".

**Independent Test**: quickstart.md §2. El carrusel muestra la promoción vigente y el flyer,
avanza solo, se pausa, responde al teclado y al dedo, y la promoción desaparece al vencer.

### Tests for User Story 1

- [ ] T013 [P] [US1] Crear `tests/carousel.test.js`:
  - `buildCarouselSlides` pone primero la promoción vigente, con sus variantes, y después los flyers vigentes en orden;
  - sin promoción vigente quedan solo los flyers;
  - descarta los flyers vencidos o futuros (`data-model.md → Flyer.inicio`, `Flyer.fin`);
  - quita el destino de un flyer con `data-model.md → Destino de flyer.pagina` fuera de la lista blanca;
  - `getNextIndex(2, 3, 1)` → 0 y `getNextIndex(0, 3, -1)` → 2;
  - `formatSlideLabel(1, 3)` → `2 de 3`
- [ ] T014 [P] [US1] Ampliar `tests/description.test.js` con `flyer:<id>` según contracts/whatsapp-links.md: devuelve el `mensaje` de un flyer de contacto, y `null` si el flyer no existe, no está vigente o su destino es de página
- [ ] T015 [P] [US1] Crear `tests/flyers.test.js`: por cada flyer de `siteData.flyers`, los archivos `data-model.md → Flyer.imagen` y `Flyer.imagenMovil` existen, tienen extensión `.webp`, `.avif` o `.svg` y pesan ≤ 250 KB; `Flyer.alt` cumple su largo
- [ ] T016 [P] [US1] Ampliar `tests/html.test.js`:
  - invariante 19 (`section#promociones` con `aria-roledescription="carrusel"`; los botones de anterior, siguiente y pausa con `aria-label`);
  - `section#promociones` es la primera sección de `index.html` y trae como respaldo estático la imagen de `recomendacion-clave` con su `alt`;
  - justo después hay un enlace a `#preguntas` con el texto "Preguntas frecuentes";
  - reemplazar la invariante 4 de 002: ya no existe `promociones-container`, y los dos enlaces "Promociones" del menú siguen con `data-promo-any` y `hidden`

### Implementation for User Story 1

- [ ] T017 [US1] En `script.js`, agregar `siteData.flyers` con el flyer inicial de data-model.md, usando `data-model.md → Flyer.id`, `Flyer.imagen`, `Flyer.imagenMovil`, `Flyer.alt` y `Flyer.destino` (destino de página a `firma.html`)
- [ ] T018 [US1] En `script.js`, agregar las funciones puras:
  - `getActiveFlyers(flyers, ahora)`, con `data-model.md → Flyer.inicio` y `Flyer.fin` y la regla de `isPromotionActive`;
  - `isValidFlyerPage(pagina)`, con la lista blanca de `data-model.md → Destino de flyer.pagina`;
  - `buildCarouselSlides(promociones, flyers, ahora)`, `getNextIndex(actual, total, paso)` y `formatSlideLabel(indice, total)`.

  Ampliar `buildProductDescription` con `flyer:<id>`, que devuelve `data-model.md → Destino de flyer.mensaje` cuando `Destino de flyer.tipo` es `contacto`
- [ ] T019 [US1] En `index.html`, sustituir la sección `#promociones` actual por el carrusel de contracts/dom-hooks.md:
  - `section#promociones` con `data-carousel`, `aria-roledescription="carrusel"` y `aria-label="Promociones y novedades"`;
  - `data-carousel-track` con el respaldo estático de `recomendacion-clave` (`<picture>` con `alt`);
  - los botones `data-carousel-prev`, `data-carousel-next` y `data-carousel-pause`;
  - `data-carousel-dots` y una región `data-carousel-live`.

  Ubicarla como primera sección, antes del hero. Debajo, agregar la barra "Preguntas frecuentes": enlace a `#preguntas` a todo el ancho, con `gold-gradient` e icono (research R10). Comentario de sección según el Principio II
- [ ] T020 [US1] En `script.js`:
  - agregar `renderCarousel(slides)`:
    - diapositiva de promoción con el diseño del banner de 002, botones `data-plan="promo:<id>:<v>"` y precios con `formatPrice` y "IVA incluido";
    - diapositiva de flyer con `<picture>`, `fetchpriority="high"` en la primera y `loading="lazy"` en las demás;
    - enlace o botón `data-open-advisor="flyer:<id>"` según el destino, y `data-flyer`;
    - todo escapado;
  - agregar `initCarousel()`:
    - flechas, indicadores con `aria-current`, teclado ← y → con foco dentro y deslizar con eventos *pointer* (umbral de 40 px);
    - avance cada 6 s, pausa con el puntero encima, con el foco dentro, al ocultar la pestaña y con el botón (`aria-pressed`);
    - sin avance con `prefers-reduced-motion`;
    - `aria-live` en `off` durante el avance y en `polite` al navegar;
    - sin controles con 1 diapositiva y sección oculta con 0;
  - reescribir `applyPromotions(ahora)` para que vuelva a dibujar el carrusel y siga alternando `[data-promo-any]`. Eliminar `renderPromotions` y todo lo de `promociones-container`, porque el Principio II no admite código muerto
- [ ] T021 [US1] Crear `img/flyers/recomendacion-clave.webp` (1920×600) y `img/flyers/recomendacion-clave-movil.webp` (1080×1080), de ≤ 250 KB cada una:
  - texto: "Tu firma es personal: nunca compartas tu archivo P12 ni tu contraseña";
  - logo, colores `taris-*` y sin precios;
  - componer en HTML en el scratchpad, renderizar con Chrome headless y convertir con el método de T001
- [ ] T022 [US1] En `script.js`, agregar el evento `clic-flyer` de contracts/analytics-events.md en `handleDocumentClick`, para los clics dentro de `[data-flyer]`
- [ ] T023 [US1] Regenerar `tailwind.css`, ejecutar `node --test` sobre `tests/` y validar `quickstart.md` §2 en Chrome: con la promoción vigente; con `applyPromotions(new Date('2026-12-01T00:00:00-05:00'))`; con "Reducir movimiento"; y sin JavaScript

**Checkpoint**: US1 se puede publicar sola. Los catálogos siguen todavía en la principal.

---

## Phase 4: User Story 2 - Publicar un flyer propio sin tocar la estructura (Priority: P1)

**Goal**: que el responsable agregue, cambie o retire flyers con la carpeta y los datos
(aclaración Q1 = A).

**Independent Test**: quickstart.md §3 con un flyer de prueba.

- [ ] T024 [P] [US2] Ampliar `tests/data.test.js` con las reglas de:
  - `data-model.md → Flyer.id` (único y con patrón), `Flyer.imagen`, `Flyer.imagenMovil`, `Flyer.alt`, `Flyer.inicio` y `Flyer.fin` (formato `AAAA-MM-DD` e `inicio ≤ fin`);
  - `data-model.md → Destino de flyer.tipo`, `Destino de flyer.mensaje` y `Destino de flyer.pagina`.

  Cada fallo debe nombrar el `id` del flyer y el campo con problemas
- [ ] T025 [US2] En `README.md`, agregar la sección "Publicar un flyer" con los pasos y las reglas de `contracts/flyers.md`, incluida la recomendación de no poner precios dentro de la imagen
- [ ] T026 [US2] Validar `quickstart.md` §3 con un flyer temporal en `script.js` y una imagen de prueba en `img/flyers/`. Usar una copia de seguridad en el scratchpad y revertir con ella al terminar

**Checkpoint**: el carrusel es un espacio de publicidad administrable.

---

## Phase 5: User Story 4 - Elegir y pedir una firma en su propia página (Priority: P2)

> Va antes que US3 porque US3 retira de la página principal las secciones que esta historia muda
> a `firma.html`.

**Goal**: `firma.html` con hero, beneficios, planes por vigencia, requisitos y formas de pago.

**Independent Test**: quickstart.md §4.

### Tests for User Story 4

- [ ] T027 [P] [US4] Ampliar `tests/choice.test.js` con `formatValidityLabel`: `10 DÍAS` → `Vigencia 10 días`, `1 AÑO` → `Vigencia 1 año`, `5 AÑOS` → `Vigencia 5 años` (data-model.md → Plan de Firma Electrónica)
- [ ] T028 [P] [US4] Ampliar `tests/html.test.js` con la invariante 16 para `firma.html`. Mover a `firma.html` las pruebas de 002 que buscaban en `index.html` el aviso de "solo personas naturales" de `#firma-electronica` y de `#requisitos`, y el botón de renovación; para eso, `seccion(id, pagina)` acepta la página

### Implementation for User Story 4

- [ ] T029 [US4] En `script.js`, agregar la función pura `formatValidityLabel(plan)` y cambiar la plantilla de `renderFirmaCards` según research R9:
  - cabecera "Más popular", "Persona Natural", píldora de vigencia, precio con "IVA incluido";
  - costo por año y aviso de promoción (de 002);
  - "Ver requisitos" → `#requisitos` y "Comprar ahora" con `data-plan`;
  - sin cambios en `buildProductDescription`
- [ ] T030 [US4] Crear `firma.html` con el `<head>` y el marcado compartidos, y estas secciones:
  - **Hero**: titular "Obtén o renueva tu firma electrónica"; usos (SRI, Quipux, SERCOP, contratos y PDF); "Obtener mi firma" → `#firma-electronica` y "Renovar mi firma" con `data-open-advisor="renovacion"`. Sin promesas de tiempo sin condición; usa `data-entrega`.
  - **Beneficios**: los 5 de la firma de las Assumptions de la spec, incluida la asesoría postventa para firmar.
  - **`#firma-electronica`**: `firma-cards-container` y el aviso de "solo personas naturales"; se mueve el bloque de `index.html`, sin el selector de tipo ni el token.
  - **`#requisitos`**: los requisitos de firma, que se mueven de `index.html`.
  - **`#formas-de-pago`**: `[data-bancos]` y el botón `data-open-advisor="banco"`.

  Cada sección con su comentario `<!-- SECCIÓN …: … -->`
- [ ] T031 [US4] Regenerar `tailwind.css`, ejecutar `node --test` sobre `tests/` y validar `quickstart.md` §4

**Checkpoint**: `firma.html` funciona sola. La principal todavía conserva su copia, que se retira
en US3.

---

## Phase 6: User Story 5 - Elegir y pedir el facturador en su propia página (Priority: P2)

**Goal**: `facturacion.html` con banner de beneficios, planes con selector, requisitos de Persona
Natural y Representante Legal, y formas de pago.

**Independent Test**: quickstart.md §5.

### Tests for User Story 5

- [ ] T032 [P] [US5] Ampliar `tests/description.test.js` con `facturacion:natural` y `facturacion:juridica`, y `tests/whatsapp.test.js` con los ejemplos de contracts/whatsapp-links.md
- [ ] T033 [P] [US5] Ampliar `tests/html.test.js` con la invariante 17 para `facturacion.html` (exactamente dos tarjetas en `#requisitos`, sin "Miembro de Empresa"). Mover a `facturacion.html` las pruebas de 002 de `data-taxpayer-note`, de `aria-pressed` en el selector y de los tipos de comprobante

### Implementation for User Story 5

- [ ] T034 [US5] En `script.js`, ampliar `buildProductDescription` con `facturacion:natural` y `facturacion:juridica` (data-model.md → Descripción del producto)
- [ ] T035 [US5] Crear `facturacion.html` con el `<head>` y el marcado compartidos, y estas secciones:
  - **Banner de beneficios**: los beneficios de facturación de las Assumptions de la spec, sin "ilimitados", app ni capacitaciones; botón "¡Empieza ahora!" → `#facturacion`.
  - **`#facturacion`**: se mueven de `index.html` el selector `btn-natural`/`btn-juridica` con `aria-pressed`, los avisos `data-taxpayer-note`, `comprobantes-cards-container`, los tipos de comprobante y el recordatorio de firma.
  - **`#requisitos`**: "Requisitos para obtener tu Sistema de Facturación Electrónica", con dos tarjetas:
    - **Persona Natural**: vigencia 1 año, certificado de RUC y firma vigente;
    - **Representante Legal**: vigencia 1 año, RUC de la empresa, firma de la empresa o de su representante gestionada por su cuenta, y el aviso de "solo personas naturales" (aclaración Q2 = A);
    - cada una con "Solicítalo aquí" y `data-open-advisor="facturacion:natural|juridica"`.
  - **`#formas-de-pago`**: `[data-bancos]`.

  Cada sección con su comentario `<!-- SECCIÓN …: … -->`
- [ ] T036 [US5] Regenerar `tailwind.css`, ejecutar `node --test` sobre `tests/` y validar `quickstart.md` §5

**Checkpoint**: `facturacion.html` funciona sola.

---

## Phase 7: User Story 3 - Conocer los servicios desde la página principal (Priority: P1)

> Depende de US4 y US5: retira de la principal lo que ya se mudó.

**Goal**: "Nuestros servicios" y el orden final de la página principal.

**Independent Test**: quickstart.md §2.1 y §2.8. El orden de las secciones es el de FR-011, y
"Saber más" lleva a cada página.

- [ ] T037 [P] [US3] Ampliar `tests/html.test.js` con la invariante 15: el orden de las secciones de `index.html`; que no existan `firma-cards-container`, `comprobantes-cards-container` ni `id="requisitos"`; y que `#servicios` tenga dos tarjetas con enlaces a `firma.html` y `facturacion.html`
- [ ] T038 [US3] En `index.html`:
  - agregar `section#servicios`, "Nuestros servicios" / "Conoce lo que ofrecemos para ti", después del hero, con las tarjetas Firma Electrónica y Facturación Electrónica (icono, nombre, descripción corta y "Saber más");
  - eliminar las secciones `#firma-electronica`, `#facturacion` y `#requisitos` y las formas de pago (FR-013);
  - cambiar "Ver todos los planes y precios" del hero para que lleve a `firma.html`;
  - dejar el orden de FR-011
- [ ] T039 [US3] En `script.js`, confirmar que el arranque tolera la página principal sin catálogos (`renderFirmaCards`, `renderComprobantesCards` y `setTaxpayerType` salen sin contenedor) y que `redirectLegacyHash` lleva `index.html#firma-electronica`, `#facturacion` y `#requisitos` a su página nueva (quickstart §6.2)
- [ ] T040 [US3] Regenerar `tailwind.css`, ejecutar `node --test` sobre `tests/` y validar `quickstart.md` §2 completo

**Checkpoint**: la página principal queda con el orden final.

---

## Phase 8: User Story 6 - Navegar entre la página principal y las de planes (Priority: P2)

**Goal**: metadatos propios de las páginas nuevas y navegación verificada.

**Independent Test**: quickstart.md §6.

- [ ] T041 [P] [US6] Ampliar `tests/metadata.test.js` para que recorra `firma.html` y `facturacion.html` según contracts/page-metadata.md: título, `description` de 150–160 caracteres, `og:*` y `canonical` con el dominio de `siteData.medicion.dominio`
- [ ] T042 [P] [US6] Ampliar `tests/html.test.js` con la invariante 18: ninguna página contiene "Security Data", "millones de firmas", "App móvil" ni "usuarios activos" (FR-031)
- [ ] T043 [US6] Completar el `<head>` de `firma.html` y de `facturacion.html` según contracts/page-metadata.md (FR-028)
- [ ] T044 [US6] Validar `quickstart.md` §6 por `file://` en Chrome: menú en las cinco páginas, `aria-current`, redirección de las anclas antiguas y "Emitida por Uanataca"

**Checkpoint**: todas las historias están completas.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T045 [P] Ampliar `tests/analytics.test.js`: `buildEventOrigin` deja pasar `flyer:<id>`, `facturacion:natural` y `facturacion:juridica`, y el cuerpo de `clic-flyer` sigue contracts/analytics-events.md
- [ ] T046 [P] Actualizar `README.md`: las páginas del sitio (`index`, `firma`, `facturacion` y las legales), el campo `bancos` y la nota de que el marcado compartido debe quedar idéntico en todas (con `tests/layout.test.js` vigilándolo)
- [ ] T047 Pasar `index.html`, `firma.html`, `facturacion.html`, `privacidad.html` y `terminos.html` por el validador W3C (vnu, en local), con 0 errores (quickstart §7.1)
- [ ] T048 Validar `quickstart.md` §7 de punta a punta en Chrome y Edge: consola sin errores por `file://` y capturas en 375 px y 1280 px de las tres páginas de venta. Dejar Firefox, Safari y Lighthouse para que los confirme el responsable en el PR
- [ ] T049 Ejecutar `node --test` sobre `tests/` (0 fail) y anotar en el PR los pendientes del responsable (horas de entrega y `websiteId`) y los textos para confirmar (beneficios de firma y de facturación, y texto del flyer inicial, FR-033)
- [ ] T050 Abrir el PR desde `003-flyers-plan-pages`, siguiendo `specs/003-flyers-plan-pages/quickstart.md`, con la descripción, la verificación del Principio IV y las confirmaciones pendientes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → historias → **Polish (9)**.
- La Foundational bloquea todas las historias: cabecera, menú, footer, modal, bancos y entidad.

### User Story Dependencies

| Historia | Depende de | Nota |
|----------|-----------|------|
| US1 (P1) | Foundational | independiente; es el MVP |
| US2 (P1) | US1 | usa el carrusel y `siteData.flyers` |
| US4 (P2) | Foundational | independiente; crea `firma.html` |
| US5 (P2) | Foundational | independiente; crea `facturacion.html` |
| US3 (P1) | US4 y US5 | retira de la principal lo que ellas mudaron; por eso va después, aunque sea P1 |
| US6 (P2) | US4 y US5 | metadatos y navegación de las páginas nuevas |

### Within Each User Story

- Las pruebas primero, y deben fallar.
- Datos y funciones puras → marcado → DOM → regenerar estilos → validación.
- Las tareas sobre el mismo archivo (`script.js`, `index.html`) van en secuencia.

### Parallel Opportunities

- Foundational: T003, T004 y T005 en paralelo.
- US1: T013–T016 en paralelo; T021 (imágenes) en paralelo con T018–T020.
- US4 y US5 pueden ir en paralelo entre sí: cada una crea su propia página. Solo comparten
  `script.js` y `tests/html.test.js`, y ahí hay que coordinarlas.
- Polish: T045 y T046 en paralelo.

---

## Parallel Example: User Story 1

```bash
Task: "Crear tests/carousel.test.js (buildCarouselSlides, getNextIndex, formatSlideLabel)"
Task: "Ampliar tests/description.test.js con flyer:<id>"
Task: "Crear tests/flyers.test.js (existencia, formato, peso, alt)"
Task: "Ampliar tests/html.test.js con la invariante 19 y la barra de preguntas"
```

## Parallel Example: User Stories 4 y 5

```bash
Task: "Crear firma.html (US4)"
Task: "Crear facturacion.html (US5)"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + Foundational: menú nuevo en las cinco páginas y Uanataca.
2. US1: carrusel con la promoción y el flyer inicial, y la barra de preguntas.
3. Validar con quickstart §2. Se puede publicar: los catálogos siguen en la principal hasta US3.

### Incremental Delivery

1. MVP (US1) → US2 (publicar flyers).
2. US4 y US5 (páginas de planes, en paralelo).
3. US3 (servicios y retiro de los catálogos de la principal) → US6 (metadatos y navegación).
4. Polish y PR.

---

## Notes

- Commits con Conventional Commits, uno por grupo lógico.
- La promoción actual vence el 30-11-2026; después, el carrusel queda con el flyer de
  recomendación, que es lo esperado (US1, escenario 5).
- Los textos de beneficios y del flyer inicial se publican solo con la confirmación del
  responsable (FR-033).

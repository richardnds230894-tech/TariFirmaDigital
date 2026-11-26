---

description: "Task list for feature 002: cerrar huecos de la página"
---

# Tasks: Cerrar huecos de la página para vender más y generar confianza

**Input**: Design documents from `/specs/002-page-gap-improvements/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: se incluyen. El Principio IV de la constitución exige pruebas automatizadas
(`node --test`) para toda lógica que calcule o transforme datos, y plan.md lista los archivos de
prueba. Se escriben antes de la implementación y deben fallar primero.

**Organization**: las tareas se agrupan por historia de usuario para implementar y probar cada
una por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo, sin dependencias pendientes).
- **[Story]**: historia de la spec a la que pertenece (US1…US10).
- Las rutas son relativas a la raíz del repositorio. La estructura está en plan.md → Project
  Structure.

## Convenciones para todas las tareas

- Código y textos en español; JSDoc en cada función nueva; 4 espacios; `const`/`let`; sin
  `console.log` ni `style=""` (Principio II).
- Toda función pura nueva se agrega a la sección 2 de `script.js` y a `module.exports` (sección 5).
- Todo texto generado con `innerHTML` pasa por `escapeHtml`; los datos sueltos se insertan con
  `textContent` (Principio III).
- **Regenerar estilos** = ejecutar
  `npx tailwindcss@3.4 -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify`.
  Si se olvida, `tests/styles.test.js` falla.
- Las citas `data-model.md → Entidad.campo` remiten a la regla canónica del campo; no se repiten
  aquí.

---

## Phase 1: Setup (base de producción)

**Purpose**: quitar el Play CDN de Tailwind y Google Fonts, fijar Font Awesome con SRI y añadir la
CSP sin cambiar el aspecto (research R1, R2 y R13). Va primero porque todas las clases nuevas de
las fases siguientes se generan con la CLI.

- [X] T001 Confirmar que la rama contiene la enmienda 1.1.0 de `.specify/memory/constitution.md` (Principio I y "Stack": Tailwind precompilado con `tailwind.config.js` e Inter local), aprobada por el responsable durante la planificación. **Bloquea T002 y T006**; incluirla en el PR
- [X] T002 Crear `tailwind.config.js`: copiar `theme.extend` (fontFamily Inter, colores `taris-*`, sombras `gold` y `card`) desde el `<script>` en línea de `index.html`, con `content: ['./*.html', './script.js']` (research R1)
- [X] T003 [P] Descargar Inter variable con subconjunto latino (wght 400–900, woff2; por ejemplo el archivo latino de `@fontsource-variable/inter`) a `fonts/inter-latin-var.woff2` y guardar su licencia OFL en `fonts/OFL.txt` (research R2)
- [X] T004 Crear `tailwind.input.css` con `@tailwind base; @tailwind components; @tailwind utilities;` y un `@font-face` de Inter que apunte a `fonts/inter-latin-var.woff2`, con `font-weight: 400 900` y `font-display: swap` (research R1, R2)
- [X] T005 Generar `tailwind.css` con el comando de "Regenerar `tailwind.css`" (depende de T002–T004)
- [X] T006 Editar el `<head>` de `index.html`:
  - quitar `cdn.tailwindcss.com`, el `<script>` de `tailwind.config` y los tres `<link>` de Google Fonts;
  - enlazar `tailwind.css` antes de `styles.css`;
  - añadir al `<link>` de Font Awesome 6.5.1 `integrity` (hash sha512 de cdnjs para `all.min.css`, obtenido de `https://api.cdnjs.com/libraries/font-awesome/6.5.1?fields=sri`), `crossorigin="anonymous"` y `referrerpolicy="no-referrer"` (research R2)
- [X] T007 Añadir a `index.html` el `<meta http-equiv="Content-Security-Policy">` de research R13 por ahora sin el endpoint de Umami (`connect-src 'self'`). Actualizar el comentario del `<noscript>` en `index.html` y el de `.aviso-sin-js` en `styles.css`: Tailwind ya no necesita JavaScript. Abrir `index.html` por `file://` en Chrome, Firefox y Safari y confirmar que `script.js`, `tailwind.css` y las fuentes cargan sin violaciones de CSP. Si algún navegador las bloquea, quitar el `<meta>` CSP, documentar la política como cabecera opcional del hosting en research.md R13 y en `README.md`, y ajustar la invariante 12 de T009 (research R13, riesgo con `file://`). **Resultado 2026-11-26**: Chrome y Edge cargan todo por `file://` sin violaciones de CSP; Firefox y Safari no están instalados en el equipo de desarrollo y quedan para la verificación del PR
- [X] T008 [P] Crear `tests/styles.test.js` (invariante 8 de contracts/dom-hooks.md):
  - extraer las clases de todos los `class="…"` de los `*.html` de la raíz;
  - en `script.js`, extraer los tokens de: los `class="…"` de las plantillas; las cadenas asignadas a `className`; las cadenas asignadas a variables cuyo nombre termina en `Style`, `Color` o `Class`; y los argumentos de `classList.add`, `.remove` y `.toggle`. Dentro de ternarios, tomar las cadenas de ambas ramas;
  - descartar los tokens que contengan `${`, `?` o comillas, y los que no tengan forma de clase;
  - escaparlas como selector CSS (`:`, `/`, `.`, `[`, `]`, `#`, `%`);
  - afirmar que cada una aparece en `tailwind.css`;
  - ignorar las clases propias de `styles.css` (`bg-taris-hero`, `gold-gradient`, `gold-text-gradient`, `promo-banner-bg`, `animate-pulse-gold`, `aviso-sin-js`)
- [X] T009 Ampliar `tests/html.test.js`:
  - leer **todas** las páginas `*.html` de la raíz y aplicarles las invariantes 1, 2, 3 y 5 de 001;
  - agregar la invariante 6 (sin `cdn.tailwindcss.com` ni `fonts.googleapis.com`; todo stylesheet externo con `integrity` y `crossorigin="anonymous"`);
  - agregar la 9 (sin `$` seguido de dígitos);
  - agregar la 12 (una sola CSP y ningún `<script>` en línea ejecutable)
- [X] T010 Verificar que el aspecto sea idéntico: comparar capturas de `index.html` a 375 px y a 1280 px antes (commit `f761bfa`) y después de T006. Ejecutar `node --test` (0 fail) y confirmar en la consola 0 errores y 0 advertencias (FR-034, quickstart §2)

**Checkpoint**: la página se ve igual, sin advertencias y sin dependencias de compilación en el
navegador.

---

## Phase 2: Foundational (datos compartidos)

**Purpose**: cambios de `siteData` que usan varias historias. US3, US6, US7 y US10 dependen del
horario estructurado, de `anios` y de `medicion`.

**⚠️ CRITICAL**: ninguna historia empieza antes de completar esta fase.

- [X] T011 En `script.js`:
  - convertir `siteData.negocio.horario` a la estructura de `data-model.md → Datos del negocio.horario.semana.inicio`, `.horario.semana.fin`, `.horario.sabado.inicio` y `.horario.sabado.fin`;
  - agregar la función pura `formatSchedule(tramo)` (`{inicio:'09:00', fin:'18:00'}` → `9:00 a 18:00`);
  - hacer que `hydrateContactData` rellene `[data-horario]` con `formatSchedule`. El texto visible no cambia
- [X] T012 [P] En `script.js`, agregar `anios` a cada elemento de `siteData.firmaPlans` según `data-model.md → Plan de Firma Electrónica.anios`
- [X] T013 [P] En `script.js`, agregar `siteData.medicion` con `data-model.md → Medición.websiteId`, `Medición.endpoint` y `Medición.dominio` (valores iniciales de data-model)
- [X] T014 Actualizar `tests/data.test.js`:
  - horario estructurado (`inicio < fin`, formato `HH:MM`) y valores actuales;
  - `anios` coherente con `duracion` en cada plan de firma;
  - `medicion.endpoint` en HTTPS y `websiteId`/`dominio` como cadena o `null`
- [X] T015 [P] Agregar a `tests/format.test.js` los casos de `formatSchedule` (`9:00 a 18:00`, `10:00 a 14:00`)
- [X] T016 Crear el ayudante `tests/pendiente.js` (lo usan `tests/publicacion.test.js` y `tests/metadata.test.js`; su nombre no coincide con los patrones de `node --test`, así que no se ejecuta como prueba) y `tests/publicacion.test.js`. El ayudante `pendiente(nombre, valor)` registra `test(nombre, { todo: valor === null }, () => assert.notEqual(valor, null))`, y las primeras comprobaciones `medicion.dominio` y `medicion.websiteId` (research R14). Si la variable de entorno `PUBLICAR` vale `1`, el ayudante no marca `todo`, de modo que cada pendiente es un fallo (quickstart.md §1)
- [X] T017 Ejecutar `node --test` sobre `tests/`: 0 fail; los `todo` aparecen listados

**Checkpoint**: datos listos. Las historias pueden empezar en orden de prioridad o en paralelo.

---

## Phase 3: User Story 1 - Entender el proceso y los requisitos de mi caso (Priority: P1) 🎯 MVP

**Goal**: el visitante ve los pasos de compra, los requisitos de su caso, el aviso de "solo
personas naturales" y la condición real de "mismo día".

**Independent Test**: solo leyendo la página, un visitante nuevo enumera los pasos y los
documentos de su caso (quickstart §3).

### Tests for User Story 1

- [X] T018 [P] [US1] Agregar a `tests/format.test.js` los casos de `formatDeliveryCondition`: ambos valores presentes, solo uno presente y ambos `null` (→ `Entrega ágil`), según `data-model.md → Datos del negocio.entrega`. Agregar a `tests/data.test.js` que cada `entrega.horaLimite*` que no sea `null` tenga formato `HH:MM` y sea anterior al `fin` del tramo de `horario` correspondiente
- [X] T019 [P] [US1] Agregar a `tests/html.test.js`:
  - `section#como-funciona` existe y tiene un `<ol>` con 5 `<li>`;
  - los valores de `data-taxpayer-note` son `natural` o `juridica`;
  - el aviso de "solo personas naturales" aparece dentro de `#firma-electronica` y de `#requisitos`

### Implementation for User Story 1

- [X] T020 [US1] En `script.js`, agregar `siteData.negocio.entrega` con `data-model.md → Datos del negocio.entrega.horaLimiteSemana` y `.entrega.horaLimiteSabado` (iniciales `null`) y la función pura `formatDeliveryCondition(entrega)`. Rellenar `[data-entrega]` desde `hydrateContactData`
- [X] T021 [US1] Agregar a `tests/publicacion.test.js` los pendientes `entrega.horaLimiteSemana` y `entrega.horaLimiteSabado`
- [X] T022 [US1] En `index.html`, agregar después del hero `<!-- SECCIÓN: CÓMO FUNCIONA -->` con `section#como-funciona` y un `<ol>` de 5 pasos (elegir plan, escribir a un asesor, enviar requisitos, pagar por transferencia, recibir el P12 o activar la facturación). Agregar el enlace "Cómo funciona" al menú de escritorio y al móvil (FR-001)
- [X] T023 [US1] En `index.html`, sustituir el texto "Mismo día" de la tarjeta del hero por un elemento `data-entrega` (FR-003)
- [X] T024 [US1] En `index.html`, reorganizar `#requisitos` en dos bloques (research R5):
  - "Firma electrónica (personas naturales)": celular, cédula, selfie, correo y certificado de RUC con la etiqueta "solo si tienes RUC";
  - "Facturación electrónica": persona natural (certificado de RUC) y persona jurídica (RUC de la empresa y documentos a confirmar por el responsable);
  - los textos no llevan precios, teléfonos ni horarios (FR-002)
- [X] T025 [US1] En `index.html`, agregar el aviso estático "La firma electrónica se emite solo a personas naturales" debajo de `#firma-cards-container` y dentro del bloque de firma de `#requisitos` (FR-002a)
- [X] T026 [US1] En `index.html`, agregar dentro de `#facturacion` dos avisos `data-taxpayer-note="natural"` y `data-taxpayer-note="juridica"`; el jurídico va con `hidden` y explica que la firma para empresas no se emite aquí, con un botón `data-open-advisor="general"`. En `script.js`, hacer que `setTaxpayerType` muestre solo los avisos del tipo activo (edge case de la spec)
- [X] T027 [US1] Regenerar `tailwind.css`, ejecutar `node --test` y validar `quickstart.md` §3

**Checkpoint**: US1 se puede publicar y demostrar por sí sola.

---

## Phase 4: User Story 2 - Resolver mis dudas sin escribir (Priority: P1)

**Goal**: preguntas frecuentes accesibles que funcionan sin JavaScript.

**Independent Test**: cada pregunta se abre y se cierra con ratón, toque y teclado, y anuncia su
estado (quickstart §4).

### Tests for User Story 2

- [X] T028 [P] [US2] Agregar a `tests/html.test.js`:
  - `section#preguntas` contiene al menos 7 `<details>`, cada uno con un `<summary>` como primer hijo;
  - la sección termina con un botón `data-open-advisor="general"`

### Implementation for User Story 2

- [X] T029 [US2] En `index.html`, agregar `<!-- SECCIÓN: PREGUNTAS FRECUENTES -->` con `section#preguntas` antes del footer, con `<details>`/`<summary>` para:
  - qué es un archivo P12;
  - en qué trámites sirve (SRI, Quipux, SERCOP);
  - cómo se instala o usa;
  - qué pasa si olvido la clave o pierdo el archivo;
  - cómo se renueva;
  - qué es un comprobante electrónico;
  - qué pasa con los comprobantes no usados.

  Las respuestas usan `data-horario` o `data-entrega` cuando citan horarios o tiempos y quedan como borrador para que las confirme el responsable (FR-004, FR-038). El icono del `<summary>` gira con `group-open:rotate-180` (research R4)
- [X] T030 [US2] En `index.html`, cerrar `#preguntas` con el botón "Preguntar a un asesor" (`data-open-advisor="general"`) y agregar el enlace "Preguntas" al menú de escritorio y al móvil (FR-006)
- [X] T031 [US2] Regenerar `tailwind.css`, ejecutar `node --test` y validar `quickstart.md` §4, incluido el modo sin JavaScript (FR-007)

**Checkpoint**: US1 y US2 funcionan cada una por su cuenta.

---

## Phase 5: User Story 3 - Encontrar y compartir la página con una buena presentación (Priority: P1)

**Goal**: vista previa con imagen al compartir, icono propio y datos para buscadores.

**Independent Test**: al pegar el enlace publicado en WhatsApp y Facebook se ven el título, la
descripción y la imagen (quickstart §5).

### Tests for User Story 3

- [X] T032 [P] [US3] Crear `tests/structured-data.test.js` según contracts/page-metadata.md → "Datos estructurados":
  - `@type` `ProfessionalService`;
  - un `contactPoint` por asesor con `formatPhone`;
  - horario derivado de `siteData.negocio.horario`;
  - `sameAs` con la URL de Facebook;
  - `url`/`image` omitidos si `medicion.dominio` es `null`;
  - `legalName`/`taxID` solo si existen
- [X] T033 [P] [US3] Crear `tests/metadata.test.js`:
  - `index.html` tiene todas las etiquetas de la tabla de contracts/page-metadata.md;
  - `description` mide entre 150 y 160 caracteres;
  - `og:title` coincide con `<title>`;
  - el dominio de `canonical`, `og:url` y `og:image` es igual a `siteData.medicion.dominio`. La comprobación del dominio usa el ayudante `tests/pendiente.js`: queda como `todo` mientras sea `null` y el `<head>` use el marcador `__DOMINIO__`, y con `PUBLICAR=1` el marcador hace fallar la suite

### Implementation for User Story 3

- [X] T034 [P] [US3] Crear `favicon.svg` a partir del logo SVG de la cabecera de `index.html` (con sus degradados `skyGrad` y `blueGrad`), con fondo redondeado `#040F22` (research R10)
- [X] T035 [P] [US3] Crear `apple-touch-icon.png` de 180×180 px renderizando `favicon.svg` sobre fondo `#061A3A`. Documentar en el PR la herramienta usada (research R10)
- [X] T036 [P] [US3] Crear `img/og-tari.jpg` (1200×630 px, < 300 KB) con el logo, "Firma Electrónica P12 y Facturación SRI" y "Ecuador", sin precios. Queda pendiente de aprobación del responsable (contracts/page-metadata.md → "Imagen para compartir")
- [X] T037 [US3] En el `<head>` de `index.html`, agregar las etiquetas de contracts/page-metadata.md (description, canonical, `og:*`, `twitter:card`, `theme-color`, icon y apple-touch-icon), usando `https://__DOMINIO__/` en las URL absolutas hasta que el responsable entregue el dominio
- [X] T038 [US3] En `script.js`, agregar la función pura `buildStructuredData(siteData)` según contracts/page-metadata.md y la función DOM `renderStructuredData()`, que escribe `JSON.stringify(...)` con `textContent` en `script[data-structured-data]`. Llamarla en el arranque. En `index.html`, agregar `<script type="application/ld+json" data-structured-data></script>` vacío en el `<head>`
- [X] T039 [US3] Ejecutar `node --test` (`metadata.test.js` en `todo` por el dominio) y validar `script.js` en la prueba de resultados enriquecidos de Google pegando el HTML renderizado (quickstart §5.3)

**Checkpoint**: las tres historias P1 de presentación ya son entregables.

---

## Phase 6: User Story 4 - Confiar en quién me vende (Priority: P1)

**Goal**: identidad legal del negocio, entidad certificadora, aviso de privacidad y términos.

**Independent Test**: un visitante encuentra la razón social, el RUC, la entidad, la privacidad y
los términos en menos de 1 minuto (quickstart §6).

### Tests for User Story 4

- [X] T040 [P] [US4] Agregar a `tests/html.test.js`:
  - existen `privacidad.html` y `terminos.html`;
  - el footer de `index.html` enlaza a ambas;
  - todo `data-legal` usa `razonSocial`, `ruc`, `ciudad` o `entidadCertificadora`;
  - ninguna página contiene `<form>`, `<input>` ni `type="file"` (FR-016)
- [X] T041 [P] [US4] Agregar a `tests/publicacion.test.js` los pendientes de `data-model.md → Datos del negocio.legal.razonSocial`, `.legal.ruc`, `.legal.ciudad` y `.legal.entidadCertificadora`, y una prueba que valide `ruc` con 13 dígitos cuando no sea `null`

### Implementation for User Story 4

- [X] T042 [US4] En `script.js`:
  - agregar `siteData.negocio.legal` con `data-model.md → Datos del negocio.legal.razonSocial`, `Datos del negocio.legal.ruc`, `Datos del negocio.legal.ciudad` y `Datos del negocio.legal.entidadCertificadora`, todos en `null`;
  - agregar la función DOM `hydrateLegalData()` según contracts/dom-hooks.md: `textContent` en cada `[data-legal]`; si el dato es `null`, oculta el elemento; oculta cada `[data-legal-group]` cuyos datos sean todos `null`; muestra el `[data-legal-fallback]` que sigue a un grupo oculto y lo oculta si el grupo es visible (contracts/dom-hooks.md);
  - llamarla en el arranque
- [X] T043 [US4] En `index.html`:
  - reemplazar "Segura y avalada por entidades certificadoras" del hero por "Emitida por" + `<span data-legal="entidadCertificadora">`, dentro de un `data-legal-group`, seguido (fuera del grupo) de `<span data-legal-fallback class="hidden">Emitida por una entidad certificadora acreditada</span>`;
  - en el footer, agregar un bloque `data-legal-group` con razón social, RUC y ciudad, y enlaces a `privacidad.html` y `terminos.html` (FR-012, FR-013)
- [X] T044 [P] [US4] Crear `privacidad.html`:
  - mismo `<head>` que `index.html` (CSP, `tailwind.css`, `styles.css`, Font Awesome con SRI, iconos si existen) con `<title>`, `description` y `canonical` propios;
  - cabecera simplificada con logo y "Volver al inicio";
  - el contenido mínimo de research R11 como borrador para el responsable, con `data-legal` para el responsable del tratamiento; cada sección precedida por un comentario `<!-- SECCIÓN …: … -->` en mayúsculas (Principio II);
  - footer con los enlaces legales;
  - `<script src="script.js">` (FR-014)
- [X] T045 [P] [US4] Crear `terminos.html` con la misma estructura que `privacidad.html` (incluidos los comentarios `<!-- SECCIÓN …: … -->` del Principio II), que cubra al menos la política de reembolso, la vigencia de los planes y el tratamiento de los comprobantes no usados al terminar el año. Queda como borrador para el responsable (FR-015)
- [X] T046 [US4] Confirmar que `script.js` arranca sin errores en las páginas legales: cada `render…` sale si no hay contenedor y `applyPromotions`/`hydrate…` toleran que falten elementos. Corregir lo que falle
- [X] T047 [US4] Regenerar `tailwind.css`, ejecutar `node --test` y validar `quickstart.md` §6

**Checkpoint**: todas las historias P1 están completas. El MVP de confianza está listo para
publicar cuando no queden `todo`.

---

## Phase 7: User Story 5 - Pedir cualquier variante de la promoción vigente (Priority: P2)

**Goal**: cada variante se pide con un clic y la promoción se genera desde los datos.

**Independent Test**: con una fecha vigente, cada variante abre el modal con su texto y precio, y
la tarjeta de 1 año avisa de la promoción (quickstart §7).

### Tests for User Story 5

- [X] T048 [P] [US5] Ampliar `tests/promotions.test.js`:
  - `getActivePromotions(promos, ahora)` en los bordes de fecha;
  - `getActiveVariants(promo, firmaPlans)` con precio explícito (variante 0 → 14,99) y heredado del plan (variantes 1 y 2 → 21,00 y 30,00)
- [X] T049 [P] [US5] Actualizar `tests/description.test.js`:
  - `promo:firma-2-anios-nov-2026:1` y `promo:firma-2-anios-nov-2026` (variante 0) con los textos de data-model.md → "Descripción del producto";
  - un índice de variante inexistente devuelve `null`
- [X] T050 [P] [US5] Actualizar `tests/data.test.js` (valores de la promoción con `variantes`; cada `pagaAnios` existe en `firmaPlans`, como exige el edge case de la spec; `recibeAnios > pagaAnios`) y `tests/html.test.js` (la invariante 4 de contracts/dom-hooks.md reemplaza a la de 001; las claves válidas de `data-open-advisor` ya no incluyen `promo:<id>`)

### Implementation for User Story 5

- [X] T051 [US5] En `script.js`, reestructurar `siteData.promociones[0]` con `data-model.md → Promoción.producto` y `Promoción.variantes`, y cada variante con `Variante de promoción.pagaAnios`, `.recibeAnios` y `.precio` (valores de la tabla de data-model). Eliminar el `precio` de nivel superior
- [X] T052 [US5] En `script.js`, agregar las funciones puras:
  - `getActivePromotions(promos, ahora)`, que usa `isPromotionActive`;
  - `getActiveVariants(promo, firmaPlans)`, que devuelve cada variante con su precio resuelto según `data-model.md → Variante de promoción.precio`
- [X] T053 [US5] En `script.js`, ampliar `buildProductDescription` con las claves `promo:<id>:<v>` y `promo:<id>`, que equivale a `:0` (texto y sufijo `- Valor: $NN,NN inc. IVA` de data-model.md)
- [X] T054 [US5] En `index.html`, sustituir el banner escrito a mano por `<section id="promociones" data-promo-any class="hidden …">` con encabezado y `<div id="promociones-container"></div>`. Cambiar los dos enlaces "Promociones" del menú a `data-promo-any`. Eliminar `data-promo`, `data-promo-link`, `data-promo-precio`, `data-promo-vigencia` y el botón `promo:<id>` (contracts/dom-hooks.md). **Se hace en el mismo commit que T055** (Principio I: migración en ambos archivos a la vez)
- [X] T055 [US5] En `script.js`, agregar `renderPromotions(ahora)`:
  - genera en `#promociones-container`, con `escapeHtml`, una tarjeta por promoción vigente con el mismo diseño del banner anterior;
  - el precio destacado es el de la variante 0;
  - cada importe usa `formatPrice` y lleva la indicación "IVA incluido" (Principio V);
  - lleva un botón `data-plan="promo:<id>:<v>"` por variante;
  - la vigencia sale de `formatDateRange`.

  **Se hace en el mismo commit que T054.**

  Reescribir `applyPromotions(ahora = new Date())` para que llame a `renderPromotions`, alterne `hidden` en `[data-promo-any]` y vuelva a dibujar las tarjetas de firma. Debe seguir pudiéndose llamar desde la consola
- [X] T056 [US5] En `script.js`, hacer que `renderFirmaCards(ahora)` muestre, en cada plan cuyo `anios` coincida con el `pagaAnios` de una variante vigente, el aviso "Promo: recibes N años por $X (IVA incluido)", con `$X` generado por `formatPrice` y enlace a `#promociones` (FR-019, Principio V)
- [X] T057 [US5] Regenerar `tailwind.css`, ejecutar `node --test` y validar `quickstart.md` §7, incluida una segunda promoción temporal sin tocar el HTML (FR-020)

**Checkpoint**: US5 funciona sola. Sin promoción vigente no queda ningún rastro.

---

## Phase 8: User Story 6 - Elegir el plan adecuado (Priority: P2)

**Goal**: costo por año y ahorro en firmas largas, comprobantes por mes y aclaraciones de la
facturación.

**Independent Test**: las tarjetas muestran los valores de la tabla de research R7 (quickstart
§8).

### Tests for User Story 6

- [X] T058 [P] [US6] Crear `tests/choice.test.js` con la tabla de research R7:
  - `calculateYearlyCost` y `calculateSavings` para 2–5 años, y `null` para planes sin `anios` o de 1 año;
  - `calculateMonthlyVouchers` de 50 → 4 a 600 → 50;
  - `formatVoucherLabel(50)` → `50 COMPROBANTES`;
  - `formatYearlyCostText` para 5 años → `$9,20 por año · Ahorras $29,00 (IVA incluido)`, y `null` cuando no aplica

### Implementation for User Story 6

- [X] T059 [US6] En `script.js`, sustituir `cantidad` por `data-model.md → Plan de Comprobantes.total` en `siteData.comprobantesPlans` y agregar `formatVoucherLabel(total)` y `calculateMonthlyVouchers(total)`. Usar la etiqueta en `buildProductDescription` y en `renderComprobantesCards`: los textos del modal no cambian. Actualizar los valores en `tests/data.test.js` y agregar que los `total` sean enteros positivos y únicos
- [X] T060 [US6] En `script.js`, agregar `calculateYearlyCost(plan)` y `calculateSavings(plan, planAnual)` basadas en `data-model.md → Plan de Firma Electrónica.anios`
- [X] T061 [US6] En `script.js`:
  - `renderFirmaCards` muestra "$X por año · Ahorras $Y (IVA incluido)", con ambos importes generados por `formatPrice` y armado por la función pura `formatYearlyCostText(plan, planAnual)`, en los planes de 2 o más años con ahorro mayor que 0 (FR-021, Principio V);
  - `renderComprobantesCards` muestra "≈ N por mes" (FR-022)
- [X] T062 [US6] En `index.html`, dentro de `#facturacion`, listar los tipos de comprobante incluidos (borrador para el responsable) y el aviso "Necesitas una firma electrónica vigente", con enlace a `#firma-electronica` (FR-023)
- [X] T063 [US6] Regenerar `tailwind.css`, ejecutar `node --test` y validar `quickstart.md` §8

**Checkpoint**: US6 funciona sola.

---

## Phase 9: User Story 7 - Contactar sin fricción y saber cuándo me responden (Priority: P2)

**Goal**: estado de atención en hora de Ecuador, asesor sugerido y saludo natural.

**Independent Test**: la tabla de horas de quickstart §9 da el texto esperado; el modal destaca un
asesor y mantiene el otro.

### Tests for User Story 7

- [X] T064 [P] [US7] Crear `tests/attention.test.js`:
  - la tabla de quickstart §9;
  - los bordes miércoles 17:59 (abierto) y 18:00 (cerrado), sábado 13:59 y 14:00, viernes 23:59 y domingo 00:00;
  - medianoche UTC frente a Ecuador
- [X] T065 [P] [US7] Crear `tests/advisor.test.js`:
  - `pickSuggestedAdvisor` con `aleatorio` fijo (0 → asesor1, 0,99 → asesor2);
  - con una muestra determinista de valores aleatorios distribuida de forma uniforme en [0, 1), cada asesor se elige exactamente la mitad de las veces (US7, escenario 4)
- [X] T066 [P] [US7] Actualizar `tests/whatsapp.test.js` con los ejemplos de contracts/whatsapp-links.md: `ayuda` y `producto` sin `{asesor}`

### Implementation for User Story 7

- [X] T067 [US7] En `script.js`, cambiar las plantillas `data-model.md → Datos del negocio.mensajes.ayuda` y `.mensajes.producto`. Quitar `{asesor}` de los valores que se pasan a `fillTemplate` en `openAdvisorModal` y `hydrateContactData`. `data-model.md → Asesor.nombre` queda solo como rótulo del botón (FR-026)
- [X] T068 [US7] En `script.js`, agregar las funciones puras `getAttentionStatus(horario, ahora)` y `formatAttentionStatus(estado)` (research R8), basadas en `data-model.md → Datos del negocio.horario.semana.inicio`, `.semana.fin`, `.sabado.inicio` y `.sabado.fin`, con el desfase `DESFASE_ECUADOR_MS`
- [X] T069 [US7] En `script.js`, agregar `renderAttentionStatus(ahora = new Date())`, que rellena `[data-atencion]`. Llamarla en el arranque y en `openAdvisorModal`. En `index.html`, agregar `data-atencion` en la barra superior y dentro del modal, bajo el título (FR-024, FR-025)
- [X] T070 [US7] En `script.js`, agregar la función pura `pickSuggestedAdvisor(asesores, aleatorio)` y el estado de módulo `asesorSugeridoId`, que se fija una vez en el arranque con `Math.random`. En `openAdvisorModal`, el enlace sugerido recibe el estilo dorado, la clase `order-first` y su `[data-suggested-badge]` visible; el otro, el estilo secundario y `order-last` (research R9, FR-027). **Implementado 2026-11-26**: en lugar de `order-*`, el enlace sugerido se mueve al principio del DOM para que el orden del foco con Tab coincida con el visual (WCAG 2.4.3)
- [X] T071 [US7] En `index.html`, dentro de `#link-asesor-1` y `#link-asesor-2`, agregar `<span data-suggested-badge class="hidden …">Sugerido</span>` y asegurar que su contenedor sea `flex flex-col` para que funcionen `order-*`
- [X] T072 [US7] Regenerar `tailwind.css`, ejecutar `node --test` y validar `quickstart.md` §9 (simular horas desde la consola con `renderAttentionStatus`)

**Checkpoint**: US7 funciona sola.

---

## Phase 10: User Story 8 - Renovar mi firma (Priority: P2)

**Goal**: un acceso directo de renovación con su propio mensaje.

**Independent Test**: "Renovar mi firma" abre el modal con "Renovación de Firma Electrónica"
(quickstart §9.3).

- [X] T073 [P] [US8] Agregar a `tests/description.test.js` que la clave `renovacion` devuelve `Renovación de Firma Electrónica`, y a `tests/html.test.js` que `renovacion` es una clave válida de `data-open-advisor`
- [X] T074 [US8] En `script.js`, agregar la clave `renovacion` a `buildProductDescription` (data-model.md → "Descripción del producto")
- [X] T075 [US8] En `index.html`, agregar el botón "Renovar mi firma" (`data-open-advisor="renovacion"`) en la cabecera de `#firma-electronica`. Si `#preguntas` existe (US2), agregar el mismo botón en la respuesta "¿Cómo se renueva?" (FR-028)
- [X] T076 [US8] Regenerar `tailwind.css` y ejecutar `node --test` sobre `tests/`

**Checkpoint**: US8 funciona sola.

---

## Phase 11: User Story 9 - Navegar cómodo en móvil y con tecnologías de apoyo (Priority: P3)

**Goal**: secciones visibles bajo la cabecera, menú y selector accesibles, sin movimiento forzado
y con texto legible.

**Independent Test**: quickstart §10 en 375 px y en escritorio, con lector de pantalla.

### Tests for User Story 9

- [X] T077 [P] [US9] Agregar a `tests/html.test.js`:
  - la invariante 7 (sin `text-[10px]` ni `text-[11px]` en los `.html` ni en `script.js`);
  - la 11 (`#mobile-menu-btn` con `aria-controls="mobile-menu"` y `aria-expanded`; `#btn-natural` y `#btn-juridica` con `aria-pressed`);
  - cada `section[id]` con `scroll-mt-28`;
  - ningún `<h3>` antes del primer `<h2>` en `index.html`

### Implementation for User Story 9

- [X] T078 [US9] En `index.html`, agregar `scroll-mt-28` a cada `section[id]` (FR-029)
- [X] T079 [US9] En `index.html`, agregar `aria-controls="mobile-menu" aria-expanded="false"` a `#mobile-menu-btn`. En `script.js`:
  - el clic alterna `hidden` y `aria-expanded`;
  - un clic en cualquier enlace dentro de `#mobile-menu` lo cierra;
  - Escape lo cierra si está abierto y el modal no (FR-030)
- [X] T080 [US9] En `index.html`, agregar `aria-pressed` inicial (`true` en Natural, `false` en Jurídica) y hacer que `setTaxpayerType` en `script.js` lo actualice (FR-031)
- [X] T081 [US9] En `index.html`, cambiar el `<h3>` "Certificado Digital P12" del hero por `<p>` con las mismas clases y revisar que no haya saltos de nivel en toda la página (FR-033)
- [X] T082 [P] [US9] En `styles.css`, agregar `@media (prefers-reduced-motion: reduce) { .animate-pulse-gold { animation: none; } }` (FR-032)
- [X] T083 [US9] Sustituir `text-[10px]` y `text-[11px]` por `text-xs` en `index.html` y en las plantillas de `script.js` (FR-033)
- [X] T084 [US9] Regenerar `tailwind.css`, ejecutar `node --test` y validar `quickstart.md` §10 con lector de pantalla

**Checkpoint**: US9 funciona sola.

---

## Phase 12: User Story 10 - Página lista para producción y medible (Priority: P3)

**Goal**: medición sin cookies y año automático. La base de producción ya quedó hecha en la
Phase 1.

**Independent Test**: quickstart §2 y §11. En `localhost` no se envía nada; en el dominio público,
los eventos llegan a Umami.

- [X] T085 [US10] Verificar en docs.umami.is ("Sending stats") la URL del endpoint de Cloud, la forma del cuerpo y el límite mensual del plan Hobby. Si algo difiere, corregir primero contracts/analytics-events.md y `data-model.md → Medición.endpoint` (research R3)

### Tests for User Story 10

- [X] T086 [P] [US10] Crear `tests/analytics.test.js`:
  - `shouldTrack` en las 4 combinaciones de las condiciones del contrato (sin `websiteId`, otro host, `doNotTrack === '1'`, todo correcto);
  - `buildAnalyticsPayload` para `pageview` (sin `name`) y para `abrir-contacto`;
  - `url` es solo `pathname`, sin consulta ni fragmento;
  - `buildEventOrigin` (`firma:2` → `firma:1 AÑO`, `comprobantes:0` + natural → `comprobantes:50:natural`)
- [X] T087 [P] [US10] Agregar a `tests/format.test.js` los casos de `getEcuadorYear` (31 dic. 23:00 en Ecuador = 1 ene. 04:00 UTC → año anterior)

### Implementation for User Story 10

- [X] T088 [US10] En `script.js`, agregar las funciones puras `shouldTrack(medicion, entorno)`, `buildAnalyticsPayload(tipo, nombre, datos, entorno)` y `buildEventOrigin(clave, tipoContribuyente)` según contracts/analytics-events.md, basadas en `data-model.md → Medición.websiteId`, `Medición.endpoint` y `Medición.dominio`
- [X] T089 [US10] En `script.js`, agregar `trackEvent(nombre, datos)`:
  - arma el entorno desde `location`, `document` y `navigator`;
  - envía con `fetch(medicion.endpoint, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body })` y `.catch(() => {})`;
  - no hace nada si `shouldTrack` es falso.

  Enviar el `pageview` en el arranque y los eventos `abrir-contacto`, `elegir-asesor`, `contacto-directo` y `ver-promocion` del catálogo desde `handleDocumentClick`/`openAdvisorModal`, sin retrasar la apertura de WhatsApp (FR-037, FR-037a)
- [X] T090 [US10] Agregar el origen del endpoint de Umami a `connect-src` de la CSP en `index.html`, `privacidad.html` y `terminos.html`, y ampliar la invariante 12 de `tests/html.test.js` para comprobarlo
- [X] T091 [US10] En `script.js`, agregar la función pura `getEcuadorYear(ahora)` y rellenar `[data-anio]` en el arranque. En el footer de `index.html`, `privacidad.html` y `terminos.html`, sustituir `2026` por `<span data-anio></span>` (FR-036)
- [X] T092 [US10] En `privacidad.html`, agregar el apartado de medición de uso: Umami, sin cookies, sin identificar al visitante, qué eventos se cuentan y que respeta "No rastrear" (FR-014)
- [X] T093 [US10] Ejecutar `node --test` y validar `quickstart.md` §2 (sin peticiones a Umami en `localhost`). Tras publicar, validar §11

**Checkpoint**: todas las historias están completas.

---

## Phase 13: Polish & Cross-Cutting Concerns

- [X] T094 [P] Actualizar `README.md`:
  - comando para regenerar estilos;
  - tabla "Quiero cambiar…" con `horario`, `entrega`, `legal`, `variantes` y `medicion`;
  - cómo completar los pendientes (`todo`) de `node --test`;
  - funciones de consola `applyPromotions(…)` y `renderAttentionStatus(…)`
- [X] T095 Validar `index.html`, `privacidad.html` y `terminos.html` en el validador W3C con 0 errores (Principio IV; quickstart §10.6)
- [ ] T096 Ejecutar quickstart.md de punta a punta y la verificación manual del Principio IV (pasos 1–5), incluida la medición Lighthouse de quickstart.md §2.3 (SC-007: LCP < 3 s en móvil "Slow 4G"); tomar capturas en 375 px y 1280 px para el PR. **Avance 2026-11-26**: medición Lighthouse hecha por el responsable; Firefox confirmado por el responsable; pendiente la prueba manual en Safari (incluido iOS) y con lector de pantalla
- [X] T097 Ejecutar `node --test` (0 fail), copiar al PR la lista de `todo` de `tests/publicacion.test.js` como checklist de datos que debe entregar el responsable (research R14) y, cuando estén todos, confirmar que `PUBLICAR=1 node --test` termina con 0 fail
- [X] T098 Abrir el PR desde `002-page-gap-improvements`, siguiendo `specs/002-page-gap-improvements/quickstart.md`, con:
  - descripción del cambio y resultado de la verificación del Principio IV;
  - capturas;
  - **confirmación explícita del responsable** de cada texto comercial, legal o de servicio nuevo (FR-038).

  No publicar hasta que `PUBLICAR=1 node --test` termine con 0 fail
- [ ] T099 Tras publicar en el dominio real: validar `quickstart.md` §5 (vista previa en WhatsApp y Facebook, icono, resultados enriquecidos; SC-003) y §11 (eventos en Umami, sin cookies; SC-009), y registrar el resultado en el PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; empieza ya.
- **Foundational (Phase 2)**: depende de Setup y bloquea todas las historias.
- **Historias (Phase 3–12)**: dependen de Foundational. Luego se hacen en orden de prioridad
  (P1 → P2 → P3) o en paralelo.
- **Polish (Phase 13)**: cuando estén las historias que se vayan a entregar.

### User Story Dependencies

| Historia | Depende de | Nota |
|----------|-----------|------|
| US1 (P1) | Foundational | independiente |
| US2 (P1) | Foundational | independiente; usa `data-entrega` si US1 ya está, si no omite esa referencia |
| US3 (P1) | Foundational (horario, `medicion.dominio`) | `buildStructuredData` incluye `legalName`/`taxID` solo si US4 ya agregó `legal` |
| US4 (P1) | Foundational | independiente |
| US5 (P2) | Foundational (`anios`) | independiente |
| US6 (P2) | Foundational (`anios`) | comparte `renderFirmaCards` con US5: si se hacen en paralelo, integrar T056 y T061 con cuidado |
| US7 (P2) | Foundational (horario) | independiente |
| US8 (P2) | Foundational | T075 agrega el botón a `#preguntas` solo si US2 existe |
| US9 (P3) | Foundational | conviene hacerla después de las historias que agregan secciones, para cubrirlas todas |
| US10 (P3) | Setup (CSP), Foundational (`medicion`) | T090 y T092 tocan las páginas legales de US4; si US4 no existe, se limitan a `index.html` |

### Within Each User Story

- Las pruebas se escriben primero y deben fallar.
- Orden: datos (`siteData`) → funciones puras → DOM/HTML → regenerar estilos → validación.
- Las tareas que tocan `script.js` o `index.html` dentro de una historia van en secuencia (mismo
  archivo).

### Parallel Opportunities

- Setup: T003 y T008 en paralelo con T002/T004.
- Foundational: T012, T013 y T015 en paralelo.
- Las pruebas marcadas [P] de cada historia se escriben en paralelo entre sí.
- US3: los recursos gráficos T034–T036 en paralelo entre sí y con las pruebas.
- US4: `privacidad.html` (T044) y `terminos.html` (T045) en paralelo.
- Entre historias: US1, US2, US3 y US4 tocan zonas distintas de `index.html` y pueden ir en
  paralelo con integración cuidadosa del mismo archivo. US5 y US6 comparten `renderFirmaCards`.

---

## Parallel Example: User Story 3

```bash
# Pruebas de US3 juntas:
Task: "Crear tests/structured-data.test.js según contracts/page-metadata.md"
Task: "Crear tests/metadata.test.js según contracts/page-metadata.md"

# Recursos gráficos de US3 juntos:
Task: "Crear favicon.svg desde el logo de index.html"
Task: "Crear apple-touch-icon.png 180×180 desde favicon.svg"
Task: "Crear img/og-tari.jpg 1200×630 < 300 KB"
```

## Parallel Example: User Story 7

```bash
Task: "Crear tests/attention.test.js con la tabla de quickstart §9"
Task: "Crear tests/advisor.test.js con muestra determinista"
Task: "Actualizar tests/whatsapp.test.js según contracts/whatsapp-links.md"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup) y Phase 2 (Foundational).
2. Phase 3 (US1): proceso, requisitos por caso, aviso de "solo personas naturales" y condición
   de entrega.
3. **Validar** con quickstart §3 y publicar si el responsable confirmó los textos y la hora límite.

### Incremental Delivery

1. Setup + Foundational: página igual, sin advertencias y con datos listos.
2. US1 → US2 → US3 → US4 (todas P1): cada una se valida y se puede publicar. Con las cuatro, la
   página cubre proceso, dudas, presentación y confianza.
3. US5 → US6 → US7 → US8 (P2): conversión y fricción.
4. US9 → US10 (P3): pulido y medición.
5. Cada entrega pasa `node --test` sin `fail`. **Publicar en producción exige 0 `todo`.**

### Parallel Team Strategy

Tras Foundational: una persona en US1 + US2 (contenido de `index.html`), otra en US3 + US4
(`<head>`, recursos y páginas legales) y otra en US5 + US6 (lógica de `script.js`). Integrar
`index.html` con commits pequeños.

---

## Notes

- [P] = otro archivo y sin dependencias pendientes.
- Commits con Conventional Commits (`feat:`, `test:`, `style:`, `docs:`, `chore:`), uno por tarea
  o grupo lógico.
- Los textos de borrador (preguntas, requisitos de empresa, tipos de comprobante, privacidad,
  términos) no se publican sin la confirmación del responsable (FR-038).
- Evitar: tareas vagas, conflictos en el mismo archivo sin coordinar, y dependencias entre
  historias que rompan su independencia.

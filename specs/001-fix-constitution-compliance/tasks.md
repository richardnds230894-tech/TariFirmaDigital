---

description: "Task list for 001-fix-constitution-compliance"
---

# Tasks: Corregir incumplimientos de la constitución

**Input**: Design documents from `/specs/001-fix-constitution-compliance/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: se incluyen. El Principio IV de la constitución exige pruebas automatizadas para la
lógica nueva de cálculo y transformación, y el plan fija `node --test tests/`. Cada prueba se
escribe antes que su implementación y debe fallar primero.

**Organization**: tareas agrupadas por historia de usuario (spec.md US1–US6).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo, sin dependencias pendientes)
- **[Story]**: historia de usuario a la que pertenece (US1…US6)

## Path Conventions

Sitio estático en la raíz del repositorio: `index.html`, `script.js`, `styles.css` (sin
cambios), `.gitignore` (nuevo) y `tests/` (nuevo, solo desarrollo). Ver plan.md → Project
Structure.

**Nota sobre paralelismo**: casi todas las tareas tocan `index.html` o `script.js`, así que
dentro de cada historia las tareas de implementación son secuenciales. El paralelismo real está
en las pruebas (archivos separados en `tests/`) y en US3 (`.gitignore`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: línea base visual y carpeta de pruebas

- [ ] T001 Capturar la línea base visual del sitio actual (antes de cualquier cambio) en 375 px y 1024 px: sección principal, promoción, catálogo de firma, comprobantes en Natural y en Jurídica, requisitos, pie y modal abierto. Guardar las capturas en `specs/001-fix-constitution-compliance/baseline/` para comparar después (FR-021)
- [ ] T002 [P] Crear `tests/load.test.js`: prueba de humo con `node:test` y `node:assert/strict` que haga `require('../script.js')` y compruebe que carga en Node sin lanzar errores y exporta un objeto. Ejecutar `node --test tests/` y confirmar que FALLA (hoy `script.js` usa `window` al cargar)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: estructura de `script.js`, fuente única de datos y utilidades compartidas

**⚠️ CRITICAL**: ninguna historia puede empezar hasta terminar esta fase

- [ ] T003 Reorganizar `script.js` en las secciones del plan.md (1. DATOS DEL NEGOCIO, 2. Funciones puras, 3. Renderizado y DOM, 4. Arranque, 5. Exportación), con un comentario de cabecera por sección. Envolver el registro de `DOMContentLoaded` en `if (typeof window !== 'undefined')` y añadir al final `if (typeof module !== 'undefined' && module.exports) { module.exports = { … } }`. Debe seguir siendo un script clásico, no un módulo ES (research.md R2). T002 debe pasar
- [ ] T004 Definir en la sección DATOS DEL NEGOCIO de `script.js` un único objeto `siteData` con `asesores`, `negocio`, `firmaPlans`, `comprobantesPlans` y `promociones`, según data-model.md: Asesor.id, Asesor.nombre, Asesor.whatsapp; Datos del negocio.nombre, Datos del negocio.facebookUrl, Datos del negocio.horario.semana, Datos del negocio.horario.sabado, Datos del negocio.mensajes.info, Datos del negocio.mensajes.ayuda, Datos del negocio.mensajes.producto; Plan de Firma Electrónica.duracion, Plan de Firma Electrónica.precio, Plan de Firma Electrónica.etiqueta, Plan de Firma Electrónica.popular; Plan de Comprobantes.cantidad, Plan de Comprobantes.precioNatural, Plan de Comprobantes.precioJuridica, Plan de Comprobantes.descripcion; Promoción.id, Promoción.titulo, Promoción.precio, Promoción.inicio, Promoción.fin. Los precios pasan de cadenas a números (`"15,00"` → `15.00`); ningún valor comercial cambia. Eliminar los arreglos `firmaPlans` y `comprobantesPlans` antiguos. Exportar `siteData`
- [ ] T005 [P] Crear `tests/format.test.js` con pruebas que fallen para `formatPrice` (`14.99` → `"14,99"`, `15` → `"15,00"`, `8.5` → `"8,50"`) y `escapeHtml` (`<`, `>`, `&`, `"`, `'` escapados; texto normal sin cambios)
- [ ] T006 [P] Crear `tests/data.test.js` que valide `siteData` contra las reglas de data-model.md: Asesor.whatsapp (12 dígitos, empieza por `593`), Asesor.id único, Plan de Firma Electrónica.precio > 0 con 2 decimales como máximo, Plan de Firma Electrónica.popular en `true` como máximo en un plan, Plan de Comprobantes.precioNatural y Plan de Comprobantes.precioJuridica > 0, Promoción.inicio ≤ Promoción.fin en formato `AAAA-MM-DD`, Datos del negocio.facebookUrl empieza por `https://`, y que los valores sean exactamente los listados en data-model.md
- [ ] T007 Implementar en `script.js` (sección 2) `formatPrice(n)` como `n.toFixed(2).replace('.', ',')` (research.md R3) y `escapeHtml(texto)`, con JSDoc en español. Exportarlas. T005 y T006 deben pasar
- [ ] T008 Actualizar `renderFirmaCards` y `renderComprobantesCards` en `script.js` para que lean `siteData.firmaPlans` / `siteData.comprobantesPlans` y muestren los precios con `formatPrice`. Abrir `index.html`: las tarjetas se ven igual que en la línea base de T001

**Checkpoint**: `node --test tests/` pasa, el sitio se ve igual y todos los datos viven en `siteData`

---

## Phase 3: User Story 1 - Precios coherentes en todo el sitio (Priority: P1) 🎯 MVP

**Goal**: tarjeta, modal y mensaje de WhatsApp muestran el mismo plan y precio, todo en formato `$NN,NN` con IVA, generado desde un solo dato

**Independent Test**: recorrer las 7 tarjetas de firma, las 12 combinaciones de comprobantes (6 Natural + 6 Jurídica) y la promoción; el texto del modal debe coincidir carácter por carácter con la tabla "Descripción del producto" de data-model.md

### Tests for User Story 1 ⚠️

- [ ] T009 [P] [US1] Crear `tests/description.test.js` con pruebas que fallen para `buildProductDescription(clave, tipoContribuyente)` usando los ejemplos de data-model.md → Descripción del producto: `firma:2`, `comprobantes:0` con `natural` y con `juridica`, y `promo:firma-2-anios-nov-2026` (debe dar `$14,99`). Incluir una prueba que recorra todos los planes y compruebe que la descripción contiene `formatPrice` del precio del plan

### Implementation for User Story 1

- [ ] T010 [US1] Implementar `buildProductDescription(clave, tipoContribuyente)` en `script.js` (sección 2) para las claves `firma:<i>`, `comprobantes:<i>` y `promo:<id>`, a partir de Plan de Firma Electrónica.duracion, Plan de Firma Electrónica.precio, Plan de Comprobantes.cantidad, Plan de Comprobantes.precioNatural, Plan de Comprobantes.precioJuridica, Promoción.titulo, Promoción.precio, Promoción.inicio y Promoción.fin (data-model.md). Para la promoción, generar el rango corto `9 al 30 Nov` desde Promoción.inicio y Promoción.fin con un helper `formatShortDateRange`. Exportar ambas. T009 debe pasar
- [ ] T011 [US1] En `script.js`, cambiar las plantillas de `renderFirmaCards` y `renderComprobantesCards`: el botón deja de llevar `onclick` y pasa a llevar `data-plan="firma:<i>"` o `data-plan="comprobantes:<i>"` (contracts/dom-hooks.md). El precio visible de la tarjeta usa el mismo `formatPrice` que la descripción
- [ ] T012 [US1] En `script.js` (sección 3), crear un único listener de clic delegado en `document` que resuelva `[data-plan]` y `[data-open-advisor]` (con `closest`), obtenga el texto con `buildProductDescription` y el tipo de contribuyente actual, y llame a `openAdvisorModal` (research.md R5)
- [ ] T013 [US1] En `index.html`, sección PROMOCIONES: reemplazar el precio literal `14.99` por un `<span data-promo-precio="firma-2-anios-nov-2026">` vacío, y cambiar el botón "¡Aprovechar Promoción!" a `data-open-advisor="promo:firma-2-anios-nov-2026"` sin `onclick`. En `script.js`, rellenar los `[data-promo-precio]` con `formatPrice(Promoción.precio)` al cargar (data-model.md Promoción.precio)
- [ ] T014 [US1] Revisar en `index.html` y `script.js` que todo precio visible lleve "IVA incluido" o "Incluye IVA" cerca (FR-003) y que no quede ningún precio literal en `index.html`
- [ ] T015 [US1] Verificar a mano según quickstart.md §3 punto 3: las 7 + 12 tarjetas y la promoción muestran `$NN,NN`, y el modal muestra el texto esperado en cada caso

**Checkpoint**: US1 funcional. Cambiar un precio en `siteData` cambia la tarjeta, el modal y el mensaje

---

## Phase 4: User Story 2 - Datos de contacto únicos y consistentes (Priority: P1)

**Goal**: números de WhatsApp, Facebook y horarios definidos una sola vez en `siteData` y mostrados con el mismo formato en todo el sitio

**Independent Test**: cambiar el número de `asesor1` en `siteData` y comprobar que la sección principal, el pie, el modal y todos los enlaces usan el nuevo (quickstart.md §5)

### Tests for User Story 2 ⚠️

- [ ] T016 [P] [US2] Crear `tests/whatsapp.test.js` con pruebas que fallen para `formatPhone` (`593960178652` → `+593 96 017 8652`, `593969790890` → `+593 96 979 0890`) y `buildWhatsAppUrl(asesorId, mensaje)` usando los tres ejemplos de la tabla de contracts/whatsapp-links.md
- [ ] T017 [P] [US2] Crear `tests/html.test.js` (lee `index.html` con `fs`) con las invariantes 2, 3 y 5 de contracts/dom-hooks.md: sin `wa.me/`, sin `960178652`/`969790890` en ningún formato (con o sin espacios ni prefijo) y sin la URL de Facebook; todo `data-whatsapp` y `data-phone` apunta a un Asesor.id de `siteData` (data-model.md Asesor.id); y existe un `<noscript>`. Además, todo `<a target="_blank">` lleva `rel="noopener noreferrer"`

### Implementation for User Story 2

- [ ] T018 [US2] Implementar en `script.js` (sección 2) `formatPhone(whatsapp)` (grupos 3-2-3-4, research.md R4) y `buildWhatsAppUrl(asesorId, mensaje)` según contracts/whatsapp-links.md, más un helper `fillTemplate(plantilla, valores)` que sustituya `{negocio}`, `{asesor}` y `{producto}` en Datos del negocio.mensajes.info, Datos del negocio.mensajes.ayuda y Datos del negocio.mensajes.producto (data-model.md). Exportarlas. T016 debe pasar
- [ ] T019 [US2] Reescribir `openAdvisorModal` en `script.js` para que arme los enlaces de `#link-asesor-1` y `#link-asesor-2` con `buildWhatsAppUrl` y la plantilla Datos del negocio.mensajes.producto, tomando número y nombre de Asesor.whatsapp y Asesor.nombre (data-model.md). Sin números literales en el código
- [ ] T020 [US2] Implementar en `script.js` (sección 3) `hydrateContactData()`, llamada al cargar, que rellene `[data-whatsapp]` (+ `data-mensaje`, por defecto `info`) → `href`; `[data-phone]` → `textContent` con `formatPhone`; `[data-facebook]` → `href` con Datos del negocio.facebookUrl; y `[data-horario]` → `textContent` con Datos del negocio.horario.semana y Datos del negocio.horario.sabado (data-model.md, contracts/dom-hooks.md)
- [ ] T021 [US2] En `index.html`, sección principal (botones Asesor 1 / Asesor 2): quitar los `href` de `wa.me`, añadir `data-whatsapp="asesor1|asesor2"` y `data-mensaje="info"`, y cambiar los números visibles `0960178652` / `0969790890` por `<span data-phone="…">` (FR-006: pasan a formato `+593 …`)
- [ ] T022 [US2] En `index.html`, pie de página (Líneas Directas WhatsApp) y modal (`#link-asesor-1`, `#link-asesor-2`): quitar los `href` y números literales, y usar `data-whatsapp` + `data-mensaje="ayuda"` en el pie y `data-phone` en ambos lugares. Los `href="#"` del modal se mantienen; los rellena `openAdvisorModal`
- [ ] T023 [US2] En `index.html`, sustituir las 5 URLs literales de Facebook (barra superior, menú móvil, tarjeta de la sección principal, pie y botón flotante) por `href="#"` + `data-facebook`, conservando `target="_blank"` y `rel="noopener noreferrer"`
- [ ] T024 [US2] En `index.html`, sustituir los horarios literales de la barra superior y del pie por `<strong data-horario="semana">` / `<strong data-horario="sabado">` (o `<span>`, según el elemento actual), sin cambiar las clases
- [ ] T025 [US2] Añadir en `index.html`, justo después de `<body>`, un `<noscript>` con un aviso visible, con las clases de marca, que pida activar JavaScript para ver los planes y contactar a un asesor (FR-008). Sin números ni enlaces de contacto
- [ ] T026 [US2] Ejecutar `node --test tests/` (T017 debe pasar) y verificar a mano quickstart.md §3 punto 4 y §5

**Checkpoint**: US1 y US2 funcionan. `index.html` no contiene números ni URLs de contacto

---

## Phase 5: User Story 3 - Repositorio protegido frente a archivos sensibles (Priority: P1)

**Goal**: git ignora certificados, claves, archivos de entorno, documentos de clientes y archivos del SO/editor

**Independent Test**: quickstart.md §2: crear archivos de muestra y comprobar que `git status --short` no los lista

### Implementation for User Story 3

- [ ] T027 [P] [US3] Crear `.gitignore` en la raíz según research.md R9, agrupado y comentado en español: certificados y claves (`*.[pP]12`, `*.[pP][fF][xX]`, `*.[kK][eE][yY]`, `*.[pP][eE][mM]`, `*.[cC][rR][tT]`, `*.[cC][eE][rR]`); entorno (`.env`, `.env.*`, `!.env.example`); documentos de clientes (`documentos-clientes/`); SO/editor (`Thumbs.db`, `Desktop.ini`, `.DS_Store`, `.vscode/`, `.idea/`, `*.swp`); y `.claude/settings.local.json`. No tocar `.specify/.gitignore`
- [ ] T028 [US3] Ejecutar quickstart.md §2: crear los archivos de muestra (incluidos `PRUEBA.PFX` y `documentos-clientes/cedula.jpg`), confirmar que `git status --short` no los muestra y borrarlos. Repetir el escaneo del historial (FR-011) y confirmar que no hay resultados; si los hubiera, detenerse e informar al responsable

**Checkpoint**: US3 completa. Es independiente de las demás historias y puede hacerse primero

---

## Phase 6: User Story 4 - Botones de compra robustos y seguros (Priority: P2)

**Goal**: ningún botón usa `onclick`; los textos con apóstrofes, comillas o `<`, `>` y `&` se muestran íntegros como texto literal

**Independent Test**: quickstart.md §3 punto 6: añadir desde la consola un plan con `'` y `"` en el nombre, volver a renderizar y abrir su modal

### Tests for User Story 4 ⚠️

- [ ] T029 [P] [US4] Añadir a `tests/description.test.js` pruebas que fallen para las claves `general`, `flotante` y `banco` (textos de data-model.md → Descripción del producto) y para un plan de firma de prueba con `duracion` `1 AÑO 'Tari's' "especial"`, cuya descripción debe conservar todos los caracteres
- [ ] T030 [US4] Añadir a `tests/html.test.js` la invariante 1 de contracts/dom-hooks.md (no aparece `onclick=` en `index.html`) y comprobar que todo `data-open-advisor` del HTML es una clave válida (`general`, `flotante`, `banco`, `promo:<Promoción.id>` según data-model.md Promoción.id). Añadir a `tests/load.test.js` una lectura de `script.js` como texto que verifique que no contiene `onclick`

### Implementation for User Story 4

- [ ] T031 [US4] Extender `buildProductDescription` en `script.js` con las claves `general`, `flotante` y `banco`, usando Datos del negocio.nombre (data-model.md). T029 debe pasar
- [ ] T032 [US4] En `index.html`, reemplazar los `onclick` del botón "Contáctanos" (`data-open-advisor="general"`), del botón flotante de WhatsApp (`flotante`) y del botón "Solicitar número de cuenta" (`banco`)
- [ ] T033 [US4] En `index.html`, reemplazar el `onclick` de `#btn-natural` y `#btn-juridica` por `data-taxpayer="natural|juridica"`, y en `script.js` atender `[data-taxpayer]` dentro del listener delegado de T012, que llama a `setTaxpayerType`
- [ ] T034 [US4] En `index.html`, reemplazar el `onclick` del botón X del modal por `data-modal-close` y quitar los `onclick` de `#link-asesor-1` y `#link-asesor-2`. En `script.js`, el listener delegado cierra el modal al pulsar `[data-modal-close]` o un enlace de asesor (sin `preventDefault`, para que se abra WhatsApp)
- [ ] T035 [US4] En `script.js`, pasar por `escapeHtml` cada valor interpolado en las plantillas de `renderFirmaCards` y `renderComprobantesCards` (research.md R6) y confirmar que `openAdvisorModal` sigue usando `textContent`. T030 debe pasar
- [ ] T036 [US4] Verificar a mano quickstart.md §3 punto 6 y que todos los botones (cabecera, flotante, banco, selector Natural/Jurídica, tarjetas, promoción, X del modal) siguen funcionando

**Checkpoint**: no queda ningún `onclick` en el proyecto. US1–US4 funcionan

---

## Phase 7: User Story 5 - Modal accesible con teclado (Priority: P2)

**Goal**: el modal es un diálogo accesible: foco dentro al abrir, Tab atrapado, Escape cierra y el foco vuelve al disparador

**Independent Test**: quickstart.md §3 punto 5, usando solo el teclado

### Tests for User Story 5 ⚠️

- [ ] T037 [P] [US5] Añadir a `tests/html.test.js` una prueba que falle y que verifique que `#advisor-modal` tiene `role="dialog"`, `aria-modal="true"` y `aria-labelledby="advisor-modal-title"`, y que existe un elemento con `id="advisor-modal-title"` (contracts/dom-hooks.md → Atributos del modal)

### Implementation for User Story 5

- [ ] T038 [US5] En `index.html`, añadir a `#advisor-modal` los atributos `role="dialog"`, `aria-modal="true"` y `aria-labelledby="advisor-modal-title"`, y poner `id="advisor-modal-title"` en el `<h3>` "Elige tu Asesor en Línea". T037 debe pasar
- [ ] T039 [US5] En `script.js`, `openAdvisorModal` guarda `document.activeElement` como disparador y mueve el foco a `#link-asesor-1`. `closeAdvisorModal` devuelve el foco al disparador si sigue en el documento (research.md R7, FR-016)
- [ ] T040 [US5] En `script.js`, añadir un listener `keydown` activo solo con el modal abierto: Escape cierra (FR-015), y Tab / Shift+Tab hacen ciclo entre los elementos enfocables de `#advisor-modal` (X, Asesor 1, Asesor 2) sin salir del modal (FR-016)
- [ ] T041 [US5] Verificar a mano quickstart.md §3 punto 5 en Chrome y Firefox, y con el lector de pantalla del sistema (Narrador de Windows) que el modal se anuncia como diálogo con su título (FR-017)

**Checkpoint**: US5 completa; el modal se usa entero con teclado

---

## Phase 8: User Story 6 - Promociones que no se muestran vencidas (Priority: P2)

**Goal**: la promoción y sus enlaces de menú aparecen solo dentro de su vigencia en hora de Ecuador (UTC−5), y el texto de vigencia sale de los datos

**Independent Test**: quickstart.md §4: llamar a `applyPromotions` con fechas simuladas desde la consola

### Tests for User Story 6 ⚠️

- [ ] T042 [P] [US6] Crear `tests/promotions.test.js` con pruebas que fallen para `isPromotionActive(promo, ahora)` en los bordes de data-model.md → Promoción (Estados), usando Promoción.inicio y Promoción.fin: `2026-11-08T23:59:59-05:00` → false; `2026-11-09T00:00:00-05:00` → true; `2026-11-30T23:59:59-05:00` → true; `2026-12-01T00:00:00-05:00` → false; `2026-12-01T03:00:00Z` (aún 30 en Ecuador) → true. Incluir pruebas de `formatDateRange` (`2026-11-09`, `2026-11-30` → `Del 9 de noviembre al 30 de noviembre`)
- [ ] T043 [US6] Añadir a `tests/html.test.js` la invariante 4 de contracts/dom-hooks.md: `section#promociones` tiene `data-promo` y la clase `hidden`, y hay exactamente dos elementos `data-promo-link` (menú de escritorio y móvil), ambos con `hidden`

### Implementation for User Story 6

- [ ] T044 [US6] Implementar en `script.js` (sección 2) `getEcuadorDateString(ahora)`, `isPromotionActive(promo, ahora)` y `formatDateRange(inicio, fin)` con nombres de meses en español, según research.md R8 y data-model.md Promoción.inicio y Promoción.fin (el día de fin cuenta completo). Exportarlas. T042 debe pasar
- [ ] T045 [US6] En `index.html`: añadir `data-promo="firma-2-anios-nov-2026"` y la clase `hidden` a `<section id="promociones">`; añadir `data-promo-link="firma-2-anios-nov-2026"` y `hidden` a los dos enlaces "Promociones" del menú (escritorio y móvil); y sustituir el texto literal "Vigencia: Del 9 de noviembre al 30 de noviembre" por `Vigencia: <span data-promo-vigencia="firma-2-anios-nov-2026"></span>`. T043 debe pasar
- [ ] T046 [US6] Implementar en `script.js` (sección 3) la función global `applyPromotions(ahora = new Date())`, llamada al cargar: por cada Promoción (data-model.md Promoción.id) quita o pone la clase `hidden` en `[data-promo]` y `[data-promo-link]` según `isPromotionActive`, y rellena `[data-promo-vigencia]` con `formatDateRange`. Debe poder llamarse desde la consola (quickstart.md §4). Para el enlace de escritorio, comprobar que al quitar `hidden` se restaura `flex` y no se rompe su diseño (el enlace usa `flex items-center`)
- [ ] T047 [US6] Verificar a mano quickstart.md §4 con las cuatro llamadas de ejemplo en escritorio y móvil

**Checkpoint**: las 6 historias funcionan de forma independiente

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: calidad, documentación y validación final contra la constitución

- [ ] T048 [P] Revisar `script.js` según el Principio II: JSDoc en español en cada función, camelCase, verbo al inicio, 4 espacios, sin `var`, sin `console.log` y sin código muerto (incluidos restos de los arreglos y del `onclick` antiguos)
- [ ] T049 [P] Ampliar `README.md` con: dónde editar precios, asesores, horarios y promociones (`siteData` en `script.js`), cómo correr las pruebas (`node --test tests/`) y la carpeta `documentos-clientes/` ignorada por git
- [ ] T050 Ejecutar `node --test tests/` y confirmar que todas las pruebas pasan
- [ ] T051 Validar `index.html` en el validador W3C (https://validator.w3.org/#validate_by_input) y corregir los errores introducidos por esta feature
- [ ] T052 Comparar el sitio con las capturas de `specs/001-fix-constitution-compliance/baseline/` en 375 px y 1024 px (FR-021). Las únicas diferencias aceptadas son el formato `+593 …` en la sección principal, `$14,99` en la promoción y la promoción oculta fuera de vigencia
- [ ] T053 Ejecutar la verificación manual completa de quickstart.md §3 (puntos 1–7) y registrar el resultado en la descripción del PR, como exige la sección "Flujo de Desarrollo" de la constitución

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias. T001 debe hacerse antes de tocar cualquier archivo del sitio
- **Foundational (Phase 2)**: depende de Setup. Bloquea US1, US2, US4, US5 y US6
- **US3 (Phase 5)**: no depende de nada (solo `.gitignore`); puede hacerse en cualquier momento, incluso antes de Setup
- **US1 (Phase 3)**: depende de Foundational
- **US2 (Phase 4)**: depende de Foundational. Toca `openAdvisorModal`, que US1 no cambia; puede ir antes o después de US1
- **US4 (Phase 6)**: depende de US1 (amplía `buildProductDescription` y el listener delegado de T012)
- **US5 (Phase 7)**: depende de Foundational. Conviene hacerla después de US4 porque ambas tocan los manejadores del modal
- **US6 (Phase 8)**: depende de US1 (T013 crea el precio de la promoción y su botón)
- **Polish (Phase 9)**: depende de todas las historias

### User Story Dependencies

```text
US3 ─────────────────────────────────────────────┐
Setup → Foundational ─┬─ US1 ─┬─ US4 ── US5 ──────┼─→ Polish
                      │       └─ US6 ─────────────┤
                      └─ US2 ─────────────────────┘
```

### Within Each User Story

- Las pruebas se escriben primero y deben FALLAR antes de implementar
- Funciones puras (sección 2 de `script.js`) antes que DOM e HTML
- Cambios en `index.html` y su código en `script.js` en el mismo commit (Principio I)
- Verificación manual al cerrar cada historia

### Parallel Opportunities

- T002 en paralelo con T001
- T005 y T006 en paralelo entre sí (archivos de prueba distintos)
- T027 (US3) en paralelo con cualquier otra tarea
- La primera prueba de cada historia (T009, T016, T017, T042) en paralelo con trabajo de otras historias, porque son archivos nuevos en `tests/`
- T048 y T049 en paralelo
- Las tareas de implementación sobre `index.html` / `script.js` NO son paralelizables entre sí

---

## Parallel Example: User Story 2

```bash
# Pruebas de US2 a la vez (archivos distintos):
Task: "T016 Crear tests/whatsapp.test.js (formatPhone, buildWhatsAppUrl)"
Task: "T017 Crear tests/html.test.js (invariantes 2, 3 y 5)"

# Mientras tanto, otra persona puede cerrar US3:
Task: "T027 Crear .gitignore"
```

---

## Implementation Strategy

### MVP First

1. US3 (`.gitignore`): 2 tareas, sin riesgo, cubre lo NO NEGOCIABLE del Principio III
2. Setup + Foundational
3. US1 (precios)
4. **STOP and VALIDATE**: quickstart.md §1 y §3 punto 3
5. Commit / PR si se quiere entregar ya

### Incremental Delivery

1. US3 → commit
2. Setup + Foundational → commit (el sitio se ve igual)
3. US1 → validar → commit (MVP)
4. US2 → validar → commit
5. US4 → US5 → validar → commit
6. US6 → validar → commit. Hacerla antes del 2026-11-30 si se quiere que la promoción actual se oculte sola al vencer
7. Polish → PR

---

## Notes

- [P] = archivo distinto y sin dependencias pendientes
- Commits con Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`), uno por historia o grupo lógico
- Ningún valor comercial (precio, número, horario, texto legal) cambia en esta feature; si una tarea parece exigirlo, detenerse y consultar
- Fuera de alcance: la migración del CDN de Tailwind (spec.md → Clarifications)

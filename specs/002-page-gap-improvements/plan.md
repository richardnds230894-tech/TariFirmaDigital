# Implementation Plan: Cerrar huecos de la página para vender más y generar confianza

**Branch**: `002-page-gap-improvements` | **Date**: 2026-11-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-page-gap-improvements/spec.md`

## Summary

Cerrar los 17 huecos de la spec sin cambiar el modelo de negocio: la venta se sigue cerrando por
WhatsApp, sin backend ni carga de documentos. Hay tres tipos de cambio:

1. **Contenido estático nuevo** en el HTML:
   - "Cómo funciona";
   - requisitos por caso, con el aviso de que la firma es solo para personas naturales;
   - preguntas frecuentes con `<details>` nativo;
   - dos páginas legales, `privacidad.html` y `terminos.html`.
2. **Lógica nueva en `script.js`**, como funciones puras probadas con `node --test`:
   - variantes de promoción generadas desde los datos;
   - costo por año, ahorro y comprobantes por mes;
   - estado de atención en hora de Ecuador;
   - asesor sugerido al azar por visita y saludo sin "Asesor 1";
   - clave de renovación;
   - datos estructurados;
   - medición sin cookies enviada directamente a la API de Umami Cloud, sin script de terceros.
3. **Preparación para producción**:
   - Tailwind v3 precompilado y versionado, lo que quita la advertencia de consola;
   - Inter servida localmente y Font Awesome con SRI;
   - una CSP por `<meta>`;
   - metadatos para compartir, iconos y ajustes de accesibilidad.

Los datos que solo puede dar el responsable del negocio (RUC, entidad certificadora, dominio,
textos) quedan como `null`. Mientras tanto se ocultan en la página y aparecen como `todo` en las
pruebas. No se publica con pendientes (research R14).

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2015+ en script clásico (sin módulos ES), igual
que en 001.

**Primary Dependencies**:
- **En el sitio**: Font Awesome 6.5.1 (cdnjs, ahora con SRI) e Inter servida localmente
  (`fonts/`). Se quitan el Play CDN de Tailwind y Google Fonts.
- **Solo en desarrollo**: Tailwind CSS 3.4 vía `npx` (R1) y `node --test`.
- **Servicio externo nuevo**: la API de envío de Umami Cloud. Es una conexión, no un script
  (R3).

**Storage**: N/A. Los datos son estáticos en `script.js`. No se usan cookies ni almacenamiento
del navegador, y el asesor sugerido vive solo en memoria.

**Testing**: `node --test` (Node ≥ 18, probado con v24.21.0), 44 pruebas actuales en verde, más
la verificación manual de [quickstart.md](quickstart.md). Pruebas nuevas:
`attention.test.js`, `promotions.test.js` (ampliada), `choice.test.js`, `advisor.test.js`,
`analytics.test.js`, `structured-data.test.js`, `metadata.test.js`, `styles.test.js` y
`publicacion.test.js`.

**Target Platform**: las 2 últimas versiones de Chrome, Edge, Firefox y Safari (incluido iOS).
Se abre por `file://` o en cualquier hosting estático.

**Project Type**: sitio web estático: una página de venta y dos páginas legales.

**Performance Goals**: SC-007, con contenido visible y con estilo en menos de 3 s en 4G típica.
- Se eliminan unos 300 KB de JavaScript de compilación de Tailwind y 2 conexiones a Google.
- `tailwind.css` minificado: unos 25–35 KB sin comprimir.
- Inter woff2 variable latina: unos 100 KB, con `font-display: swap`.

**Constraints**:
- Sin paso de build para abrir o publicar. Regenerar el CSS solo hace falta al agregar clases.
- Sin cookies ni datos personales.
- Ningún texto comercial, legal o de servicio se publica sin confirmación del responsable
  (FR-038).
- Los valores comerciales actuales (precios, números, horarios) no cambian.

**Scale/Scope**:
- 3 páginas HTML;
- 7 planes de firma, 6 de comprobantes, 1 promoción con 3 variantes y 2 asesores;
- 39 FR + 2 subrequisitos (FR-002a, FR-037a) y 10 historias.

Ninguna incógnita técnica queda abierta. Los datos del negocio pendientes están en research R14 y
no bloquean el diseño.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / regla | Antes del diseño | Tras el diseño |
|-------------------|------------------|----------------|
| I. Sitio estático, sin build obligatorio, abrible por `file://` | ⚠️ precompilar Tailwind podría parecer un build | ✅ el CSS generado se versiona; abrir y publicar no requiere compilar; lo permite expresamente "Restricciones → Producción" (R1) |
| I. Estructura raíz; archivos nuevos justificados | ⚠️ varios archivos nuevos | ✅ cada uno justificado en Project Structure |
| I. Solo Tailwind, Inter y Font Awesome; sin framework, backend ni empaquetador | ✅ | ✅ Inter pasa de Google a local (misma fuente); Tailwind CLI genera CSS y no empaqueta código; Umami es una conexión de medición, no un framework ni un backend propio (R3) |
| I. IDs y anclas existentes se conservan | ✅ | ✅ todos se conservan; `data-promo`/`data-promo-link` se migran a `data-promo-any` en el mismo cambio ([dom-hooks](contracts/dom-hooks.md)) |
| II. Español, camelCase, verbos, JSDoc, 4 espacios, sin `var`/`console.log`/estilos en línea | ✅ | ✅ aplica a todas las funciones nuevas; el banner de promoción generado usa clases, no `style` |
| II. Catálogo, contacto y horario en un solo lugar | ✅ desde 001 | ✅ variantes, horario estructurado, entrega, datos legales y medición en `siteData`; el JSON-LD se genera desde ahí; la única repetición (dominio en `<head>`) la vigila una prueba (R10) |
| II. Lógica separada del DOM en funciones puras | ✅ | ✅ 17 funciones puras nuevas (ver Source Code) |
| III. No recolectar ni transmitir documentos personales | ✅ | ✅ sin formularios ni carga de archivos (FR-016); la medición excluye datos personales ([analytics-events](contracts/analytics-events.md)) |
| III. `innerHTML` solo con datos estáticos y escapados; `addEventListener` + `data-*` | ✅ | ✅ el banner de promoción usa `escapeHtml` como las tarjetas; JSON-LD por `textContent` |
| III. Mensajes de WhatsApp con `encodeURIComponent` y sin datos del visitante | ✅ | ✅ [whatsapp-links](contracts/whatsapp-links.md); no se añade referencia de medición al mensaje |
| III. Scripts de terceros justificados, con versión fija y SRI | ✅ no se añade ninguno | ✅ la medición no carga script (R3); Font Awesome gana SRI (R2) |
| III. CSP cuando el hosting lo permita (SHOULD) | ❌ no existe | ✅ `<meta>` CSP en cada página (R13) |
| III. Sin números de cuenta ni pagos con tarjeta | ✅ | ✅ sin cambios |
| IV. Paso 1: consola sin errores ni advertencias | ❌ advertencia del Play CDN | ✅ R1 |
| IV. Lógica de cálculo con pruebas automatizadas | ✅ | ✅ 9 archivos de prueba nuevos o ampliados |
| IV. Marcado válido W3C | ✅ | ✅ paso 10.6 del quickstart, en las 3 páginas |
| V. Precio con IVA y formato único | ⚠️ el texto de la promoción usa "a $14,99" sin "inc. IVA" | ✅ sufijo `- Valor: $NN,NN inc. IVA` (data-model) |
| V. Tarjeta = modal = mensaje desde un dato | ⚠️ 2 variantes anunciadas sin dato ni botón | ✅ variantes en los datos (R6) |
| V. Promociones con vigencia y retiro automático | ✅ | ✅ se mantiene y se generaliza a N promociones |
| V. Afirmaciones legales y de servicio confirmadas | ❌ "mismo día" sin condición; entidad sin nombrar | ✅ condición desde los datos; textos nuevos condicionados a confirmación (FR-038); pendientes como `todo` (R14) |
| Restricciones: accesibilidad | ⚠️ menú, selector, títulos, movimiento, texto de 10 px | ✅ R12 |
| Restricciones: imágenes WebP/AVIF/SVG | — | ⚠️ 2 imágenes PNG/JPEG, ver Complexity Tracking |
| Restricciones: Play CDN de Tailwind en producción | ⚠️ deuda | ✅ resuelta (R1) |
| Flujo: rama, Conventional Commits, PR con capturas y confirmación de datos | ✅ | ✅ el PR MUST incluir la confirmación del responsable de cada dato de R14 |

**Enmienda 1.1.0** (2026-11-26, aprobada por el responsable tras `/speckit-analyze`): el
Principio I decía que los tokens `taris-*` viven en la configuración en línea de `index.html` y
"Stack" nombraba Google Fonts. Ahora ambos admiten Tailwind precompilado con `tailwind.config.js`
e Inter local. La primera tarea (T001) confirma que la enmienda está en la rama antes de mover
la configuración.

**Resultado**: el gate **pasa**. Los ❌ y ⚠️ previos son precisamente lo que corrige la feature.
Queda una sola desviación, en las imágenes, justificada abajo.

## Project Structure

### Documentation (this feature)

```text
specs/002-page-gap-improvements/
├── plan.md                    # Este archivo
├── research.md                # Fase 0: decisiones R1–R14
├── data-model.md              # Fase 1: cambios sobre el modelo de 001
├── quickstart.md              # Fase 1: guía de validación
├── contracts/
│   ├── dom-hooks.md           # Ganchos HTML ↔ script.js (versión 002)
│   ├── whatsapp-links.md      # Mensajes y claves nuevas
│   ├── analytics-events.md    # Interfaz saliente de medición
│   └── page-metadata.md       # <head>, vista previa y JSON-LD
├── checklists/
│   └── requirements.md
└── tasks.md                   # Fase 2 (/speckit-tasks; aún no existe)
```

### Source Code (repository root)

```text
index.html               # MODIFICADO
                         #   <head>: metadatos, iconos, CSP, tailwind.css, Font Awesome con SRI;
                         #     sin el Play CDN, la configuración en línea ni Google Fonts
                         #   secciones nuevas: #como-funciona, #preguntas
                         #   requisitos por caso, aviso de "solo personas naturales",
                         #     avisos data-taxpayer-note
                         #   #promociones con data-promo-any y #promociones-container vacío
                         #   footer: data-legal-group, enlaces legales, data-anio;
                         #     botón "Renovar mi firma"
                         #   accesibilidad: aria-*, scroll-mt-28, h3→p en el hero,
                         #     text-[10/11px]→text-xs
privacidad.html          # NUEVO: aviso de privacidad (LOPDP); cabecera simplificada (R11)
terminos.html            # NUEVO: términos (reembolso, comprobantes no usados) (R11)
script.js                # MODIFICADO; se conservan las secciones 1–5
                         #   1. DATOS: horario estructurado, entrega, legal, mensajes sin
                         #      {asesor}, anios, total, variantes de promoción, medicion
                         #   2. FUNCIONES PURAS NUEVAS: formatSchedule, getAttentionStatus,
                         #      formatAttentionStatus, formatDeliveryCondition,
                         #      calculateYearlyCost, calculateSavings, formatYearlyCostText,
                         #      formatVoucherLabel, calculateMonthlyVouchers,
                         #      getActivePromotions, getActiveVariants,
                         #      pickSuggestedAdvisor, buildStructuredData, shouldTrack,
                         #      buildAnalyticsPayload, buildEventOrigin, getEcuadorYear
                         #      (y buildProductDescription ampliada)
                         #   3. DOM: renderPromotions, renderAttentionStatus,
                         #      hydrateLegalData, renderStructuredData, trackEvent,
                         #      menú móvil accesible, aria-pressed, asesor sugerido en el modal
                         #   4. ARRANQUE: llamadas nuevas; tolera páginas sin contenedores
                         #   5. EXPORTACIÓN: las funciones puras nuevas
styles.css               # MODIFICADO: @media (prefers-reduced-motion) para .animate-pulse-gold;
                         #   el comentario de .aviso-sin-js se actualiza
tailwind.config.js       # NUEVO (solo desarrollo): configuración movida desde index.html (R1)
tailwind.input.css       # NUEVO (solo desarrollo): @tailwind base/components/utilities
                         #   + @font-face de Inter
tailwind.css             # NUEVO, GENERADO Y VERSIONADO: la hoja que cargan las páginas (R1)
fonts/
└── inter-latin-var.woff2  # NUEVO: Inter variable, subconjunto latino (R2)
img/
└── og-tari.jpg          # NUEVO: imagen para compartir, 1200×630, < 300 KB (R10)
favicon.svg              # NUEVO: sacado del logo SVG existente (R10)
apple-touch-icon.png     # NUEVO: 180×180 (R10)
README.md                # MODIFICADO: regenerar CSS, nuevos campos de siteData,
                         #   cómo completar los pendientes
tests/
├── html.test.js         # AMPLIADO: invariantes 4, 6, 7 y 9–12 en las 3 páginas
├── data.test.js         # AMPLIADO: anios ↔ duracion, total, variantes, horario,
                         #   valores actuales
├── description.test.js  # AMPLIADO: promo:<id>:<v>, renovacion, sufijo de IVA
├── whatsapp.test.js     # ACTUALIZADO: ejemplos de contracts/whatsapp-links.md
├── promotions.test.js   # AMPLIADO: getActiveVariants, precio heredado del plan
├── attention.test.js    # NUEVO: tabla del quickstart §9 y bordes de 17:59/18:00
├── choice.test.js       # NUEVO: costo por año, ahorro, comprobantes por mes (tabla R7)
├── advisor.test.js      # NUEVO: pickSuggestedAdvisor, reparto 40–60 % con muestra fija
├── analytics.test.js    # NUEVO: shouldTrack y buildAnalyticsPayload según el contrato
├── structured-data.test.js # NUEVO: forma de buildStructuredData
├── metadata.test.js     # NUEVO: <head> según page-metadata.md; dominio = siteData
├── styles.test.js       # NUEVO: cada clase usada existe en tailwind.css (invariante 8)
├── publicacion.test.js  # NUEVO: datos de R14 pendientes → todo; con PUBLICAR=1, fallo
└── pendiente.js         # NUEVO: ayudante pendiente(nombre, valor) compartido; no es prueba
                         #   (no coincide con los patrones de node --test)
```

**Structure Decision**: se mantienen los tres archivos raíz del Principio I. Los archivos nuevos
se justifican así:
- las **páginas legales** las exige FR-014 y FR-015 (R11);
- `tailwind.*` lo permite la constitución y lo exige FR-034 (R1);
- `fonts/` lo exige FR-035 (R2);
- `img/`, `favicon.svg` y `apple-touch-icon.png` los exigen FR-009 y FR-010 (R10);
- las **pruebas nuevas** las exige el Principio IV.

No se agrega `package.json`: `npx tailwindcss@3.4` y `node --test` no lo necesitan.

## Orden de implementación sugerido

Cada paso deja `main` desplegable y se puede verificar por separado con el quickstart.

1. **Base de producción (US10, parte 1)**:
   - Tailwind precompilado, Inter local, Font Awesome con SRI y CSP;
   - `styles.test.js`;
   - hacerlo primero porque las clases nuevas de los pasos siguientes ya se generan con la CLI.
2. **Datos y funciones puras**: cambios de `siteData` y todas las funciones nuevas con sus
   pruebas, todavía sin DOM.
3. **US1 + US2**: proceso, requisitos, avisos y preguntas frecuentes (contenido estático).
4. **US4**: datos legales, páginas de privacidad y términos, y `publicacion.test.js`.
5. **US3**: metadatos, iconos, imagen para compartir y JSON-LD.
6. **US5**: banner de promoción generado, variantes y aviso en tarjetas.
7. **US6**: costo por año, ahorro, comprobantes por mes y tipos de comprobante.
8. **US7 + US8**: estado de atención, asesor sugerido, saludo y renovación.
9. **US9**: navegación y accesibilidad.
10. **US10, parte 2**: medición. Primero verificar el endpoint de Umami (R3); luego `trackEvent`
    y los eventos del contrato.
11. README, validador W3C, quickstart completo y PR con la confirmación de los datos de R14.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `img/og-tari.jpg` en JPEG y `apple-touch-icon.png` en PNG, contra la regla "imágenes nuevas en WebP/AVIF o SVG" | WhatsApp y Facebook no muestran SVG en las vistas previas y su soporte de WebP es irregular; iOS no acepta SVG como icono de pantalla de inicio. Ninguna de las dos se muestra dentro de la página, así que no afecta su rendimiento | Usar WebP o SVG haría que la vista previa (FR-009) o el icono de iOS (FR-010) no aparezcan en parte de los dispositivos |
| Regenerar `tailwind.css` al agregar clases (paso manual de desarrollo) | Es lo que permite quitar el Play CDN (FR-034) sin un build para abrir o publicar el sitio | Mantener el Play CDN incumple FR-034 y el paso 1 del Principio IV; el olvido se detecta con `styles.test.js` |

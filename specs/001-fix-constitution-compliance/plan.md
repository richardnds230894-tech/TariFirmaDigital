# Implementation Plan: Corregir incumplimientos de la constitución

**Branch**: `001-fix-constitution-compliance` | **Date**: 2026-11-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-fix-constitution-compliance/spec.md`

## Summary

Corregir los seis incumplimientos de la constitución v1.0.0 sin cambiar el aspecto del sitio ni
ningún valor comercial: `.gitignore` para archivos sensibles; una única fuente de datos en
`script.js` para precios, asesores, Facebook, horarios y promociones, de la que el HTML se
rellena mediante atributos `data-*`; precios como números con formato `NN,NN`; botones con
delegación de eventos en lugar de `onclick`; modal accesible (diálogo, foco atrapado, Escape);
y promociones que se muestran solo dentro de su vigencia en hora de Ecuador. La lógica nueva son
funciones puras probadas con `node --test`, sin build ni dependencias.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2015+ en script clásico (no módulo ES)

**Primary Dependencies**: Tailwind CSS (Play CDN, sin cambios), Font Awesome 6.5.1, Google
Fonts Inter. Sin dependencias nuevas.

**Storage**: N/A (datos estáticos en `script.js`)

**Testing**: `node --test` (Node ≥ 18, probado con v24.21.0) + verificación manual del
Principio IV ([quickstart.md](quickstart.md))

**Target Platform**: navegadores actuales (2 últimas versiones de Chrome, Edge, Firefox,
Safari/iOS); se abre por `file://` o en hosting estático

**Project Type**: sitio web estático de una página

**Performance Goals**: sin regresión: no se añaden peticiones de red; `script.js` crece en
pocos KB

**Constraints**: sin paso de build; `index.html` abrible directamente; aspecto visual idéntico
(FR-021); no se cambia la carga de estilos (FR-022)

**Scale/Scope**: 3 archivos del sitio (`index.html`, `script.js`, `.gitignore` nuevo) + 1 carpeta
de pruebas; 7 planes de firma, 6 de comprobantes, 1 promoción, 2 asesores

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / regla | Antes del diseño | Tras el diseño |
|-------------------|------------------|----------------|
| I. Sitio estático, sin build, abrible por `file://` | ✅ | ✅ script clásico, sin módulos ES (R2) |
| I. Estructura raíz; archivos nuevos justificados | ✅ | ✅ solo `.gitignore` (exigido por III) y `tests/` (exigido por IV) |
| I. IDs y anclas existentes se conservan | ✅ | ✅ todos conservados; se añade `advisor-modal-title` ([dom-hooks](contracts/dom-hooks.md)) |
| II. Español, camelCase, JSDoc, 4 espacios, sin `var`/`console.log` | ✅ | ✅ aplica a todo el código nuevo |
| II. Catálogo y contacto en un único lugar | ❌ hoy duplicado | ✅ objeto de datos único (R1) |
| III. Sin recolección de datos personales | ✅ | ✅ sin cambios |
| III. `.gitignore` de secretos y documentos | ❌ no existe | ✅ R9 |
| III. `innerHTML` solo con datos estáticos; `addEventListener` + `data-*` | ❌ `onclick` interpolado | ✅ delegación + `escapeHtml` (R5, R6) |
| III. Mensajes de WhatsApp con `encodeURIComponent` y solo datos del producto | ✅ | ✅ [whatsapp-links](contracts/whatsapp-links.md) |
| III. `rel="noopener noreferrer"` | ✅ | ✅ invariante conservada |
| IV. Pruebas automatizadas para lógica de cálculo | ⚠️ no hay suite | ✅ `node --test` (R2) |
| V. Formato de precio único con IVA | ❌ `14.99` vs `15,00` | ✅ `formatPrice` (R3) |
| V. Tarjeta = modal = mensaje | ⚠️ coincide, pero por copia | ✅ derivado de un dato (data-model) |
| V. Promociones con vigencia y retiro al vencer | ❌ retiro manual | ✅ ocultación automática (R8) |
| Restricciones: accesibilidad del modal | ❌ sin Escape ni foco | ✅ R7 |
| Restricciones: Tailwind Play CDN en producción | ⚠️ deuda | ⚠️ fuera de alcance por decisión del usuario (spec, Clarifications) |

**Resultado**: el gate pasa. Los ❌ son justamente lo que la feature corrige. La única deuda que
queda (Tailwind CDN) está fuera de alcance por decisión explícita del usuario, que la
constitución permite tratar después.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-constitution-compliance/
├── plan.md              # Este archivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── dom-hooks.md       # Contrato HTML ↔ script.js
│   └── whatsapp-links.md  # Formato de enlaces externos
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks, aún no creado)
```

### Source Code (repository root)

```text
.gitignore              # NUEVO: certificados, claves, .env, documentos-clientes/, SO/editor
index.html              # MODIFICADO: sin onclick, sin números/URLs/precios literales;
                        #   atributos data-*, role="dialog", <noscript>, promo oculta por defecto
script.js               # MODIFICADO: secciones en este orden
                        #   1. DATOS DEL NEGOCIO (asesores, negocio, planes, promociones)
                        #   2. Funciones puras (formatPrice, formatPhone, buildWhatsAppUrl,
                        #      buildProductDescription, isPromotionActive, formatDateRange,
                        #      escapeHtml)
                        #   3. Renderizado y DOM (tarjetas, hidratación data-*, modal, promos)
                        #   4. Arranque (DOMContentLoaded, solo si existe window)
                        #   5. module.exports condicional para Node
styles.css              # SIN CAMBIOS
tests/
├── format.test.js      # formatPrice, formatPhone, formatDateRange, escapeHtml
├── whatsapp.test.js    # buildWhatsAppUrl, buildProductDescription (ejemplos del contrato)
├── promotions.test.js  # isPromotionActive en los bordes: inicio, fin 23:59 UTC−5, día siguiente
└── html.test.js        # invariantes de contracts/dom-hooks.md leyendo index.html
```

**Structure Decision**: se mantiene la estructura de tres archivos en raíz que exige el
Principio I. Solo se añaden `.gitignore` (lo exige el Principio III) y `tests/` (lo exige el
Principio IV). Las pruebas son solo de desarrollo: no se cargan en el sitio y no requieren
`package.json`.

## Orden de implementación sugerido

1. `.gitignore` (independiente, P1 de seguridad).
2. Datos + funciones puras + pruebas unitarias (base de las demás historias).
3. Precios y tarjetas desde los datos (US1).
4. Hidratación de contacto y horarios; limpieza del HTML (US2).
5. Delegación de eventos y eliminación de `onclick` (US4).
6. Modal accesible (US5).
7. Promociones por vigencia (US6).
8. Pruebas de invariantes del HTML y verificación manual completa del quickstart.

## Complexity Tracking

Sin violaciones que justificar.

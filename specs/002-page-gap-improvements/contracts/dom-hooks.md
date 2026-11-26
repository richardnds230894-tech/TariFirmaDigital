# Contract: Ganchos entre las páginas HTML y `script.js` (versión 002)

Amplía [001/contracts/dom-hooks.md](../../001-fix-constitution-compliance/contracts/dom-hooks.md).
Lo que no se menciona aquí sigue igual. Cambiar un gancho obliga a cambiar el HTML y
`script.js` en el mismo commit (Principio I).

Páginas: `index.html`, `privacidad.html` y `terminos.html`. Todas cargan `tailwind.css`,
`styles.css` y `script.js`.

## Atributos nuevos

| Atributo | Dónde | Qué hace `script.js` |
|----------|-------|----------------------|
| `data-atencion` | barra superior y modal | pone `textContent` con el estado de atención (research R8); se recalcula al abrir el modal |
| `data-entrega` | hero y preguntas frecuentes | pone `textContent` con la condición de entrega el mismo día (data-model → `entrega`) |
| `data-legal="razonSocial\|ruc\|ciudad\|entidadCertificadora"` | footer, hero, páginas legales | pone `textContent` con el dato; si es `null`, oculta el elemento |
| `data-legal-group` | contenedor de datos legales | se oculta si todos sus `data-legal` son `null` |
| `data-legal-fallback` | texto alternativo **hermano** de un `data-legal-group` (fuera de él) | se muestra solo cuando el grupo al que sigue está oculto; si el grupo es visible, se oculta |
| `data-anio` | footer de todas las páginas | pone `textContent` con el año en hora de Ecuador |
| `data-promo-any` | `section#promociones` y enlaces "Promociones" del menú | se muestra si hay al menos una promoción vigente |
| `data-taxpayer-note="natural\|juridica"` | avisos dentro de `#facturacion` | `setTaxpayerType` muestra solo los del tipo activo |
| `data-suggested-badge` | etiqueta "Sugerido" dentro de cada enlace de asesor del modal | visible solo en el asesor sugerido |
| `data-structured-data` | `<script type="application/ld+json">` vacío en `index.html` | pone `textContent` con `JSON.stringify(buildStructuredData(siteData))` |

## Atributos que cambian

| Atributo | Antes | Ahora |
|----------|-------|-------|
| `data-promo="<id>"` y `data-promo-link="<id>"` | uno por promoción, escrito en el HTML | **se eliminan**; los reemplaza `data-promo-any` |
| `data-promo-precio`, `data-promo-vigencia` | en el banner escrito a mano | **se eliminan**; el banner lo genera `renderPromotions()` |
| `data-plan` | `firma:<i>`, `comprobantes:<i>` | además `promo:<id>:<v>` (botones de variante generados) |
| `data-open-advisor` | `general`, `flotante`, `banco`, `promo:<id>` | además `renovacion` |
| `data-horario="semana\|sabado"` | `textContent` = cadena de datos | `textContent` = `formatSchedule(horario[clave])`; el texto visible no cambia |

## IDs

Se conservan todos los de 001. Nuevos:

| ID | Elemento |
|----|----------|
| `como-funciona` | `section` del proceso (ancla del menú) |
| `preguntas` | `section` de preguntas frecuentes (ancla del menú) |
| `promociones-container` | contenedor dentro de `section#promociones` donde se generan las tarjetas |

## Atributos de accesibilidad

| Elemento | Atributos |
|----------|-----------|
| `#mobile-menu-btn` | `aria-controls="mobile-menu"` y `aria-expanded="false\|true"` (lo actualiza `script.js`) |
| `#btn-natural`, `#btn-juridica` | `aria-pressed="true\|false"` (lo actualiza `setTaxpayerType`) |
| cada `section[id]` | clase `scroll-mt-28` |
| preguntas frecuentes | `<details>` + `<summary>` nativos, sin JavaScript |

## Invariantes verificables por prueba automatizada

Se conservan las invariantes 1, 2, 3 y 5 de 001 y se aplican a **todas** las páginas `.html`.
Cambian o se agregan:

4. *(reemplaza a la 4 de 001)* `section#promociones` y los dos enlaces de menú tienen
   `data-promo-any` y la clase `hidden`. Ninguna página contiene un identificador de promoción ni
   una fecha de vigencia escritos a mano.
6. Ninguna página contiene `cdn.tailwindcss.com` ni `fonts.googleapis.com`. Todo
   `<link rel="stylesheet">` externo lleva `integrity` y `crossorigin="anonymous"`.
7. Ningún `.html` ni `script.js` usa `text-[10px]` ni `text-[11px]`.
8. Cada clase usada en los `.html` y en los literales de clase de `script.js` tiene su selector en
   `tailwind.css` (research R1).
9. Ninguna página contiene precios literales (`$` seguido de dígitos), salvo los que genera
   `script.js`.
10. Cada `data-open-advisor` y cada `data-legal` usa una clave válida.
11. `#mobile-menu-btn` tiene `aria-controls` y `aria-expanded`; `#btn-natural` y
    `#btn-juridica` tienen `aria-pressed`.
12. Cada página tiene exactamente un `<meta http-equiv="Content-Security-Policy">` y ningún
    `<script>` en línea ejecutable (solo `src="script.js"` y el `application/ld+json`).

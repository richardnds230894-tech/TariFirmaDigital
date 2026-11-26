# Contract: Ganchos entre `index.html` y `script.js`

Contrato que `index.html` y `script.js` deben respetar. Cambiar un atributo o ID de esta lista
obliga a cambiar ambos archivos en el mismo commit (Principio I).

## Atributos de datos (nuevos)

| Atributo | Dónde | Qué hace `script.js` |
|----------|-------|----------------------|
| `data-whatsapp="<asesorId>"` | `<a>` de contacto directo | pone `href` = enlace de WhatsApp del asesor |
| `data-mensaje="info\|ayuda"` | junto a `data-whatsapp` | elige el mensaje prellenado (por defecto `info`) |
| `data-phone="<asesorId>"` | `<span>` | pone `textContent` = número con formato `+593 …` |
| `data-facebook` | `<a>` | pone `href` = URL de Facebook |
| `data-horario="semana\|sabado"` | `<span>`/`<strong>` | pone `textContent` = horario |
| `data-open-advisor="<clave>"` | `<button>` fijo | abre el modal con la descripción de esa clave |
| `data-plan="firma:<i>\|comprobantes:<i>"` | botón generado en una tarjeta | abre el modal con la descripción del plan |
| `data-taxpayer="natural\|juridica"` | botones del selector | cambia el tipo de contribuyente |
| `data-promo="<promoId>"` | `<section id="promociones">` | se muestra solo si la promoción está vigente |
| `data-promo-link="<promoId>"` | enlaces "Promociones" del menú | igual que la sección |
| `data-promo-precio="<promoId>"` | `<span>` del precio | pone `textContent` = precio formateado |
| `data-promo-vigencia="<promoId>"` | `<span>` de vigencia | pone `textContent` = "Del … al …" |
| `data-modal-close` | botón X del modal | cierra el modal |

Claves válidas de `data-open-advisor`: `general`, `flotante`, `banco`, `promo:<promoId>`.

## IDs existentes (se conservan)

`firma-cards-container`, `comprobantes-cards-container`, `advisor-modal`,
`modal-product-text`, `link-asesor-1`, `link-asesor-2`, `btn-natural`, `btn-juridica`,
`mobile-menu`, `mobile-menu-btn`, y las anclas `#promociones`, `#firma-electronica`,
`#facturacion`, `#requisitos`.

ID nuevo: `advisor-modal-title` (título del modal, destino de `aria-labelledby`).

## Atributos del modal

`#advisor-modal` MUST tener `role="dialog"`, `aria-modal="true"` y
`aria-labelledby="advisor-modal-title"`.

## Invariantes verificables por prueba automatizada

1. `index.html` no contiene `onclick=`.
2. `index.html` no contiene `wa.me/`, ni los números `960178652` / `969790890` en ningún formato,
   ni la URL de Facebook.
3. Todo `data-whatsapp`, `data-phone` y `data-open-advisor` del HTML referencia un asesor o una
   clave que existe en los datos.
4. La sección `#promociones` y los `data-promo-link` tienen la clase `hidden` en el HTML.
5. `index.html` incluye un `<noscript>` que pide activar JavaScript (FR-008).

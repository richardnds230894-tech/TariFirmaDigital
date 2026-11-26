# Contract: Ganchos entre las páginas y `script.js` (versión 003)

Amplía [002/contracts/dom-hooks.md](../../002-page-gap-improvements/contracts/dom-hooks.md). Lo
que no se menciona aquí sigue igual.

## Páginas y lo que contiene cada una

| Página | Secciones, en orden |
|--------|---------------------|
| `index.html` | cabecera · `#promociones` (carrusel) · barra de preguntas · hero · `#servicios` · `#como-funciona` · `#preguntas` · footer |
| `firma.html` | cabecera · hero de firma · beneficios · `#firma-electronica` (planes) · `#requisitos` · `#formas-de-pago` · footer |
| `facturacion.html` | cabecera · banner de beneficios · `#facturacion` (selector y planes) · `#requisitos` · `#formas-de-pago` · footer |
| `privacidad.html`, `terminos.html` | cabecera · contenido legal · footer |

Todas las páginas tienen la **misma** cabecera (con el menú móvil), el mismo footer, los botones
flotantes y el modal `#advisor-modal`, carácter por carácter
([research R1](../research.md)).

## Migración de IDs y anclas (Principio I)

| ID o ancla | Antes | Ahora |
|------------|-------|-------|
| `firma-cards-container`, `#firma-electronica` | `index.html` | `firma.html` |
| `comprobantes-cards-container`, `btn-natural`, `btn-juridica`, `#facturacion` | `index.html` | `facturacion.html` |
| `#requisitos` | `index.html` | `firma.html` y `facturacion.html` |
| `#promociones` | banner de `index.html` | carrusel de `index.html` |
| `promociones-container` | `index.html` | **se elimina** (lo reemplaza el carrusel) |
| `advisor-modal`, `modal-product-text`, `link-asesor-1`, `link-asesor-2`, `mobile-menu`, `mobile-menu-btn` | `index.html` | las cinco páginas |

Anclas antiguas de `index.html`: `#firma-electronica`, `#facturacion` y `#requisitos` se redirigen
con `mapLegacyHash` (research R2).

## Atributos nuevos

| Atributo | Dónde | Qué hace `script.js` |
|----------|-------|----------------------|
| `data-carousel` | `section#promociones` | inicializa el carrusel; se oculta si no hay diapositivas |
| `data-carousel-track` | contenedor de diapositivas | `innerHTML` con las diapositivas de `buildCarouselSlides` (datos escapados) |
| `data-carousel-prev`, `data-carousel-next` | botones | diapositiva anterior o siguiente |
| `data-carousel-pause` | botón | alterna reproducir/pausar y actualiza `aria-pressed` y su `aria-label` |
| `data-carousel-dots` | contenedor | un botón por diapositiva, con `aria-label="Ir a la diapositiva N"` y `aria-current` en la activa |
| `data-carousel-live` | región `aria-live` | `off` durante el avance automático y `polite` al navegar a mano |
| `data-flyer="<id>"` | cada diapositiva generada | identifica el flyer para la medición |
| `data-bancos` | contenedor en `firma.html` y `facturacion.html` | dibuja `siteData.bancos` |
| `data-nav="index\|firma\|facturacion"` | enlaces del menú | recibe `aria-current="page"` si corresponde a la página actual |

**Sin JavaScript**: `section#promociones` contiene como respaldo estático el primer flyer
permanente (`recomendacion-clave`), y `script.js` lo reemplaza al iniciar.

## Claves nuevas de `data-open-advisor`

`flyer:<id>`, `facturacion:natural` y `facturacion:juridica` (ver
[whatsapp-links.md](whatsapp-links.md)).

## Invariantes verificables por prueba automatizada (nuevas o cambiadas)

13. La cabecera (`<header>…</header>`), el footer, los botones flotantes y el modal son idénticos
    en las cinco páginas (`tests/layout.test.js`).
14. El menú de escritorio y el móvil de cada página tienen enlaces a `index.html`, `firma.html`,
    `facturacion.html`, `index.html#como-funciona` e `index.html#preguntas`.
15. `index.html` sigue el orden de secciones de la tabla de arriba y **no** contiene
    `firma-cards-container`, `comprobantes-cards-container` ni `id="requisitos"`.
16. `firma.html` contiene `firma-cards-container`, `#requisitos`, `[data-bancos]` y el aviso de
    "solo personas naturales", y **no** contiene selector de tipo de cliente (`data-taxpayer`) ni
    la palabra "token".
17. `facturacion.html` contiene `comprobantes-cards-container`, `btn-natural`, `btn-juridica`,
    `#requisitos` con exactamente dos tarjetas ("Persona Natural" y "Representante Legal") y
    `[data-bancos]`, y **no** contiene "Miembro de Empresa".
18. Ninguna página contiene los textos ni las cifras de los sitios de referencia ("Security Data",
    "millones de firmas", "App móvil", "usuarios activos").
19. `section#promociones` tiene `aria-roledescription="carrusel"`, y sus botones tienen
    `aria-label`.

Las invariantes 1 a 12 de las features 001 y 002 se siguen aplicando a todas las páginas.

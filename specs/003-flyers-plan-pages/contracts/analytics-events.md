# Contract: Eventos de medición (versión 003)

Amplía
[002/contracts/analytics-events.md](../../002-page-gap-improvements/contracts/analytics-events.md).
El endpoint, las condiciones de envío y las prohibiciones no cambian.

## Eventos nuevos o ampliados

| Nombre (`name`) | Cuándo | `data` |
|-----------------|--------|--------|
| `clic-flyer` | clic en un flyer o en un botón de la diapositiva de promoción | `{ "flyer": "<id>" }` o `{ "flyer": "promo:<id>" }` |
| `abrir-contacto` | sin cambios; nuevos orígenes posibles | `origen`: además `flyer:<id>`, `facturacion:natural` y `facturacion:juridica` |
| *(pageview)* | al cargar `firma.html` y `facturacion.html` | — |

No se miden el avance automático ni los clics en las flechas del carrusel: no indican interés en
un producto y multiplicarían los eventos.

# Data Model: Carrusel de flyers y páginas propias de planes

Solo los **cambios** sobre el modelo de la
[feature 002](../002-page-gap-improvements/data-model.md). Todo vive en `siteData`, al inicio de
`script.js` (Principio II). No hay servidor ni almacenamiento.

## Flyer (nuevo) — `siteData.flyers[]`

| Campo | Tipo | Regla |
|-------|------|-------|
| `id` | cadena | único; solo `a-z`, `0-9` y `-`; se usa en `flyer:<id>` y en la medición |
| `tipo` | cadena | obligatorio; `'promocion'` o `'informativo'` (D1 del análisis; Principio V) |
| `imagen` | cadena | ruta relativa que empieza por `img/flyers/` y termina en `.webp`, `.avif` o `.svg`; el archivo MUST existir y pesar ≤ 250 KB |
| `imagenMovil` | cadena u omitido | misma regla que `imagen`; se usa en pantallas de 640 px o menos |
| `alt` | cadena | obligatorio, entre 10 y 200 caracteres; transmite el mensaje del flyer (FR-005) |
| `destino` | objeto u omitido | ver "Destino de flyer" |
| `inicio` | cadena `AAAA-MM-DD` u omitido | **obligatorio si `tipo` es `promocion`**; si existe `fin`, `inicio ≤ fin` |
| `fin` | cadena `AAAA-MM-DD` u omitido | **obligatorio si `tipo` es `promocion`**; día de fin completo, en hora de Ecuador |

**Imagen**: MUST NOT contener precios ni montos (FR-009a). **Orden**: el del arreglo.
**Vigencia**: un flyer informativo sin fechas es permanente; con fechas usa la misma regla
de `isPromotionActive` (Ecuador, UTC−5).

Valor inicial (FR-008):

```text
{ id: 'recomendacion-clave',
  tipo: 'informativo',
  imagen: 'img/flyers/recomendacion-clave.webp',
  imagenMovil: 'img/flyers/recomendacion-clave-movil.webp',
  alt: 'Tu firma es personal: nunca compartas tu archivo P12 ni tu contraseña. Tari’s Firma Digital.',
  destino: { tipo: 'pagina', pagina: 'firma.html' } }
```

### Destino de flyer (nuevo)

| Variante | Campos | Regla |
|----------|--------|-------|
| Contacto | `tipo: 'contacto'`, `mensaje` | `mensaje` entre 5 y 200 caracteres, sin datos del visitante; abre el modal con `flyer:<id>` |
| Página | `tipo: 'pagina'`, `pagina` | `pagina` está en la lista blanca: `index.html`, `firma.html` o `facturacion.html`, opcionalmente con `#firma-electronica`, `#facturacion`, `#requisitos`, `#preguntas` o `#como-funciona` |

Un destino inválido se descarta en la página (el flyer queda sin enlace) y hace fallar
`tests/data.test.js`.

## Diapositiva del carrusel (derivada, no se guarda)

`buildCarouselSlides(promociones, flyers, ahora)` devuelve una lista ordenada de:
- `{ tipo: 'promocion', promo, variantes }`, una por cada promoción vigente, con `variantes` de
  `getActiveVariants`;
- `{ tipo: 'flyer', flyer }`, una por cada flyer vigente con destino válido o sin destino.

Primero las promociones y luego los flyers.

### Estados del carrusel

```text
sin diapositivas ── sección oculta
1 diapositiva   ── visible, sin controles ni avance
≥ 2             ── reproduciendo ⇄ en pausa
                   (pausa: botón, puntero encima, foco dentro, pestaña oculta,
                    o reducir movimiento desde el inicio)
```

## Banco (nuevo) — `siteData.bancos[]`

| Campo | Tipo | Regla |
|-------|------|-------|
| `sigla` | cadena | 2 o 3 letras mayúsculas |
| `nombre` | cadena | texto visible |
| `estilo` | cadena | una de: `rosa`, `amarillo`, `turquesa`, `esmeralda` (se traduce a clases fijas en `script.js`) |

Valores, sin cambios respecto de lo que muestra hoy la página: BG Banco Guayaquil (`rosa`) · BP
Banco Pichincha (`amarillo`) · BB Banco Bolivariano (`turquesa`) · PB Produbanco (`esmeralda`).

## Datos del negocio (cambia)

| Campo | Antes | Ahora |
|-------|-------|-------|
| `negocio.legal.entidadCertificadora` | `null` | `'Uanataca'` (FR-029) |

## Plan de Firma Electrónica (sin cambios de datos)

Texto nuevo derivado: `formatValidityLabel(plan)` → `Vigencia 10 días`, `Vigencia 1 año` o
`Vigencia 2 años`, a partir de `duracion` y `anios`.

## Descripción del producto (derivada; claves nuevas)

| Clave | Texto resultante |
|-------|------------------|
| `flyer:<id>` | el `mensaje` del destino de contacto de ese flyer; `null` si el flyer no existe o no es de contacto |
| `facturacion:natural` | `Sistema de Facturación Electrónica (Persona Natural) - Consulta de requisitos` |
| `facturacion:juridica` | `Sistema de Facturación Electrónica (Persona Jurídica) - Consulta de requisitos`; la tarjeta se titula "Persona Jurídica (Representante Legal)" para coincidir |

Las demás claves (`firma:<i>`, `comprobantes:<i>`, `promo:<id>[:<v>]`, `general`, `flotante`,
`banco` y `renovacion`) no cambian.

## Páginas (derivado)

`getCurrentNavPage(pathname)` → `'index'`, `'firma'`, `'facturacion'`, `'privacidad'` o
`'terminos'`. `/` y las rutas desconocidas cuentan como `'index'`.

`mapLegacyHash(hash)` → URL nueva o `null`. Ver [research.md](research.md) R2.

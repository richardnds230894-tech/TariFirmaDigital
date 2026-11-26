# Contract: Metadatos de página, vista previa al compartir y datos estructurados

Interfaz con rastreadores (WhatsApp, Facebook, buscadores). FR-008 a FR-011, research R10.

## `<head>` estático de `index.html`

Debe ser estático porque los rastreadores de vistas previas no ejecutan JavaScript.

| Etiqueta | Valor |
|----------|-------|
| `<title>` | sin cambios: `Tari's Firma Digital \| Firma y Facturación Electrónica en Ecuador` |
| `meta name="description"` | 150–160 caracteres; menciona firma electrónica P12, facturación SRI, Ecuador, 100 % en línea |
| `link rel="canonical"` | `https://<dominio>/` |
| `meta property="og:type"` | `website` |
| `meta property="og:locale"` | `es_EC` |
| `meta property="og:site_name"` | `Tari's Firma Digital` |
| `meta property="og:title"` | igual al `<title>` |
| `meta property="og:description"` | igual a `description` |
| `meta property="og:url"` | `https://<dominio>/` |
| `meta property="og:image"` | `https://<dominio>/img/og-tari.jpg` (URL absoluta) |
| `meta property="og:image:width"` / `:height` | `1200` / `630` |
| `meta property="og:image:alt"` | descripción de la imagen en español |
| `meta name="twitter:card"` | `summary_large_image` |
| `meta name="theme-color"` | `#061A3A` (token `taris-navy`) |
| `link rel="icon"` | `favicon.svg`, `type="image/svg+xml"` |
| `link rel="apple-touch-icon"` | `apple-touch-icon.png` (180×180) |

`privacidad.html` y `terminos.html` tienen su propio `<title>` y `description`, el mismo icono,
`canonical` a su propia URL y `meta name="robots" content="index, follow"`. No llevan `og:*`.

**Regla**: ningún metadato contiene teléfonos, precios ni la URL de Facebook (invariante 2 de
dom-hooks).

**Dominio**: `<dominio>` MUST ser igual a `siteData.medicion.dominio`. Lo comprueba
`tests/metadata.test.js`, que queda como `todo` mientras el dominio sea `null`.

## Imagen para compartir

`img/og-tari.jpg`: JPEG de 1200×630 px y menos de 300 KB. Muestra el logo, el eslogan "Firma y
Facturación Electrónica al instante" (aprobado por el responsable el 2026-11-26) y las etiquetas
"100% en línea", "Todo Ecuador" y "Atención por WhatsApp". No lleva precios, para que no quede
desactualizada.

## Datos estructurados (generados por `script.js`)

`buildStructuredData(siteData)` devuelve:

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "<negocio.nombre>",
  "url": "https://<medicion.dominio>/",
  "image": "https://<medicion.dominio>/img/og-tari.jpg",
  "areaServed": { "@type": "Country", "name": "Ecuador" },
  "telephone": "<formatPhone(asesores[0].whatsapp)>",
  "contactPoint": [
    { "@type": "ContactPoint", "telephone": "<formatPhone(asesor.whatsapp)>", "contactType": "sales", "availableLanguage": "es" }
  ],
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "18:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "10:00", "closes": "14:00" }
  ],
  "sameAs": ["<negocio.facebookUrl>"]
}
```

- Hay un `contactPoint` por asesor.
- `legalName` y `taxID` se agregan solo si `legal.razonSocial` y `legal.ruc` no son `null`.
- `url` e `image` se omiten si `medicion.dominio` es `null`.
- Se inserta con `textContent`, nunca con `innerHTML` (Principio III).

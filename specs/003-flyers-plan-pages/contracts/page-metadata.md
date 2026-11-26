# Contract: Metadatos de las páginas nuevas (versión 003)

Amplía
[002/contracts/page-metadata.md](../../002-page-gap-improvements/contracts/page-metadata.md).

| Página | `<title>` | `canonical` y `og:url` |
|--------|-----------|------------------------|
| `firma.html` | `Firma Electrónica P12 \| Tari's Firma Digital` | `https://tari-firma-digital.vercel.app/firma.html` |
| `facturacion.html` | `Facturación Electrónica SRI \| Tari's Firma Digital` | `https://tari-firma-digital.vercel.app/facturacion.html` |

Para cada página:
- `description` de 150 a 160 caracteres, igual en `og:description`;
- `og:title` igual a `<title>`;
- `og:image` = `https://tari-firma-digital.vercel.app/img/og-tari.jpg`;
- además `og:type`, `og:locale`, `og:site_name`, `og:image:width`, `og:image:height`,
  `og:image:alt`, `twitter:card`, `theme-color`, icon y apple-touch-icon, como en `index.html`.

El dominio de todas las URL absolutas MUST ser igual a `siteData.medicion.dominio`
(`tests/metadata.test.js`). El JSON-LD sigue solo en `index.html`.

# Contract: Eventos de medición (Umami Cloud, sin script de terceros)

Interfaz saliente nueva del sitio (FR-037, FR-037a, research R3). `script.js` la implementa con
`fetch`. Ningún código de terceros se carga en la página.

> **Verificado el 2026-11-26** en docs.umami.is ("Sending stats"): para Umami Cloud el endpoint es
> `https://gateway.umami.is/api/send` (no `cloud.umami.is`); el cuerpo `{ type, payload }` coincide con
> este contrato; no requiere token, pero sí un User-Agent válido (el navegador lo envía). La página
> no documenta CORS ni el límite mensual del plan Hobby.

## Cuándo se envía

Se envía solo si se cumplen **todas** estas condiciones (`shouldTrack(siteData.medicion, entorno)`, función pura):

1. `medicion.websiteId` no es `null`.
2. `location.hostname === medicion.dominio`. No se mide en `file://`, `localhost` ni en las
   pruebas.
3. `navigator.doNotTrack !== '1'`.

## Petición

```text
POST <medicion.endpoint>
Content-Type: application/json
keepalive: true
```

Cuerpo, armado por la función pura `buildAnalyticsPayload(tipo, nombre, datos, entorno)`:

```json
{
  "type": "event",
  "payload": {
    "website": "<websiteId>",
    "hostname": "<location.hostname>",
    "url": "<location.pathname>",
    "title": "<document.title>",
    "language": "<navigator.language>",
    "screen": "<ancho>x<alto>",
    "referrer": "<document.referrer>",
    "name": "<nombre del evento; se omite en pageview>",
    "data": { "...": "propiedades del evento; se omite si no hay" }
  }
}
```

- `url` es solo `location.pathname`. **Nunca** se envían la consulta ni el fragmento, que podrían
  contener datos.
- Los errores de red se ignoran (`.catch(() => {})`): la medición nunca bloquea ni retrasa la
  apertura de WhatsApp.

## Catálogo de eventos

| Nombre (`name`) | Cuándo | `data` |
|-----------------|--------|--------|
| *(pageview, sin `name`)* | al cargar cada página | — |
| `abrir-contacto` | se abre el modal | `{ "origen": "<clave>" }`, donde la clave es `firma:1 AÑO`, `comprobantes:50:natural`, `promo:<id>:<v>`, `general`, `flotante`, `banco` o `renovacion` |
| `elegir-asesor` | clic en `#link-asesor-1` o `#link-asesor-2` | `{ "asesor": "asesor1\|asesor2", "sugerido": true\|false, "origen": "<clave>" }` |
| `contacto-directo` | clic en un `a[data-whatsapp]` | `{ "asesor": "<id>", "mensaje": "info\|ayuda" }` |
| `ver-promocion` | clic en un enlace del menú o en un aviso de tarjeta hacia `#promociones` | `{ "desde": "menu\|tarjeta" }` |

**Regla de nombres**: en `origen` los planes se identifican por su **etiqueta** (`1 AÑO`, `50`),
no por su índice, para que las cifras sigan siendo comparables si se reordenan los planes.

## Prohibido en cualquier evento (Principio III)

Texto escrito por el visitante, número de teléfono del visitante, el mensaje de WhatsApp, cookies
o almacenamiento local, e identificadores propios del visitante.

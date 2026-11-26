# Data Model: Cerrar huecos de la página

Los datos comerciales siguen en el único objeto `siteData` al inicio de `script.js` (Principio
II). Este documento describe **solo los cambios** sobre el modelo de
[001/data-model.md](../001-fix-constitution-compliance/data-model.md). No hay almacenamiento,
servidor ni datos del visitante.

Convención: `null` = dato pendiente de entregar por el responsable. El elemento que lo usa queda
oculto y `tests/publicacion.test.js` lo reporta como `todo` (research R11, R14).

## Asesor (cambia)

| Campo | Tipo | Regla | Valor |
|-------|------|-------|-------|
| `id` | cadena | sin cambios | `asesor1`, `asesor2` |
| `nombre` | cadena | **rótulo interno**; solo se muestra como etiqueta del botón, nunca en el saludo (FR-026) | `Asesor 1`, `Asesor 2` |
| `whatsapp` | cadena | sin cambios | `593960178652`, `593969790890` |

Estado de la visita, en memoria y no persistido: `asesorSugeridoId`, elegido una vez por carga con
`pickSuggestedAdvisor` (research R9).

## Datos del negocio (cambia)

### `horario` (pasa de texto a estructura)

| Campo | Tipo | Regla | Valor |
|-------|------|-------|-------|
| `horario.semana.inicio` / `.fin` | cadena `HH:MM` | lunes a viernes; `inicio < fin` | `09:00` / `18:00` |
| `horario.sabado.inicio` / `.fin` | cadena `HH:MM` | `inicio < fin` | `10:00` / `14:00` |

El domingo no se atiende (no hay clave). Texto visible derivado: `formatSchedule` →
`9:00 a 18:00` y `10:00 a 14:00`, idéntico al actual. `fin` es exclusivo: a las 18:00 ya no se
atiende.

### `entrega` (nuevo)

| Campo | Tipo | Regla | Valor |
|-------|------|-------|-------|
| `entrega.horaLimiteSemana` | cadena `HH:MM` o `null` | `< horario.semana.fin` | `null` (pendiente) |
| `entrega.horaLimiteSabado` | cadena `HH:MM` o `null` | `< horario.sabado.fin` | `null` (pendiente) |

Texto derivado (FR-003): "Mismo día si envías requisitos y pago antes de las 16:00 (sábados,
12:00)". Si los dos valores son `null`, se muestra "Entrega ágil" sin promesa de tiempo.

### `legal` (nuevo)

| Campo | Tipo | Regla | Valor |
|-------|------|-------|-------|
| `legal.razonSocial` | cadena o `null` | texto | `null` (pendiente) |
| `legal.ruc` | cadena o `null` | 13 dígitos | `null` (pendiente) |
| `legal.ciudad` | cadena o `null` | texto | `null` (pendiente) |
| `legal.entidadCertificadora` | cadena o `null` | nombre de la entidad acreditada | `null` (pendiente) |

### `mensajes` (cambia: sin `{asesor}`, FR-026)

| Clave | Plantilla |
|-------|-----------|
| `info` | `Hola {negocio}, deseo información sobre Firma y Facturación Electrónica.` (sin cambios) |
| `ayuda` | `Hola, equipo de {negocio}, necesito ayuda.` |
| `producto` | `Hola, equipo de {negocio}, estoy interesado en adquirir:\n*{producto}*\n\nPor favor ayúdeme con el proceso.` |

## Plan de Firma Electrónica (cambia: `anios`)

| Campo | Tipo | Regla |
|-------|------|-------|
| `duracion` | cadena | sin cambios (`1 AÑO`) |
| `anios` | número o `null` | **nuevo**; `null` para planes en días; si es número, MUST coincidir con `duracion` |
| `precio`, `etiqueta`, `popular` | — | sin cambios |

Valores de `anios`: 10 DÍAS `null` · 30 DÍAS `null` · 1 AÑO `1` · 2 AÑOS `2` · 3 AÑOS `3` ·
4 AÑOS `4` · 5 AÑOS `5`.

Derivados (research R7): `calculateYearlyCost` y `calculateSavings` frente al plan de `anios = 1`.
Solo se muestran con `anios ≥ 2` y ahorro > 0.

## Plan de Comprobantes (cambia: `cantidad` → `total`)

| Campo | Tipo | Regla |
|-------|------|-------|
| `total` | número entero | **sustituye** a `cantidad`; > 0; únicos |
| `precioNatural`, `precioJuridica`, `descripcion` | — | sin cambios |

Derivados: `formatVoucherLabel(total)` → `50 COMPROBANTES`, igual al texto actual, y
`calculateMonthlyVouchers(total)` → `Math.round(total / 12)`.

## Promoción (cambia: variantes)

| Campo | Tipo | Regla | Valor |
|-------|------|-------|-------|
| `id` | cadena | único | `firma-2-anios-nov-2026` |
| `titulo` | cadena | titular del banner | `Firma Electrónica por 2 años` |
| `producto` | cadena | **nuevo**; base del texto de cada variante | `Firma Electrónica` |
| `inicio`, `fin` | `AAAA-MM-DD` | sin cambios | `2026-11-09`, `2026-11-30` |
| `variantes` | lista de Variante | **nuevo**; ≥ 1; la primera es la destacada | ver abajo |

El campo `precio` de nivel superior desaparece; ahora vive en la variante 0.

### Variante de promoción (nueva)

| Campo | Tipo | Regla |
|-------|------|-------|
| `pagaAnios` | entero | MUST existir un plan de firma con ese `anios` |
| `recibeAnios` | entero | `> pagaAnios` |
| `precio` | número u omitido | si se omite, se usa el `precio` del plan de firma de `pagaAnios` |

Valores actuales:

| # | Paga | Recibe | Precio | Origen del precio |
|---|------|--------|--------|-------------------|
| 0 | 1 | 2 | 14.99 | explícito (hoy en `promociones[0].precio`) |
| 1 | 2 | 3 | 21.00 | plan de 2 años |
| 2 | 3 | 4 | 30.00 | plan de 3 años |

### Estados (sin cambios en las reglas de fecha)

```text
programada --(hoy Ecuador ≥ inicio)--> vigente --(hoy Ecuador > fin)--> vencida
  oculta                               visible                           oculta
```

La sección `#promociones` y los enlaces de menú `data-promo-any` se muestran si **alguna**
promoción está `vigente`. Las tarjetas de firma con `anios` igual a un `pagaAnios` vigente
muestran su aviso de promoción.

## Medición (nuevo)

| Campo | Tipo | Regla | Valor |
|-------|------|-------|-------|
| `medicion.websiteId` | cadena UUID o `null` | sin él no se mide | `null` (pendiente) |
| `medicion.endpoint` | cadena HTTPS | URL de envío de Umami Cloud (verificada el 2026-11-26 en docs.umami.is, R3) | `https://gateway.umami.is/api/send` |
| `medicion.dominio` | cadena o `null` | host público; solo se mide en ese host | `null` (pendiente) |

El evento de uso no se guarda en el sitio: se arma y se envía (ver
[contracts/analytics-events.md](contracts/analytics-events.md)).

## Descripción del producto (derivada; cambia)

| Clave | Texto resultante |
|-------|------------------|
| `firma:<i>` | sin cambios: `Firma Electrónica (1 AÑO) - Valor: $15,00 inc. IVA` |
| `comprobantes:<i>` + tipo | sin cambios: `Plan de Facturación: 50 COMPROBANTES (Persona Natural) - Valor: $7,00 inc. IVA` |
| `promo:<id>:<v>` | **nuevo**: `PROMOCIÓN VIGENTE (9 al 30 Nov): Firma Electrónica por 3 años (pagas 2) - Valor: $21,00 inc. IVA` |
| `promo:<id>` | equivale a `promo:<id>:0`: `PROMOCIÓN VIGENTE (9 al 30 Nov): Firma Electrónica por 2 años (pagas 1) - Valor: $14,99 inc. IVA` |
| `renovacion` | **nuevo**: `Renovación de Firma Electrónica` |
| `general`, `flotante`, `banco` | sin cambios |

El texto de la promoción adopta el sufijo `- Valor: $NN,NN inc. IVA` del catálogo. Así cumple el
Principio V (formato e "IVA incluido" iguales en todo el sitio), algo que el texto actual
"a $14,99" no hacía.

## Contenido estático (no es dato comercial)

Pasos del proceso, requisitos por caso, preguntas frecuentes, tipos de comprobante y textos
legales viven como marcado en los `.html` (research R4, R5, R11). Regla: no contienen precios,
teléfonos, horarios ni la URL de Facebook literales. Si los necesitan, usan los ganchos de
[contracts/dom-hooks.md](contracts/dom-hooks.md).

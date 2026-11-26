# Data Model: Corregir incumplimientos de la constitución

Todos los datos viven en un único objeto de configuración al inicio de `script.js`
(ver [research.md](research.md) R1). No hay almacenamiento, servidor ni datos del visitante.
Los valores actuales del sitio se conservan; solo cambian su tipo y su ubicación.

## Asesor

| Campo | Tipo | Regla | Valor actual |
|-------|------|-------|--------------|
| `id` | cadena | único; usado en `data-whatsapp` | `asesor1`, `asesor2` |
| `nombre` | cadena | texto visible | `Asesor 1`, `Asesor 2` |
| `whatsapp` | cadena | 12 dígitos, empieza por `593`, sin `+` ni espacios | `593960178652`, `593969790890` |

Derivados: `formatPhone(whatsapp)` → `+593 96 017 8652`; enlace según
[contracts/whatsapp-links.md](contracts/whatsapp-links.md).

## Datos del negocio

| Campo | Tipo | Regla | Valor actual |
|-------|------|-------|--------------|
| `nombre` | cadena | aparece en los mensajes | `Tari's Firma Digital` |
| `facebookUrl` | cadena | HTTPS | `https://www.facebook.com/profile.php?id=61595452224986` |
| `horario.semana` | cadena | formato `H:MM a H:MM` | `9:00 a 18:00` |
| `horario.sabado` | cadena | formato `H:MM a H:MM` | `10:00 a 14:00` |
| `mensajes.info` | cadena | sin datos personales | `Hola {negocio}, deseo información sobre Firma y Facturación Electrónica.` |
| `mensajes.ayuda` | cadena | sin datos personales | `Hola {asesor} de {negocio}, necesito ayuda.` |
| `mensajes.producto` | cadena | sin datos personales | `Hola {asesor} de {negocio}, estoy interesado en adquirir:\n*{producto}*\n\nPor favor ayúdeme con el proceso.` |

## Plan de Firma Electrónica

| Campo | Tipo | Regla |
|-------|------|-------|
| `duracion` | cadena | p. ej. `1 AÑO` |
| `precio` | número | > 0, dos decimales, IVA incluido |
| `etiqueta` | cadena | p. ej. `Más solicitado` |
| `popular` | booleano | como máximo un plan en `true` |

Valores actuales (sin cambios): 10 DÍAS 8.50 · 30 DÍAS 10.50 · 1 AÑO 15.00 (popular) ·
2 AÑOS 21.00 · 3 AÑOS 30.00 · 4 AÑOS 35.00 · 5 AÑOS 46.00.

## Plan de Comprobantes

| Campo | Tipo | Regla |
|-------|------|-------|
| `cantidad` | cadena | p. ej. `50 COMPROBANTES` |
| `precioNatural` | número | > 0, IVA incluido |
| `precioJuridica` | número | > 0, IVA incluido |
| `descripcion` | cadena | texto corto |

Vigencia fija: 1 año. Valores actuales sin cambios (50: 7.00/7.50 · 70: 8.00/9.50 ·
100: 10.00/13.00 · 200: 12.00/21.00 · 400: 15.50/25.00 · 600: 17.00/35.00).

## Promoción

| Campo | Tipo | Regla | Valor actual |
|-------|------|-------|--------------|
| `id` | cadena | único; usado en `data-open-advisor="promo:<id>"` | `firma-2-anios-nov-2026` |
| `titulo` | cadena | texto del producto en el mensaje | `Firma Electrónica por 2 años` |
| `precio` | número | > 0, IVA incluido | `14.99` |
| `inicio` | cadena | `AAAA-MM-DD`, ≤ `fin` | `2026-11-09` |
| `fin` | cadena | `AAAA-MM-DD`, día incluido completo | `2026-11-30` |

### Estados

```text
programada  --(hoy Ecuador ≥ inicio)-->  vigente  --(hoy Ecuador > fin)-->  vencida
   oculta                                visible                             oculta
```

"hoy Ecuador" = fecha en UTC−5 (research R8). Solo `vigente` muestra la sección `#promociones`
y los enlaces "Promociones" del menú de escritorio y móvil.

## Descripción del producto (derivada, no se guarda)

`buildProductDescription(clave, tipoContribuyente)` produce el texto del modal y del mensaje.
Debe coincidir carácter por carácter con lo que muestra la tarjeta (FR-004):

| Clave | Texto resultante (ejemplo) |
|-------|----------------------------|
| `firma:2` | `Firma Electrónica (1 AÑO) - Valor: $15,00 inc. IVA` |
| `comprobantes:0` + natural | `Plan de Facturación: 50 COMPROBANTES (Persona Natural) - Valor: $7,00 inc. IVA` |
| `promo:firma-2-anios-nov-2026` | `PROMOCIÓN VIGENTE (9 al 30 Nov): Firma Electrónica por 2 años a $14,99` |
| `general` | `Asesoría General - Tari's Firma Digital` |
| `flotante` | `Consulta general desde la web de Tari's Firma Digital` |
| `banco` | `Solicito los datos bancarios para realizar el pago por transferencia` |

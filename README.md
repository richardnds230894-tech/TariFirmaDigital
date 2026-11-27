# TariFirmaDigital
Web para venta de Firmas

Sitio estático de Tari's Firma Digital: Firma Electrónica (archivo P12) y planes de
Facturación Electrónica en Ecuador. La venta se cierra por WhatsApp con los asesores.
No necesita compilación para abrirse ni publicarse: basta con abrir `index.html` en el
navegador o subir los archivos a cualquier hosting estático.

Páginas (todas usan `tailwind.css`, `styles.css` y `script.js`):

| Página | Contenido |
|--------|-----------|
| `index.html` | carrusel de flyers y promociones, barra de preguntas, hero, "Nuestros servicios", "Cómo funciona" y preguntas frecuentes |
| `firma.html` | firma electrónica: beneficios, planes por vigencia, requisitos y formas de pago |
| `facturacion.html` | facturación electrónica: beneficios, planes de comprobantes, requisitos por tipo de cliente y formas de pago |
| `privacidad.html`, `terminos.html` | aviso de privacidad y términos del servicio |

**Marcado compartido**: la cabecera (con el menú) y el pie (footer, botones flotantes y modal de
asesores) son **idénticos** en todas las páginas, entre los comentarios
`<!-- COMPARTIDO: INICIO … -->` y `<!-- COMPARTIDO: FIN … -->`. Si cambias uno, copia el mismo
bloque en las demás páginas: `tests/layout.test.js` falla si alguna queda distinta. Los enlaces
antiguos a `index.html#firma-electronica`, `#facturacion` o `#requisitos` se redirigen solos a la
página nueva.

## Cómo editar precios, asesores, horarios y promociones

Todo está en **un solo lugar**: el objeto `siteData`, al inicio de `script.js`
(sección `1. DATOS DEL NEGOCIO`). No hay que tocar el HTML.

| Quiero cambiar… | Edita en `siteData` |
|-----------------|---------------------|
| Precio de una firma | `firmaPlans[…].precio` (número, con IVA; ej. `15.00`). `anios` es `null` en planes por días |
| Precio de comprobantes | `comprobantesPlans[…].precioNatural` / `precioJuridica`; la cantidad es `total` (ej. `50`) |
| Número de un asesor | `asesores[…].whatsapp` (12 dígitos, sin `+`; ej. `593960178652`) |
| Página de Facebook | `negocio.facebookUrl` |
| Horario de atención | `negocio.horario.semana` / `.sabado` → `{ inicio: '09:00', fin: '18:00' }` (hora de Ecuador; `fin` exclusivo) |
| Entrega el mismo día | `negocio.entrega.horaLimiteSemana` / `.horaLimiteSabado` (`'HH:MM'` o `null`) |
| Razón social, RUC, ciudad, entidad certificadora | `negocio.legal.*` (`null` = aún no se muestra) |
| Mensajes de WhatsApp | `negocio.mensajes` (`{negocio}` y `{producto}`; sin datos del cliente) |
| Promoción | `promociones[…]`: `titulo`, `producto`, `inicio`, `fin` (`AAAA-MM-DD`) y `variantes` |
| Medición (Umami) | `medicion.websiteId` y `medicion.dominio` (`null` = no se mide) |
| Flyers del carrusel | `flyers[…]` (ver "Publicar un flyer") |
| Bancos para transferencias | `bancos[…]`: `sigla`, `nombre` y `estilo` (`rosa`, `amarillo`, `turquesa` o `esmeralda`); se muestran en `firma.html` y `facturacion.html` |

- Los precios se muestran siempre como `$NN,NN` con IVA incluido.
- **Promociones**: cada variante es `{ pagaAnios, recibeAnios, precio? }`. Si no lleva `precio`,
  se usa el del plan de firma de `pagaAnios` años. Una promoción aparece sola entre su `inicio`
  y su `fin` (hora de Ecuador, día de fin completo), con su banner, el enlace "Promociones" del
  menú y un aviso en la tarjeta de firma correspondiente; al vencer desaparece todo. Para
  publicar otra promoción basta con agregarla a `promociones`.
- **Asesor sugerido**: en cada visita el modal sugiere uno de los dos asesores al azar (mitad y
  mitad); el otro sigue disponible.

### Probar desde la consola del navegador

```js
applyPromotions(new Date('2026-12-01T00:00:00-05:00'));       // otra fecha para las promociones
renderAttentionStatus(new Date('2026-11-28T14:30:00-05:00')); // otra hora para "Atendiendo ahora"
```

## Publicar un flyer

El carrusel de la página principal muestra primero las promociones vigentes y después los
flyers de `siteData.flyers`. Para publicar uno no hace falta tocar el HTML:

1. **Prepara la imagen**: 1920×600 px para escritorio (y, si quieres, una versión para tablet,
   de 641 a 1024 px de ancho, y otra para móvil, de hasta 640 px; pueden tener cualquier
   proporción, por ejemplo 1080×1080 px), en **WebP** y de **250 KB como máximo**. Puedes convertirla con, por ejemplo, squoosh.app.
   **La imagen no puede llevar precios ni montos**: si la promoción tiene precio, agrégala en
   `siteData.promociones`, que genera su propia diapositiva con los precios del sitio.
2. **Copia la imagen** a `img/flyers/`, con un nombre en minúsculas y guiones
   (por ejemplo `img/flyers/feriado-diciembre.webp`).
3. **Agrega sus datos** en `script.js` → `siteData.flyers`, en la posición donde quieras verlo:

   ```js
   {
       id: 'feriado-diciembre',
       tipo: 'promocion',          // 'promocion' (inicio y fin obligatorios) o 'informativo'
       imagen: 'img/flyers/feriado-diciembre.webp',
       imagenTablet: 'img/flyers/feriado-diciembre-tablet.webp', // opcional
       imagenMovil: 'img/flyers/feriado-diciembre-movil.webp',   // opcional
       alt: 'Atención especial en feriados de diciembre: escríbenos por WhatsApp',
       destino: { tipo: 'contacto', mensaje: 'Consulta por el flyer de feriados de diciembre' },  // opcional
       inicio: '2026-12-01',
       fin: '2026-12-31'
   }
   ```

   - `alt` describe lo que dice la imagen (10 a 200 caracteres): es lo que lee un lector de
     pantalla.
   - `destino` es opcional: `{ tipo: 'contacto', mensaje: '…' }` abre WhatsApp con ese mensaje, y
     `{ tipo: 'pagina', pagina: 'firma.html' }` lleva a una página del sitio (`index.html`,
     `firma.html` o `facturacion.html`, con o sin `#ancla`).
   - El flyer aparece desde el día `inicio` y desaparece al terminar el día `fin`, en hora de
     Ecuador. Un flyer `informativo` sin fechas queda siempre.
4. **Ejecuta `node --test`**: si algo está mal (imagen inexistente o muy pesada, promoción sin
   fechas, fecha de fin anterior a la de inicio o destino no permitido), la prueba indica qué
   flyer y qué campo corregir.
5. **Sube el cambio a `main`**: Vercel lo publica solo.

Para retirar un flyer, borra su objeto de `siteData.flyers` (y su imagen de `img/flyers/`). Si
retiras el primer flyer `informativo` permanente, actualiza también el respaldo sin JavaScript
de `section#promociones` en `index.html` (la prueba lo avisa).

## Regenerar estilos

Los estilos de Tailwind están precompilados en `tailwind.css`, que se versiona. Solo hace falta
regenerarlo si **agregas o cambias clases** en el HTML o en `script.js`:

```bash
npx tailwindcss@3.4 -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify
```

La configuración (colores `taris-*`, sombras, fuente) está en `tailwind.config.js`. La fuente
Inter se sirve desde `fonts/` (licencia en `fonts/OFL.txt`). Si olvidas regenerar,
`tests/styles.test.js` falla y lista las clases que faltan.

## Pruebas

Requiere Node.js 18 o superior (solo para desarrollo; el sitio no lo necesita):

```bash
node --test
```

Las pruebas están en `tests/` y no usan dependencias. Validan los datos, los textos que recibe
el asesor, las promociones, el horario de atención y que el HTML no tenga números, URLs ni
precios escritos a mano.

### Datos pendientes y modo publicación

Algunos datos los debe entregar el responsable del negocio (dominio, RUC, entidad certificadora,
horas límite de entrega, cuenta de Umami). Mientras falten, `node --test` los lista como `todo`
sin fallar. **Antes de publicar**, ejecuta el modo publicación, donde cada pendiente es un fallo:

```bash
PUBLICAR=1 node --test            # bash
$env:PUBLICAR = '1'; node --test  # PowerShell
```

El dominio también se escribe en el `<head>` de las páginas: reemplaza `__DOMINIO__` por el
dominio real (el mismo de `siteData.medicion.dominio`).

## Seguridad

- Cada página define una Content-Security-Policy en un `<meta>`; si agregas un recurso externo,
  añade su origen a la política. Opcionalmente, el hosting puede enviar además la cabecera
  `frame-ancestors 'none'` (no se puede fijar por `<meta>`).
- La medición no carga scripts de terceros ni usa cookies: `script.js` envía los eventos a Umami
  solo en el dominio público y respeta "No rastrear".

## Archivos sensibles

Este repositorio **no** debe contener certificados (`.p12`, `.pfx`), claves, archivos `.env`
ni documentos de clientes; `.gitignore` los excluye. Si necesitas guardar documentos de
clientes en tu equipo, usa solo la carpeta `documentos-clientes/`, que git ignora por completo.

## Reglas del proyecto

Ver la constitución en `.specify/memory/constitution.md`.

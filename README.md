# TariFirmaDigital
Web para venta de Firmas

Sitio estático de Tari's Firma Digital: Firma Electrónica (archivo P12) y planes de
Facturación Electrónica en Ecuador. La venta se cierra por WhatsApp con los asesores.
No necesita compilación para abrirse ni publicarse: basta con abrir `index.html` en el
navegador o subir los archivos a cualquier hosting estático.

Páginas: `index.html` (venta), `privacidad.html` (aviso de privacidad) y `terminos.html`
(términos del servicio). Todas usan `tailwind.css`, `styles.css` y `script.js`.

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

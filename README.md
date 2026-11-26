# TariFirmaDigital
Web para venta de Firmas

Sitio estático de Tari's Firma Digital: Firma Electrónica (archivo P12) y planes de
Facturación Electrónica en Ecuador. La venta se cierra por WhatsApp con los asesores.
No necesita compilación: basta con abrir `index.html` en el navegador o publicarlo en
cualquier hosting estático.

## Cómo editar precios, asesores, horarios y promociones

Todo está en **un solo lugar**: el objeto `siteData`, al inicio de `script.js`
(sección `1. DATOS DEL NEGOCIO`). No hay que tocar `index.html`.

| Quiero cambiar… | Edita en `siteData` |
|-----------------|---------------------|
| Precio de una firma | `firmaPlans[…].precio` (número, con IVA; ej. `15.00`) |
| Precio de comprobantes | `comprobantesPlans[…].precioNatural` / `precioJuridica` |
| Número de un asesor | `asesores[…].whatsapp` (12 dígitos, sin `+`; ej. `593960178652`) |
| Página de Facebook | `negocio.facebookUrl` |
| Horario de atención | `negocio.horario.semana` / `negocio.horario.sabado` |
| Promoción | `promociones[…]`: `precio`, `inicio` y `fin` (`AAAA-MM-DD`) |

- Los precios se muestran siempre como `$NN,NN` con IVA incluido.
- Una promoción aparece sola entre su fecha de `inicio` y de `fin` (hora de Ecuador, día de
  fin completo) y se oculta sola al vencer, junto con el enlace "Promociones" del menú.
- Para probar otra fecha, abre la consola del navegador y ejecuta, por ejemplo:
  `applyPromotions(new Date('2026-12-01T00:00:00-05:00'))`.

## Pruebas

Requiere Node.js 18 o superior (solo para desarrollo; el sitio no lo necesita):

```bash
node --test
```

Las pruebas están en `tests/` y no usan dependencias. Después de cambiar datos, ejecútalas:
validan los formatos y que `index.html` no tenga números, URLs ni precios escritos a mano.

## Archivos sensibles

Este repositorio **no** debe contener certificados (`.p12`, `.pfx`), claves, archivos `.env`
ni documentos de clientes; `.gitignore` los excluye. Si necesitas guardar documentos de
clientes en tu equipo, usa solo la carpeta `documentos-clientes/`, que git ignora por completo.

## Reglas del proyecto

Ver la constitución en `.specify/memory/constitution.md`.

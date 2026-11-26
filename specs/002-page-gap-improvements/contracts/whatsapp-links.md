# Contract: Enlaces de WhatsApp (versión 002)

Amplía
[001/contracts/whatsapp-links.md](../../001-fix-constitution-compliance/contracts/whatsapp-links.md).
El formato del enlace (`https://wa.me/<whatsapp>?text=<encodeURIComponent(mensaje)>`) y los
atributos `target`/`rel` no cambian.

## Qué cambia

1. **Saludo**: las plantillas `ayuda` y `producto` ya no usan `{asesor}` (FR-026). El asesor sigue
   identificado por el número al que llega el mensaje.
2. **Claves nuevas**: `promo:<id>:<v>` y `renovacion` (data-model → Descripción del producto).
3. **Promoción**: el texto lleva el sufijo `- Valor: $NN,NN inc. IVA`, como el catálogo.
4. **Sin datos del visitante**: no cambia. Ninguna clave nueva agrega datos personales ni
   referencias de medición al mensaje (FR-028, FR-037).

## Ejemplos esperados (reemplazan los de 001 que cambian)

| Entrada | `text` decodificado esperado |
|---------|------------------------------|
| asesor1, mensaje `info` | sin cambios: `Hola Tari's Firma Digital, deseo información sobre Firma y Facturación Electrónica.` |
| asesor2, mensaje `ayuda` | `Hola, equipo de Tari's Firma Digital, necesito ayuda.` |
| asesor1, producto `firma:2` | `Hola, equipo de Tari's Firma Digital, estoy interesado en adquirir:\n*Firma Electrónica (1 AÑO) - Valor: $15,00 inc. IVA*\n\nPor favor ayúdeme con el proceso.` |
| asesor2, producto `promo:firma-2-anios-nov-2026:1` | `Hola, equipo de Tari's Firma Digital, estoy interesado en adquirir:\n*PROMOCIÓN VIGENTE (9 al 30 Nov): Firma Electrónica por 3 años (pagas 2) - Valor: $21,00 inc. IVA*\n\nPor favor ayúdeme con el proceso.` |
| asesor1, producto `renovacion` | `Hola, equipo de Tari's Firma Digital, estoy interesado en adquirir:\n*Renovación de Firma Electrónica*\n\nPor favor ayúdeme con el proceso.` |

`href` de `asesor2` + `ayuda`:
`https://wa.me/593969790890?text=Hola%2C%20equipo%20de%20Tari's%20Firma%20Digital%2C%20necesito%20ayuda.`

## Modal

- Los dos enlaces (`#link-asesor-1`, `#link-asesor-2`) reciben el mismo mensaje; solo cambia el
  número.
- El enlace del asesor sugerido va primero, con el estilo dorado y `data-suggested-badge`
  visible. El otro sigue siendo un enlace activo (FR-027).

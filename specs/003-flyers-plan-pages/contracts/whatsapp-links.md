# Contract: Enlaces de WhatsApp (versión 003)

Amplía
[002/contracts/whatsapp-links.md](../../002-page-gap-improvements/contracts/whatsapp-links.md). El
formato del enlace y las plantillas no cambian.

## Claves nuevas

| Entrada | `text` decodificado esperado |
|---------|------------------------------|
| asesor1, producto `facturacion:natural` | `Hola, equipo de Tari's Firma Digital, estoy interesado en adquirir:\n*Sistema de Facturación Electrónica (Persona Natural) - Consulta de requisitos*\n\nPor favor ayúdeme con el proceso.` |
| asesor2, producto `facturacion:juridica` | igual, con `(Persona Jurídica)` |
| asesor1, producto `flyer:<id>` con `mensaje: 'Consulta por el flyer de feriados de diciembre'` | `Hola, equipo de Tari's Firma Digital, estoy interesado en adquirir:\n*Consulta por el flyer de feriados de diciembre*\n\nPor favor ayúdeme con el proceso.` |

## Reglas

- `flyer:<id>` devuelve `null`, y el modal no se abre, si el flyer no existe, no está vigente o su
  destino no es de contacto.
- Los botones de la diapositiva de promoción siguen usando `promo:<id>:<v>`, con el mismo texto de
  la feature 002.

# Contract: Enlaces de WhatsApp y Facebook

Interfaz externa del sitio: los enlaces que abren WhatsApp con un mensaje prellenado. Es lo que
recibe el asesor, así que su formato es parte del contrato comercial.

## Formato del enlace de WhatsApp

```text
https://wa.me/<whatsapp>?text=<encodeURIComponent(mensaje)>
```

- `<whatsapp>`: los 12 dígitos del asesor (p. ej. `593960178652`), sin `+` ni espacios.
- `mensaje`: una plantilla de [data-model.md](../data-model.md) con `{negocio}`, `{asesor}` y
  `{producto}` sustituidos. MUST codificarse con `encodeURIComponent`.
- El mensaje MUST contener solo datos del negocio, del asesor y del producto; nunca datos del
  visitante (Principio III).

## Atributos obligatorios del `<a>`

`target="_blank"` y `rel="noopener noreferrer"` en todo enlace a WhatsApp o Facebook.

## Ejemplos esperados (para pruebas)

| Entrada | `href` esperado |
|---------|-----------------|
| asesor1, mensaje `info` | `https://wa.me/593960178652?text=Hola%20Tari's%20Firma%20Digital%2C%20deseo%20informaci%C3%B3n%20sobre%20Firma%20y%20Facturaci%C3%B3n%20Electr%C3%B3nica.` |
| asesor2, mensaje `ayuda` | `https://wa.me/593969790890?text=Hola%20Asesor%202%20de%20Tari's%20Firma%20Digital%2C%20necesito%20ayuda.` |
| asesor1, producto `firma:2` | `text` decodificado = `Hola Asesor 1 de Tari's Firma Digital, estoy interesado en adquirir:\n*Firma Electrónica (1 AÑO) - Valor: $15,00 inc. IVA*\n\nPor favor ayúdeme con el proceso.` |

Nota: `encodeURIComponent` no codifica el apóstrofe (`'`) y sí la coma (`%2C`). WhatsApp acepta
ambos; el cambio respecto a los enlaces escritos a mano actuales (que dejaban la coma sin
codificar) no altera el mensaje recibido.

## Facebook

`href` = `facebookUrl` de los datos del negocio, sin parámetros adicionales.

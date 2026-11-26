# Quickstart: validar la feature 001-fix-constitution-compliance

## Requisitos

- Node.js 18 o superior (probado con v24.21.0). Solo para las pruebas; el sitio no lo necesita.
- Un navegador actual (Chrome, Edge, Firefox o Safari).
- Estar en la rama `001-fix-constitution-compliance`.

## 1. Pruebas automatizadas

```bash
node --test
```

Esperado: todas las pruebas pasan. Cubren `formatPrice`, `formatPhone`, `buildWhatsAppUrl`,
`buildProductDescription`, `isPromotionActive`, `formatDateRange`, `escapeHtml` y las
invariantes de [contracts/dom-hooks.md](contracts/dom-hooks.md) (sin `onclick`, sin números
ni URLs en el HTML, promoción oculta por defecto).

## 2. `.gitignore` (User Story 3)

```bash
touch prueba.p12 PRUEBA.PFX clave.key cert.pem .env .env.local
mkdir -p documentos-clientes && touch documentos-clientes/cedula.jpg
git status --short
rm -rf prueba.p12 PRUEBA.PFX clave.key cert.pem .env .env.local documentos-clientes
```

Esperado: `git status --short` no lista ninguno de esos archivos.

Revisión del historial (FR-011):

```bash
git log --all --name-only --format= | sort -u | grep -iE '\.(p12|pfx|key|pem|crt|cer)$|(^|/)\.env'
```

Esperado: sin resultados.

## 3. Verificación manual (Principio IV)

Abrir `index.html` directamente (doble clic) con la consola de desarrollador abierta.

1. **Consola**: sin errores ni advertencias.
2. **Diseño**: comparar con el sitio actual en 375 px y en ≥ 1024 px; debe verse igual (FR-021).
3. **Precios** (User Story 1): todas las tarjetas, Natural y Jurídica, muestran `$NN,NN` con
   "IVA incluido". Pulsar "Comprar Plan" en 1 AÑO: el modal muestra
   `Firma Electrónica (1 AÑO) - Valor: $15,00 inc. IVA`.
4. **Contacto** (User Story 2): la sección principal, el pie y el modal muestran
   `+593 96 017 8652` y `+593 96 979 0890`. Cada enlace abre el asesor correcto en una pestaña
   nueva. Los horarios de la barra superior y del pie coinciden.
5. **Modal con teclado** (User Story 5): Tab hasta "Contáctanos" → Enter → el foco entra al
   modal → Tab no sale del modal → Escape lo cierra y el foco vuelve a "Contáctanos".
6. **Caracteres especiales** (User Story 4): en la consola, añadir temporalmente un plan con
   apóstrofe y comillas al arreglo de planes de firma y volver a renderizar; su botón abre el
   modal con el nombre íntegro.
7. **Sin JavaScript**: desactivar JavaScript y recargar; aparece el aviso para activarlo.

## 4. Vigencia de la promoción (User Story 6)

En la consola del navegador, con el sitio abierto:

```js
applyPromotions(new Date('2026-11-30T23:30:00-05:00')); // último día: visible
applyPromotions(new Date('2026-12-01T00:00:00-05:00')); // vencida: oculta, menú sin "Promociones"
applyPromotions(new Date('2026-11-08T12:00:00-05:00')); // aún no empieza: oculta
applyPromotions();                                      // fecha real
```

Esperado: la sección `#promociones` y los dos enlaces "Promociones" (escritorio y móvil)
aparecen o desaparecen según el comentario. Cuando está visible, el texto de vigencia dice
"Del 9 de noviembre al 30 de noviembre" y el precio es `$14,99`.

## 5. Fuente única (SC-002)

Cambiar temporalmente el número de `asesor1` en los datos de `script.js`, recargar y
comprobar que la sección principal, el pie, el modal y los enlaces usan el número nuevo.
Revertir el cambio.

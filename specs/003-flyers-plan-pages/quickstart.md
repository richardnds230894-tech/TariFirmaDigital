# Quickstart: validar la feature 003

Complementa la verificación manual del Principio IV y el
[quickstart de la feature 002](../002-page-gap-improvements/quickstart.md), que sigue vigente.
Los detalles de cada interfaz están en [contracts/](contracts/) y en [data-model.md](data-model.md).

## 1. Pruebas automatizadas

```bash
node --test
npx tailwindcss@3.4 -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify   # si cambiaron clases
```

Esperado: 0 `fail`. Los pendientes del responsable bajan a 3 (la entidad certificadora ya está
cargada).

## 2. Página principal (US1, US3)

1. Abre `index.html`. Debajo de la cabecera se ven el carrusel, la barra dorada "Preguntas
   frecuentes", el hero, "Nuestros servicios", "Cómo funciona", las preguntas y el footer (FR-011).
2. **Carrusel**, con la promoción vigente (hasta el 30-11-2026):
   - la primera diapositiva es la promoción, con sus 3 variantes y precios con "IVA incluido";
   - la segunda es el flyer de recomendación;
   - avanza solo cada 6 s y se detiene con el puntero encima o con el foco dentro;
   - el botón de pausa lo detiene y lo reanuda.
3. Usa las flechas, los indicadores, las flechas del teclado (con el foco dentro) y desliza en
   375 px (FR-003).
4. Con un lector de pantalla se anuncia "carrusel" y "diapositiva 2 de 2".
5. Activa "Reducir movimiento" en el sistema operativo y recarga: no avanza solo (FR-004).
6. En la consola, `applyPromotions(new Date('2026-12-01T00:00:00-05:00'))`: desaparece la
   diapositiva de promoción y queda solo el flyer, sin flechas ni indicadores (US1, escenarios 5 y
   6).
7. Pulsa el flyer de recomendación: lleva a `firma.html`.
8. "Saber más" de cada servicio abre `firma.html` o `facturacion.html` en la misma pestaña
   (FR-012).
9. Desactiva JavaScript: el primer flyer se ve como imagen estática.

## 3. Publicar un flyer propio (US2)

Sigue [contracts/flyers.md](contracts/flyers.md) con una imagen de prueba y fechas de hoy a
mañana:
1. `node --test` pasa.
2. El flyer aparece en el carrusel en su posición.
3. Con una fecha de fin de ayer, desaparece.
4. Con `destino.pagina: 'https://otro.sitio'`, `node --test` falla con un mensaje claro.

Revierte el cambio al terminar.

## 4. Página de firma (US4)

1. `firma.html`:
   - el titular para obtener o renovar la firma;
   - los botones "Obtener mi firma" (lleva a los planes) y "Renovar mi firma" (abre el modal con
     "Renovación de Firma Electrónica");
   - los beneficios, incluida la asesoría postventa.
2. **Planes**:
   - tarjetas con "Persona Natural", "Vigencia …", precio con "IVA incluido" y "Más popular" en
     1 año;
   - costo por año en los planes de 2 a 5 años y el aviso de promoción;
   - no hay selector de tipo de cliente ni token.
3. "Comprar ahora" en 1 año: el modal y el mensaje dicen
   `Firma Electrónica (1 AÑO) - Valor: $15,00 inc. IVA` (sin cambios).
4. "Ver requisitos" baja a `#requisitos`. Las formas de pago muestran los 4 bancos.

## 5. Página de facturación (US5)

1. `facturacion.html`: banner de beneficios con "¡Empieza ahora!".
2. El selector Natural/Jurídica cambia precios y avisos como hoy.
3. **Requisitos**: dos tarjetas, Persona Natural y Persona Jurídica (Representante Legal), sin
   "Miembro de Empresa";
   "Solicítalo aquí" abre el modal con `Sistema de Facturación Electrónica (Persona …) - Consulta de
   requisitos`.
4. Las formas de pago muestran los mismos 4 bancos que en `firma.html`.

## 6. Navegación (US6)

1. En las cinco páginas, el menú de escritorio y el móvil llevan a Inicio, Firma, Facturación, Cómo
   funciona y Preguntas. El enlace de la página actual se anuncia como página actual.
2. Abre `index.html#firma-electronica`: termina en `firma.html#firma-electronica`. Lo mismo con
   `#facturacion` y `#requisitos` (FR-027).
3. El hero dice "Emitida por Uanataca, entidad certificadora acreditada" (FR-029).

## 7. Validación final

1. Validador W3C (vnu, en local) en las cinco páginas: 0 errores.
2. La consola sin errores ni advertencias, por `file://` y en el hosting; Chrome y Firefox.
3. Lighthouse en móvil "Slow 4G" en `index.html`: el primer flyer visible en menos de 3 s (SC-001).
4. Tras publicar: vista previa de `firma.html` y `facturacion.html` en WhatsApp y Facebook
   (FR-028).

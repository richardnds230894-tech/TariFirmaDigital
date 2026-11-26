# Quickstart: validar la feature 002

Guía para comprobar que la feature funciona de punta a punta. Complementa la verificación manual
del Principio IV de la constitución, que sigue siendo obligatoria. Los detalles de cada interfaz
están en [contracts/](contracts/) y en [data-model.md](data-model.md).

## Requisitos previos

- Node.js 18 o superior (probado con v24.21.0).
- Navegador actual (Chrome o Edge para las herramientas de desarrollo; Safari iOS o un emulador
  de 375 px para móvil).
- Opcional: un lector de pantalla (NVDA en Windows o VoiceOver en iOS/macOS).

## 1. Pruebas automatizadas

```bash
node --test
```

Esperado: 0 `fail`. Las entradas `todo` listan los datos que aún debe entregar el responsable
(research R14).

**Antes de publicar** se ejecuta en modo publicación, donde cada pendiente es un fallo:

```bash
PUBLICAR=1 node --test
```

En PowerShell: `$env:PUBLICAR = '1'; node --test`. Para publicar MUST terminar con 0 `fail`.

Si cambiaste clases de estilo, primero regenera la hoja:

```bash
npx tailwindcss@3.4 -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify
```

Si olvidas regenerar, `tests/styles.test.js` falla y lista las clases que faltan.

## 2. Consola y recursos (US10)

1. Abre `index.html` directamente (doble clic) y con un servidor local:
   `npx http-server -p 8080`, y luego `http://localhost:8080`.
2. Consola: **sin errores ni advertencias** (FR-034). En particular, sin el aviso de Tailwind en
   modo desarrollo ni violaciones de la CSP. Repetir la apertura por `file://` en Chrome,
   Firefox y Safari (research R13, riesgo con `file://`).
3. Rendimiento (SC-007): Lighthouse en modo móvil con la limitación "Slow 4G" sobre la página
   publicada o servida en local. Esperado: LCP < 3 s.
4. Pestaña Red: no hay peticiones a `cdn.tailwindcss.com` ni a `fonts.googleapis.com`. La hoja
   de Font Awesome carga con `integrity`. En `localhost` no hay peticiones a Umami (FR-037a).
5. Desactiva JavaScript y recarga. Se ve el aviso `noscript`, y el proceso, los requisitos y las
   preguntas frecuentes se leen **con estilo** (FR-007).

## 3. Proceso, requisitos y entrega (US1)

1. Debajo del hero está "Cómo funciona", con 5 pasos en orden (FR-001).
2. En Requisitos, el certificado de RUC dice "solo si tienes RUC". Hay un bloque aparte para
   facturación, y el aviso "La firma electrónica se emite solo a personas naturales" aparece junto
   a los planes de firma y a los requisitos (FR-002, FR-002a).
3. En Facturación, pulsa "Persona Jurídica": aparece el aviso para empresas. Pulsa "Persona
   Natural": desaparece.
4. El texto de entrega en el hero indica la hora límite, o "Entrega ágil" si aún no hay dato
   (FR-003).

## 4. Preguntas frecuentes (US2)

1. Con el ratón, el toque y luego con Tab + Enter/Espacio, abre y cierra cada pregunta (FR-005).
2. Con un lector de pantalla, se anuncia "contraído/expandido".
3. Al final, "Preguntar a un asesor" abre el modal con "Asesoría General" (FR-006).
4. Las respuestas no contienen precios, teléfonos ni horarios escritos a mano (invariante 9).

## 5. Vista previa al compartir (US3)

Se hace **después de publicar**, con el dominio real.

1. Pega la URL en el depurador de Facebook (Sharing Debugger) y luego en un chat de WhatsApp:
   se ven el título, la descripción y la imagen (SC-003).
2. La pestaña del navegador muestra el icono de Tari's. Al "Agregar a pantalla de inicio" en iOS
   se ve el icono PNG.
3. En la prueba de resultados enriquecidos de Google, la página muestra un `ProfessionalService`
   con teléfonos y horario (FR-011).

## 6. Confianza y legal (US4)

1. El footer muestra razón social, RUC y ciudad, y enlaces a Privacidad y Términos (FR-012). Si
   aún faltan datos, el bloque queda oculto y `node --test` lo marca como `todo`.
2. El hero nombra la entidad certificadora (FR-013).
3. `privacidad.html` cubre todos los puntos de research R11. `terminos.html` cubre reembolso y
   comprobantes no usados (FR-014, FR-015).
4. No existe ningún campo de formulario ni carga de archivos en ninguna página (FR-016).

## 7. Promociones (US5)

En la consola del navegador:

```js
applyPromotions(new Date('2026-11-20T12:00:00-05:00'));   // vigente
```

1. El banner muestra 3 variantes. Cada botón abre el modal con su texto y precio:
   - variante 0: `… por 2 años (pagas 1) - Valor: $14,99 inc. IVA`;
   - variante 1: `… por 3 años (pagas 2) - Valor: $21,00 inc. IVA`.

   Los ejemplos completos están en [contracts/whatsapp-links.md](contracts/whatsapp-links.md)
   (FR-017).
2. La tarjeta "1 AÑO" del catálogo muestra el aviso de promoción y lleva a `#promociones`
   (FR-019).
3. `applyPromotions(new Date('2026-12-01T00:00:00-05:00'))`: desaparecen el banner, los enlaces
   del menú y los avisos de tarjeta (escenario 4 de US5).
4. Agrega temporalmente una segunda promoción en `siteData` **sin tocar el HTML** y recarga:
   aparece sola (FR-020). Luego revierte el cambio.

## 8. Ayuda para elegir (US6)

1. Las tarjetas de 2 a 5 años muestran el costo por año y el ahorro de la tabla de research R7.
   Las de 10 días, 30 días y 1 año no los muestran.
2. Cada plan de comprobantes muestra "≈ N por mes" (50 → 4, 600 → 50).
3. Facturación lista los tipos de comprobante e indica "Necesitas una firma electrónica vigente",
   con un enlace a `#firma-electronica`.

## 9. Contacto y renovación (US7, US8)

En la consola, sin recargar, simula horas con `renderAttentionStatus(new Date(…))`:

| Hora (Ecuador) | Esperado |
|----------------|----------|
| miércoles 10:00 | "Atendiendo ahora" |
| miércoles 18:00 | "Fuera de horario · Te respondemos mañana desde las 9:00" |
| viernes 20:00 | "… el sábado desde las 10:00" |
| sábado 14:30 | "… el lunes desde las 9:00" |
| domingo 12:00 | "… mañana desde las 9:00" |

1. Abre el modal: un asesor aparece primero, dorado y con "Sugerido". El otro sigue clicable.
   Ciérralo y ábrelo otra vez: se sugiere el mismo (FR-027).
2. El mensaje de WhatsApp empieza "Hola, equipo de Tari's Firma Digital…" (FR-026).
3. "Renovar mi firma", en la sección de firma, abre el modal con "Renovación de Firma
   Electrónica" (FR-028).

## 10. Navegación y accesibilidad (US9)

1. En 375 px y en ≥ 1024 px, cada enlace del menú deja el título de su sección visible bajo la
   cabecera (FR-029).
2. En móvil: abre el menú, elige una opción y el menú se cierra. El lector anuncia
   "expandido/contraído" en el botón (FR-030).
3. El selector Natural/Jurídica anuncia "presionado" en la opción activa (FR-031).
4. Activa "Reducir movimiento" en el sistema operativo: el borde de la promoción deja de pulsar
   (FR-032).
5. Con la extensión HeadingsMap, o el panel de accesibilidad: el orden es h1 → h2 → h3 sin saltos
   (FR-033).
6. Pasa `index.html`, `privacidad.html` y `terminos.html` por el validador W3C: 0 errores
   (Principio IV).

## 11. Medición (US10, tras publicar)

1. Con el `websiteId` y el dominio configurados, abre la página publicada y pulsa un plan y un
   asesor.
2. En el panel de Umami, en tiempo real, aparecen el `pageview`, `abrir-contacto` y
   `elegir-asesor` con las propiedades de
   [contracts/analytics-events.md](contracts/analytics-events.md).
3. Con un bloqueador activo, la página funciona igual y la consola no muestra errores (escenario
   5 de US10).
4. En Aplicación → Cookies y Almacenamiento local: vacío.

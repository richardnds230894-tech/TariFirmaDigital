# Contract: Cómo publica el responsable un flyer

Interfaz del responsable del negocio con el sitio (aclaración Q1 = A). No hay panel ni servidor:
se agrega un archivo y un objeto de datos. Este texto se copia al README.

## Pasos

1. Prepara la imagen.
   - **Escritorio**: 1920×600 px (proporción 16:5), en WebP y de 250 KB como máximo.
   - **Móvil** (opcional): 1080×1080 px, también en WebP.
   - Para convertir a WebP sirve, por ejemplo, squoosh.app.
   - **Regla**: la imagen **no puede llevar precios ni montos**. Si la promoción tiene precio,
     agrégala en `siteData.promociones`: el carrusel genera su diapositiva con los precios del
     sitio y la oculta al vencer.
2. Copia la imagen a `img/flyers/` con un nombre en minúsculas y guiones, por ejemplo
   `img/flyers/feriado-diciembre.webp`.
3. En `script.js`, sección `1. DATOS DEL NEGOCIO`, agrega un objeto a `siteData.flyers` en la
   posición donde quieras que aparezca:

   ```text
   {
       id: 'feriado-diciembre',
       tipo: 'promocion',      // 'promocion' (fechas obligatorias) o 'informativo'
       imagen: 'img/flyers/feriado-diciembre.webp',
       imagenMovil: 'img/flyers/feriado-diciembre-movil.webp',   // opcional
       alt: 'Atención especial en feriados de diciembre: escríbenos por WhatsApp',
       destino: { tipo: 'contacto', mensaje: 'Consulta por el flyer de feriados de diciembre' },  // opcional
       inicio: '2026-12-01',   // obligatorio si tipo es 'promocion'
       fin: '2026-12-31'       // obligatorio si tipo es 'promocion'
   }
   ```

4. Ejecuta `node --test`. Si un dato está mal (archivo inexistente, imagen muy pesada, fecha de
   fin anterior a la de inicio, promoción sin fechas o destino no permitido), la prueba lo indica.
5. Sube el cambio a `main`. Vercel lo publica solo.

## Reglas

- Las reglas de los campos están en [data-model.md](../data-model.md) → Flyer.
- `destino.tipo: 'pagina'` solo admite las páginas de la lista blanca.
- Un flyer `tipo: 'promocion'` MUST tener `inicio` y `fin` (Principio V). Un flyer
  `'informativo'` puede no tenerlas y entonces es permanente.
- Las pruebas no pueden leer el texto de una imagen: confirmar que no lleva precios es
  responsabilidad de quien publica el flyer, y se confirma en cada PR.
- El flyer aparece desde el día `inicio` y desaparece al terminar el día `fin`, en hora de
  Ecuador.
- La promoción de precios **no** se publica como flyer de imagen: se agrega a
  `siteData.promociones`, que genera su propia diapositiva con los precios del sitio.

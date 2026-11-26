# Feature Specification: Carrusel de flyers, sección de servicios y páginas propias de planes

**Feature Branch**: `003-flyers-plan-pages`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "Agregar un espacio de flyers para publicidad y promociones que vaya primero; luego 'Nuestros servicios — Conoce lo que ofrecemos para ti'; luego 'Cómo funciona'; luego las preguntas frecuentes; y llevar los planes de firma y los planes del facturador a páginas propias, guiándose de las capturas de referencia y omitiendo 'Miembro de Empresa'."

## Contexto

Las capturas de referencia son de otro sitio del sector. Se toma de ellas **solo la estructura**:
carrusel de banners, tarjetas de servicios, tarjetas de precio por vigencia, tarjetas de
requisitos por tipo de cliente. Su marca, sus fotos, sus textos y sus cifras no se copian. Todo
va con la identidad de Tari's y con afirmaciones que corresponden a su servicio real
(Principio V).

## Clarifications

### Session 2026-11-26

- Q: ¿Se emite firma para representante legal? → A: No. La firma sigue siendo solo para personas
  naturales; la página de firma no tiene selector de tipo de cliente.
- Q: ¿Se ofrece "firma más token"? → A: No. No hay interruptor de token.
- Q: ¿"Otra pestaña" es una página propia o una pestaña nueva del navegador? → A: Páginas propias
  del sitio, que se abren en la misma pestaña.
- Q: ¿Orden de la página principal? → A: Flyers → Nuestros servicios → Cómo funciona → Preguntas
  frecuentes → footer. El hero actual se mantiene.
- Q: ¿Qué pasa con el banner de promoción actual? → A: Se convierte en un flyer temporal que
  desaparece al terminar la vigencia de la promoción.
- Q: ¿La barra "Preguntas frecuentes"? → A: Va debajo del carrusel, con colores de la marca.
- Q: ¿Qué servicios se listan? → A: Solo Firma Electrónica y Facturación Electrónica.
- Q: ¿Accesos rápidos (estado de solicitud, recuperar clave…)? → A: Se omiten por ahora.
- Q: ¿Entidad certificadora? → A: Uanataca.
- Q: ¿Flyers? → A: Se crea un flyer inicial con una recomendación sobre la firma electrónica, y se
  deja un espacio para que el responsable agregue sus propias imágenes y promociones.
- Q: ¿Beneficios? → A: Los que proponga el equipo, más "asesoría postventa para firmar".
- Q: ¿Cómo sube el responsable sus flyers? → A: Copia la imagen a una carpeta del sitio y agrega
  sus datos (orden, destino, fechas) en el archivo de datos; sin servidor ni panel. Los pasos
  quedan en el README.
- Q: ¿Requisitos de facturación para Representante Legal? → A: Los confirmados en noviembre:
  certificado de RUC de la empresa y una firma de la empresa o de su representante legal,
  gestionada por su cuenta.
- Q: ¿Dónde quedan los requisitos y las formas de pago? → A: En cada página de planes: requisitos
  de firma en la de firma, de facturación en la de facturación, y formas de pago en ambas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver primero las promociones y novedades (Priority: P1)

Un visitante entra a la página principal y lo primero que ve es un carrusel de flyers: la
promoción vigente, recomendaciones y publicidad del negocio. Puede pasar de un flyer a otro y
pulsar el que le interesa.

**Why this priority**: es el espacio de publicidad que pidió el negocio y el primer contacto del
visitante con las ofertas.

**Independent Test**: con dos o más flyers vigentes, el carrusel muestra el primero, avanza solo y
con los controles, y cada flyer lleva a su destino.

**Acceptance Scenarios**:

1. **Given** la página principal, **When** carga, **Then** el carrusel de flyers es lo primero
   debajo de la cabecera y muestra el primer flyer vigente.
2. **Given** varios flyers vigentes, **When** el visitante usa las flechas, los indicadores, el
   teclado o desliza en el móvil, **Then** pasa al flyer anterior o siguiente.
3. **Given** el carrusel, **When** pasan unos segundos sin interacción, **Then** avanza solo; se
   detiene mientras el visitante lo tiene en foco o con el puntero encima, y no avanza solo si el
   visitante pidió reducir el movimiento.
4. **Given** la promoción de firma por 2 años vigente, **When** se ve su flyer, **Then** muestra
   sus variantes y precios con "IVA incluido", tomados del mismo dato que el resto del sitio, y su
   botón abre el contacto con esa variante.
5. **Given** que la promoción venció, **When** se carga la página, **Then** su flyer ya no aparece
   y el carrusel sigue con los demás flyers.
6. **Given** un solo flyer vigente, **When** se carga la página, **Then** se muestra sin flechas ni
   indicadores ni avance automático.
7. **Given** el carrusel, **When** se mira justo debajo, **Then** hay una barra "Preguntas
   frecuentes", con colores de la marca, que lleva a la sección de preguntas.

---

### User Story 2 - Publicar un flyer propio sin tocar la estructura (Priority: P1)

El responsable del negocio quiere subir una imagen de publicidad o una promoción nueva, con fechas
de inicio y fin, sin editar la estructura de la página.

**Why this priority**: sin esto, el carrusel quedaría fijo y no serviría como espacio de
publicidad.

**Independent Test**: el responsable agrega un flyer nuevo siguiendo las instrucciones del
README; aparece en el carrusel entre sus fechas y desaparece solo al vencer.

**Acceptance Scenarios**:

1. **Given** una imagen nueva y sus datos (texto alternativo, destino, fechas), **When** el
   responsable copia la imagen a la carpeta de flyers del sitio y registra sus datos en el
   archivo de datos, siguiendo los pasos del README, **Then** el flyer aparece en el carrusel en
   el orden indicado al publicarse el cambio.
2. **Given** un flyer de promoción (siempre lleva fecha de inicio y de fin) o un flyer informativo
   con fecha de fin, **When** esa fecha pasa (hora de Ecuador), **Then** el flyer deja de
   mostrarse sin intervención.
3. **Given** un flyer sin destino, **When** el visitante lo pulsa, **Then** no ocurre nada
   inesperado; un flyer con destino abre WhatsApp con su mensaje o lleva a la página indicada.

---

### User Story 3 - Conocer los servicios desde la página principal (Priority: P1)

Un visitante quiere saber qué ofrece el negocio antes de ver precios.

**Why this priority**: con los planes en páginas propias, esta sección es la puerta de entrada a
cada servicio.

**Independent Test**: la sección "Nuestros servicios — Conoce lo que ofrecemos para ti" muestra
Firma Electrónica y Facturación Electrónica, y cada "Saber más" lleva a su página.

**Acceptance Scenarios**:

1. **Given** la página principal, **When** el visitante llega a "Nuestros servicios", **Then** ve
   dos tarjetas, Firma Electrónica y Facturación Electrónica, cada una con icono, nombre y
   "Saber más".
2. **Given** una tarjeta, **When** se pulsa "Saber más", **Then** se abre la página de ese servicio
   en la misma pestaña.
3. **Given** la página principal, **When** se recorre de arriba abajo, **Then** el orden es:
   flyers, barra de preguntas, hero, Nuestros servicios, Cómo funciona, Preguntas frecuentes y
   footer.

---

### User Story 4 - Elegir y pedir una firma en su propia página (Priority: P2)

Un visitante pulsa "Saber más" en Firma Electrónica y llega a una página dedicada, con el titular
de la firma, sus beneficios, los planes por vigencia y los requisitos.

**Why this priority**: concentra la decisión de compra de la firma en una página clara, como en la
referencia.

**Independent Test**: en la página de firma, cada plan muestra su vigencia, su precio con IVA,
"Ver requisitos" y "Comprar ahora", y el pedido llega al asesor con el plan y el precio exactos.

**Acceptance Scenarios**:

1. **Given** la página de firma, **When** carga, **Then** muestra un titular para obtener o renovar
   la firma, los usos de la firma en Ecuador, un botón para obtenerla y otro para renovarla.
2. **Given** la sección de beneficios, **When** se lee, **Then** muestra entre 3 y 6 beneficios
   reales de Tari's, incluida la asesoría postventa para firmar.
3. **Given** los planes de firma, **When** se muestran, **Then** cada tarjeta indica "Persona
   Natural", la vigencia, el precio con "IVA incluido", "Ver requisitos" y "Comprar ahora"; el plan
   más solicitado se destaca como "Más popular". No hay selector de tipo de cliente ni opción de
   token.
4. **Given** "Comprar ahora", **When** se pulsa, **Then** se abre el modal de asesores con el mismo
   texto y precio que hoy recibe el asesor.
5. **Given** "Ver requisitos", **When** se pulsa, **Then** el visitante llega a los requisitos de la
   firma en la misma página.
6. **Given** la página de firma, **When** se lee, **Then** se mantiene el aviso de que la firma se
   emite solo a personas naturales.

---

### User Story 5 - Elegir y pedir el facturador en su propia página (Priority: P2)

Un visitante pulsa "Saber más" en Facturación Electrónica y llega a una página dedicada, con un
banner de beneficios, los planes de comprobantes y los requisitos por tipo de cliente.

**Why this priority**: igual que US4, para el segundo servicio del negocio.

**Independent Test**: en la página de facturación, el selector Natural/Jurídica cambia los
precios, el pedido llega al asesor con el plan exacto y se ven los requisitos de ambos tipos.

**Acceptance Scenarios**:

1. **Given** la página de facturación, **When** carga, **Then** muestra un banner con los beneficios
   reales del sistema de facturación y un botón para empezar.
2. **Given** los planes de comprobantes, **When** el visitante alterna Persona Natural y Persona
   Jurídica, **Then** los precios cambian como hoy, con "IVA incluido" y el promedio de comprobantes
   por mes.
3. **Given** la sección "Requisitos para obtener tu Sistema de Facturación Electrónica", **When** se
   lee, **Then** muestra una tarjeta por tipo de cliente: Persona Natural y Persona Jurídica
   (Representante Legal), sin "Miembro de Empresa", cada una con su vigencia, sus documentos y un botón
   "Solicítalo aquí" que abre el contacto.
4. **Given** la tarjeta de Persona Jurídica (Representante Legal), **When** se lee, **Then** muestra los requisitos
   confirmados en noviembre: certificado de RUC de la empresa y una firma electrónica vigente de
   la empresa o de su representante legal, gestionada por su cuenta, junto al aviso de que en
   este sitio la firma se emite solo a personas naturales.

---

### User Story 6 - Navegar entre la página principal y las de planes (Priority: P2)

Un visitante quiere moverse entre la página principal, la de firma y la de facturación sin
perderse.

**Why this priority**: al separar los planes, el menú y los enlaces existentes deben seguir
llevando a donde corresponde.

**Independent Test**: desde cualquier página, el menú lleva a las otras dos y a las secciones de la
principal, y los enlaces antiguos a `#firma-electronica` y `#facturacion` siguen llevando a los
planes.

**Acceptance Scenarios**:

1. **Given** cualquier página, **When** se usa el menú de escritorio o el móvil, **Then** hay
   enlaces a Inicio, Firma Electrónica, Facturación Electrónica, Cómo funciona y Preguntas
   frecuentes.
2. **Given** un enlace antiguo o compartido a la sección de firma o de facturación de la página
   principal, **When** se abre, **Then** el visitante llega a los planes correspondientes.
3. **Given** las páginas nuevas, **When** se comparten o se buscan, **Then** tienen su propio título,
   descripción, icono y vista previa.

---

### Edge Cases

- Ningún flyer vigente: el carrusel no se muestra, la barra de preguntas queda arriba y la página
  sigue en orden.
- Un flyer cuya imagen no carga: se ve su texto alternativo y el carrusel sigue funcionando.
- Visitante sin JavaScript: se ve al menos el primer flyer, sin avance automático, y las páginas de
  planes muestran sus textos y requisitos.
- Flyer con una fecha de fin anterior a la de inicio: es un dato inválido que las pruebas
  automáticas rechazan antes de publicar.
- Flyer de promoción sin fecha de inicio o de fin: es un dato inválido que las pruebas rechazan
  antes de publicar (Principio V).
- Varias promociones vigentes a la vez: cada una tiene su flyer.
- Las imágenes de flyers MUST NOT contener precios. Una promoción con precio se publica en los
  datos de promociones, que generan su propia diapositiva con los precios del sitio (Principio V).
- Pantalla de 375 px: el flyer se ve completo, sin texto cortado, y sus controles se pueden tocar.

## Requirements *(mandatory)*

### Functional Requirements

**Carrusel de flyers (US1, US2)**

- **FR-001**: La página principal MUST mostrar un carrusel de flyers, en la posición que fija
  FR-011.
- **FR-002**: El carrusel MUST mostrar solo los flyers vigentes en hora de Ecuador, en el orden
  definido por el responsable.
- **FR-003**: El carrusel MUST permitir avanzar y retroceder con flechas, indicadores, teclado y
  gesto de deslizar, y MUST anunciar a tecnologías de apoyo qué flyer se muestra (por ejemplo,
  "2 de 3").
- **FR-004**: El carrusel MUST avanzar solo cada 6 segundos, MUST detenerse con foco o puntero
  encima y MUST NOT avanzar solo si el visitante pidió reducir el movimiento. MUST tener un control
  para pausar.
- **FR-005**: Cada flyer de imagen MUST tener texto alternativo que transmita su mensaje.
- **FR-006**: Cada flyer MAY tener un destino: abrir el contacto por WhatsApp con un mensaje sin
  datos del visitante, o ir a una página del sitio.
- **FR-007**: La promoción de firma vigente MUST mostrarse como un flyer generado a partir de sus
  datos, con sus variantes y precios con "IVA incluido", y MUST desaparecer al terminar su
  vigencia. Sustituye al banner de promoción actual.
- **FR-008**: El sitio MUST incluir un flyer inicial con una recomendación sobre el uso seguro de la
  firma electrónica, sin precios.
- **FR-009**: El responsable MUST poder agregar, cambiar o retirar flyers copiando la imagen a la
  carpeta de flyers y editando solo sus datos (tipo, imagen, texto alternativo, orden, destino
  opcional y fechas), sin servidor ni panel de administración, con pasos documentados en el
  README. Cada flyer es de **promoción** o **informativo**; un flyer de promoción MUST tener fecha
  de inicio y de fin (Principio V), y uno informativo las tiene opcionales.
- **FR-009a**: Las imágenes de los flyers MUST NOT contener precios ni montos (Principio V).
- **FR-010**: Debajo del carrusel MUST haber una barra "Preguntas frecuentes" con colores de la
  marca que lleve a la sección de preguntas.

**Página principal (US3)**

- **FR-011**: La página principal MUST seguir este orden: carrusel, barra de preguntas, hero,
  "Nuestros servicios", "Cómo funciona", preguntas frecuentes y footer.
- **FR-012**: La sección "Nuestros servicios — Conoce lo que ofrecemos para ti" MUST mostrar dos
  tarjetas, Firma Electrónica y Facturación Electrónica, cada una con un enlace "Saber más" a su
  página.
- **FR-013**: Los catálogos de planes de firma y de comprobantes MUST dejar de mostrarse en la
  página principal y pasar a sus páginas propias.
- **FR-014**: Los requisitos de firma MUST pasar a la página de firma, los de facturación a la
  página de facturación, y las formas de pago MUST mostrarse en ambas, a partir de una sola
  definición de los bancos para no duplicar datos.

**Página de firma (US4)**

- **FR-015**: MUST existir una página propia de Firma Electrónica que se abra en la misma pestaña.
- **FR-016**: La página MUST mostrar un titular para obtener o renovar la firma, los usos de la
  firma en Ecuador y botones para obtenerla y para renovarla, este último con el contacto de
  renovación existente. No promete tiempos que no tengan condición (FR-003 de la feature 002).
- **FR-017**: La página MUST mostrar una sección de beneficios con entre 3 y 6 beneficios reales de
  Tari's, incluida la asesoría postventa para firmar.
- **FR-018**: La página MUST mostrar los planes de firma como tarjetas por vigencia, con "Persona
  Natural", el precio con "IVA incluido", "Ver requisitos", "Comprar ahora", y "Más popular" en el
  plan destacado. MUST NOT haber selector de tipo de cliente ni opción de token.
- **FR-019**: "Comprar ahora" MUST abrir el contacto con el mismo texto y precio que el resto del
  sitio (Principio V).
- **FR-020**: La página MUST conservar el costo por año, el ahorro y el aviso de promoción de cada
  plan (feature 002), y el aviso de que la firma se emite solo a personas naturales.

**Página de facturación (US5)**

- **FR-021**: MUST existir una página propia de Facturación Electrónica que se abra en la misma
  pestaña.
- **FR-022**: La página MUST mostrar un banner de beneficios del sistema de facturación con un botón
  para empezar, y solo afirmaciones que correspondan al servicio real.
- **FR-023**: La página MUST mostrar los planes de comprobantes con el selector Persona Natural /
  Persona Jurídica, los precios con "IVA incluido", el promedio por mes, los tipos de comprobante y
  el recordatorio de firma vigente (feature 002).
- **FR-024**: La página MUST mostrar los requisitos para obtener el sistema de facturación en una
  tarjeta por tipo de cliente, Persona Natural y Persona Jurídica (Representante Legal), sin "Miembro de Empresa",
  cada una con su vigencia, sus documentos y un botón "Solicítalo aquí".
- **FR-025**: La tarjeta de Persona Jurídica (Representante Legal) MUST mostrar los requisitos confirmados en
  noviembre (US5, escenario 4) y MUST NOT agregar documentos no confirmados por el responsable.

**Navegación y consistencia (US6)**

- **FR-026**: Todas las páginas MUST compartir la cabecera y el footer, y el menú MUST enlazar a
  Inicio, Firma Electrónica, Facturación Electrónica, Cómo funciona y Preguntas frecuentes.
- **FR-027**: Los enlaces antiguos a la sección de firma y a la de facturación de la página
  principal MUST seguir llevando a los planes correspondientes.
- **FR-028**: Cada página nueva MUST tener su propio título, descripción, enlace canónico, icono y
  vista previa al compartir.
- **FR-029**: La entidad certificadora MUST mostrarse como "Uanataca" donde hoy aparece el texto
  alternativo "una entidad certificadora acreditada".

**Generales**

- **FR-030**: Las imágenes nuevas MUST estar optimizadas y cargarse de forma diferida si no están en
  la primera pantalla.
- **FR-031**: Las páginas MUST NOT usar la marca, las fotos, los textos ni las cifras de los sitios de
  referencia.
- **FR-032**: Los precios, promociones y datos de contacto MUST seguir saliendo de la fuente única
  del sitio, y todo precio visible MUST indicar "IVA incluido" (Principios II y V).
- **FR-033**: Todo texto nuevo de servicio o beneficio MUST contar con la confirmación del
  responsable antes de publicarse (Principio V).

### Key Entities *(include if feature involves data)*

- **Flyer**: imagen, texto alternativo, orden, destino opcional (contacto con mensaje o página del
  sitio) y fechas opcionales de inicio y fin. Un flyer de promoción se genera a partir de la
  Promoción existente.
- **Servicio**: nombre, icono, descripción corta y página de destino (Firma Electrónica, Facturación
  Electrónica).
- **Beneficio**: icono y texto, asociado a la página de firma o a la de facturación.
- **Requisito por tipo de cliente** (facturación): tipo de cliente (Persona Natural, Persona Jurídica /
  Representante Legal), vigencia y lista de documentos.
- **Promoción, Plan de firma y Plan de comprobantes** (existentes): sin cambios en sus reglas; se
  muestran en sus páginas nuevas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El primer flyer se ve completo en menos de 3 segundos en un móvil con conexión 4G
  lenta (≈ 1,6 Mbps de bajada y 150 ms de latencia).
- **SC-002**: Un visitante llega desde la página principal a los planes de firma o de facturación
  en un máximo de 2 clics.
- **SC-003**: El responsable publica un flyer nuevo en menos de 10 minutos siguiendo las
  instrucciones, sin editar la estructura de ninguna página.
- **SC-004**: El 100 % de los flyers vencidos deja de mostrarse el día siguiente a su fecha de fin,
  en hora de Ecuador.
- **SC-005**: El texto y el precio que recibe el asesor coinciden con los de la tarjeta en el 100 %
  de los planes de las páginas nuevas.
- **SC-006**: El carrusel se puede usar completo con teclado y lector de pantalla, sin ningún
  control sin nombre o sin estado.
- **SC-007**: Ninguna página tiene errores en el validador W3C ni advertencias en la consola.

## Assumptions

- El carrusel va arriba del hero ("que vaya primero"); el hero actual se mantiene debajo de la barra
  de preguntas.
- Sin fotos de personas: los flyers y banners usan ilustraciones, iconos y colores de la marca,
  salvo que el responsable aporte fotos propias o con licencia.
- Beneficios propuestos para la firma, a confirmar: atención personalizada por WhatsApp, entrega del
  archivo P12 por correo, cobertura en todo Ecuador, válida para SRI, Quipux y SERCOP, y asesoría
  postventa para firmar.
- Beneficios propuestos para la facturación, a confirmar: emisión de los comprobantes del SRI,
  planes por cantidad con vigencia de un año, precios para persona natural y jurídica, y asesoría
  para empezar. No se afirman "comprobantes ilimitados", app móvil ni capacitaciones mientras el
  responsable no lo confirme.
- La promoción actual (2 años por $14,99, del 9 al 30 de noviembre de 2026) vence en cuatro días; su
  flyer desaparecerá solo.
- Los accesos rápidos (firmar documentos, estado de solicitud, verificar caducidad, recuperar clave)
  quedan fuera de alcance por ahora.
- La medición sin cookies de la feature 002 se extiende a las páginas nuevas y a los clics en los
  flyers.
- Un flyer nuevo se publica cuando el cambio llega a la rama principal, que el hosting publica
  automáticamente.

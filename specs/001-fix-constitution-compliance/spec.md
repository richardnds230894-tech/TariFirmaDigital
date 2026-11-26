# Feature Specification: Corregir incumplimientos de la constitución

**Feature Branch**: `001-fix-constitution-compliance`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "corregir lo que imcumple, el .gitignore y para unificar los precios y los datos de contacto."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Precios coherentes en todo el sitio (Priority: P1)

Un visitante que mira la promoción, las tarjetas del catálogo y luego pulsa "Comprar" ve
siempre el mismo precio, con el mismo formato e indicando que incluye IVA. El asesor recibe por
WhatsApp exactamente el plan y el precio que el visitante vio.

**Why this priority**: un precio distinto entre la tarjeta, el modal y el mensaje genera reclamos
y pérdida de confianza. Es el riesgo comercial más directo (Principio V).

**Independent Test**: recorrer cada tarjeta (firma, comprobantes en Persona Natural y Jurídica,
promoción), abrir el modal y comparar el precio mostrado con el del mensaje de WhatsApp generado.

**Acceptance Scenarios**:

1. **Given** el catálogo de firma electrónica, **When** el visitante pulsa "Comprar Plan" en
   cualquier tarjeta, **Then** el modal y el mensaje de WhatsApp muestran el mismo plan y el
   mismo precio que la tarjeta.
2. **Given** la promoción vigente, **When** el visitante la ve, **Then** su precio aparece con el
   mismo formato que el catálogo (`$14,99`, no `$14.99`) e indica "IVA incluido".
3. **Given** el selector en Persona Jurídica, **When** el visitante pulsa "Solicitar Plan",
   **Then** el mensaje enviado indica "Persona Jurídica" y el precio jurídico correspondiente.
4. **Given** que el responsable cambia un precio, **When** lo modifica en un único lugar,
   **Then** el cambio se refleja en la tarjeta, el modal y el mensaje sin editar nada más.

---

### User Story 2 - Datos de contacto únicos y consistentes (Priority: P1)

Un visitante que busca contactar a un asesor ve los mismos números de WhatsApp, con el mismo
formato, en la cabecera, la sección principal, el pie de página, el botón flotante y el modal.
Cuando el negocio cambia un número, se actualiza en un solo lugar.

**Why this priority**: un número desactualizado en una sola parte del sitio envía clientes a un
contacto equivocado (Principio II).

**Independent Test**: cambiar el número de un asesor en su única definición y comprobar que todos
los puntos de contacto del sitio muestran y enlazan el número nuevo.

**Acceptance Scenarios**:

1. **Given** el sitio cargado, **When** el visitante revisa la sección principal, el pie de
   página y el modal, **Then** cada asesor aparece con el mismo número y el mismo formato visible.
2. **Given** cualquier enlace a WhatsApp del sitio, **When** se pulsa, **Then** abre la
   conversación con el número correcto del asesor indicado.
3. **Given** cualquier enlace a Facebook del sitio, **When** se pulsa, **Then** abre la misma
   página oficial en una pestaña nueva.
4. **Given** el horario de atención, **When** se muestra en la barra superior y en el pie de
   página, **Then** ambos textos coinciden.

---

### User Story 3 - Repositorio protegido frente a archivos sensibles (Priority: P1)

Un miembro del equipo que trabaja con archivos de clientes en su equipo (P12, claves,
documentos, variables de entorno) no puede subirlos por accidente al repositorio.

**Why this priority**: subir un certificado o una cédula de un cliente es una fuga de datos
personales con consecuencias legales (Principio III, no negociable).

**Independent Test**: crear localmente archivos de prueba con las extensiones sensibles y
comprobar que el control de versiones los ignora.

**Acceptance Scenarios**:

1. **Given** un archivo `.p12`, `.pfx`, `.key`, `.pem` o `.env` en la carpeta del proyecto,
   **When** se revisan los cambios pendientes, **Then** ese archivo no aparece como candidato a
   subir.
2. **Given** una carpeta local con documentos de clientes (cédulas, selfies, RUC), **When** se
   ubica en la ruta reservada para ello, **Then** su contenido queda ignorado.
3. **Given** el historial actual del repositorio, **When** se revisa, **Then** se confirma que no
   contiene ninguno de esos archivos.

---

### User Story 4 - Botones de compra robustos y seguros (Priority: P2)

Un visitante pulsa cualquier botón de compra o contacto y el modal se abre con el texto correcto,
aunque el nombre del producto contenga apóstrofes, comillas u otros caracteres especiales (por
ejemplo, "Tari's").

**Why this priority**: hoy los botones arman su acción concatenando texto; un carácter especial
puede romper el botón o abrir la puerta a inyección de contenido (Principio III).

**Independent Test**: agregar temporalmente un plan con apóstrofe y comillas en su nombre y
comprobar que su botón abre el modal con el texto íntegro y que el mensaje se envía bien.

**Acceptance Scenarios**:

1. **Given** un plan cuyo nombre contiene `'` o `"`, **When** el visitante pulsa su botón,
   **Then** el modal muestra el nombre exacto y el mensaje de WhatsApp lo incluye sin cortes.
2. **Given** cualquier texto mostrado en el modal, **When** contiene caracteres con significado
   especial en una página web (`<`, `>`, `&`), **Then** se muestra como texto literal.

---

### User Story 5 - Modal accesible con teclado (Priority: P2)

Un visitante que navega con teclado o lector de pantalla abre el selector de asesor, se mueve
entre las opciones y lo cierra sin usar el ratón.

**Why this priority**: la constitución exige que todo control sea usable con teclado y que el
modal se cierre con Escape.

**Independent Test**: usando solo el teclado, abrir el modal desde el botón "Contáctanos",
recorrer sus opciones con Tab y cerrarlo con Escape.

**Acceptance Scenarios**:

1. **Given** el modal abierto, **When** el visitante pulsa Escape, **Then** el modal se cierra.
2. **Given** el modal recién abierto, **When** aparece, **Then** el foco pasa a un elemento dentro
   del modal y Tab no sale del modal mientras esté abierto.
3. **Given** el modal cerrado, **When** se cierra por cualquier vía, **Then** el foco vuelve al
   botón que lo abrió.
4. **Given** un lector de pantalla, **When** el modal se abre, **Then** se anuncia como diálogo
   con su título "Elige tu Asesor en Línea".

---

### User Story 6 - Promociones que no se muestran vencidas (Priority: P2)

Un visitante que entra después de la fecha de fin de una promoción no la ve publicada ni puede
solicitarla, y el menú no lo lleva a una sección vacía.

**Why this priority**: la promoción actual termina el 30 de noviembre de 2026; publicar ofertas
vencidas incumple el Principio V y puede considerarse publicidad engañosa.

**Independent Test**: simular una fecha posterior al fin de la promoción y comprobar que la
sección y sus enlaces de menú desaparecen; simular una fecha dentro de la vigencia y comprobar
que se muestran.

**Acceptance Scenarios**:

1. **Given** una fecha dentro de la vigencia, **When** el visitante abre el sitio, **Then** ve la
   promoción con sus fechas de inicio y fin.
2. **Given** una fecha posterior al último día de vigencia, **When** el visitante abre el sitio,
   **Then** no ve la sección de promoción ni los enlaces "Promociones" del menú.
3. **Given** el último día de vigencia (30 de noviembre), **When** el visitante abre el sitio
   ese día, **Then** la promoción sigue visible hasta el final del día en hora de Ecuador.

---

### Edge Cases

- Un plan o producto con apóstrofe, comillas, `&` o saltos de línea en su descripción.
- La fecha del dispositivo del visitante es incorrecta: la promoción se rige por esa fecha; se
  acepta ese riesgo (ver Assumptions).
- El visitante abre el modal y cambia el tipo de contribuyente antes de elegir asesor.
- El navegador tiene JavaScript desactivado: el sitio muestra un aviso para activarlo (hoy el
  catálogo y el modal ya dependen de JavaScript).
- Archivos sensibles con extensión en mayúsculas (`.P12`, `.PFX`).
- Ya existía algún archivo sensible en el historial del repositorio antes de esta corrección.

## Requirements *(mandatory)*

### Functional Requirements

**Precios (Principio V)**

- **FR-001**: Cada precio del sitio (firma, comprobantes Natural/Jurídica, promoción) MUST estar
  definido en un único lugar y ser la fuente de la tarjeta, del modal y del mensaje de WhatsApp.
- **FR-002**: Todos los precios MUST mostrarse con el formato `$` + `NN,NN` (coma decimal), incluida
  la promoción (`$14,99`).
- **FR-003**: Todo precio mostrado MUST ir acompañado de la indicación "IVA incluido".
- **FR-004**: El texto del producto en el modal y en el mensaje de WhatsApp MUST coincidir
  carácter por carácter con el plan y el precio de la tarjeta pulsada.

**Datos de contacto (Principio II)**

- **FR-005**: Los números de WhatsApp de Asesor 1 y Asesor 2, la URL de Facebook y el horario de
  atención MUST definirse en un único lugar.
- **FR-006**: Cada número MUST mostrarse con el mismo formato visible en todo el sitio
  (`+593 96 017 8652`, `+593 96 979 0890`).
- **FR-007**: Todos los enlaces a WhatsApp y Facebook MUST conservar su comportamiento actual:
  abrir en pestaña nueva, de forma segura, con el mensaje prellenado que corresponda.
- **FR-008**: Si el navegador no ejecuta scripts, el sitio MUST mostrar un aviso visible que pida
  activarlos para ver planes y contactar a un asesor. Los datos de contacto no se duplican para
  este caso (decisión de plan 2026-11-25, ver research.md R1).

**Archivos sensibles (Principio III)**

- **FR-009**: El repositorio MUST ignorar archivos de certificados y claves (`.p12`, `.pfx`,
  `.key`, `.pem`, `.crt`, `.cer`), de entorno (`.env` y variantes) y documentos de clientes,
  sin distinguir mayúsculas y minúsculas en las extensiones.
- **FR-010**: El repositorio MUST ignorar archivos del sistema operativo y del editor que no
  forman parte del sitio (por ejemplo, miniaturas de Windows y carpetas de configuración local).
- **FR-011**: Antes de cerrar la feature MUST verificarse que el historial del repositorio no
  contiene archivos sensibles; si se encuentra alguno, se informa al responsable antes de actuar.

**Botones y contenido seguro (Principio III)**

- **FR-012**: Los botones de compra y contacto MUST abrir el modal con el texto del producto sin
  construir la acción concatenando ese texto en el propio botón.
- **FR-013**: Todo texto variable que se muestre en la página MUST mostrarse como texto literal,
  nunca interpretarse como marcado.
- **FR-014**: Los mensajes prellenados de WhatsApp MUST contener solo información del producto o
  plan.

**Accesibilidad del modal**

- **FR-015**: El modal MUST cerrarse con la tecla Escape, con el botón de cierre y con un clic
  fuera de la tarjeta.
- **FR-016**: Al abrirse, el modal MUST llevar el foco a su interior y mantenerlo dentro mientras
  esté abierto; al cerrarse MUST devolverlo al elemento que lo abrió.
- **FR-017**: El modal MUST identificarse como diálogo ante tecnologías de asistencia, con su
  título como nombre accesible.

**Vigencia de promociones (Principio V)**

- **FR-018**: Cada promoción MUST tener fecha de inicio y fin definidas en un único lugar, y el
  texto de vigencia visible MUST derivarse de ellas.
- **FR-019**: Fuera de su vigencia, la promoción MUST ocultarse junto con sus enlaces de menú
  (escritorio y móvil).
- **FR-020**: La vigencia MUST incluir el día de fin completo, en hora de Ecuador continental
  (UTC−5).

**Compatibilidad visual**

- **FR-021**: El aspecto visual y el comportamiento del sitio MUST permanecer equivalentes a los
  actuales tras todos los cambios de esta feature.
- **FR-022**: Esta feature MUST NOT cambiar la forma en que se cargan los estilos del sitio
  (ver "Fuera de alcance" en Assumptions).

### Key Entities

- **Plan de Firma Electrónica**: duración, precio con IVA, etiqueta, si es el más popular.
- **Plan de Comprobantes**: cantidad de comprobantes, precio Persona Natural, precio Persona
  Jurídica, descripción. Vigencia fija de 1 año.
- **Promoción**: título, beneficio (pagas N años, recibes N+1), precio con IVA, fecha de inicio,
  fecha de fin.
- **Asesor**: nombre visible (Asesor 1 / Asesor 2), número de WhatsApp, formato visible del
  número, mensaje de saludo.
- **Datos del negocio**: URL de Facebook, horario de lunes a viernes, horario de sábado,
  cobertura.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los precios del sitio usan el mismo formato y coinciden entre tarjeta,
  modal y mensaje de WhatsApp (verificado en las 7 tarjetas de firma, las 12 combinaciones de
  comprobantes y la promoción).
- **SC-002**: Cambiar un precio, un número de asesor o el horario requiere editar exactamente un
  lugar, y el cambio se ve en todos los puntos del sitio.
- **SC-003**: Ningún archivo de las categorías sensibles creado en la carpeta del proyecto aparece
  como pendiente de subir (0 de 0 en la prueba con archivos de muestra).
- **SC-004**: El 100 % de los botones de compra y contacto abren el modal con el texto correcto,
  incluido un plan de prueba con apóstrofe y comillas.
- **SC-005**: Un usuario solo con teclado completa "abrir modal → elegir asesor o cerrar" en
  menos de 10 pulsaciones de tecla.
- **SC-006**: Al día siguiente del fin de una promoción, 0 visitantes ven la promoción ni sus
  enlaces.
- **SC-007**: La verificación manual del Principio IV de la constitución pasa completa, sin errores
  en la consola del navegador, en móvil (375 px) y escritorio (≥ 1024 px).

## Assumptions

- La promoción vigente corresponde al año 2026: del 9 de noviembre de 2026 al 30 de noviembre de
  2026, ambos incluidos.
- La vigencia se evalúa con la fecha del dispositivo del visitante; no hay servidor que dé la
  hora oficial. El riesgo de un reloj mal configurado se acepta.
- El formato visible de los números será el internacional (`+593 …`), que ya usan el pie de página
  y el modal; la sección principal pasa a usarlo también.
- Los números, precios, horarios y textos comerciales actuales son correctos; esta feature no
  cambia ningún valor comercial, solo su formato y su origen.
- La carpeta reservada para documentos de clientes, si alguien la usa localmente, será una carpeta
  dedicada dentro del proyecto que el repositorio ignora por completo.
- Se mantiene el diseño visual actual; no se rediseña ninguna sección.
- Esta feature no añade recolección de datos personales ni scripts de terceros nuevos.
- **Fuera de alcance**: la migración de estilos a una versión apta para producción (dejar de
  usar el CDN de pruebas de Tailwind). Se decidió el 2026-11-25 tratarla en una feature aparte,
  porque añade un paso de desarrollo para regenerar los estilos. Sigue siendo deuda pendiente
  frente a la constitución (Restricciones Técnicas: Producción).

## Clarifications

### Session 2026-11-25

- Q: ¿Se incluye en esta feature la migración de estilos a una versión apta para producción?
  → A: No (opción B). Se trata en una feature aparte; esta feature no cambia la carga de estilos.

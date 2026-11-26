# Feature Specification: Cerrar huecos de la página para vender más y generar confianza

**Feature Branch**: `002-page-gap-improvements`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "busca huecos y dame recomendaciones para mejorar la pagina."

## Contexto: huecos encontrados en la página actual

Revisión de la página publicada en `main` (commit `5abbb97`), contrastada con la constitución
v1.0.0. Cada hueco se resuelve en una historia de usuario más abajo.

| # | Hueco | Dónde se nota | Historia |
|---|-------|---------------|----------|
| H1 | No hay un "cómo funciona": el visitante no sabe qué pasa después de pulsar "Comprar Plan" (requisitos → pago → entrega del P12) | Entre catálogo y requisitos | US1 |
| H2 | Una sola lista de requisitos para todos: el certificado de RUC se pide a todos, y no se aclara que la firma solo se emite a personas naturales | Requisitos y Pagos | US1 |
| H3 | "Entrega mismo día" sin condiciones (hora límite, días hábiles), lo que choca con el Principio V | Tarjeta del hero | US1 |
| H4 | No hay preguntas frecuentes: qué es un P12, cómo se instala, qué pasa si olvido la clave, qué es un comprobante, renovación | Toda la página | US2 |
| H5 | Sin descripción, vista previa para compartir (imagen y texto al pegar el enlace en WhatsApp/Facebook), icono de pestaña ni datos del negocio para buscadores | Datos de la página | US3 |
| H6 | No se identifica al negocio (razón social, RUC, ciudad) ni a la entidad certificadora que emite la firma; "avalada por entidades certificadoras" no dice cuál | Hero y footer | US4 |
| H7 | No hay aviso de privacidad sobre cómo tratan los asesores la cédula y la selfie que se envían por WhatsApp, ni términos (reembolsos, comprobantes no usados) | Footer | US4 |
| H8 | La promoción ofrece "Pagas 2 → te damos 3" y "Pagas 3 → te damos 4", pero solo se puede pedir la variante de 2 años; la tarjeta de "1 AÑO" del catálogo no avisa que hay promoción | Promociones y catálogo | US5 |
| H9 | Agregar una promoción nueva obliga a editar el HTML, aunque el README dice que no hace falta | Enlaces del menú | US5 |
| H10 | No ayuda a elegir: no muestra costo por año en firmas largas, ni cuántos comprobantes equivalen a un mes, ni qué tipos de comprobante incluye; no recuerda que la facturación necesita firma | Catálogo | US6 |
| H11 | El visitante debe elegir entre "Asesor 1" y "Asesor 2" sin ninguna diferencia entre ellos; el mensaje dice "Hola Asesor 1 de…" | Modal | US7 |
| H12 | No indica si están atendiendo ahora; fuera de horario el cliente escribe y no sabe cuándo le responderán | Barra superior y modal | US7 |
| H13 | No hay camino para clientes que vuelven a renovar su firma | Toda la página | US8 |
| H14 | Al pulsar un enlace del menú, el título de la sección queda tapado por la cabecera fija; el menú móvil no se cierra al elegir una opción ni anuncia si está abierto | Navegación | US9 |
| H15 | El selector Natural/Jurídica no anuncia cuál está activo a lectores de pantalla; títulos fuera de orden (h3 antes del primer h2); animación de pulso permanente sin respetar "reducir movimiento"; textos de 10–11 px | Varias | US9 |
| H16 | La consola muestra la advertencia de uso del estilo en modo desarrollo (incumple el paso 1 de la verificación del Principio IV); iconos cargados sin verificación de integridad; año del copyright fijo | Carga de la página y footer | US10 |
| H17 | No hay forma de saber qué planes o botones generan consultas | Todo el sitio | US10 |

## Clarifications

### Session 2026-11-26

- Q: ¿El negocio emite firma para persona jurídica / representante legal? → A: No. La firma
  electrónica solo se emite a personas naturales; la página lo avisa. El certificado de RUC se
  pide solo a quien tiene RUC o compra facturación.
- Q: ¿Cómo se presentan los asesores en el modal? → A: Siguen anónimos; la página sugiere uno de
  los dos, repartiendo las consultas, y permite elegir el otro.
- Q: ¿Cómo se mide qué plan o botón genera consultas? → A: Con una analítica sin cookies que
  respete la privacidad, sin cargar su script; la justificación del Principio III está en
  FR-037a.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender el proceso y los requisitos de mi caso (Priority: P1)

Un visitante que nunca ha sacado una firma electrónica quiere saber, antes de escribir, qué pasos
siguen, qué documentos necesita según sea persona natural sin RUC, persona natural con RUC o
empresa, cuánto tarda y cómo paga.

**Why this priority**: es la duda que más conversaciones de WhatsApp consume y la razón principal
por la que un visitante abandona sin escribir. Además, la condición de "mismo día" debe ser cierta
(Principio V).

**Independent Test**: un visitante nuevo, solo leyendo la página, puede enumerar los pasos del
proceso y la lista exacta de documentos que debe preparar para su caso.

**Acceptance Scenarios**:

1. **Given** un visitante en la página, **When** llega a la sección del proceso, **Then** ve los
   pasos numerados en orden: elegir plan, escribir a un asesor, enviar requisitos, pagar por
   transferencia y recibir el P12 en su correo.
2. **Given** un visitante persona natural sin RUC, **When** consulta los requisitos de su caso,
   **Then** no se le pide certificado de RUC.
3. **Given** un visitante que representa a una empresa, **When** consulta los requisitos de la
   firma, **Then** ve un aviso claro de que la firma electrónica solo se emite a personas
   naturales, con un acceso para consultar a un asesor.
4. **Given** el texto "entrega el mismo día", **When** se muestra, **Then** indica la condición
   que lo hace posible (por ejemplo, requisitos completos y pago confirmado antes de una hora
   límite en día de atención).

---

### User Story 2 - Resolver mis dudas sin escribir (Priority: P1)

Un visitante quiere respuestas inmediatas a las dudas habituales: qué es un archivo P12, en qué
trámites sirve, cómo se instala, qué pasa si olvido la clave o pierdo el archivo, cómo se renueva,
qué es un comprobante electrónico y qué pasa con los que no use en el año.

**Why this priority**: reduce el tiempo de los asesores en preguntas repetidas y da confianza a
quien compara con otros proveedores.

**Independent Test**: se pueden abrir y cerrar cada pregunta de la sección con ratón, toque y
teclado, y cada respuesta está confirmada por el responsable del negocio.

**Acceptance Scenarios**:

1. **Given** la sección de preguntas frecuentes, **When** el visitante elige una pregunta,
   **Then** se muestra su respuesta y las demás siguen accesibles.
2. **Given** un visitante que usa solo el teclado o un lector de pantalla, **When** recorre las
   preguntas, **Then** puede abrir cada una y se anuncia si está abierta o cerrada.
3. **Given** una duda no resuelta, **When** el visitante termina de leer, **Then** tiene a la mano
   un botón para preguntar a un asesor.

---

### User Story 3 - Encontrar y compartir la página con una buena presentación (Priority: P1)

Un cliente comparte el enlace de la página por WhatsApp o Facebook (los canales principales del
negocio), o alguien busca "firma electrónica Ecuador" en un buscador.

**Why this priority**: hoy al pegar el enlace no aparece imagen ni descripción, lo que resta
confianza en el canal donde se cierra la venta; es una mejora de bajo esfuerzo y alto alcance.

**Independent Test**: al pegar el enlace publicado en una conversación de WhatsApp y en una
publicación de Facebook aparece una tarjeta con título, descripción e imagen de la marca.

**Acceptance Scenarios**:

1. **Given** el enlace de la página, **When** se pega en WhatsApp o Facebook, **Then** se ve una
   vista previa con título, descripción breve e imagen de la marca.
2. **Given** la pestaña del navegador o un acceso directo en el móvil, **When** se abre la
   página, **Then** se ve el icono de Tari's.
3. **Given** un buscador, **When** indexa la página, **Then** encuentra una descripción del
   servicio y los datos del negocio (nombre, área de servicio, horario, teléfonos).

---

### User Story 4 - Confiar en quién me vende (Priority: P1)

Un visitante que va a enviar su cédula y una selfie por WhatsApp quiere saber quién está detrás
del sitio, qué entidad certificadora emite la firma y qué se hará con sus documentos.

**Why this priority**: la marca vende identidad digital con validez legal (Principio III); sin
identidad del negocio ni aviso de privacidad, el visitante desconfía justo en el paso de enviar
documentos personales.

**Independent Test**: un visitante puede encontrar en menos de un minuto la razón social, el RUC
del negocio, la entidad certificadora, el aviso de privacidad y los términos del servicio.

**Acceptance Scenarios**:

1. **Given** el pie de página, **When** el visitante lo lee, **Then** ve razón social, RUC y
   ciudad del negocio y enlaces al aviso de privacidad y a los términos.
2. **Given** la frase sobre entidades certificadoras, **When** se muestra, **Then** nombra a la
   entidad o entidades acreditadas que emiten la firma.
3. **Given** el aviso de privacidad, **When** el visitante lo abre, **Then** explica qué
   documentos se piden, para qué, quién los recibe, cuánto tiempo se conservan y cómo pedir su
   eliminación, de acuerdo con la LOPDP del Ecuador.
4. **Given** los términos, **When** el visitante los abre, **Then** encuentra la política de
   reembolso y qué pasa con los comprobantes no usados al terminar el año.

---

### User Story 5 - Pedir cualquier variante de la promoción vigente (Priority: P2)

Un visitante ve "Pagas 2 años → te damos 3" y quiere pedir exactamente esa opción, con su precio.

**Why this priority**: hoy dos de las tres variantes anunciadas no se pueden pedir con un clic y
no muestran precio, lo que genera confusión y reclamos en el chat.

**Independent Test**: con una promoción vigente, cada variante anunciada abre el modal con su
propio texto y precio, y la tarjeta del catálogo equivalente avisa que hay promoción.

**Acceptance Scenarios**:

1. **Given** una promoción vigente con varias variantes, **When** el visitante elige una,
   **Then** el modal y el mensaje de WhatsApp indican esa variante, los años que paga, los años
   que recibe y su precio con IVA.
2. **Given** una promoción vigente que afecta a un plan del catálogo, **When** el visitante ve
   ese plan, **Then** la tarjeta indica que hay una promoción y lleva a ella.
3. **Given** el responsable del negocio, **When** registra una promoción nueva en los datos del
   sitio, **Then** la promoción y su enlace del menú aparecen y desaparecen solos según sus
   fechas, sin editar la estructura de la página.
4. **Given** que no hay ninguna promoción vigente, **When** se carga la página, **Then** no
   queda ningún rastro visible de promociones (sección, menú ni avisos en tarjetas).

---

### User Story 6 - Elegir el plan adecuado (Priority: P2)

Un visitante duda entre duraciones de firma o cantidades de comprobantes y quiere comparar el
valor y saber qué necesita.

**Why this priority**: ayuda a vender planes largos y más comprobantes, y evita que alguien
compre facturación sin tener firma.

**Independent Test**: para cada plan de firma de un año o más se ve el costo por año; para cada
plan de comprobantes se ve su equivalencia mensual; la sección de facturación explica qué incluye
y recuerda que hace falta firma.

**Acceptance Scenarios**:

1. **Given** los planes de firma de 2 a 5 años, **When** se muestran, **Then** cada uno indica su
   costo por año y el ahorro frente a renovar cada año.
2. **Given** los planes de comprobantes, **When** se muestran, **Then** cada uno indica el
   promedio aproximado de comprobantes por mes.
3. **Given** la sección de facturación, **When** el visitante la lee, **Then** sabe qué tipos de
   comprobante incluye el plan y que necesita una firma electrónica vigente, con un enlace a los
   planes de firma.

---

### User Story 7 - Contactar sin fricción y saber cuándo me responden (Priority: P2)

Un visitante pulsa "Comprar Plan" y quiere hablar con alguien ya, o al menos saber cuándo le
responderán.

**Why this priority**: elegir entre dos asesores idénticos es un paso extra sin valor, y escribir
fuera de horario sin saber cuándo habrá respuesta hace que el cliente busque otro proveedor.

**Independent Test**: dentro y fuera del horario de atención (hora de Ecuador), la página muestra
el estado correcto, y el modal permite contactar en un solo clic.

**Acceptance Scenarios**:

1. **Given** una hora dentro del horario de atención en Ecuador, **When** se carga la página,
   **Then** se indica que están atendiendo ahora.
2. **Given** una hora fuera del horario, **When** se carga la página o se abre el modal,
   **Then** se indica cuándo se reanuda la atención (por ejemplo, "Te respondemos el lunes desde
   las 9:00").
3. **Given** el modal de contacto, **When** se abre, **Then** un asesor aparece destacado como
   sugerido y el otro sigue disponible; los asesores no muestran nombre propio y el saludo del
   mensaje no dice "Hola Asesor 1".
4. **Given** una visita nueva, **When** la página elige el asesor sugerido, **Then** cada
   asesor tiene la misma probabilidad (1/2) de ser elegido, y la elección no depende de la hora
   ni del plan. El reparto real se mide como indicador en SC-010.

---

### User Story 8 - Renovar mi firma (Priority: P2)

Un cliente cuya firma está por vencer vuelve a la página para renovarla.

**Why this priority**: los clientes que renuevan son la venta más barata; hoy no hay un camino
para ellos y deben explicarse desde cero en el chat.

**Independent Test**: existe un botón visible de renovación que abre el contacto con un mensaje
que indica que es una renovación.

**Acceptance Scenarios**:

1. **Given** un cliente que vuelve, **When** busca renovar, **Then** encuentra un botón de
   renovación en la cabecera de la sección de firma o en las preguntas frecuentes.
2. **Given** ese botón, **When** lo pulsa y elige asesor, **Then** el mensaje indica que se trata
   de una renovación, sin incluir datos personales del cliente.

---

### User Story 9 - Navegar cómodo en móvil y con tecnologías de apoyo (Priority: P3)

Un visitante en el móvil, con teclado o con lector de pantalla, recorre el menú y las secciones.

**Why this priority**: son defectos de pulido; no impiden comprar, pero restan calidad y algunos
incumplen la sección de accesibilidad de la constitución.

**Independent Test**: en 375 px y en escritorio, cada enlace del menú deja el título de la sección
visible bajo la cabecera, y un lector de pantalla anuncia el estado del menú y del selector.

**Acceptance Scenarios**:

1. **Given** un enlace del menú, **When** se pulsa, **Then** el título de la sección queda visible
   y no tapado por la cabecera fija.
2. **Given** el menú móvil abierto, **When** el visitante elige una opción, **Then** el menú se
   cierra; y el botón del menú anuncia si está abierto o cerrado.
3. **Given** el selector Persona Natural / Persona Jurídica, **When** se usa con lector de
   pantalla, **Then** se anuncia cuál está seleccionado.
4. **Given** un visitante con la preferencia de "reducir movimiento", **When** ve la promoción,
   **Then** el borde no pulsa de forma continua.
5. **Given** la página, **When** se revisa la estructura de títulos, **Then** sigue un orden
   lógico (h1 → h2 → h3) y ningún texto de la página es menor de 12 px.

---

### User Story 10 - Página lista para producción y medible (Priority: P3)

El responsable del negocio quiere una página que cargue rápido, sin advertencias, segura frente a
recursos externos alterados, y saber qué planes generan más consultas.

**Why this priority**: no cambia lo que ve el visitante, pero hoy la página incumple el paso 1 de
la verificación del Principio IV y no hay datos para decidir precios o promociones.

**Independent Test**: la consola del navegador queda sin errores ni advertencias, los recursos
externos se verifican, y el responsable puede saber qué plan originó cada consulta.

**Acceptance Scenarios**:

1. **Given** la página publicada, **When** se abre con la consola del navegador, **Then** no hay
   errores ni advertencias.
2. **Given** un recurso externo de estilos o iconos, **When** se carga, **Then** se verifica su
   integridad.
3. **Given** el pie de página, **When** cambia el año, **Then** el año del copyright se mantiene
   correcto sin editar a mano.
4. **Given** un mes de operación, **When** el responsable revisa sus datos, **Then** ve cuántas veces
   se pulsó cada botón de plan, promoción, renovación y contacto, sin que la medición use cookies
   ni identifique al visitante.
5. **Given** un visitante que bloquea la herramienta de medición, **When** usa la página,
   **Then** todo funciona igual y los botones siguen abriendo WhatsApp.

---

### Edge Cases

- Fuera de horario un sábado por la tarde, el próximo horario de atención es el lunes; en un
  feriado nacional el indicador puede equivocarse si no se registran los feriados (ver
  Assumptions).
- Dos promociones vigentes a la vez: ambas deben mostrarse y el menú debe llevar a la sección de
  promociones una sola vez.
- Una variante de promoción cuyo plan de firma ya no existe en el catálogo: los datos se
  consideran inválidos y las pruebas automáticas lo rechazan antes de publicar.
- Una pregunta frecuente con una respuesta larga en móvil de 375 px: el texto no se desborda.
- El visitante abre la página sin scripts: el aviso actual sigue apareciendo y el contenido
  estático nuevo (proceso, requisitos, preguntas frecuentes, aviso de privacidad) se puede leer.
- El enlace se comparte antes de que exista la imagen de vista previa: la tarjeta muestra al menos
  título y descripción.
- El visitante elige "Persona Jurídica" en el selector de comprobantes: ve los requisitos de
  facturación para empresas y el aviso de que la firma necesaria para facturar no se emite a
  empresas en este sitio, con acceso para consultar a un asesor.
- El mismo visitante abre el modal varias veces en la misma visita: se le sugiere siempre el
  mismo asesor.
- La herramienta de medición no carga (bloqueador, sin conexión al servicio): la página no
  muestra errores y las cifras del mes se consideran aproximadas.

## Requirements *(mandatory)*

### Functional Requirements

**Proceso y requisitos (US1)**

- **FR-001**: La página MUST mostrar los pasos del proceso de compra, numerados y en orden, desde
  la elección del plan hasta la entrega del archivo P12 o la activación del sistema de facturación.
- **FR-002**: La página MUST mostrar los requisitos según el caso: para la firma, persona natural
  sin RUC y persona natural con RUC; para la facturación, persona natural y persona jurídica. El
  certificado de RUC MUST pedirse solo a quien tiene RUC o compra facturación.
- **FR-002a**: La página MUST avisar, junto a los planes de firma y a los requisitos, que la firma
  electrónica solo se emite a personas naturales y no a empresas ni representantes legales.
- **FR-003**: Toda promesa de tiempo de entrega MUST indicar la condición que la hace posible.

**Preguntas frecuentes (US2)**

- **FR-004**: La página MUST incluir una sección de preguntas frecuentes con al menos: qué es un
  archivo P12, en qué trámites sirve, cómo se instala o usa, qué pasa si se olvida la clave o se
  pierde el archivo, cómo se renueva, qué es un comprobante electrónico y qué pasa con los
  comprobantes no usados.
- **FR-005**: Cada pregunta MUST poder abrirse y cerrarse con ratón, toque y teclado, y MUST
  anunciar su estado a tecnologías de apoyo.
- **FR-006**: La sección MUST terminar con un acceso para preguntar a un asesor.
- **FR-007**: El contenido de proceso, requisitos y preguntas frecuentes MUST poder leerse aunque
  el navegador no ejecute scripts.

**Presentación al compartir y en buscadores (US3)**

- **FR-008**: La página MUST tener una descripción del servicio de 150 a 160 caracteres para
  buscadores.
- **FR-009**: Al compartir el enlace, la página MUST ofrecer título, descripción e imagen de la
  marca para la vista previa.
- **FR-010**: La página MUST tener un icono de la marca para la pestaña y los accesos directos.
- **FR-011**: La página MUST describir para buscadores el negocio: nombre, área de servicio
  (Ecuador), horario de atención y teléfonos, tomados de la misma única fuente de datos que usa el
  resto del sitio.

**Confianza y aspectos legales (US4)**

- **FR-012**: El pie de página MUST mostrar razón social, RUC y ciudad del negocio.
- **FR-013**: La página MUST nombrar la entidad o entidades certificadoras acreditadas que emiten
  la firma.
- **FR-014**: La página MUST ofrecer un aviso de privacidad que explique qué documentos se piden,
  su finalidad, quién los recibe, el tiempo de conservación y cómo ejercer los derechos de la LOPDP
  (acceso, rectificación, eliminación). También MUST describir la medición de uso del sitio y
  aclarar que no usa cookies ni identifica al visitante.
- **FR-015**: La página MUST ofrecer términos del servicio con, como mínimo, la política de
  reembolso y el tratamiento de comprobantes no usados.
- **FR-016**: El sitio MUST seguir sin recolectar ni recibir documentos personales: el aviso de
  privacidad describe el tratamiento por WhatsApp, no habilita su carga en la página
  (Principio III).

**Promociones (US5)**

- **FR-017**: Cada variante de una promoción vigente MUST poder pedirse con un clic, con su propio
  texto y precio con IVA en el modal y en el mensaje de WhatsApp.
- **FR-018**: El texto de cada variante (años que paga, años que recibe y precio) MUST cumplir la
  regla de fuente única de FR-039 (Principio V).
- **FR-019**: Mientras una promoción esté vigente, la tarjeta del plan del catálogo al que afecta
  MUST indicarlo y llevar a la promoción.
- **FR-020**: El responsable MUST poder publicar, cambiar o retirar una promoción editando solo
  los datos del negocio; la sección, el enlace del menú y los avisos en tarjetas aparecen y
  desaparecen solos según sus fechas.

**Ayuda para elegir (US6)**

- **FR-021**: Cada plan de firma de 2 años o más MUST mostrar su costo por año y el ahorro frente
  a pagar el plan de 1 año cada año.
- **FR-022**: Cada plan de comprobantes MUST mostrar el promedio aproximado de comprobantes por
  mes.
- **FR-023**: La sección de facturación MUST indicar los tipos de comprobante incluidos y que se
  requiere una firma electrónica vigente, con enlace a los planes de firma.

**Contacto (US7)**

- **FR-024**: La página MUST indicar si en este momento hay atención, según el horario del negocio
  en hora de Ecuador continental.
- **FR-025**: Fuera de horario, la página MUST indicar el día y la hora en que se reanuda la
  atención.
- **FR-026**: El saludo del mensaje de WhatsApp MUST ser natural y no usar el rótulo interno
  "Asesor 1" / "Asesor 2" como nombre de persona.
- **FR-027**: El modal MUST destacar a uno de los dos asesores como sugerido, repartiendo las
  sugerencias de forma aproximadamente equitativa entre visitantes, y MUST seguir permitiendo
  elegir el otro. Durante una misma visita la sugerencia MUST ser la misma. Los asesores se
  mantienen anónimos (sin nombre propio ni foto).

**Renovación (US8)**

- **FR-028**: La página MUST ofrecer un acceso de renovación de firma que abra el contacto con un
  mensaje que identifique la consulta como renovación, sin datos personales del visitante.

**Navegación y accesibilidad (US9)**

- **FR-029**: Al navegar a una sección desde el menú, su título MUST quedar visible bajo la
  cabecera fija.
- **FR-030**: El menú móvil MUST cerrarse al elegir una opción y MUST anunciar si está abierto o
  cerrado.
- **FR-031**: El selector Persona Natural / Persona Jurídica MUST anunciar la opción seleccionada.
- **FR-032**: Las animaciones continuas MUST detenerse cuando el visitante pide reducir el
  movimiento.
- **FR-033**: Los títulos MUST seguir un orden jerárquico sin saltos, y ningún texto de la página
  MUST ser menor de 12 px.

**Producción y medición (US10)**

- **FR-034**: La página publicada MUST abrir sin errores ni advertencias en la consola.
- **FR-035**: Los recursos externos MUST cargarse con verificación de integridad y versión fija.
- **FR-036**: El año del copyright MUST mantenerse correcto automáticamente.
- **FR-037**: El responsable MUST poder ver cuántas veces se pulsó cada botón de plan, promoción,
  renovación y contacto, mediante una medición que no use cookies, no guarde datos personales
  ni identifique al visitante, y que no agregue nada a los mensajes de WhatsApp.
- **FR-037a**: La medición MUST NOT cargar scripts de terceros: los eventos se envían desde el
  código propio del sitio, versionado en el repositorio. Justificación según el Principio III:
  se necesita para SC-009, no usa cookies ni datos personales y se desactiva dejando vacío el
  identificador del sitio. Si el envío falla, la página MUST seguir funcionando igual.

**Generales**

- **FR-038**: Todo texto nuevo (pasos, requisitos, preguntas, aviso de privacidad, términos,
  entidad certificadora, datos legales) MUST contar con la confirmación del responsable del
  negocio antes de publicarse (Principio V).
- **FR-039**: Los precios, horarios, asesores y promociones que usen las secciones nuevas MUST
  salir de la misma única fuente de datos del sitio, y el formato de precio MUST seguir siendo
  `$NN,NN` con "IVA incluido".

### Key Entities *(include if feature involves data)*

- **Paso del proceso**: orden, título y descripción breve de cada etapa de la compra.
- **Requisito**: documento que se pide, descripción y casos de cliente a los que aplica (natural
  sin RUC, natural con RUC, jurídica) y producto (firma, facturación).
- **Pregunta frecuente**: pregunta, respuesta y tema (firma, facturación, pagos, renovación).
- **Variante de promoción**: promoción a la que pertenece, años que paga, años que recibe, precio
  con IVA y plan del catálogo al que afecta.
- **Horario de atención**: días, hora de inicio y fin por día en hora de Ecuador; base para el
  indicador "atendiendo ahora" y la próxima apertura.
- **Datos legales del negocio**: razón social, RUC, ciudad, entidad certificadora, enlaces a aviso
  de privacidad y términos.
- **Asesor** (existente): sigue anónimo; se agrega cuál se sugiere en cada visita.
- **Evento de uso**: botón pulsado (plan, promoción, renovación o contacto) y fecha; sin datos
  del visitante.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una prueba con 5 personas que nunca han sacado firma, al menos 4 identifican sin
  ayuda los pasos del proceso y los documentos de su caso en menos de 2 minutos.
- **SC-002**: Las preguntas repetidas que reciben los asesores por WhatsApp (requisitos, qué es un
  P12, tiempo de entrega) bajan al menos un 30 % en el primer mes, según el conteo de los asesores
  frente al mes anterior.
- **SC-003**: El enlace compartido muestra vista previa con imagen, título y descripción en
  WhatsApp y Facebook en el 100 % de las pruebas.
- **SC-004**: Un visitante encuentra la razón social, el RUC, la entidad certificadora y el aviso
  de privacidad en menos de 1 minuto.
- **SC-005**: El 100 % de las variantes de promoción anunciadas se pueden pedir con un clic y su
  precio coincide en tarjeta, modal y mensaje.
- **SC-006**: El indicador de atención es correcto en el 100 % de las horas de prueba dentro y
  fuera del horario (incluidos sábado por la tarde y domingo).
- **SC-007**: La página abre sin errores ni advertencias en la consola y su contenido principal es
  visible y con estilo en menos de 3 segundos en un móvil con conexión 4G lenta (≈ 1,6 Mbps de
  bajada y 150 ms de latencia).
- **SC-008**: La revisión de accesibilidad con teclado y lector de pantalla no encuentra ningún
  control sin nombre o sin estado anunciado.
- **SC-009**: Tras un mes, el responsable puede ver en su panel de medición los clics de cada plan
  y botón de contacto, e indicar qué plan generó más interés.
- **SC-010**: En el primer mes, la diferencia entre las consultas que recibe cada asesor no supera
  los 20 puntos porcentuales, según el conteo de los asesores.

## Assumptions

- Los requisitos actuales (celular, cédula, selfie, correo) aplican a toda persona natural, y el
  certificado de RUC solo a quien tiene RUC o compra facturación. El responsable confirma los
  requisitos de facturación para persona jurídica.
- Una medición sin cookies no exige aviso de consentimiento de cookies; las cifras son
  aproximadas porque algunos visitantes la bloquean.
- El precio de cada variante de la promoción vigente es el precio normal de los años que se pagan
  (pagas 1 año = $15,00 → la promoción lo publica a $14,99; pagas 2 = $21,00; pagas 3 = $30,00),
  salvo que el responsable defina otro.
- El responsable del negocio provee y confirma: razón social y RUC, entidad certificadora, textos
  de requisitos, respuestas de preguntas frecuentes, aviso de privacidad, términos, imagen para
  compartir y hora límite para la entrega del mismo día.
- Los feriados nacionales no se registran en esta versión; el indicador de atención puede
  mostrarse "atendiendo" un feriado. Registrar feriados queda fuera de alcance.
- La página sigue siendo una sola página estática sin backend ni carga de archivos; el aviso de
  privacidad y los términos pueden ser secciones o páginas estáticas propias (a justificar en el
  plan según el Principio I).
- Los pagos siguen siendo solo por transferencia coordinada con el asesor; no se publican números
  de cuenta ni se agregan pagos con tarjeta (Principio III). Agregar otros medios (por ejemplo,
  billeteras móviles) es una decisión de negocio fuera de este alcance.
- Fuera de alcance: blog, varios idiomas, chat en vivo, formularios y cuentas de usuario.

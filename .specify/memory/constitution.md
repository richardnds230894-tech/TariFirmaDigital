# Tari's Firma Digital (TariFirmaDigital) Constitution

Sitio web estático de venta de Firma Electrónica (archivo P12) y planes de Facturación
Electrónica (comprobantes SRI) en Ecuador. La conversión ocurre por WhatsApp con dos asesores;
el sitio NO emite, firma ni custodia certificados. Esta constitución gobierna todo cambio al
repositorio.

## Core Principles

### I. Compatibilidad con el Stack y la Estructura Existente

- El sitio MUST seguir siendo estático: HTML5 + CSS + JavaScript vanilla (ES2015+), sin paso de
  compilación obligatorio, desplegable en cualquier hosting estático y abrible directamente
  desde `index.html`.
- La estructura en raíz MUST conservarse: `index.html` (marcado y secciones), `script.js`
  (datos del catálogo y lógica), `styles.css` (estilos que Tailwind no cubre: gradientes,
  keyframes). Nuevos archivos MUST justificarse en el plan de la feature.
- Estilos MUST usar utilidades de Tailwind y los tokens de marca `taris-*` definidos en
  `tailwind.config.js` (o en la configuración en línea de `index.html` mientras se use el CDN)
  (navy, dark, card, gold, goldLight, goldDark,
  emerald, emeraldHover, royal, sky) y las sombras `shadow-gold` / `shadow-card`. Un color de
  marca nuevo MUST añadirse como token, no como valor hexadecimal suelto repetido.
- Dependencias permitidas: Tailwind CSS (CDN, o precompilado y versionado en el repositorio),
  la fuente Inter (desde Google Fonts o servida localmente) y Font Awesome 6.x.
  Añadir un framework (React, Vue, etc.), un backend, una base de datos o un empaquetador
  requiere una enmienda MAJOR de esta constitución.
- Los IDs que `script.js` usa (`firma-cards-container`, `comprobantes-cards-container`,
  `advisor-modal`, `modal-product-text`, `link-asesor-1`, `link-asesor-2`, `btn-natural`,
  `btn-juridica`, `mobile-menu`, `mobile-menu-btn`) y las anclas de navegación (`#promociones`,
  `#firma-electronica`, `#facturacion`, `#requisitos`) MUST mantenerse o migrarse en el mismo
  cambio en ambos archivos.

**Justificación**: el proyecto es pequeño, sin build y lo mantiene un equipo reducido; romper
esa simplicidad cuesta más de lo que aporta mientras el negocio funcione por WhatsApp.

### II. Calidad de Código y Convenciones

- Todo texto visible, comentario y JSDoc MUST estar en español, con tildes y signos correctos
  (`¡`, `¿`). Los identificadores MUST usar camelCase; las funciones MUST empezar con un verbo
  (`render…`, `open…`, `close…`, `set…`). Los nombres existentes se conservan.
- Cada función de `script.js` MUST tener un bloque JSDoc en español que explique su propósito.
  Las secciones de `index.html` MUST ir precedidas por un comentario en mayúsculas
  (`<!-- SECCIÓN …: … -->`), como ya ocurre.
- Indentación de 4 espacios en HTML y JS. MUST usarse `const`/`let`, nunca `var`. No se
  permiten estilos en línea (`style=""`), `console.log` ni código muerto en la rama principal.
- Catálogo dirigido por datos: los planes y precios MUST definirse una sola vez como datos en
  `script.js` (`firmaPlans`, `comprobantesPlans` o estructuras equivalentes) y renderizarse desde
  ahí. No se duplican tarjetas de precio escritas a mano en el HTML.
- Datos de contacto (números de WhatsApp, URL de Facebook, horarios) MUST definirse en un único
  lugar para todo código nuevo; el código que toque estos datos SHOULD consolidar los duplicados
  existentes.
- Las funciones MUST ser pequeñas y de un solo propósito; la lógica que calcula o transforma
  datos (precio activo, armado del mensaje de WhatsApp) SHOULD separarse del acceso al DOM en
  funciones puras.

**Justificación**: un único origen de datos evita que una tarjeta, el modal y el mensaje de
WhatsApp muestren precios distintos, que es el error más caro en un sitio de ventas.

### III. Seguridad y Protección de Datos Personales (NO NEGOCIABLE)

- El sitio MUST NOT recolectar, subir, almacenar ni transmitir cédulas, selfies, certificados
  de RUC, archivos P12/PFX, claves privadas ni contraseñas de firma. Esos requisitos se entregan
  solo al asesor por su canal directo. Cualquier feature que cambie esto MUST pasar por una
  enmienda de esta constitución y una spec con modelo de amenazas y cumplimiento de la Ley
  Orgánica de Protección de Datos Personales (LOPDP) del Ecuador.
- El repositorio MUST NOT contener secretos, tokens, archivos `.p12`/`.pfx`/`.key`/`.pem`,
  `.env` ni documentos de clientes. El `.gitignore` MUST excluir esos patrones.
- `innerHTML` solo MAY usarse con datos estáticos definidos en el propio código. Todo dato que
  provenga del usuario, de la URL o de una fuente externa MUST insertarse con `textContent` o
  escaparse. Los elementos interactivos nuevos MUST usar `addEventListener` y atributos
  `data-*` en lugar de `onclick` con cadenas interpoladas.
- Los mensajes prellenados de WhatsApp MUST construirse con `encodeURIComponent` y MUST contener
  solo información del producto o plan, nunca datos personales del visitante.
- Todo enlace con `target="_blank"` MUST llevar `rel="noopener noreferrer"`. Todos los recursos
  externos MUST cargarse por HTTPS.
- Scripts de terceros nuevos (analítica, píxeles, widgets de chat) MUST justificarse en la spec,
  fijarse a una versión y SHOULD incluir `integrity` (SRI) y `crossorigin`. Cuando el hosting lo
  permita, SHOULD definirse una Content-Security-Policy.
- El sitio MUST NOT publicar números de cuenta bancaria ni procesar pagos con tarjeta; el pago
  por transferencia se coordina con el asesor, como hoy.

**Justificación**: la marca vende identidad digital con validez legal. Una fuga de cédulas o de
un P12 (o un XSS en la página de venta) destruye la confianza del negocio y tiene consecuencias
legales.

### IV. Pruebas y Verificación

- Todo cambio MUST pasar la verificación manual mínima antes de integrarse:
  1. Abrir `index.html` sin errores ni advertencias en la consola del navegador.
  2. Revisar el diseño en móvil (375 px) y escritorio (≥ 1024 px), incluido el menú móvil.
  3. Alternar Persona Natural / Persona Jurídica y comprobar los precios mostrados.
  4. Abrir el modal desde cada tipo de botón y cerrarlo con la X y haciendo clic fuera.
  5. Confirmar que los enlaces de Asesor 1 y Asesor 2 abren WhatsApp con el número correcto y
     el producto y precio exactos de la tarjeta pulsada.
- La lógica nueva que calcule o transforme datos (descuentos, totales, validaciones, armado de
  mensajes) MUST escribirse como funciones puras y MUST tener pruebas automatizadas. La
  herramienta preferida es el runner integrado de Node (`node --test`), sin dependencias; las
  herramientas de prueba son solo de desarrollo y MUST NOT añadir un paso de build al sitio.
- Corregir un error en la lógica MUST incluir una prueba (o un paso de verificación manual
  documentado) que lo reproduzca.
- El marcado nuevo MUST validar sin errores en el validador W3C.

**Justificación**: hoy no existe suite automatizada. Exigirla para todo sería desproporcionado,
pero los cálculos de precio y los enlaces de venta sí deben probarse, porque un fallo ahí cuesta
ventas.

### V. Exactitud Comercial y del Contenido

- Todo precio publicado MUST incluir IVA e indicarlo ("IVA incluido"). El formato MUST ser el
  mismo en todo el sitio (el del catálogo: `$` + `NN,NN`).
- El precio que muestran la tarjeta, el texto del modal y el mensaje de WhatsApp MUST coincidir
  y salir del mismo dato.
- Toda promoción MUST indicar fechas de vigencia explícitas (inicio y fin). Al vencer MUST
  retirarse u ocultarse en el mismo día; no se publican promociones vencidas.
- Las afirmaciones legales o de servicio ("validez legal", "SRI, Quipux, SERCOP", "mismo día",
  horarios) MUST corresponder al servicio real; cambiarlas requiere confirmación del responsable
  del negocio en el PR.

**Justificación**: un precio o vigencia incorrectos generan reclamos y pueden constituir
publicidad engañosa según la normativa de defensa del consumidor.

## Restricciones Técnicas y Estándares

- **Stack**: HTML5, Tailwind CSS 3.4 precompilado en `tailwind.css` (configuración en
  `tailwind.config.js`; la hoja generada se versiona y regenerarla solo hace falta al agregar
  clases), CSS propio en `styles.css`, JavaScript vanilla en `script.js`, Font Awesome 6.5.1,
  Inter servida desde `fonts/`.
- **Idioma y localización**: `lang="es"`, moneda USD, números de teléfono en formato Ecuador
  (`+593`), contenido orientado a contribuyentes ecuatorianos (Persona Natural / Jurídica).
- **Producción**: el Play CDN de Tailwind (`cdn.tailwindcss.com`) no está pensado para
  producción. Migrar a una hoja de estilos de Tailwind precompilada está permitido sin enmienda
  si el sitio sigue sirviéndose como archivos estáticos y el CSS generado se versiona en el
  repositorio.
- **Accesibilidad**: los botones que solo tienen icono MUST llevar `aria-label`; las imágenes
  MUST tener `alt`; todo control MUST poder usarse con teclado; los modales nuevos o modificados
  SHOULD cerrarse con Escape y devolver el foco. El contraste de texto SHOULD cumplir WCAG AA.
- **Rendimiento**: diseño mobile-first; las imágenes nuevas MUST optimizarse (WebP/AVIF o SVG)
  y llevar `loading="lazy"` cuando estén fuera de la primera pantalla. No se añaden fuentes ni
  librerías que dupliquen lo que ya existe.
- **Navegadores**: últimas dos versiones de Chrome, Edge, Firefox y Safari (incluido Safari iOS).

## Flujo de Desarrollo y Puertas de Calidad

- Las features se trabajan con Spec Kit: `/speckit-specify` → `/speckit-plan` (con el
  "Constitution Check" contra esta constitución) → `/speckit-tasks` → `/speckit-implement`.
- Se trabaja en ramas a partir de `main`; `main` MUST estar siempre desplegable.
- Los mensajes de commit MUST seguir Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`,
  `style:`, `refactor:`, `test:`).
- Cada PR MUST incluir: descripción del cambio, resultado de la verificación manual del
  Principio IV, captura móvil y de escritorio si cambia la interfaz, y confirmación explícita
  cuando cambien precios, promociones o datos de contacto.
- Un PR que viole un principio MUST documentar la excepción en la sección "Complexity Tracking"
  del plan o ser rechazado.

## Governance

- Esta constitución prevalece sobre cualquier otra práctica o guía del repositorio. Si una guía
  de ejecución (README.md, CLAUDE.md u otra) la contradice, manda la constitución.
- **Enmiendas**: se proponen mediante PR que modifique `.specify/memory/constitution.md` con su
  justificación, el impacto sobre el código existente y, si hace falta, un plan de migración.
  Las aprueba el responsable del proyecto.
- **Versionado** (SemVer):
  - MAJOR: eliminar o redefinir un principio de forma incompatible (por ejemplo, permitir un
    backend o la carga de documentos personales).
  - MINOR: añadir un principio o sección, o ampliar materialmente una regla.
  - PATCH: aclaraciones, redacción y erratas sin cambio de significado.
- **Cumplimiento**: cada `/speckit-plan` MUST evaluar el "Constitution Check" contra estos
  principios, y cada revisión de PR MUST verificar los Principios III y V. Una vez al trimestre
  se revisa la deuda pendiente frente a la constitución.

**Version**: 1.1.0 | **Ratified**: 2026-11-25 | **Last Amended**: 2026-11-26

<!-- Enmienda 1.1.0 (MINOR, 2026-11-26, feature 002): el Principio I y "Stack" admiten Tailwind
precompilado con su configuración en tailwind.config.js e Inter servida localmente, como ya
permitía "Restricciones → Producción". Sin impacto en el código existente hasta que se
implemente la feature 002. -->


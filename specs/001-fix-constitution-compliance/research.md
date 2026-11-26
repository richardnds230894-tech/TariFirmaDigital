# Research: Corregir incumplimientos de la constitución

**Feature**: `001-fix-constitution-compliance` | **Fecha**: 2026-11-25

Todas las incógnitas del Technical Context quedan resueltas aquí. Verificaciones hechas en el
equipo de desarrollo: Node v24.21.0 disponible, `core.ignorecase=true` en git, y el historial
(`git log --all --name-only`) no contiene archivos `.p12/.pfx/.key/.pem/.crt/.cer`, `.env`,
cédulas ni selfies.

## R1. Dónde vive la "fuente única" de datos sin paso de build

- **Decision**: un objeto de configuración al inicio de `script.js` (sección
  `DATOS DEL NEGOCIO`) con asesores, datos del negocio, planes y promociones. El HTML deja de
  contener números, URLs de WhatsApp/Facebook, precios y horarios: los elementos llevan atributos
  `data-*` y `script.js` rellena `href` y `textContent` al cargar
  (ver [contracts/dom-hooks.md](contracts/dom-hooks.md)).
- **Rationale**: es la única forma de cumplir SC-002 ("editar exactamente un lugar") sin build:
  cualquier valor literal en el HTML sería una segunda copia. El catálogo ya se genera así hoy.
- **Alternatives considered**:
  - *Datos en el HTML (JSON embebido o atributos) leídos por JS*: sigue necesitando JS para los
    enlaces y obliga a parsear HTML en las pruebas.
  - *Mantener `href` de respaldo en el HTML + prueba que detecte desincronización*: conserva el
    funcionamiento sin JavaScript, pero exige editar dos o más lugares; contradice el pedido
    explícito de unificar.
  - *Archivo nuevo `datos.js`*: más cómodo de editar, pero añade un archivo y orden de carga; la
    constitución pide justificar archivos nuevos y no hay necesidad real todavía.

### Conflicto detectado con la spec (FR-008)

FR-008 pedía que los enlaces de la sección principal y del pie funcionaran sin JavaScript. Con
la fuente única en `script.js` eso no es posible sin duplicar los números. El sitio ya depende de
JavaScript para mostrar el catálogo y el modal, así que se prioriza la unificación (pedido
explícito del usuario). **Se actualizó FR-008 en la spec**: sin JavaScript el sitio muestra un
aviso que pide activarlo, sin números duplicados.

## R2. Pruebas automatizadas sin build y con apertura directa por `file://`

- **Decision**: `script.js` sigue siendo un script clásico (no módulo ES). Al final expone sus
  funciones puras con `if (typeof module !== 'undefined') module.exports = { … }`, y el código que
  toca el DOM se ejecuta solo si existe `window`. Las pruebas viven en `tests/` y se corren con
  `node --test tests/`, sin `package.json` ni dependencias.
- **Rationale**: los módulos ES (`type="module"`) no cargan desde `file://` en Chrome/Edge por
  CORS, y la constitución exige que `index.html` se pueda abrir directamente. `node --test` es la
  herramienta preferida por el Principio IV.
- **Alternatives considered**: módulos ES (rompen `file://`); Jest/Vitest (dependencias y
  `node_modules` innecesarios); solo verificación manual (el Principio IV exige pruebas para la
  lógica de cálculo nueva: formato de precio, vigencia y armado de mensajes).

## R3. Formato de precio `NN,NN`

- **Decision**: los precios se guardan como números (`14.99`) y se muestran con
  `formatPrice(n)` = `n.toFixed(2).replace('.', ',')`.
- **Rationale**: determinista en todos los navegadores y en Node; evita que un error de tipeo
  ("15.00" vs "15,00") vuelva a mezclar formatos, porque el formato lo decide una sola función.
- **Alternatives considered**: `Intl.NumberFormat('es-EC')` (da `14,99` en Node 24, pero añade
  separador de miles y depende del ICU del navegador); seguir guardando cadenas (es el origen del
  problema actual).

## R4. Formato visible de teléfonos

- **Decision**: se guarda solo el número E.164 sin `+` (`593960178652`); `formatPhone` produce
  `+593 96 017 8652` (grupos 3-2-3-4). El enlace usa `https://wa.me/<número>?text=<mensaje>`.
- **Rationale**: un dato, dos usos (enlace y texto), sin posibilidad de desincronizar.
- **Alternatives considered**: guardar número y texto visible por separado (dos datos que pueden
  divergir).

## R5. Botones sin `onclick` con cadenas interpoladas

- **Decision**: delegación de eventos. Las tarjetas generadas llevan `data-plan="firma:<índice>"`
  o `data-plan="comprobantes:<índice>"`; los botones fijos del HTML llevan
  `data-open-advisor="<clave>"` (`general`, `flotante`, `promo:<id>`, `banco`). Un único
  listener en `document` resuelve la clave a la descripción del producto con
  `buildProductDescription`, que lee los datos. Se eliminan todos los `onclick` del HTML y de las
  plantillas, incluidos los de cierre del modal.
- **Rationale**: el texto del producto nunca pasa por un atributo de evento, así que apóstrofes y
  comillas no rompen nada (FR-012) y se cumple "addEventListener + data-*" del Principio III.
- **Alternatives considered**: escapar comillas dentro del `onclick` (frágil y contrario a la
  constitución); un listener por botón (más código y hay que volver a enlazar al re-renderizar
  las tarjetas de comprobantes).

## R6. Texto variable como texto literal

- **Decision**: el modal sigue usando `textContent`. Las plantillas de tarjetas pasan cada valor
  por `escapeHtml` antes de interpolarlo en `innerHTML`, aunque los datos sean estáticos.
- **Rationale**: defensa en profundidad para FR-013 a costo mínimo; si algún día un dato viene de
  fuera, la plantilla ya es segura.
- **Alternatives considered**: construir las tarjetas con `createElement` (mucho más código para
  el mismo resultado con datos estáticos).

## R7. Modal accesible

- **Decision**: `role="dialog"`, `aria-modal="true"` y `aria-labelledby` apuntando al título.
  Al abrir: guardar `document.activeElement`, mover el foco al primer enlace de asesor y atrapar
  Tab/Shift+Tab entre los elementos enfocables del modal. Escape, la X, el clic en el fondo y la
  elección de asesor cierran el modal y devuelven el foco al disparador.
- **Rationale**: patrón WAI-ARIA "Dialog (Modal)", suficiente sin librerías.
- **Alternatives considered**: el elemento nativo `<dialog>` con `showModal()` (gestiona foco y
  Escape solo, pero obliga a rehacer las clases de Tailwind `hidden/flex` y su backdrop, con
  riesgo para FR-021 de compatibilidad visual).

## R8. Vigencia de promociones en hora de Ecuador

- **Decision**: cada promoción guarda `inicio` y `fin` como `AAAA-MM-DD`.
  `isPromotionActive(promo, ahora)` calcula la fecha de Ecuador continental como
  `new Date(ahora.getTime() - 5 h).toISOString().slice(0, 10)` y compara cadenas
  (`inicio ≤ hoy ≤ fin`). La sección `#promociones` y sus enlaces de menú quedan ocultos por
  defecto en el HTML y `script.js` los muestra solo si la promoción está vigente. El texto de
  vigencia ("Del 9 de noviembre al 30 de noviembre") lo genera `formatDateRange`.
- **Rationale**: Ecuador continental es UTC−5 sin horario de verano, así que el desfase fijo es
  exacto (FR-020). Ocultar por defecto evita que una promoción vencida "parpadee" antes de que
  cargue el script.
- **Alternatives considered**: comparar con la hora local del visitante (falla para visitantes
  fuera de Ecuador cerca de medianoche); `Intl` con `timeZone: 'America/Guayaquil'` (correcto,
  pero más código para el mismo resultado).
- **Prueba manual**: la función de aplicación acepta una fecha opcional, así que en la consola
  del navegador se puede simular otro día sin añadir parámetros de URL a producción
  (ver [quickstart.md](quickstart.md)).

## R9. Patrones del `.gitignore`

- **Decision**: patrones con clases de caracteres para que no dependan de mayúsculas
  (`*.[pP]12`, `*.[pP][fF][xX]`, …), `.env` y `.env.*` (excepto `.env.example`), la carpeta
  reservada `documentos-clientes/`, archivos del SO/editor (`Thumbs.db`, `Desktop.ini`,
  `.DS_Store`, `.vscode/`, `.idea/`) y `.claude/settings.local.json`. El `.gitignore` propio de
  `.specify/` se conserva.
- **Rationale**: `core.ignorecase=true` cubre Windows, pero un clon en Linux/macOS distingue
  mayúsculas; las clases de caracteres funcionan en ambos.
- **Alternatives considered**: solo minúsculas (dejaría pasar `.P12` en Linux).

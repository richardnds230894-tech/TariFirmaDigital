# Research: Cerrar huecos de la página

Fase 0 de [plan.md](plan.md). Cada decisión resuelve un punto abierto del Technical Context o una
elección de tecnología. Formato: Decisión, Justificación y Alternativas.

---

## R1. Estilos sin la advertencia de modo desarrollo (FR-034)

**Decisión**: precompilar Tailwind **v3.4.x** con su CLI oficial (`npx tailwindcss@3.4`, solo en
desarrollo) a una hoja `tailwind.css` minificada que se **versiona en el repositorio**. La
configuración en línea de `index.html` pasa a `tailwind.config.js`, con
`content: ['./*.html', './script.js']`, y la entrada a `tailwind.input.css`. Se quita
`cdn.tailwindcss.com` de todas las páginas.

**Justificación**:
- La constitución lo permite sin enmienda ("Restricciones → Producción") si se sirve como
  archivos estáticos y el CSS generado se versiona. `index.html` se sigue abriendo directamente:
  regenerar el CSS solo hace falta al **agregar clases nuevas**, no para abrir ni publicar el
  sitio.
- Se usa v3 porque la configuración actual (`theme.extend`, tokens `taris-*` y sombras) es del
  formato de v3, el que usa el Play CDN. Con v4 habría que reescribir la configuración en CSS.
- Elimina la advertencia de consola (paso 1 de la verificación del Principio IV), unos 300 KB de
  JavaScript de compilación en el navegador y el parpadeo sin estilos.
- Beneficio adicional: los estilos ya no dependen de JavaScript, de modo que el contenido estático
  (proceso, requisitos, preguntas frecuentes) se ve con estilo aunque los scripts estén
  desactivados (FR-007).

**Riesgo y mitigación**: si alguien agrega una clase y olvida regenerar, esa clase no tendrá
estilo. Para cubrirlo:
1. `tests/styles.test.js` extrae las clases de los `class="…"` de los `.html` y de los literales
   de clase de `script.js`, y comprueba que cada una tenga su selector en `tailwind.css`.
2. El README documenta el comando de regeneración.

**Alternativas**:
- Mantener el Play CDN: incumple FR-034. Rechazada.
- Tailwind v4 o el ejecutable standalone: v4 cambia el formato de configuración, y el ejecutable
  pesa unos 40 MB por plataforma y no se puede versionar razonablemente. Rechazadas (`npx` usa el
  Node que ya se exige para las pruebas).
- CSS escrito a mano: reescribir cientos de utilidades no compensa. Rechazada.

## R2. Recursos externos con integridad y versión fija (FR-035)

**Decisión**:
- **Font Awesome 6.5.1** se queda en cdnjs, con `integrity="sha512-…"` (el hash publicado por
  cdnjs para `all.min.css` 6.5.1), `crossorigin="anonymous"` y `referrerpolicy="no-referrer"`.
- **Inter** se sirve localmente: un archivo `fonts/inter-latin-var.woff2` (fuente variable,
  subconjunto latino, pesos 400–900) declarado con `@font-face` y `font-display: swap` en
  `tailwind.input.css`. Se eliminan los `preconnect` y el `<link>` a Google Fonts.

**Justificación**: la hoja de Google Fonts cambia según el navegador que la pide, así que **no
admite SRI**. Servir Inter localmente cumple FR-035, evita enviar la IP del visitante a un
tercero (coherente con el aviso de privacidad, FR-014) y ahorra dos conexiones. Es la misma
fuente, así que no contradice "no se añaden fuentes que dupliquen lo existente".

**Alternativas**:
- Dejar Google Fonts y documentar una excepción: incumple un MUST de la spec teniendo una
  solución barata. Rechazada.
- Font Awesome local: unos 900 KB entre CSS y webfonts; el CDN con SRI ya cumple. Rechazada.

## R3. Medición sin cookies (FR-037, FR-037a; aclaración Q3 = B)

**Decisión**: usar **Umami Cloud** (plan Hobby, gratuito según su FAQ oficial) **sin cargar su
script**. `script.js` envía los eventos directamente a la API pública de Umami con
`fetch(…, { method: 'POST', keepalive: true })`.
- El cuerpo del envío lo arma una función pura (`buildAnalyticsPayload`).
- Se envía un evento `pageview` al cargar y un evento por cada clic medible
  ([contracts/analytics-events.md](contracts/analytics-events.md)).
- Solo se mide si los datos tienen `medicion.websiteId`, el host es `medicion.dominio` y el
  visitante no activó "No rastrear" (`navigator.doNotTrack === '1'`).

**Justificación**:
- Umami no usa cookies, no guarda la IP (la convierte en un identificador diario con sal) y
  admite eventos con propiedades.
- Al no cargar código de terceros, no hay script que fijar ni verificar: el código de medición es
  nuestro, va versionado en `script.js` y se prueba con `node --test`. Así FR-037a se cumple por
  construcción y el Principio III no suma superficie de ataque.
- Si la llamada falla o la bloquean, se ignora en silencio (`.catch(() => {})`) y la página sigue
  igual.
- Las condiciones de dominio y `websiteId` evitan medir al abrir el archivo localmente o en las
  pruebas.

**Verificado el 2026-11-26** en docs.umami.is ("Sending stats"): el endpoint de Umami Cloud es
`https://gateway.umami.is/api/send` (no `cloud.umami.is`, como se suponía); la forma del cuerpo
(`{ type, payload: { website, hostname, url, title, language, screen, referrer, name?, data? } }`)
coincide; no hace falta token, pero sí un User-Agent válido. El límite mensual del plan Hobby sigue sin
confirmarse en la página oficial (terceros citan 100 000 eventos al mes); con el tráfico de un
negocio local el margen es amplio, y debe revisarse al crear la cuenta.

**Alternativas**:
- Script oficial de Umami o Plausible desde su CDN: no tienen versión fija ni SRI posible.
  Incumple FR-037a. Rechazada.
- Copiar el script de Umami al repositorio: se desincroniza con su API sin aviso. Rechazada.
- GoatCounter: el plan gratuito está pensado para uso no comercial y los precios comerciales que
  publican terceros no coinciden (5 o 15 al mes). Rechazada por incertidumbre de licencia.
- Cloudflare Web Analytics: no tiene eventos personalizados, así que no cumple SC-009. Rechazada.
- Plausible: es de pago desde el primer mes. Puede reemplazar a Umami cambiando solo el endpoint
  y el formato del cuerpo, si el negocio lo prefiere.

## R4. Preguntas frecuentes accesibles y sin JavaScript (FR-004 a FR-007)

**Decisión**: preguntas con `<details>`/`<summary>` nativos, escritas como contenido estático en
`index.html`. Las respuestas **no** llevan precios, teléfonos ni horarios literales: si los
necesitan, usan los ganchos existentes (`data-horario`, `data-open-advisor`). Al final va un botón
`data-open-advisor="general"`.

**Justificación**: el elemento nativo se abre con ratón, toque, Enter y Espacio, anuncia el estado
"expandido/contraído" a los lectores de pantalla y funciona sin scripts. No hace falta código.

**Alternativas**: un acordeón propio con `aria-expanded` añade código y pruebas sin beneficio.
Datos estructurados `FAQPage`: desde 2023 Google solo los muestra para sitios oficiales y de
salud. Ambas rechazadas.

## R5. Proceso, requisitos por caso y aviso de "solo personas naturales" (FR-001 a FR-003)

**Decisión**:
- **Proceso**: una sección estática nueva, `#como-funciona`, con 5 pasos en un `<ol>`, entre el
  hero y el catálogo de firmas.
- **Requisitos**: se reorganizan en dos bloques estáticos.
  - "Firma electrónica (personas naturales)": celular, cédula, selfie y correo; el certificado de
    RUC lleva la etiqueta "solo si tienes RUC".
  - "Facturación electrónica": persona natural y persona jurídica, con los documentos que confirme
    el responsable.
- **Aviso FR-002a**: un texto estático junto a los planes de firma y a los requisitos, y otro en
  la sección de facturación que se muestra al elegir "Persona Jurídica"
  (`data-taxpayer-note="juridica"`, que `setTaxpayerType` alterna).
- **Mismo día (FR-003)**: la condición sale de los datos (`negocio.entrega`) y se muestra con el
  gancho `data-entrega`.

**Justificación**: los requisitos y los pasos son contenido, no datos comerciales. Escritos en el
HTML se leen sin JavaScript y no contradicen la regla de fuente única, que se refiere a precios,
contacto y horarios. La hora límite de entrega sí es un dato comercial que puede cambiar, por eso
vive en los datos.

**Alternativa**: generar los requisitos desde los datos. No se leerían sin JavaScript y no hay
nada que derivar. Rechazada.

## R6. Promociones con variantes y sin tocar el HTML (FR-017 a FR-020)

**Decisión**:
- Cada promoción gana `variantes: [{ pagaAnios, recibeAnios, precio? }]`. Si falta `precio`, se
  usa el del plan de firma de `pagaAnios` años (supuesto de la spec).
- El banner completo se genera en `renderPromotions()` dentro de `#promociones-container`, con
  una tarjeta por promoción vigente y un botón por variante (`data-plan="promo:<id>:<i>"`).
- `section#promociones` y los enlaces del menú pasan a usar el gancho genérico
  `data-promo-any`: se muestran si hay **al menos una** promoción vigente.
- La tarjeta de firma cuyo `anios` coincide con el `pagaAnios` de una variante vigente muestra
  "Promo: recibes N años por $X" con enlace a `#promociones`.

**Justificación**: hoy el texto, las variantes y el identificador de la promoción están escritos
en el HTML, así que publicar otra obliga a editarlo (H9). Generarlo desde los datos cumple FR-020
y FR-018 y reutiliza el mismo mecanismo que las tarjetas. Las fechas y la hora de Ecuador siguen
en `isPromotionActive`.

**Compatibilidad**: la clave `promo:<id>` (sin índice) sigue siendo válida y equivale a la
variante 0, así que no se rompen las pruebas ni los enlaces existentes.

**Alternativas**: dejar el banner en el HTML y solo agregar botones. No cumple FR-020.
Rechazada.

## R7. Ayuda para elegir: costo por año, ahorro y comprobantes por mes (FR-021 a FR-023)

**Decisión**:
- **Firmas**: se agrega `anios` (número, o `null` para los planes de 10 y 30 días). Las funciones
  puras `calculateYearlyCost(plan)` = `precio / anios` y
  `calculateSavings(plan, planAnual)` = `planAnual.precio × anios − precio` calculan los valores.
  Se muestran solo si `anios ≥ 2` y el ahorro es mayor que 0.
- **Comprobantes**: el campo de texto `cantidad` se sustituye por el número `total`. La etiqueta
  `"<total> COMPROBANTES"` y el promedio `Math.round(total / 12)` salen de funciones puras.
- **Facturación**: los tipos de comprobante incluidos son contenido estático, a confirmar por el
  responsable.

**Justificación**: los números permiten calcular sin interpretar textos. Las descripciones del
modal siguen idénticas ("50 COMPROBANTES"), así que los mensajes que reciben los asesores no
cambian.

**Valores resultantes** (para pruebas):

| Plan | Por año | Ahorro |
|------|---------|--------|
| 2 años $21,00 | $10,50 | $9,00 |
| 3 años $30,00 | $10,00 | $15,00 |
| 4 años $35,00 | $8,75 | $25,00 |
| 5 años $46,00 | $9,20 | $29,00 |

Comprobantes por mes: 50 → 4, 70 → 6, 100 → 8, 200 → 17, 400 → 33, 600 → 50.

## R8. Estado de atención y próxima apertura (FR-024, FR-025)

**Decisión**:
- El horario pasa de texto a estructura:
  `horario: { semana: { inicio: '09:00', fin: '18:00' }, sabado: { inicio: '10:00', fin: '14:00' } }`.
  El domingo no se atiende.
- Funciones puras, todas en hora de Ecuador (UTC−5, el mismo desfase que ya usa
  `getEcuadorDateString`):
  - `formatSchedule(tramo)` → `"9:00 a 18:00"`, el mismo texto de hoy.
  - `getAttentionStatus(horario, ahora)` → `{ abierto, proxima: { cuando, hora } }`, donde
    `cuando` vale `hoy`, `mañana` o el nombre del día.
  - `formatAttentionStatus(estado)` → "Atendiendo ahora" o "Fuera de horario · Te respondemos
    el lunes desde las 9:00".
- El estado se muestra en la barra superior (`data-atencion`) y en el modal, y se recalcula cada
  vez que se abre el modal.

**Justificación**: la estructura evita interpretar "9:00 a 18:00" y permite probar los bordes:
17:59, 18:00, sábado 14:00, domingo y la noche del viernes. Los feriados quedan fuera de alcance
(Assumptions de la spec).

**Alternativa**: `Intl.DateTimeFormat` con `timeZone: 'America/Guayaquil'` es más general, pero
es innecesario sin horario de verano y menos predecible en Node de pruebas. Se mantiene el
desfase fijo ya probado.

## R9. Asesor sugerido y saludo sin "Asesor 1" (FR-026, FR-027; aclaración Q2 = B)

**Decisión**:
- `pickSuggestedAdvisor(asesores, aleatorio)` elige un asesor con `aleatorio()` inyectable para
  las pruebas. Se llama **una vez por carga de página** y el resultado queda en memoria, así que
  la sugerencia es la misma durante la visita.
- En el modal, el enlace del asesor sugerido lleva el estilo dorado, va primero (se mueve al inicio del DOM, para que también sea el primero con Tab)
  y muestra la etiqueta "Sugerido". Los IDs `link-asesor-1` y `link-asesor-2` se conservan.
- Las plantillas de mensaje dejan de usar `{asesor}`, por ejemplo: "Hola, equipo de {negocio},
  estoy interesado en adquirir: …".

**Justificación**: un sorteo de 50 % por carga reparte las consultas sin guardar nada en el
navegador; cada asesor tiene probabilidad 1/2 (US7, escenario 4). Con una muestra fija y
uniforme de valores aleatorios la prueba es determinista. El reparto real se mide en SC-010. El rótulo interno del asesor desaparece del
mensaje.

**Alternativas**:
- `sessionStorage` para mantenerla entre recargas: no se pide y guarda estado. Rechazada.
- Alternar por paridad del minuto: sesgos predecibles. Rechazada.

## R10. Presentación al compartir, icono y datos para buscadores (FR-008 a FR-011)

**Decisión**:
- **Metadatos estáticos** en el `<head>` de `index.html`: `description` de 150–160 caracteres,
  `og:type`, `og:title`, `og:description`, `og:image` (URL absoluta), `og:url`, `og:locale=es_EC`,
  `twitter:card=summary_large_image`, `link rel="canonical"` y `theme-color`. Facebook y WhatsApp
  no ejecutan JavaScript, así que **deben** ser estáticos. No llevan teléfonos, precios ni la URL
  de Facebook, así que no rompen las invariantes de fuente única.
- **Imagen para compartir**: `img/og-tari.jpg`, de 1200×630 y menos de 300 KB. Es JPEG porque
  WhatsApp no muestra SVG y su soporte de WebP en vistas previas es irregular (ver Complexity
  Tracking).
- **Iconos**: `favicon.svg`, sacado del logo vectorial existente, y `apple-touch-icon.png` de
  180×180, porque iOS no acepta SVG.
- **Datos estructurados**: el JSON-LD de tipo `ProfessionalService` lo **genera `script.js`**
  desde los datos con la función pura `buildStructuredData(siteData)` y lo inserta como
  `textContent` de un `<script type="application/ld+json">`. Google ejecuta JavaScript al indexar,
  y así los teléfonos y el horario siguen en una sola fuente.

**Dependencia del responsable**: el dominio público, para `og:url`, `og:image` y `canonical`. Va
en `siteData.medicion.dominio` (lo usa la medición) y se escribe también en el `<head>`; esa es la
única repetición, y `tests/metadata.test.js` comprueba que ambas coincidan.

**Alternativas**:
- Metadatos generados por JavaScript: los rastreadores de vistas previas no los verían.
  Rechazada.
- `robots.txt` y `sitemap.xml`: para una sola página con canonical no aportan; quedan fuera de
  alcance.

## R11. Aviso de privacidad, términos e identidad legal (FR-012 a FR-016)

**Decisión**:
- Dos páginas estáticas nuevas, `privacidad.html` y `terminos.html`, con cabecera simplificada
  (logo y "Volver al inicio"), las mismas hojas de estilo y `script.js`.
- Razón social, RUC, ciudad y entidad certificadora viven en `siteData.negocio.legal` y se
  muestran con ganchos `data-legal="razonSocial|ruc|ciudad|entidadCertificadora"`.
- El footer enlaza a ambas páginas.
- Mientras un dato legal sea `null`, el elemento queda oculto y `tests/publicacion.test.js` lo
  marca como **pendiente** (`todo`) sin romper la suite.

**Justificación**:
- Páginas propias dan una URL enlazable (útil para responder en WhatsApp y para Facebook) y no
  alargan la página de venta.
- Los ganchos evitan repetir el RUC en tres archivos.
- `script.js` ya tolera páginas sin contenedores: `render…` sale si no encuentra su contenedor.
- La marca `todo` cumple el Principio V: no se publica un RUC inventado, y el pendiente queda a
  la vista en cada ejecución de `node --test`.

**Contenido mínimo del aviso de privacidad**, según la LOPDP:
- responsable del tratamiento;
- datos pedidos (cédula, selfie, RUC, correo, celular);
- finalidad (emisión ante la entidad certificadora);
- destinatarios (la entidad certificadora);
- canal (WhatsApp);
- tiempo de conservación;
- derechos de acceso, rectificación, eliminación, oposición y portabilidad, y cómo ejercerlos;
- la medición sin cookies (R3);
- que el sitio no recibe ni guarda archivos.

El texto lo redacta y confirma el responsable (FR-038).

**Alternativa**: secciones `<details>` dentro de `index.html`. Un ancla no abre un `<details>`
sin código y alarga la página. Rechazada.

## R12. Navegación y accesibilidad (FR-029 a FR-033, FR-036)

**Decisión**:
- **Cabecera fija**: `scroll-mt-28` en cada `section[id]`; la cabecera mide 80 px más el margen.
- **Menú móvil**:
  - el botón lleva `aria-expanded` y `aria-controls="mobile-menu"`;
  - al pulsar un enlace del menú, el menú se cierra;
  - Escape también lo cierra.
- **Selector Natural/Jurídica**: `aria-pressed="true|false"`, que actualiza `setTaxpayerType`.
- **Títulos**: en el hero, "Certificado Digital P12" pasa de `h3` a `p` con el mismo estilo (va
  antes del primer `h2`).
- **Movimiento**: en `styles.css`,
  `@media (prefers-reduced-motion: reduce) { .animate-pulse-gold { animation: none; } }`.
- **Tamaño de texto**: `text-[10px]` y `text-[11px]` pasan a `text-xs` (12 px).
  `tests/html.test.js` prohíbe ambas clases en los `.html` y en `script.js`.
- **Año**: `data-anio`, que se rellena con el año de Ecuador (`getEcuadorDateString(ahora).slice(0, 4)`).

**Justificación**: son cambios locales que no alteran el diseño y cumplen la sección de
accesibilidad de la constitución.

## R13. Content-Security-Policy

**Decisión**: una etiqueta `<meta http-equiv="Content-Security-Policy">` en cada página:

```text
default-src 'self' file:; script-src 'self' file:; style-src 'self' file: https://cdnjs.cloudflare.com;
font-src 'self' file: https://cdnjs.cloudflare.com; img-src 'self' file: data:;
connect-src 'self' https://gateway.umami.is; base-uri 'self'; form-action 'none'; object-src 'none'
```

**Justificación**:
- La constitución lo pide (SHOULD) "cuando el hosting lo permita", y la etiqueta funciona en
  cualquier hosting estático.
- Es posible ahora porque al precompilar Tailwind desaparece el único `<script>` en línea (la
  configuración).
- El `<script type="application/ld+json">` no se ejecuta, así que no lo afecta `script-src`.
- `frame-ancestors` no se puede fijar por `<meta>`; se documenta como cabecera opcional del
  hosting.
- **Riesgo con `file://`** (Principio I): algunos navegadores tratan una página abierta por
  `file://` como origen opaco, y entonces `'self'` podría bloquear `script.js`, `tailwind.css`
  o las fuentes. Al implementar se prueba en Chrome, Firefox y Safari. Si alguno bloquea, se
  quita el `<meta>` y la CSP pasa a ser una cabecera del hosting documentada en el README; el
  resultado se anota aquí.
  **Resultado (2026-11-26)**: Chrome y Edge cargan `script.js`, `tailwind.css` y las fuentes
  por `file://` sin violaciones de CSP; se mantiene el `<meta>`. Firefox y Safari quedan para la
  verificación del PR. El validador W3C (vnu) advierte que `'self'` no cubre archivos `file:`,
  así que se agregó la fuente de esquema `file:` (según CSP3 coincide con cualquier URL `file:`;
  en producción no tiene efecto, porque una página HTTPS no puede cargar recursos `file:`).
  **Firefox (2026-11-26)**: el responsable confirmó que funciona bien. Safari sigue pendiente.

**Alternativa**: no definir CSP. Pierde una defensa barata frente a XSS en la página de venta.
Rechazada.

## R14. Datos que debe entregar el responsable del negocio

No bloquean el diseño, pero sí la publicación (FR-038). Hasta tenerlos, los elementos quedan
ocultos y aparecen como pendientes en `tests/publicacion.test.js`.

| Dato | Dónde se usa |
|------|--------------|
| Dominio público | metadatos, canonical, medición |
| Razón social, RUC, ciudad | footer, aviso de privacidad |
| Entidad certificadora acreditada | hero, footer, preguntas frecuentes |
| Hora límite para entrega el mismo día (lun–vie y sábado) | hero, preguntas frecuentes |
| Requisitos de facturación para persona jurídica | requisitos |
| Tipos de comprobante incluidos | facturación |
| Respuestas de las preguntas frecuentes | preguntas frecuentes |
| Textos de privacidad y de términos (reembolsos, comprobantes no usados) | páginas legales |
| Imagen para compartir (o aprobación de una generada del logo) | vista previa |
| Cuenta de Umami Cloud y su `websiteId` | medición |

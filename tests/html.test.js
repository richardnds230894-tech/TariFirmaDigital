/**
 * Invariantes de las páginas HTML (contracts/dom-hooks.md de 001 y de 002 → "Invariantes
 * verificables"). Las invariantes generales se aplican a todas las páginas *.html de la raíz.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');
const { siteData } = require('../script.js');

const raiz = join(__dirname, '..');
const paginas = readdirSync(raiz)
    .filter(nombre => nombre.endsWith('.html'))
    .map(nombre => ({ nombre, html: readFileSync(join(raiz, nombre), 'utf8') }));
const html = paginas.find(p => p.nombre === 'index.html').html;
const asesorIds = siteData.asesores.map(a => a.id);

/** Devuelve los valores de un atributo data-* en un HTML (por defecto, index.html). */
function valoresDe(atributo, texto = html) {
    return [...texto.matchAll(new RegExp(`${atributo}="([^"]*)"`, 'g'))].map(m => m[1]);
}

/** Devuelve todas las etiquetas de apertura de un elemento en un HTML. */
function etiquetas(nombre, texto) {
    return [...texto.matchAll(new RegExp(`<${nombre}\\b[^>]*>`, 'g'))].map(m => m[0]);
}

for (const { nombre, html: pagina } of paginas) {
    const sinEspacios = pagina.replace(/\s+/g, '');

    test(`${nombre} · invariante 1: no contiene onclick`, () => {
        assert.ok(!/onclick\s*=/i.test(pagina), 'contiene onclick');
    });

    test(`${nombre} · invariante 2: sin wa.me, números de asesor ni URL de Facebook`, () => {
        assert.ok(!pagina.includes('wa.me/'), 'contiene wa.me/');
        for (const asesor of siteData.asesores) {
            const local = asesor.whatsapp.slice(3); // sin el 593
            assert.ok(!sinEspacios.includes(local), `contiene el número ${local}`);
        }
        assert.ok(!pagina.includes('facebook.com'), 'contiene la URL de Facebook');
    });

    test(`${nombre} · invariante 3: data-whatsapp y data-phone apuntan a asesores existentes`, () => {
        for (const id of [...valoresDe('data-whatsapp', pagina), ...valoresDe('data-phone', pagina)]) {
            assert.ok(asesorIds.includes(id), `asesor desconocido: ${id}`);
        }
        for (const mensaje of valoresDe('data-mensaje', pagina)) {
            assert.ok(['info', 'ayuda'].includes(mensaje), `mensaje desconocido: ${mensaje}`);
        }
    });

    test(`${nombre} · todo enlace target="_blank" lleva rel="noopener noreferrer"`, () => {
        for (const enlace of etiquetas('a', pagina).filter(a => a.includes('target="_blank"'))) {
            assert.ok(enlace.includes('rel="noopener noreferrer"'), enlace);
        }
    });

    test(`${nombre} · invariante 6: sin CDN de Tailwind ni Google Fonts; hojas externas con SRI`, () => {
        assert.ok(!pagina.includes('cdn.tailwindcss.com'), 'usa el Play CDN de Tailwind');
        assert.ok(!pagina.includes('fonts.googleapis.com'), 'usa Google Fonts');
        const externas = etiquetas('link', pagina)
            .filter(l => /rel="stylesheet"/.test(l) && /href="https:\/\//.test(l));
        for (const hoja of externas) {
            assert.match(hoja, /integrity="sha(256|384|512)-[^"]+"/, hoja);
            assert.ok(hoja.includes('crossorigin="anonymous"'), hoja);
        }
        assert.ok(pagina.includes('href="tailwind.css"'), 'no enlaza tailwind.css');
    });

    test(`${nombre} · invariante 9: sin precios escritos a mano`, () => {
        assert.ok(!/\$\s*\d/.test(pagina), 'contiene un precio literal ($ seguido de dígitos)');
    });

    test(`${nombre} · invariante 12: una sola CSP y ningún script en línea ejecutable`, () => {
        const csp = etiquetas('meta', pagina).filter(m => m.includes('http-equiv="Content-Security-Policy"'));
        assert.equal(csp.length, 1, 'se esperaba exactamente una CSP');
        for (const script of etiquetas('script', pagina)) {
            const permitido = script.includes('src="script.js"') || script.includes('type="application/ld+json"');
            assert.ok(permitido, `script no permitido: ${script}`);
        }
    });
}

/** Devuelve el HTML de una página de la raíz por su nombre. */
function pagina(nombre) {
    const encontrada = paginas.find(p => p.nombre === nombre);
    assert.ok(encontrada, `no existe ${nombre}`);
    return encontrada.html;
}

/** Devuelve el HTML de la sección con ese id (hasta su cierre </section>) en una página. */
function seccion(id, texto = html) {
    const encontrada = texto.match(new RegExp(`<section\\b[^>]*id="${id}"[\\s\\S]*?</section>`));
    assert.ok(encontrada, `no existe section#${id}`);
    return encontrada[0];
}

const AVISO_NATURALES = 'La firma electrónica se emite solo a personas naturales';

test('index.html · US1: #como-funciona tiene un <ol> con 5 pasos (FR-001)', () => {
    const lista = seccion('como-funciona').match(/<ol\b[\s\S]*?<\/ol>/);
    assert.ok(lista, 'falta el <ol> de pasos');
    assert.equal((lista[0].match(/<li\b/g) || []).length, 5);
});

test('facturacion.html · data-taxpayer-note solo usa natural o juridica, y el jurídico empieza oculto', () => {
    const facturacion = pagina('facturacion.html');
    const notas = valoresDe('data-taxpayer-note', facturacion);
    assert.deepEqual([...new Set(notas)].sort(), ['juridica', 'natural']);
    for (const etiqueta of etiquetas('[a-z]+', facturacion).filter(e => e.includes('data-taxpayer-note="juridica"'))) {
        assert.match(etiqueta, /class="[^"]*\bhidden\b/, etiqueta);
    }
});

test('firma.html · el aviso de "solo personas naturales" está en los planes y en los requisitos (FR-002a, FR-020)', () => {
    const firma = pagina('firma.html');
    assert.ok(seccion('firma-electronica', firma).includes(AVISO_NATURALES), 'falta en #firma-electronica');
    assert.ok(seccion('requisitos', firma).includes(AVISO_NATURALES), 'falta en #requisitos');
});

test('index.html · US1: la entrega del mismo día sale de los datos (FR-003)', () => {
    assert.ok(html.includes('data-entrega'), 'falta el gancho data-entrega');
    assert.ok(!/>\s*Mismo día\s*</.test(html), '"Mismo día" sigue escrito a mano');
});

test('index.html · US2: #preguntas tiene al menos 7 <details> con <summary> y cierra con un asesor', () => {
    const preguntas = seccion('preguntas');
    const bloques = [...preguntas.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)].map(m => m[1]);
    assert.ok(bloques.length >= 7, `hay ${bloques.length} preguntas`);
    for (const bloque of bloques) {
        assert.match(bloque, /^\s*<summary\b/, 'el <summary> debe ser el primer hijo');
    }
    const ultimoBoton = etiquetas('button', preguntas).pop();
    assert.ok(ultimoBoton && ultimoBoton.includes('data-open-advisor="general"'), 'falta el botón final al asesor');
});

test('US4: existen las páginas legales y el footer de index.html enlaza a ambas (FR-012, FR-014, FR-015)', () => {
    const nombres = paginas.map(p => p.nombre);
    assert.ok(nombres.includes('privacidad.html'), 'falta privacidad.html');
    assert.ok(nombres.includes('terminos.html'), 'falta terminos.html');
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)[0];
    assert.ok(footer.includes('href="privacidad.html"'), 'el footer no enlaza a privacidad.html');
    assert.ok(footer.includes('href="terminos.html"'), 'el footer no enlaza a terminos.html');
});

test('US4: data-legal usa claves válidas y cada grupo legal tiene su texto alternativo', () => {
    const validas = ['razonSocial', 'ruc', 'ciudad', 'entidadCertificadora'];
    for (const { nombre, html: pagina } of paginas) {
        for (const clave of valoresDe('data-legal', pagina)) {
            assert.ok(validas.includes(clave), `${nombre}: clave legal desconocida ${clave}`);
        }
    }
    assert.ok(html.includes('data-legal="entidadCertificadora"'), 'el hero no nombra la entidad certificadora (FR-013)');
    for (const grupo of etiquetas('[a-z]+', html).filter(e => /\sdata-legal-group[\s>]/.test(e))) {
        assert.match(grupo, /class="[^"]*\bhidden\b/, `el grupo debe empezar oculto: ${grupo}`);
    }
});

test('US4: ninguna página recoge datos ni archivos (FR-016)', () => {
    for (const { nombre, html: pagina } of paginas) {
        assert.ok(!/<form\b/i.test(pagina), `${nombre} contiene <form>`);
        assert.ok(!/<input\b/i.test(pagina), `${nombre} contiene <input>`);
        assert.ok(!/<textarea\b/i.test(pagina), `${nombre} contiene <textarea>`);
        assert.ok(!/type="file"/i.test(pagina), `${nombre} contiene type="file"`);
    }
});

test('index.html · invariante 5: existe un aviso <noscript>', () => {
    assert.match(html, /<noscript>[\s\S]*JavaScript[\s\S]*<\/noscript>/);
});

test('index.html · todo data-open-advisor es una clave válida', () => {
    const validas = ['general', 'flotante', 'banco', 'renovacion', 'facturacion:natural', 'facturacion:juridica'];
    const usadas = valoresDe('data-open-advisor');
    assert.ok(usadas.length > 0);
    for (const clave of usadas) {
        assert.ok(validas.includes(clave), `clave desconocida: ${clave}`);
    }
});

test('index.html · el modal es un diálogo accesible con su título', () => {
    const modal = html.match(/<div\b[^>]*id="advisor-modal"[^>]*>/);
    assert.ok(modal, 'no existe #advisor-modal');
    assert.ok(modal[0].includes('role="dialog"'), 'falta role="dialog"');
    assert.ok(modal[0].includes('aria-modal="true"'), 'falta aria-modal="true"');
    assert.ok(modal[0].includes('aria-labelledby="advisor-modal-title"'), 'falta aria-labelledby');
    assert.match(html, /id="advisor-modal-title"/);
});

test('index.html · invariante 4 (003): sin promociones-container; el menú "Promociones" depende de la vigencia', () => {
    assert.ok(!html.includes('promociones-container'), 'queda promociones-container');

    const enlaces = etiquetas('a', html).filter(a => /\sdata-promo-any[\s>]/.test(a));
    assert.equal(enlaces.length, 2, 'se esperaban 2 enlaces de menú (escritorio y móvil)');
    for (const enlace of enlaces) {
        assert.match(enlace, /class="[^"]*\bhidden\b/, enlace);
    }
    for (const antiguo of ['data-promo=', 'data-promo-link', 'data-promo-precio', 'data-promo-vigencia']) {
        assert.ok(!html.includes(antiguo), `queda el gancho antiguo ${antiguo}`);
    }
    for (const promo of siteData.promociones) {
        assert.ok(!html.includes(promo.id), `el id ${promo.id} está escrito en el HTML`);
    }
    assert.ok(!/Del \d+ de [a-z]+ al \d+ de [a-z]+/.test(html), 'hay una vigencia escrita a mano');
});

test('firma.html · hay un botón de renovación (FR-028 de 002, FR-016 de 003)', () => {
    assert.ok(pagina('firma.html').includes('data-open-advisor="renovacion"'), 'falta el botón de renovación');
});

test('firma.html · invariante 16: planes, requisitos y formas de pago, sin selector de tipo ni token', () => {
    const firma = pagina('firma.html');
    assert.match(firma, /id="firma-cards-container"/);
    seccion('requisitos', firma);
    assert.match(seccion('formas-de-pago', firma), /data-bancos/);
    assert.ok(!firma.includes('data-taxpayer'), 'no debe haber selector de tipo de cliente');
    assert.ok(!/token/i.test(firma), 'no debe mencionar token');
    assert.match(firma, /data-open-advisor="banco"/);
});

test('invariante 7: sin texto de 10 u 11 px en las páginas ni en script.js (FR-033)', () => {
    const codigo = readFileSync(join(raiz, 'script.js'), 'utf8');
    for (const { nombre, html: texto } of [...paginas, { nombre: 'script.js', html: codigo }]) {
        assert.ok(!/text-\[1[01]px\]/.test(texto), `${nombre} usa text-[10px] o text-[11px]`);
    }
});

test('index.html · invariante 11: menú móvil y selector con estado accesible (FR-030, FR-031)', () => {
    const boton = etiquetas('button', html).find(b => b.includes('id="mobile-menu-btn"'));
    assert.ok(boton.includes('aria-controls="mobile-menu"'), 'falta aria-controls');
    assert.match(boton, /aria-expanded="false"/);
    for (const id of ['btn-natural', 'btn-juridica']) {
        const selector = etiquetas('button', pagina('facturacion.html')).find(b => b.includes(`id="${id}"`));
        assert.ok(selector, `falta #${id} en facturacion.html`);
        assert.match(selector, /aria-pressed="(true|false)"/, id);
    }
});

test('facturacion.html · invariante 17: planes, dos tarjetas de requisitos y formas de pago, sin "Miembro de Empresa"', () => {
    const facturacion = pagina('facturacion.html');
    for (const id of ['comprobantes-cards-container', 'btn-natural', 'btn-juridica']) {
        assert.match(facturacion, new RegExp(`id="${id}"`), id);
    }
    const requisitos = seccion('requisitos', facturacion);
    const tarjetas = [...requisitos.matchAll(/<h3\b[^>]*>([^<]+)<\/h3>/g)].map(m => m[1].trim());
    assert.deepEqual(tarjetas, ['Persona Natural', 'Persona Jurídica (Representante Legal)']);
    for (const clave of ['facturacion:natural', 'facturacion:juridica']) {
        assert.ok(requisitos.includes(`data-open-advisor="${clave}"`), `falta el botón ${clave}`);
    }
    assert.ok(requisitos.includes(AVISO_NATURALES), 'falta el aviso de "solo personas naturales"');
    assert.ok(!/Miembro de Empresa/i.test(facturacion), 'no debe aparecer "Miembro de Empresa"');
    assert.match(seccion('formas-de-pago', facturacion), /data-bancos/);
    assert.match(facturacion, /Necesitas una firma electrónica vigente/);
});

for (const nombre of ['index.html', 'firma.html', 'facturacion.html']) {
    test(`${nombre} · cada section con id deja su título visible bajo la cabecera fija (FR-029)`, () => {
        for (const apertura of etiquetas('section', pagina(nombre)).filter(s => /\sid="/.test(s))) {
            assert.match(apertura, /class="[^"]*\bscroll-mt-28\b/, apertura);
        }
    });

    test(`${nombre} · los títulos no saltan de nivel y no hay <h3> antes del primer <h2> (FR-033)`, () => {
        const principal = pagina(nombre).split('<!-- COMPARTIDO: INICIO PIE')[0];
        const niveles = [...principal.matchAll(/<h([1-6])\b/g)].map(m => Number(m[1]));
        assert.equal(niveles[0], 1, 'el primer título debe ser h1');
        assert.ok(niveles.indexOf(3) === -1 || niveles.indexOf(2) < niveles.indexOf(3), 'hay un h3 antes del primer h2');
        for (let i = 1; i < niveles.length; i += 1) {
            assert.ok(niveles[i] <= niveles[i - 1] + 1, `salto de h${niveles[i - 1]} a h${niveles[i]}`);
        }
    });
}

test('styles.css detiene el pulso de la promoción con "reducir movimiento" (FR-032)', () => {
    const css = readFileSync(join(raiz, 'styles.css'), 'utf8');
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.animate-pulse-gold\s*\{\s*animation:\s*none;/);
});

test('invariante 12 (US10): la CSP permite enviar la medición solo al origen de Umami', () => {
    const origen = new URL(siteData.medicion.endpoint).origin;
    for (const { nombre, html: pagina } of paginas) {
        const csp = pagina.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/)[1];
        const connect = csp.split(';').map(d => d.trim()).find(d => d.startsWith('connect-src'));
        assert.equal(connect, `connect-src 'self' ${origen}`, nombre);
    }
});

test('US10: el año del copyright sale de los datos en todas las páginas (FR-036)', () => {
    for (const { nombre, html: pagina } of paginas) {
        assert.match(pagina, /©\s*<span data-anio>/, nombre);
    }
});

test('US10: el aviso de privacidad describe la medición sin cookies (FR-014)', () => {
    const privacidad = paginas.find(p => p.nombre === 'privacidad.html').html;
    assert.match(privacidad, /sin cookies/i);
    assert.match(privacidad, /No rastrear/);
});

test('index.html · invariante 19 (003): el carrusel es accesible y sus botones tienen nombre', () => {
    const apertura = html.match(/<section\b[^>]*id="promociones"[^>]*>/);
    assert.ok(apertura, 'no existe section#promociones');
    assert.match(apertura[0], /aria-roledescription="carrusel"/);
    assert.match(apertura[0], /aria-label="[^"]+"/);
    assert.match(apertura[0], /\sdata-carousel[\s>]/);
    const carrusel = seccion('promociones');
    for (const control of ['data-carousel-prev', 'data-carousel-next', 'data-carousel-pause']) {
        const boton = etiquetas('button', carrusel).find(b => b.includes(control));
        assert.ok(boton, `falta el botón ${control}`);
        assert.match(boton, /aria-label="[^"]+"/, control);
    }
    assert.match(carrusel, /data-carousel-dots/);
    assert.match(carrusel, /data-carousel-live/);
});

test('index.html · US1: el carrusel es la primera sección y su respaldo coincide con el primer flyer informativo (F3)', () => {
    const primera = html.slice(html.indexOf('<!-- COMPARTIDO: FIN CABECERA -->')).match(/<section\b[^>]*>/);
    assert.match(primera[0], /id="promociones"/, 'la primera sección no es el carrusel');
    const respaldo = siteData.flyers.find(f => f.tipo === 'informativo' && !f.inicio && !f.fin);
    const carrusel = seccion('promociones');
    assert.ok(carrusel.includes(`src="${respaldo.imagen}"`), 'el respaldo no usa la imagen del primer flyer informativo');
    assert.ok(carrusel.includes(`alt="${respaldo.alt}"`), 'el respaldo no usa el alt del primer flyer informativo');
});

test('index.html · US1: justo debajo del carrusel está la barra "Preguntas frecuentes" (FR-010)', () => {
    const despues = html.slice(html.indexOf('</section>', html.indexOf('id="promociones"')));
    const siguiente = despues.match(/<a\b[^>]*>[\s\S]*?<\/a>/);
    assert.ok(siguiente, 'no hay un enlace después del carrusel');
    assert.match(siguiente[0], /href="(index\.html)?#preguntas"/);
    assert.match(siguiente[0], /Preguntas frecuentes/);
    assert.ok(despues.indexOf(siguiente[0]) < despues.indexOf('<section'), 'la barra debe ir antes de la siguiente sección');
});

test('index.html · invariante 15 (003): orden de secciones y sin los catálogos trasladados (FR-011, FR-013)', () => {
    const principal = html.slice(html.indexOf('<!-- COMPARTIDO: FIN CABECERA -->'), html.indexOf('<!-- COMPARTIDO: INICIO PIE'));
    const ids = [...principal.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(ids, ['promociones', 'servicios', 'como-funciona', 'preguntas']);
    const hero = principal.indexOf('<!-- HERO SECTION -->');
    assert.ok(principal.indexOf('id="promociones"') < hero && hero < principal.indexOf('id="servicios"'),
        'el hero debe ir entre el carrusel y los servicios');
    for (const trasladado of ['firma-cards-container', 'comprobantes-cards-container', 'id="requisitos"',
        'id="firma-electronica"', 'id="facturacion"', 'data-taxpayer']) {
        assert.ok(!html.includes(trasladado), `index.html todavía contiene ${trasladado}`);
    }
});

test('index.html · US3: "Nuestros servicios" con Firma y Facturación y su "Saber más" (FR-012)', () => {
    const servicios = seccion('servicios');
    assert.match(servicios, /Nuestros servicios/);
    assert.match(servicios, /Conoce lo que ofrecemos para ti/);
    const enlaces = [...servicios.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>[\s\S]*?Saber más[\s\S]*?<\/a>/g)].map(m => m[1]);
    assert.deepEqual(enlaces, ['firma.html', 'facturacion.html']);
});

test('invariante 18 (003): ninguna página usa textos ni cifras de los sitios de referencia (FR-031)', () => {
    const prohibidos = [/Security Data/i, /millones de firmas/i, /App m[oó]vil/i, /usuarios activos/i,
        /Miembro de Empresa/i, /Security Factura/i];
    for (const { nombre, html: texto } of paginas) {
        for (const patron of prohibidos) {
            assert.ok(!patron.test(texto), `${nombre} contiene ${patron}`);
        }
    }
});

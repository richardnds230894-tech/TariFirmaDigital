/**
 * Metadatos del <head> de index.html (contracts/page-metadata.md, FR-008 a FR-010).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { siteData } = require('../script.js');
const { pendiente } = require('./pendiente.js');

const raiz = join(__dirname, '..');
const html = readFileSync(join(raiz, 'index.html'), 'utf8');
const head = html.slice(0, html.indexOf('</head>'));

/** Devuelve el content de un <meta> por name o property, o undefined. */
function meta(clave) {
    const etiqueta = head.match(new RegExp(`<meta\\s+(?:name|property)="${clave}"\\s+content="([^"]*)"`));
    return etiqueta ? etiqueta[1] : undefined;
}

/** Devuelve el href de un <link rel="…">, o undefined. */
function enlace(rel) {
    const etiqueta = head.match(new RegExp(`<link\\s+rel="${rel}"[^>]*href="([^"]*)"`));
    return etiqueta ? etiqueta[1] : undefined;
}

test('description de 150 a 160 caracteres (FR-008)', () => {
    const descripcion = meta('description');
    assert.ok(descripcion, 'falta meta description');
    assert.ok(descripcion.length >= 150 && descripcion.length <= 160, `mide ${descripcion.length}`);
    assert.equal(meta('og:description'), descripcion);
});

test('Open Graph y Twitter completos (FR-009)', () => {
    const titulo = head.match(/<title>([^<]*)<\/title>/)[1];
    assert.equal(meta('og:title'), titulo);
    assert.equal(meta('og:type'), 'website');
    assert.equal(meta('og:locale'), 'es_EC');
    assert.equal(meta('og:site_name'), siteData.negocio.nombre);
    assert.equal(meta('og:image:width'), '1200');
    assert.equal(meta('og:image:height'), '630');
    assert.ok(meta('og:image:alt'), 'falta og:image:alt');
    assert.equal(meta('twitter:card'), 'summary_large_image');
    assert.equal(meta('theme-color'), '#061A3A');
});

test('iconos de la marca (FR-010)', () => {
    assert.match(head, /<link\s+rel="icon"\s+href="favicon\.svg"\s+type="image\/svg\+xml">/);
    assert.equal(enlace('apple-touch-icon'), 'apple-touch-icon.png');
    for (const archivo of ['favicon.svg', 'apple-touch-icon.png', 'img/og-tari.jpg']) {
        assert.ok(existsSync(join(raiz, archivo)), `falta ${archivo}`);
    }
});

test('imagen para compartir: JPEG de menos de 300 KB', () => {
    const imagen = readFileSync(join(raiz, 'img', 'og-tari.jpg'));
    assert.equal(imagen[0], 0xFF);
    assert.equal(imagen[1], 0xD8, 'no es un JPEG');
    assert.ok(imagen.length < 300 * 1024, `pesa ${imagen.length} bytes`);
});

test('las URL absolutas usan https y un mismo host', () => {
    const urls = [enlace('canonical'), meta('og:url'), meta('og:image')];
    for (const url of urls) {
        assert.ok(url, 'falta canonical, og:url u og:image');
        assert.match(url, /^https:\/\/[^/]+\//);
    }
    assert.equal(new Set(urls.map(u => new URL(u.replace('__DOMINIO__', 'pendiente.invalid')).host)).size, 1);
    assert.ok(meta('og:image').endsWith('/img/og-tari.jpg'));
});

pendiente('dominio real en el <head> igual a siteData.medicion.dominio',
    siteData.medicion.dominio && !head.includes('__DOMINIO__') ? siteData.medicion.dominio : null,
    (dominio) => {
        assert.equal(new URL(enlace('canonical')).host, dominio);
        assert.equal(new URL(meta('og:url')).host, dominio);
        assert.equal(new URL(meta('og:image')).host, dominio);
    });

test('index.html incluye el contenedor de datos estructurados', () => {
    assert.match(head, /<script type="application\/ld\+json" data-structured-data><\/script>/);
});

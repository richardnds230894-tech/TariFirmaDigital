/**
 * Metadatos de las páginas de planes (contracts/page-metadata.md de 003, FR-028).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { siteData } = require('../script.js');

const raiz = join(__dirname, '..');
const dominio = siteData.medicion.dominio;

const paginas = {
    'firma.html': "Firma Electrónica P12 | Tari's Firma Digital",
    'facturacion.html': "Facturación Electrónica SRI | Tari's Firma Digital"
};

for (const [archivo, titulo] of Object.entries(paginas)) {
    const html = readFileSync(join(raiz, archivo), 'utf8');
    const head = html.slice(0, html.indexOf('</head>'));
    const meta = (clave) => {
        const m = head.match(new RegExp(`<meta\\s+(?:name|property)="${clave}"\\s+content="([^"]*)"`));
        return m ? m[1] : undefined;
    };
    const enlace = (rel) => {
        const m = head.match(new RegExp(`<link\\s+rel="${rel}"[^>]*href="([^"]*)"`));
        return m ? m[1] : undefined;
    };

    test(`${archivo} · título y descripción propios (150–160 caracteres)`, () => {
        assert.equal(head.match(/<title>([^<]*)<\/title>/)[1], titulo);
        const descripcion = meta('description');
        assert.ok(descripcion && descripcion.length >= 150 && descripcion.length <= 160,
            `description mide ${descripcion ? descripcion.length : 0}`);
        assert.equal(meta('og:description'), descripcion);
        assert.equal(meta('og:title'), titulo);
    });

    test(`${archivo} · canonical, og:url y og:image con el dominio público`, () => {
        assert.equal(enlace('canonical'), `https://${dominio}/${archivo}`);
        assert.equal(meta('og:url'), `https://${dominio}/${archivo}`);
        assert.equal(meta('og:image'), `https://${dominio}/img/og-tari.jpg`);
    });

    test(`${archivo} · resto de etiquetas para compartir e iconos`, () => {
        assert.equal(meta('og:type'), 'website');
        assert.equal(meta('og:locale'), 'es_EC');
        assert.equal(meta('og:site_name'), siteData.negocio.nombre);
        assert.equal(meta('og:image:width'), '1200');
        assert.equal(meta('og:image:height'), '630');
        assert.ok(meta('og:image:alt'));
        assert.equal(meta('twitter:card'), 'summary_large_image');
        assert.equal(meta('theme-color'), '#061A3A');
        assert.match(head, /<link\s+rel="icon"\s+href="favicon\.svg"/);
        assert.equal(enlace('apple-touch-icon'), 'apple-touch-icon.png');
    });
}

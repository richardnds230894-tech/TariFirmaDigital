/**
 * Navegación entre páginas (research R2, data-model.md → Páginas, invariante 14 de 003).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');
const { getCurrentNavPage, mapLegacyHash } = require('../script.js');

test('getCurrentNavPage identifica la página por su ruta', () => {
    const casos = {
        '/': 'index',
        '/index.html': 'index',
        '/firma.html': 'firma',
        '/facturacion.html': 'facturacion',
        '/privacidad.html': 'privacidad',
        '/terminos.html': 'terminos',
        '/C:/Users/kevin/sitio/firma.html': 'firma',
        '/otra-cosa.html': 'index'
    };
    for (const [ruta, esperado] of Object.entries(casos)) {
        assert.equal(getCurrentNavPage(ruta), esperado, ruta);
    }
});

test('mapLegacyHash redirige las anclas antiguas de la página principal', () => {
    assert.equal(mapLegacyHash('#firma-electronica'), 'firma.html#firma-electronica');
    assert.equal(mapLegacyHash('#facturacion'), 'facturacion.html#facturacion');
    assert.equal(mapLegacyHash('#requisitos'), 'firma.html#requisitos');
    assert.equal(mapLegacyHash('#preguntas'), null);
    assert.equal(mapLegacyHash('#promociones'), null);
    assert.equal(mapLegacyHash(''), null);
});

const raiz = join(__dirname, '..');
const destinos = ['index.html', 'firma.html', 'facturacion.html', 'index.html#como-funciona', 'index.html#preguntas'];

for (const pagina of readdirSync(raiz).filter(nombre => nombre.endsWith('.html'))) {
    test(`${pagina} · invariante 14: el menú de escritorio y el móvil llevan a todas las páginas`, () => {
        const html = readFileSync(join(raiz, pagina), 'utf8');
        const escritorio = html.match(/<nav\b[^>]*aria-label="Menú principal"[\s\S]*?<\/nav>/);
        const movil = html.match(/<div id="mobile-menu"[\s\S]*?<\/div>/);
        assert.ok(escritorio, 'falta el menú de escritorio');
        assert.ok(movil, 'falta el menú móvil');
        for (const menu of [escritorio[0], movil[0]]) {
            for (const destino of destinos) {
                assert.ok(menu.includes(`href="${destino}"`), `falta el enlace a ${destino}`);
            }
        }
    });
}

/**
 * Prueba de humo: script.js debe poder cargarse en Node (sin navegador)
 * para que sus funciones puras se puedan probar.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');

test('script.js carga en Node y exporta un objeto', () => {
    const site = require('../script.js');
    assert.equal(typeof site, 'object');
    assert.ok(site !== null);
});

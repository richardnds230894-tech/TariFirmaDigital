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

test('script.js no genera atributos onclick', () => {
    const { readFileSync } = require('node:fs');
    const { join } = require('node:path');
    const codigo = readFileSync(join(__dirname, '..', 'script.js'), 'utf8');
    assert.ok(!/onclick/i.test(codigo), 'script.js contiene onclick');
});

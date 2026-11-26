/**
 * Pruebas de formato: precios y escape de texto (research.md R3 y R6).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { formatPrice, escapeHtml } = require('../script.js');

test('formatPrice usa coma decimal y siempre dos decimales', () => {
    assert.equal(formatPrice(14.99), '14,99');
    assert.equal(formatPrice(15), '15,00');
    assert.equal(formatPrice(8.5), '8,50');
    assert.equal(formatPrice(46), '46,00');
});

test('escapeHtml escapa los caracteres especiales de HTML', () => {
    assert.equal(escapeHtml('<b>"Tari\'s" & co</b>'),
        '&lt;b&gt;&quot;Tari&#39;s&quot; &amp; co&lt;/b&gt;');
});

test('escapeHtml no altera el texto normal', () => {
    assert.equal(escapeHtml('Firma Electrónica 1 AÑO'), 'Firma Electrónica 1 AÑO');
});

test('escapeHtml convierte valores no texto en texto', () => {
    assert.equal(escapeHtml(15), '15');
});

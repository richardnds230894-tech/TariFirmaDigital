/**
 * Pruebas de formato: precios y escape de texto (research.md R3 y R6).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { formatPrice, escapeHtml, formatSchedule, formatDeliveryCondition, getEcuadorYear } = require('../script.js');

test('getEcuadorYear usa el año en hora de Ecuador (FR-036)', () => {
    assert.equal(getEcuadorYear(new Date('2027-01-01T04:00:00Z')), '2026', '31 dic. 23:00 en Ecuador');
    assert.equal(getEcuadorYear(new Date('2027-01-01T05:00:00Z')), '2027');
});

test('formatDeliveryCondition indica la condición de la entrega el mismo día (FR-003)', () => {
    assert.equal(formatDeliveryCondition({ horaLimiteSemana: '16:00', horaLimiteSabado: '12:00' }),
        'Mismo día si envías requisitos y pago antes de las 16:00 (sábados, 12:00)');
    assert.equal(formatDeliveryCondition({ horaLimiteSemana: '16:00', horaLimiteSabado: null }),
        'Mismo día si envías requisitos y pago antes de las 16:00 (lunes a viernes)');
    assert.equal(formatDeliveryCondition({ horaLimiteSemana: null, horaLimiteSabado: '11:30' }),
        'Mismo día los sábados si envías requisitos y pago antes de las 11:30');
    assert.equal(formatDeliveryCondition({ horaLimiteSemana: null, horaLimiteSabado: null }), 'Entrega ágil');
});

test('formatSchedule muestra el tramo sin cero inicial en la hora', () => {
    assert.equal(formatSchedule({ inicio: '09:00', fin: '18:00' }), '9:00 a 18:00');
    assert.equal(formatSchedule({ inicio: '10:00', fin: '14:00' }), '10:00 a 14:00');
    assert.equal(formatSchedule({ inicio: '08:30', fin: '12:05' }), '8:30 a 12:05');
});

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

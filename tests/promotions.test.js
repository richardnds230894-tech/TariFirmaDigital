/**
 * Vigencia de promociones en hora de Ecuador continental (UTC−5, sin horario de verano).
 * Bordes tomados de data-model.md → Promoción (Estados).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { siteData, isPromotionActive, formatDateRange, getEcuadorDateString } = require('../script.js');

const promo = siteData.promociones[0]; // 2026-11-09 → 2026-11-30

test('getEcuadorDateString convierte a la fecha de Ecuador', () => {
    assert.equal(getEcuadorDateString(new Date('2026-12-01T03:00:00Z')), '2026-11-30');
    assert.equal(getEcuadorDateString(new Date('2026-12-01T05:00:00Z')), '2026-12-01');
});

const casos = [
    ['2026-11-08T23:59:59-05:00', false, 'el día antes del inicio'],
    ['2026-11-09T00:00:00-05:00', true, 'el primer minuto del inicio'],
    ['2026-11-25T12:00:00-05:00', true, 'a mitad de la vigencia'],
    ['2026-11-30T23:59:59-05:00', true, 'el último segundo del día de fin'],
    ['2026-12-01T00:00:00-05:00', false, 'el día siguiente al fin'],
    ['2026-12-01T03:00:00Z', true, 'visitante en UTC que ya es 1 de diciembre, pero en Ecuador sigue siendo 30']
];

for (const [instante, esperado, descripcion] of casos) {
    test(`isPromotionActive: ${descripcion} → ${esperado}`, () => {
        assert.equal(isPromotionActive(promo, new Date(instante)), esperado);
    });
}

test('formatDateRange en español', () => {
    assert.equal(formatDateRange('2026-11-09', '2026-11-30'), 'Del 9 de noviembre al 30 de noviembre');
    assert.equal(formatDateRange('2026-12-20', '2027-01-05'), 'Del 20 de diciembre al 5 de enero');
});

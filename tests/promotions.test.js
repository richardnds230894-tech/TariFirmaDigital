/**
 * Vigencia de promociones en hora de Ecuador continental (UTC−5, sin horario de verano).
 * Bordes tomados de data-model.md → Promoción (Estados).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { siteData, isPromotionActive, formatDateRange, getEcuadorDateString, getActivePromotions,
    getActiveVariants } = require('../script.js');

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

test('getActivePromotions devuelve solo las vigentes en hora de Ecuador', () => {
    const otra = { id: 'diciembre', inicio: '2026-12-01', fin: '2026-12-31', variantes: [] };
    const promos = [promo, otra];
    assert.deepEqual(getActivePromotions(promos, new Date('2026-11-20T12:00:00-05:00')).map(p => p.id),
        ['firma-2-anios-nov-2026']);
    assert.deepEqual(getActivePromotions(promos, new Date('2026-12-01T00:00:00-05:00')).map(p => p.id),
        ['diciembre']);
    assert.deepEqual(getActivePromotions(promos, new Date('2027-01-01T00:00:00-05:00')), []);
});

test('getActiveVariants: precio explícito o heredado del plan de firma de pagaAnios', () => {
    assert.deepEqual(getActiveVariants(promo, siteData.firmaPlans), [
        { pagaAnios: 1, recibeAnios: 2, precio: 14.99 },
        { pagaAnios: 2, recibeAnios: 3, precio: 21 },
        { pagaAnios: 3, recibeAnios: 4, precio: 30 }
    ]);
});

test('getActiveVariants omite una variante sin precio y sin plan del que heredarlo', () => {
    const rara = { variantes: [{ pagaAnios: 9, recibeAnios: 10 }, { pagaAnios: 1, recibeAnios: 2, precio: 12 }] };
    assert.deepEqual(getActiveVariants(rara, siteData.firmaPlans), [{ pagaAnios: 1, recibeAnios: 2, precio: 12 }]);
});

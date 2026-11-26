/**
 * Ayuda para elegir el plan (US6, research R7): costo por año, ahorro y comprobantes por mes.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
    siteData, calculateYearlyCost, calculateSavings, formatYearlyCostText,
    calculateMonthlyVouchers, formatVoucherLabel
} = require('../script.js');

const planAnual = siteData.firmaPlans.find(plan => plan.anios === 1);
const planDe = (anios) => siteData.firmaPlans.find(plan => plan.anios === anios);

test('costo por año y ahorro de los planes de 2 a 5 años (tabla de research R7)', () => {
    const esperado = [[2, 10.5, 9], [3, 10, 15], [4, 8.75, 25], [5, 9.2, 29]];
    for (const [anios, porAnio, ahorro] of esperado) {
        assert.equal(calculateYearlyCost(planDe(anios)), porAnio, `${anios} años por año`);
        assert.equal(calculateSavings(planDe(anios), planAnual), ahorro, `${anios} años ahorro`);
    }
});

test('sin costo por año ni ahorro en los planes por días o de 1 año', () => {
    for (const plan of siteData.firmaPlans.filter(p => p.anios === null || p.anios === 1)) {
        assert.equal(calculateYearlyCost(plan), null, plan.duracion);
        assert.equal(calculateSavings(plan, planAnual), null, plan.duracion);
        assert.equal(formatYearlyCostText(plan, planAnual), null, plan.duracion);
    }
});

test('formatYearlyCostText usa el formato del catálogo e indica el IVA (Principio V)', () => {
    assert.equal(formatYearlyCostText(planDe(5), planAnual), '$9,20 por año · Ahorras $29,00 (IVA incluido)');
    assert.equal(formatYearlyCostText(planDe(2), planAnual), '$10,50 por año · Ahorras $9,00 (IVA incluido)');
});

test('formatYearlyCostText devuelve null si no hay ahorro', () => {
    const caro = { duracion: '2 AÑOS', anios: 2, precio: 40 };
    assert.equal(formatYearlyCostText(caro, planAnual), null);
});

test('comprobantes por mes, redondeados (50 → 4 … 600 → 50)', () => {
    const esperado = { 50: 4, 70: 6, 100: 8, 200: 17, 400: 33, 600: 50 };
    for (const [total, porMes] of Object.entries(esperado)) {
        assert.equal(calculateMonthlyVouchers(Number(total)), porMes, total);
    }
});

test('formatVoucherLabel mantiene el texto actual de las tarjetas y del modal', () => {
    assert.equal(formatVoucherLabel(50), '50 COMPROBANTES');
    assert.equal(formatVoucherLabel(600), '600 COMPROBANTES');
});

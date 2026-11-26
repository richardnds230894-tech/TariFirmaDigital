/**
 * Asesor sugerido (US7, escenario 4; research R9): cada asesor con probabilidad 1/2.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { siteData, pickSuggestedAdvisor } = require('../script.js');

test('pickSuggestedAdvisor reparte el intervalo [0, 1) entre los asesores', () => {
    assert.equal(pickSuggestedAdvisor(siteData.asesores, () => 0), 'asesor1');
    assert.equal(pickSuggestedAdvisor(siteData.asesores, () => 0.49), 'asesor1');
    assert.equal(pickSuggestedAdvisor(siteData.asesores, () => 0.5), 'asesor2');
    assert.equal(pickSuggestedAdvisor(siteData.asesores, () => 0.99), 'asesor2');
});

test('con una muestra uniforme determinista, cada asesor se elige exactamente la mitad de las veces', () => {
    const muestra = Array.from({ length: 100 }, (_, i) => (i + 0.5) / 100);
    const conteo = { asesor1: 0, asesor2: 0 };
    for (const valor of muestra) {
        conteo[pickSuggestedAdvisor(siteData.asesores, () => valor)] += 1;
    }
    assert.deepEqual(conteo, { asesor1: 50, asesor2: 50 });
});

test('pickSuggestedAdvisor no depende de nada más que del valor aleatorio', () => {
    const primero = pickSuggestedAdvisor(siteData.asesores, () => 0.3);
    const segundo = pickSuggestedAdvisor(siteData.asesores, () => 0.3);
    assert.equal(primero, segundo);
});

/**
 * Valida siteData contra las reglas y valores de data-model.md.
 * Si un valor comercial cambia a propósito, actualizar también data-model.md.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { siteData } = require('../script.js');

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const tieneMaxDosDecimales = (n) => Math.round(n * 100) === n * 100;

test('Asesor: id único y whatsapp de 12 dígitos que empieza por 593', () => {
    const ids = siteData.asesores.map(a => a.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const asesor of siteData.asesores) {
        assert.match(asesor.whatsapp, /^593\d{9}$/);
        assert.ok(asesor.nombre.length > 0);
    }
});

test('Asesor: valores actuales', () => {
    assert.deepEqual(siteData.asesores, [
        { id: 'asesor1', nombre: 'Asesor 1', whatsapp: '593960178652' },
        { id: 'asesor2', nombre: 'Asesor 2', whatsapp: '593969790890' }
    ]);
});

test('Datos del negocio: valores actuales y URL segura', () => {
    const negocio = siteData.negocio;
    assert.equal(negocio.nombre, "Tari's Firma Digital");
    assert.match(negocio.facebookUrl, /^https:\/\//);
    assert.equal(negocio.facebookUrl, 'https://www.facebook.com/profile.php?id=61595452224986');
    assert.deepEqual(negocio.horario, { semana: '9:00 a 18:00', sabado: '10:00 a 14:00' });
    for (const clave of ['info', 'ayuda', 'producto']) {
        assert.equal(typeof negocio.mensajes[clave], 'string');
    }
});

test('Plan de Firma Electrónica: precios válidos y como máximo un popular', () => {
    for (const plan of siteData.firmaPlans) {
        assert.equal(typeof plan.precio, 'number');
        assert.ok(plan.precio > 0);
        assert.ok(tieneMaxDosDecimales(plan.precio));
    }
    assert.ok(siteData.firmaPlans.filter(p => p.popular).length <= 1);
});

test('Plan de Firma Electrónica: valores actuales', () => {
    assert.deepEqual(
        siteData.firmaPlans.map(p => [p.duracion, p.precio, p.popular]),
        [
            ['10 DÍAS', 8.5, false], ['30 DÍAS', 10.5, false], ['1 AÑO', 15, true],
            ['2 AÑOS', 21, false], ['3 AÑOS', 30, false], ['4 AÑOS', 35, false],
            ['5 AÑOS', 46, false]
        ]
    );
});

test('Plan de Comprobantes: precios válidos y valores actuales', () => {
    for (const plan of siteData.comprobantesPlans) {
        assert.ok(plan.precioNatural > 0 && tieneMaxDosDecimales(plan.precioNatural));
        assert.ok(plan.precioJuridica > 0 && tieneMaxDosDecimales(plan.precioJuridica));
    }
    assert.deepEqual(
        siteData.comprobantesPlans.map(p => [p.cantidad, p.precioNatural, p.precioJuridica]),
        [
            ['50 COMPROBANTES', 7, 7.5], ['70 COMPROBANTES', 8, 9.5],
            ['100 COMPROBANTES', 10, 13], ['200 COMPROBANTES', 12, 21],
            ['400 COMPROBANTES', 15.5, 25], ['600 COMPROBANTES', 17, 35]
        ]
    );
});

test('Promoción: fechas válidas, inicio ≤ fin y valores actuales', () => {
    const ids = siteData.promociones.map(p => p.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const promo of siteData.promociones) {
        assert.match(promo.inicio, FECHA);
        assert.match(promo.fin, FECHA);
        assert.ok(promo.inicio <= promo.fin);
        assert.ok(promo.precio > 0);
    }
    assert.deepEqual(siteData.promociones, [{
        id: 'firma-2-anios-nov-2026',
        titulo: 'Firma Electrónica por 2 años',
        precio: 14.99,
        inicio: '2026-11-09',
        fin: '2026-11-30'
    }]);
});

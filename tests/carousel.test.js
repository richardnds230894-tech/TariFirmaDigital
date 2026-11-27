/**
 * Carrusel de flyers (US1, research R3–R5 de 003, data-model.md → Flyer y Diapositiva).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
    siteData, buildCarouselSlides, getActiveFlyers, isValidFlyerPage, getNextIndex, formatSlideLabel
} = require('../script.js');

const promo = siteData.promociones[0]; // 2026-11-09 → 2026-11-30
const vigente = new Date('2026-11-20T12:00:00-05:00');
const vencida = new Date('2026-12-01T00:00:00-05:00');

const flyers = [
    { id: 'permanente', tipo: 'informativo', imagen: 'img/flyers/a.webp', alt: 'Flyer permanente de prueba' },
    { id: 'diciembre', tipo: 'promocion', imagen: 'img/flyers/b.webp', alt: 'Flyer de diciembre de prueba',
        inicio: '2026-12-01', fin: '2026-12-31' },
    { id: 'externo', tipo: 'informativo', imagen: 'img/flyers/c.webp', alt: 'Flyer con destino externo',
        destino: { tipo: 'pagina', pagina: 'https://otro.sitio' } }
];

test('buildCarouselSlides: primero la promoción vigente y después los flyers vigentes, en orden', () => {
    const diapositivas = buildCarouselSlides([promo], flyers, vigente);
    assert.deepEqual(diapositivas.map(d => d.tipo === 'promocion' ? `promo:${d.promo.id}` : d.flyer.id),
        ['promo:firma-2-anios-nov-2026', 'permanente', 'externo']);
    assert.equal(diapositivas[0].variantes.length, 3);
    assert.equal(diapositivas[0].variantes[0].precio, 14.99);
});

test('buildCarouselSlides: sin promoción vigente quedan solo los flyers vigentes', () => {
    const diapositivas = buildCarouselSlides([promo], flyers, vencida);
    assert.deepEqual(diapositivas.map(d => d.flyer.id), ['permanente', 'diciembre', 'externo']);
});

test('buildCarouselSlides: un destino fuera de la lista blanca se descarta y el flyer queda sin enlace', () => {
    const externo = buildCarouselSlides([], flyers, vigente).find(d => d.flyer.id === 'externo');
    assert.equal(externo.flyer.destino, undefined);
    assert.equal(flyers[2].destino.pagina, 'https://otro.sitio', 'no modifica los datos originales');
});

test('getActiveFlyers respeta inicio y fin en hora de Ecuador (data-model.md → Flyer.inicio, Flyer.fin)', () => {
    const conFechas = [{ id: 'x', inicio: '2026-12-01', fin: '2026-12-31' }];
    assert.equal(getActiveFlyers(conFechas, new Date('2026-11-30T23:59:59-05:00')).length, 0);
    assert.equal(getActiveFlyers(conFechas, new Date('2026-12-01T00:00:00-05:00')).length, 1);
    assert.equal(getActiveFlyers(conFechas, new Date('2026-12-31T23:59:59-05:00')).length, 1);
    assert.equal(getActiveFlyers(conFechas, new Date('2027-01-01T00:00:00-05:00')).length, 0);
    assert.equal(getActiveFlyers([{ id: 'sin-fechas' }], vencida).length, 1, 'sin fechas es permanente');
});

test('isValidFlyerPage acepta solo las páginas y anclas de la lista blanca (Destino de flyer.pagina)', () => {
    for (const valida of ['index.html', 'firma.html', 'facturacion.html', 'firma.html#requisitos',
        'index.html#preguntas', 'facturacion.html#facturacion', 'index.html#como-funciona']) {
        assert.equal(isValidFlyerPage(valida), true, valida);
    }
    for (const invalida of ['https://otro.sitio', 'javascript:alert(1)', 'firma.html#otra', '/firma.html',
        'privacidad.html', '', undefined]) {
        assert.equal(isValidFlyerPage(invalida), false, String(invalida));
    }
});

test('getNextIndex da la vuelta en ambos sentidos', () => {
    assert.equal(getNextIndex(0, 3, 1), 1);
    assert.equal(getNextIndex(2, 3, 1), 0);
    assert.equal(getNextIndex(0, 3, -1), 2);
    assert.equal(getNextIndex(0, 1, 1), 0);
});

test('formatSlideLabel anuncia la posición', () => {
    assert.equal(formatSlideLabel(1, 3), '2 de 3');
    assert.equal(formatSlideLabel(0, 1), '1 de 1');
});

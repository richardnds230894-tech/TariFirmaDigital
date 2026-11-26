/**
 * Medición sin cookies (contracts/analytics-events.md, FR-037, FR-037a).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { siteData, shouldTrack, buildAnalyticsPayload, buildEventOrigin } = require('../script.js');

const configurada = { websiteId: '0f5b5c1e-1111-4222-8333-944455556666', endpoint: 'https://gateway.umami.is/api/send', dominio: 'tarisfirma.ec' };
const entorno = {
    hostname: 'tarisfirma.ec',
    ruta: '/index.html?utm=x#preguntas',
    titulo: "Tari's Firma Digital",
    idioma: 'es-EC',
    ancho: 390,
    alto: 844,
    referente: 'https://www.facebook.com/',
    doNotTrack: null
};

test('shouldTrack: solo con websiteId, en el dominio público y sin "No rastrear"', () => {
    assert.equal(shouldTrack({ ...configurada, websiteId: null }, entorno), false, 'sin websiteId');
    assert.equal(shouldTrack(configurada, { ...entorno, hostname: 'localhost' }), false, 'otro host');
    assert.equal(shouldTrack(configurada, { ...entorno, hostname: '' }), false, 'file://');
    assert.equal(shouldTrack(configurada, { ...entorno, doNotTrack: '1' }), false, 'No rastrear');
    assert.equal(shouldTrack(configurada, entorno), true, 'todo correcto');
});

test('con los datos actuales (pendientes) no se mide nada', () => {
    assert.equal(shouldTrack(siteData.medicion, entorno), false);
});

test('pageview: tipo event, sin name ni data, y url solo con la ruta', () => {
    assert.deepEqual(buildAnalyticsPayload('pageview', null, null, { ...entorno, websiteId: configurada.websiteId }), {
        type: 'event',
        payload: {
            website: configurada.websiteId,
            hostname: 'tarisfirma.ec',
            url: '/index.html',
            title: "Tari's Firma Digital",
            language: 'es-EC',
            screen: '390x844',
            referrer: 'https://www.facebook.com/'
        }
    });
});

test('evento abrir-contacto con su origen', () => {
    const cuerpo = buildAnalyticsPayload('evento', 'abrir-contacto', { origen: 'firma:1 AÑO' },
        { ...entorno, websiteId: configurada.websiteId });
    assert.equal(cuerpo.type, 'event');
    assert.equal(cuerpo.payload.name, 'abrir-contacto');
    assert.deepEqual(cuerpo.payload.data, { origen: 'firma:1 AÑO' });
    assert.equal(cuerpo.payload.url, '/index.html', 'nunca la consulta ni el fragmento');
});

test('el cuerpo no contiene datos del visitante ni el mensaje de WhatsApp (Principio III)', () => {
    const texto = JSON.stringify(buildAnalyticsPayload('evento', 'elegir-asesor',
        { asesor: 'asesor1', sugerido: true, origen: 'general' }, { ...entorno, websiteId: configurada.websiteId }));
    assert.ok(!texto.includes('wa.me'));
    assert.ok(!texto.includes('593'));
    assert.ok(!texto.includes('utm='));
});

test('buildEventOrigin identifica los planes por su etiqueta, no por el índice', () => {
    assert.equal(buildEventOrigin('firma:2', 'natural'), 'firma:1 AÑO');
    assert.equal(buildEventOrigin('comprobantes:0', 'natural'), 'comprobantes:50:natural');
    assert.equal(buildEventOrigin('comprobantes:5', 'juridica'), 'comprobantes:600:juridica');
    assert.equal(buildEventOrigin('promo:firma-2-anios-nov-2026', 'natural'), 'promo:firma-2-anios-nov-2026:0');
    assert.equal(buildEventOrigin('promo:firma-2-anios-nov-2026:2', 'natural'), 'promo:firma-2-anios-nov-2026:2');
    for (const clave of ['general', 'flotante', 'banco', 'renovacion']) {
        assert.equal(buildEventOrigin(clave, 'natural'), clave);
    }
});

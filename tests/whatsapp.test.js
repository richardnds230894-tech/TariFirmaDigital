/**
 * Enlaces de WhatsApp y formato de teléfonos (contracts/whatsapp-links.md).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { siteData, formatPhone, buildWhatsAppUrl, fillTemplate, buildProductDescription } = require('../script.js');

test('formatPhone agrupa 3-2-3-4 con prefijo +', () => {
    assert.equal(formatPhone('593960178652'), '+593 96 017 8652');
    assert.equal(formatPhone('593969790890'), '+593 96 979 0890');
});

test('fillTemplate sustituye {negocio}, {asesor} y {producto}', () => {
    assert.equal(fillTemplate('Hola {asesor} de {negocio}: {producto}', {
        negocio: "Tari's", asesor: 'Asesor 1', producto: 'X'
    }), "Hola Asesor 1 de Tari's: X");
});

test('fillTemplate no interpreta patrones especiales del reemplazo ($&)', () => {
    assert.equal(fillTemplate('{producto}', { producto: 'a $& b $1' }), 'a $& b $1');
});

test('contrato: asesor1 con mensaje info', () => {
    const mensaje = fillTemplate(siteData.negocio.mensajes.info, { negocio: siteData.negocio.nombre });
    assert.equal(buildWhatsAppUrl('asesor1', mensaje),
        "https://wa.me/593960178652?text=Hola%20Tari's%20Firma%20Digital%2C%20deseo%20informaci%C3%B3n%20sobre%20Firma%20y%20Facturaci%C3%B3n%20Electr%C3%B3nica.");
});

test('contrato: asesor2 con mensaje ayuda, sin el rótulo del asesor (FR-026)', () => {
    const mensaje = fillTemplate(siteData.negocio.mensajes.ayuda, { negocio: siteData.negocio.nombre });
    assert.equal(buildWhatsAppUrl('asesor2', mensaje),
        "https://wa.me/593969790890?text=Hola%2C%20equipo%20de%20Tari's%20Firma%20Digital%2C%20necesito%20ayuda.");
});

test('contrato: asesor1 con producto firma:2', () => {
    const mensaje = fillTemplate(siteData.negocio.mensajes.producto, {
        negocio: siteData.negocio.nombre,
        producto: 'Firma Electrónica (1 AÑO) - Valor: $15,00 inc. IVA'
    });
    const url = new URL(buildWhatsAppUrl('asesor1', mensaje));
    assert.equal(url.searchParams.get('text'),
        "Hola, equipo de Tari's Firma Digital, estoy interesado en adquirir:\n*Firma Electrónica (1 AÑO) - Valor: $15,00 inc. IVA*\n\nPor favor ayúdeme con el proceso.");
});

test('contrato: asesor2 con la variante 1 de la promoción', () => {
    const mensaje = fillTemplate(siteData.negocio.mensajes.producto, {
        negocio: siteData.negocio.nombre,
        producto: buildProductDescription('promo:firma-2-anios-nov-2026:1', 'natural')
    });
    const url = new URL(buildWhatsAppUrl('asesor2', mensaje));
    assert.equal(url.searchParams.get('text'),
        "Hola, equipo de Tari's Firma Digital, estoy interesado en adquirir:\n*PROMOCIÓN VIGENTE (9 al 30 Nov): Firma Electrónica por 3 años (pagas 2) - Valor: $21,00 inc. IVA*\n\nPor favor ayúdeme con el proceso.");
});

test('ninguna plantilla de mensaje usa el rótulo interno del asesor (FR-026)', () => {
    for (const plantilla of Object.values(siteData.negocio.mensajes)) {
        assert.ok(!plantilla.includes('{asesor}'), plantilla);
    }
});

test('buildWhatsAppUrl devuelve null para un asesor inexistente', () => {
    assert.equal(buildWhatsAppUrl('asesor9', 'hola'), null);
});

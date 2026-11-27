/**
 * Descripción del producto: texto que ven el modal y el asesor por WhatsApp.
 * Ejemplos tomados de data-model.md → "Descripción del producto".
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { siteData, formatPrice, buildProductDescription, formatShortDateRange } = require('../script.js');

test('firma:2 → plan de 1 AÑO', () => {
    assert.equal(buildProductDescription('firma:2', 'natural'),
        'Firma Electrónica (1 AÑO) - Valor: $15,00 inc. IVA');
});

test('comprobantes:0 según el tipo de contribuyente', () => {
    assert.equal(buildProductDescription('comprobantes:0', 'natural'),
        'Plan de Facturación: 50 COMPROBANTES (Persona Natural) - Valor: $7,00 inc. IVA');
    assert.equal(buildProductDescription('comprobantes:0', 'juridica'),
        'Plan de Facturación: 50 COMPROBANTES (Persona Jurídica) - Valor: $7,50 inc. IVA');
});

test('promo:<id> equivale a la variante 0, con el sufijo de IVA del catálogo', () => {
    assert.equal(buildProductDescription('promo:firma-2-anios-nov-2026', 'natural'),
        'PROMOCIÓN VIGENTE (9 al 30 Nov): Firma Electrónica por 2 años (pagas 1) - Valor: $14,99 inc. IVA');
});

test('promo:<id>:<v> describe cada variante con su precio', () => {
    assert.equal(buildProductDescription('promo:firma-2-anios-nov-2026:1', 'natural'),
        'PROMOCIÓN VIGENTE (9 al 30 Nov): Firma Electrónica por 3 años (pagas 2) - Valor: $21,00 inc. IVA');
    assert.equal(buildProductDescription('promo:firma-2-anios-nov-2026:2', 'natural'),
        'PROMOCIÓN VIGENTE (9 al 30 Nov): Firma Electrónica por 4 años (pagas 3) - Valor: $30,00 inc. IVA');
});

test('promo con un índice de variante inexistente devuelve null', () => {
    assert.equal(buildProductDescription('promo:firma-2-anios-nov-2026:7', 'natural'), null);
    assert.equal(buildProductDescription('promo:firma-2-anios-nov-2026:x', 'natural'), null);
});

test('cada plan genera una descripción con su propio precio formateado', () => {
    siteData.firmaPlans.forEach((plan, i) => {
        const texto = buildProductDescription(`firma:${i}`, 'natural');
        assert.ok(texto.includes(plan.duracion));
        assert.ok(texto.includes(`$${formatPrice(plan.precio)}`));
    });
    siteData.comprobantesPlans.forEach((plan, i) => {
        assert.ok(buildProductDescription(`comprobantes:${i}`, 'natural')
            .includes(`$${formatPrice(plan.precioNatural)}`));
        assert.ok(buildProductDescription(`comprobantes:${i}`, 'juridica')
            .includes(`$${formatPrice(plan.precioJuridica)}`));
    });
});

test('una clave desconocida devuelve null', () => {
    assert.equal(buildProductDescription('firma:99', 'natural'), null);
    assert.equal(buildProductDescription('promo:no-existe', 'natural'), null);
    assert.equal(buildProductDescription('otra-cosa', 'natural'), null);
});

test('formatShortDateRange: mismo mes y meses distintos', () => {
    assert.equal(formatShortDateRange('2026-11-09', '2026-11-30'), '9 al 30 Nov');
    assert.equal(formatShortDateRange('2026-11-25', '2026-12-05'), '25 Nov al 5 Dic');
});

test('claves fijas: general, flotante y banco', () => {
    assert.equal(buildProductDescription('general', 'natural'), "Asesoría General - Tari's Firma Digital");
    assert.equal(buildProductDescription('flotante', 'natural'), "Consulta general desde la web de Tari's Firma Digital");
    assert.equal(buildProductDescription('banco', 'natural'), 'Solicito los datos bancarios para realizar el pago por transferencia');
});

test('un plan con apóstrofes y comillas conserva todos sus caracteres', () => {
    const planDePrueba = { duracion: `1 AÑO 'Tari's' "especial"`, precio: 15, etiqueta: 'Prueba', popular: false };
    siteData.firmaPlans.push(planDePrueba);
    try {
        const indice = siteData.firmaPlans.length - 1;
        assert.equal(buildProductDescription(`firma:${indice}`, 'natural'),
            `Firma Electrónica (1 AÑO 'Tari's' "especial") - Valor: $15,00 inc. IVA`);
    } finally {
        siteData.firmaPlans.pop();
    }
});

test('renovacion → Renovación de Firma Electrónica (FR-028)', () => {
    assert.equal(buildProductDescription('renovacion', 'natural'), 'Renovación de Firma Electrónica');
});

test('flyer:<id> devuelve el mensaje de un flyer de contacto vigente (contracts/whatsapp-links.md 003)', () => {
    const deContacto = { id: 'prueba-contacto', tipo: 'informativo', imagen: 'img/flyers/x.webp', alt: 'Flyer de prueba',
        destino: { tipo: 'contacto', mensaje: 'Consulta por el flyer de feriados de diciembre' } };
    const vencido = { ...deContacto, id: 'prueba-vencido', tipo: 'promocion', inicio: '2020-01-01', fin: '2020-01-31' };
    const dePagina = { ...deContacto, id: 'prueba-pagina', destino: { tipo: 'pagina', pagina: 'firma.html' } };
    siteData.flyers.push(deContacto, vencido, dePagina);
    try {
        assert.equal(buildProductDescription('flyer:prueba-contacto', 'natural'), 'Consulta por el flyer de feriados de diciembre');
        assert.equal(buildProductDescription('flyer:prueba-vencido', 'natural'), null, 'no vigente');
        assert.equal(buildProductDescription('flyer:prueba-pagina', 'natural'), null, 'destino de página');
        assert.equal(buildProductDescription('flyer:no-existe', 'natural'), null, 'no existe');
    } finally {
        siteData.flyers.splice(-3, 3);
    }
});

test('facturacion:natural y facturacion:juridica (contracts/whatsapp-links.md 003)', () => {
    assert.equal(buildProductDescription('facturacion:natural', 'natural'),
        'Sistema de Facturación Electrónica (Persona Natural) - Consulta de requisitos');
    assert.equal(buildProductDescription('facturacion:juridica', 'natural'),
        'Sistema de Facturación Electrónica (Persona Jurídica) - Consulta de requisitos');
});

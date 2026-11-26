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
    for (const clave of ['info', 'ayuda', 'producto']) {
        assert.equal(typeof negocio.mensajes[clave], 'string');
    }
});

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

test('Horario: tramos HH:MM con inicio < fin y valores actuales (data-model.md → Datos del negocio.horario)', () => {
    const horario = siteData.negocio.horario;
    for (const tramo of Object.values(horario)) {
        assert.match(tramo.inicio, HORA);
        assert.match(tramo.fin, HORA);
        assert.ok(tramo.inicio < tramo.fin, `${tramo.inicio} no es anterior a ${tramo.fin}`);
    }
    assert.deepEqual(horario, {
        semana: { inicio: '09:00', fin: '18:00' },
        sabado: { inicio: '10:00', fin: '14:00' }
    });
});

test('Entrega: hora límite HH:MM anterior al cierre de su tramo (data-model.md → Datos del negocio.entrega)', () => {
    const { entrega, horario } = siteData.negocio;
    const pares = [['horaLimiteSemana', 'semana'], ['horaLimiteSabado', 'sabado']];
    for (const [campo, tramo] of pares) {
        assert.ok(campo in entrega, `falta el campo ${campo}`);
        if (entrega[campo] !== null) {
            assert.match(entrega[campo], HORA, campo);
            assert.ok(entrega[campo] < horario[tramo].fin, `${campo} debe ser anterior a ${horario[tramo].fin}`);
        }
    }
});

test('Plan de Firma Electrónica: anios coincide con duracion (data-model.md → Plan de Firma Electrónica.anios)', () => {
    for (const plan of siteData.firmaPlans) {
        const enAnios = plan.duracion.match(/^(\d+) AÑOS?$/);
        if (enAnios) {
            assert.equal(plan.anios, Number(enAnios[1]), plan.duracion);
        } else {
            assert.match(plan.duracion, /^\d+ DÍAS$/);
            assert.equal(plan.anios, null, plan.duracion);
        }
    }
});

test('Medición: endpoint HTTPS y websiteId/dominio como cadena o null (data-model.md → Medición)', () => {
    const medicion = siteData.medicion;
    assert.match(medicion.endpoint, /^https:\/\//);
    for (const campo of ['websiteId', 'dominio']) {
        assert.ok(medicion[campo] === null || typeof medicion[campo] === 'string', campo);
    }
    if (typeof medicion.dominio === 'string') {
        assert.match(medicion.dominio, /^[a-z0-9.-]+\.[a-z]{2,}$/, 'dominio sin protocolo ni barra');
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
        siteData.comprobantesPlans.map(p => [p.total, p.precioNatural, p.precioJuridica]),
        [
            [50, 7, 7.5], [70, 8, 9.5],
            [100, 10, 13], [200, 12, 21],
            [400, 15.5, 25], [600, 17, 35]
        ]
    );
});

test('Plan de Comprobantes: total entero positivo y único (data-model.md → Plan de Comprobantes.total)', () => {
    const totales = siteData.comprobantesPlans.map(p => p.total);
    for (const total of totales) {
        assert.ok(Number.isInteger(total) && total > 0, `total inválido: ${total}`);
    }
    assert.equal(new Set(totales).size, totales.length, 'hay totales repetidos');
    assert.ok(siteData.comprobantesPlans.every(p => !('cantidad' in p)), 'queda el campo antiguo cantidad');
});

test('Promoción: fechas válidas, inicio ≤ fin y valores actuales', () => {
    const ids = siteData.promociones.map(p => p.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const promo of siteData.promociones) {
        assert.match(promo.inicio, FECHA);
        assert.match(promo.fin, FECHA);
        assert.ok(promo.inicio <= promo.fin);
        assert.ok(promo.variantes.length >= 1, 'cada promoción necesita al menos una variante');
        for (const variante of promo.variantes) {
            // Edge case de la spec: una variante cuyo plan de firma no existe es un dato inválido
            assert.ok(siteData.firmaPlans.some(plan => plan.anios === variante.pagaAnios),
                `no existe un plan de firma de ${variante.pagaAnios} años`);
            assert.ok(variante.recibeAnios > variante.pagaAnios, 'recibeAnios debe ser mayor que pagaAnios');
            if ('precio' in variante) {
                assert.ok(variante.precio > 0 && tieneMaxDosDecimales(variante.precio));
            }
        }
    }
    assert.deepEqual(siteData.promociones, [{
        id: 'firma-2-anios-nov-2026',
        titulo: 'Firma Electrónica por 2 años',
        producto: 'Firma Electrónica',
        inicio: '2026-11-09',
        fin: '2026-11-30',
        variantes: [
            { pagaAnios: 1, recibeAnios: 2, precio: 14.99 },
            { pagaAnios: 2, recibeAnios: 3 },
            { pagaAnios: 3, recibeAnios: 4 }
        ]
    }]);
});

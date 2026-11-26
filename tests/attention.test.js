/**
 * Estado de atención en hora de Ecuador continental (US7, research R8, quickstart.md §9).
 * Regla: el mismo día → "hoy", el día siguiente → "mañana", más adelante → "el <día>".
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { siteData, getAttentionStatus, formatAttentionStatus } = require('../script.js');

const horario = siteData.negocio.horario;

/** Texto del estado para un instante dado en hora de Ecuador (UTC−5). */
function textoEn(instante) {
    return formatAttentionStatus(getAttentionStatus(horario, new Date(instante)));
}

// 2026-11-25 es miércoles; 27 viernes; 28 sábado; 29 domingo; 30 lunes.
const casos = [
    ['2026-11-25T10:00:00-05:00', 'Atendiendo ahora', 'miércoles 10:00'],
    ['2026-11-25T08:59:00-05:00', 'Fuera de horario · Te respondemos hoy desde las 9:00', 'miércoles antes de abrir'],
    ['2026-11-25T09:00:00-05:00', 'Atendiendo ahora', 'miércoles 9:00 en punto'],
    ['2026-11-25T17:59:00-05:00', 'Atendiendo ahora', 'miércoles 17:59'],
    ['2026-11-25T18:00:00-05:00', 'Fuera de horario · Te respondemos mañana desde las 9:00', 'miércoles 18:00 (fin exclusivo)'],
    ['2026-11-27T20:00:00-05:00', 'Fuera de horario · Te respondemos mañana desde las 10:00', 'viernes 20:00'],
    ['2026-11-27T23:59:00-05:00', 'Fuera de horario · Te respondemos mañana desde las 10:00', 'viernes 23:59'],
    ['2026-11-28T13:59:00-05:00', 'Atendiendo ahora', 'sábado 13:59'],
    ['2026-11-28T14:00:00-05:00', 'Fuera de horario · Te respondemos el lunes desde las 9:00', 'sábado 14:00'],
    ['2026-11-28T14:30:00-05:00', 'Fuera de horario · Te respondemos el lunes desde las 9:00', 'sábado 14:30'],
    ['2026-11-29T00:00:00-05:00', 'Fuera de horario · Te respondemos mañana desde las 9:00', 'domingo 00:00'],
    ['2026-11-29T12:00:00-05:00', 'Fuera de horario · Te respondemos mañana desde las 9:00', 'domingo 12:00'],
    ['2026-11-26T13:00:00Z', 'Fuera de horario · Te respondemos hoy desde las 9:00', 'jueves 13:00 UTC = 8:00 en Ecuador'],
    ['2026-11-26T02:00:00Z', 'Fuera de horario · Te respondemos mañana desde las 9:00', 'jueves 02:00 UTC = miércoles 21:00 en Ecuador']
];

for (const [instante, esperado, descripcion] of casos) {
    test(`estado de atención: ${descripcion}`, () => {
        assert.equal(textoEn(instante), esperado);
    });
}

test('getAttentionStatus devuelve la estructura del research R8', () => {
    assert.deepEqual(getAttentionStatus(horario, new Date('2026-11-25T10:00:00-05:00')), { abierto: true, proxima: null });
    assert.deepEqual(getAttentionStatus(horario, new Date('2026-11-28T15:00:00-05:00')),
        { abierto: false, proxima: { cuando: 'el lunes', hora: '9:00' } });
});

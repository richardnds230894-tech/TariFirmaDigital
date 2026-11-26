/**
 * Invariantes de index.html (contracts/dom-hooks.md → "Invariantes verificables").
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { siteData } = require('../script.js');

const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
const sinEspacios = html.replace(/\s+/g, '');
const asesorIds = siteData.asesores.map(a => a.id);

/** Devuelve los valores de un atributo data-* en todo el HTML. */
function valoresDe(atributo) {
    return [...html.matchAll(new RegExp(`${atributo}="([^"]*)"`, 'g'))].map(m => m[1]);
}

test('invariante 2: sin enlaces wa.me, números de asesor ni URL de Facebook en el HTML', () => {
    assert.ok(!html.includes('wa.me/'), 'contiene wa.me/');
    for (const asesor of siteData.asesores) {
        const local = asesor.whatsapp.slice(3); // sin el 593
        assert.ok(!sinEspacios.includes(local), `contiene el número ${local}`);
    }
    assert.ok(!html.includes('facebook.com'), 'contiene la URL de Facebook');
});

test('invariante 3: data-whatsapp y data-phone apuntan a asesores existentes', () => {
    const usados = [...valoresDe('data-whatsapp'), ...valoresDe('data-phone')];
    assert.ok(usados.length > 0, 'no hay ganchos de contacto');
    for (const id of usados) {
        assert.ok(asesorIds.includes(id), `asesor desconocido: ${id}`);
    }
    for (const mensaje of valoresDe('data-mensaje')) {
        assert.ok(['info', 'ayuda'].includes(mensaje), `mensaje desconocido: ${mensaje}`);
    }
});

test('invariante 5: existe un aviso <noscript>', () => {
    assert.match(html, /<noscript>[\s\S]*JavaScript[\s\S]*<\/noscript>/);
});

test('todo enlace target="_blank" lleva rel="noopener noreferrer"', () => {
    const enlaces = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map(m => m[0]);
    assert.ok(enlaces.length > 0);
    for (const enlace of enlaces) {
        assert.ok(enlace.includes('rel="noopener noreferrer"'), enlace);
    }
});

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

test('invariante 1: index.html no contiene onclick', () => {
    assert.ok(!/onclick\s*=/i.test(html), 'contiene onclick');
});

test('todo data-open-advisor es una clave válida', () => {
    const validas = ['general', 'flotante', 'banco', ...siteData.promociones.map(p => `promo:${p.id}`)];
    const usadas = valoresDe('data-open-advisor');
    assert.ok(usadas.length > 0);
    for (const clave of usadas) {
        assert.ok(validas.includes(clave), `clave desconocida: ${clave}`);
    }
});

test('el modal es un diálogo accesible con su título', () => {
    const modal = html.match(/<div\b[^>]*id="advisor-modal"[^>]*>/);
    assert.ok(modal, 'no existe #advisor-modal');
    assert.ok(modal[0].includes('role="dialog"'), 'falta role="dialog"');
    assert.ok(modal[0].includes('aria-modal="true"'), 'falta aria-modal="true"');
    assert.ok(modal[0].includes('aria-labelledby="advisor-modal-title"'), 'falta aria-labelledby');
    assert.match(html, /id="advisor-modal-title"/);
});

test('invariante 4: la promoción y sus enlaces de menú están ocultos por defecto', () => {
    const seccion = html.match(/<section\b[^>]*id="promociones"[^>]*>/);
    assert.ok(seccion, 'no existe section#promociones');
    assert.match(seccion[0], /data-promo="[^"]+"/);
    assert.match(seccion[0], /class="[^"]*\bhidden\b/);

    const enlaces = [...html.matchAll(/<a\b[^>]*data-promo-link="[^"]+"[^>]*>/g)].map(m => m[0]);
    assert.equal(enlaces.length, 2, 'se esperaban 2 enlaces de menú (escritorio y móvil)');
    for (const enlace of enlaces) {
        assert.match(enlace, /class="[^"]*\bhidden\b/, enlace);
    }
    assert.match(html, /data-promo-vigencia="[^"]+"/);
    assert.ok(!html.includes('Del 9 de noviembre al 30 de noviembre'), 'la vigencia sigue escrita a mano');
});

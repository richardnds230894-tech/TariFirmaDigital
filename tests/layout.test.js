/**
 * Invariante 13 (contracts/dom-hooks.md de 003): la cabecera, el footer, los botones flotantes y
 * el modal son idénticos en todas las páginas. Se comparan los bloques marcados con
 * <!-- COMPARTIDO: INICIO … --> y <!-- COMPARTIDO: FIN … --> (research R1).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

const raiz = join(__dirname, '..');
const paginas = readdirSync(raiz).filter(nombre => nombre.endsWith('.html'));

/** Devuelve el bloque compartido indicado, con los espacios normalizados, o null si falta. */
function bloque(html, nombre) {
    const encontrado = html.match(new RegExp(
        `<!-- COMPARTIDO: INICIO ${nombre}[^>]*-->([\\s\\S]*?)<!-- COMPARTIDO: FIN ${nombre} -->`));
    return encontrado ? encontrado[1].replace(/\s+/g, ' ').trim() : null;
}

const referencia = readFileSync(join(raiz, 'index.html'), 'utf8');

for (const nombre of ['CABECERA', 'PIE']) {
    const esperado = bloque(referencia, nombre);

    test(`index.html tiene el bloque compartido ${nombre}`, () => {
        assert.ok(esperado, `falta el bloque ${nombre} en index.html`);
    });

    for (const pagina of paginas.filter(p => p !== 'index.html')) {
        test(`${pagina} · el bloque ${nombre} es idéntico al de index.html`, () => {
            const html = readFileSync(join(raiz, pagina), 'utf8');
            const actual = bloque(html, nombre);
            assert.ok(actual, `falta el bloque ${nombre}`);
            assert.equal(actual, esperado, `el bloque ${nombre} de ${pagina} no coincide con index.html`);
        });
    }
}

test('el bloque PIE contiene el footer, los botones flotantes y el modal', () => {
    const pie = bloque(referencia, 'PIE');
    assert.match(pie, /<footer\b/);
    assert.match(pie, /data-open-advisor="flotante"/);
    assert.match(pie, /id="advisor-modal"/);
});

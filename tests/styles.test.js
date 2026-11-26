/**
 * Invariante 8 de contracts/dom-hooks.md (002): cada clase usada en las páginas y en
 * script.js tiene su selector en tailwind.css. Falla si se agregó una clase sin regenerar
 * la hoja (ver README → "Regenerar estilos").
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

const raiz = join(__dirname, '..');
const css = readFileSync(join(raiz, 'tailwind.css'), 'utf8');
const paginas = readdirSync(raiz).filter(nombre => nombre.endsWith('.html'));
const codigo = readFileSync(join(raiz, 'script.js'), 'utf8');

// Clases que no genera Tailwind: las de styles.css, Font Awesome y los marcadores de grupo
const PROPIAS = new Set(['bg-taris-hero', 'gold-gradient', 'gold-text-gradient', 'promo-banner-bg',
    'animate-pulse-gold', 'aviso-sin-js', 'group', 'peer']);
const FORMA_DE_CLASE = /^-?[a-z!][\w:\-[\]#/.%]*$/i;

/** Devuelve el contenido de las cadenas entre comillas simples o dobles de un fragmento. */
function cadenasDe(fragmento) {
    return [...fragmento.matchAll(/'([^']*)'|"([^"]*)"/g)].map(m => m[1] ?? m[2]);
}

/** Separa en clases el valor de un atributo class, incluidas las ramas de sus ${…}. */
function clasesDeAtributo(valor) {
    const plano = valor.replace(/\$\{[^}]*\}/g, interpolacion => ` ${cadenasDe(interpolacion).join(' ')} `);
    return plano.split(/\s+/);
}

/** Reúne las clases usadas en un texto HTML o JS según la regla de la tarea T008. */
function clasesUsadas(texto, esScript) {
    const tokens = [];
    for (const m of texto.matchAll(/class="([^"]*)"/g)) {
        tokens.push(...clasesDeAtributo(m[1]));
    }
    if (esScript) {
        for (const m of texto.matchAll(/\.className\s*=\s*([^;]+);/g)) {
            cadenasDe(m[1]).forEach(c => tokens.push(...c.split(/\s+/)));
        }
        for (const m of texto.matchAll(/(?:const|let)\s+\w*(?:Style|Color|Class)\s*=\s*([^;]+);/g)) {
            cadenasDe(m[1]).forEach(c => tokens.push(...c.split(/\s+/)));
        }
        for (const m of texto.matchAll(/classList\.(?:add|remove|toggle)\(([^)]*)\)/g)) {
            cadenasDe(m[1]).forEach(c => tokens.push(...c.split(/\s+/)));
        }
    }
    return tokens.filter(t => t && FORMA_DE_CLASE.test(t) && !t.includes('${')
        && !t.startsWith('fa-') && !PROPIAS.has(t));
}

/** Escapa un nombre de clase como lo escribe Tailwind en el selector. */
function escaparSelector(clase) {
    return '.' + clase.replace(/[:/.[\]#%!,()']/g, c => `\\${c}`);
}

test('cada clase usada en las páginas y en script.js existe en tailwind.css', () => {
    const usadas = new Set();
    for (const pagina of paginas) {
        clasesUsadas(readFileSync(join(raiz, pagina), 'utf8'), false).forEach(c => usadas.add(c));
    }
    clasesUsadas(codigo, true).forEach(c => usadas.add(c));
    assert.ok(usadas.size > 50, `se esperaban muchas clases y se encontraron ${usadas.size}`);

    const faltan = [...usadas].filter(clase => !css.includes(escaparSelector(clase)));
    assert.deepEqual(faltan, [], `Clases sin estilo; regenera tailwind.css: ${faltan.join(', ')}`);
});

test('tailwind.css incluye la fuente Inter local', () => {
    assert.match(css, /@font-face\{[^}]*font-family:Inter[^}]*fonts\/inter-latin-var\.woff2/);
});

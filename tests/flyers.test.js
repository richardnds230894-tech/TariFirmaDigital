/**
 * Archivos de los flyers (FR-005, FR-030; data-model.md → Flyer.imagen, Flyer.imagenMovil, Flyer.alt).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, statSync } = require('node:fs');
const { join } = require('node:path');
const { siteData } = require('../script.js');

const raiz = join(__dirname, '..');
const LIMITE = 250 * 1024;

test('hay al menos un flyer informativo permanente (respaldo del carrusel sin JavaScript)', () => {
    assert.ok(siteData.flyers.some(f => f.tipo === 'informativo' && !f.inicio && !f.fin));
});

for (const flyer of siteData.flyers) {
    test(`flyer ${flyer.id}: imágenes WebP/AVIF/SVG existentes de ≤ 250 KB`, () => {
        for (const campo of ['imagen', 'imagenTablet', 'imagenMovil']) {
            if (campo !== 'imagen' && flyer[campo] === undefined) continue;
            const ruta = flyer[campo];
            assert.match(ruta, /^img\/flyers\/[a-z0-9-]+\.(webp|avif|svg)$/, `${campo}: ${ruta}`);
            const archivo = join(raiz, ruta);
            assert.ok(existsSync(archivo), `${campo}: no existe ${ruta}`);
            assert.ok(statSync(archivo).size <= LIMITE, `${campo}: ${ruta} pesa más de 250 KB`);
        }
    });

    test(`flyer ${flyer.id}: texto alternativo de 10 a 200 caracteres`, () => {
        assert.equal(typeof flyer.alt, 'string');
        assert.ok(flyer.alt.length >= 10 && flyer.alt.length <= 200, `mide ${flyer.alt.length}`);
    });
}

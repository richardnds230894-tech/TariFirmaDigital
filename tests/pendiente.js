/**
 * Ayudante compartido para datos que debe entregar el responsable del negocio (research R14).
 * No es un archivo de prueba: su nombre no coincide con los patrones de `node --test`.
 *
 * - Normal: un dato pendiente (null) se reporta como `todo` y no rompe la suite.
 * - Con la variable de entorno PUBLICAR=1: cada pendiente es un fallo (quickstart.md §1).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');

const modoPublicacion = process.env.PUBLICAR === '1';

/**
 * Registra una prueba que exige que un dato del negocio esté completo.
 * @param {string} nombre - Descripción del dato pendiente.
 * @param {*} valor - Valor actual; null significa pendiente.
 * @param {function(*): void} [validar] - Comprobación adicional cuando el valor existe.
 */
function pendiente(nombre, valor, validar) {
    const falta = valor === null || valor === undefined;
    test(`pendiente del responsable: ${nombre}`, { todo: falta && !modoPublicacion }, () => {
        assert.ok(!falta, `falta el dato: ${nombre}`);
        if (validar) {
            validar(valor);
        }
    });
}

module.exports = { pendiente, modoPublicacion };

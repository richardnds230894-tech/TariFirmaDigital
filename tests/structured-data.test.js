/**
 * Datos estructurados para buscadores (contracts/page-metadata.md → "Datos estructurados", FR-011).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { siteData, buildStructuredData, formatPhone } = require('../script.js');

/** Copia profunda de siteData para variar datos sin afectar a otras pruebas. */
function copiaDatos(cambios) {
    const copia = JSON.parse(JSON.stringify(siteData));
    cambios(copia);
    return copia;
}

test('ProfessionalService con nombre, área de servicio y Facebook', () => {
    const datos = buildStructuredData(siteData);
    assert.equal(datos['@context'], 'https://schema.org');
    assert.equal(datos['@type'], 'ProfessionalService');
    assert.equal(datos.name, "Tari's Firma Digital");
    assert.deepEqual(datos.areaServed, { '@type': 'Country', name: 'Ecuador' });
    assert.deepEqual(datos.sameAs, [siteData.negocio.facebookUrl]);
});

test('un contactPoint por asesor, con el teléfono en el formato del sitio', () => {
    const datos = buildStructuredData(siteData);
    assert.equal(datos.telephone, formatPhone(siteData.asesores[0].whatsapp));
    assert.deepEqual(datos.contactPoint, siteData.asesores.map(asesor => ({
        '@type': 'ContactPoint',
        telephone: formatPhone(asesor.whatsapp),
        contactType: 'sales',
        availableLanguage: 'es'
    })));
});

test('el horario sale de siteData.negocio.horario', () => {
    const datos = buildStructuredData(siteData);
    assert.deepEqual(datos.openingHoursSpecification, [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '14:00' }
    ]);
});

test('url e image se omiten sin dominio y aparecen con dominio', () => {
    const sinDominio = buildStructuredData(copiaDatos(d => { d.medicion.dominio = null; }));
    assert.ok(!('url' in sinDominio));
    assert.ok(!('image' in sinDominio));

    const conDominio = buildStructuredData(copiaDatos(d => { d.medicion.dominio = 'tarisfirma.ec'; }));
    assert.equal(conDominio.url, 'https://tarisfirma.ec/');
    assert.equal(conDominio.image, 'https://tarisfirma.ec/img/og-tari.jpg');
});

test('legalName y taxID solo si existen los datos legales', () => {
    const sinLegal = buildStructuredData(copiaDatos(d => { delete d.negocio.legal; }));
    assert.ok(!('legalName' in sinLegal));
    assert.ok(!('taxID' in sinLegal));

    const conLegal = buildStructuredData(copiaDatos(d => {
        d.negocio.legal = { razonSocial: 'Ejemplo S.A.', ruc: '1790000000001', ciudad: 'Quito', entidadCertificadora: 'X' };
    }));
    assert.equal(conLegal.legalName, 'Ejemplo S.A.');
    assert.equal(conLegal.taxID, '1790000000001');
});

test('el resultado se puede serializar como JSON', () => {
    assert.doesNotThrow(() => JSON.stringify(buildStructuredData(siteData)));
});

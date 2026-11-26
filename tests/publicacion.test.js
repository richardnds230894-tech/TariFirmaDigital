/**
 * Datos que debe entregar el responsable antes de publicar (research R14, FR-038).
 * Mientras falten aparecen como `todo`; con PUBLICAR=1 node --test, son fallos.
 */
const { siteData } = require('../script.js');
const { pendiente } = require('./pendiente.js');

pendiente('dominio público (medicion.dominio)', siteData.medicion.dominio);
pendiente('identificador del sitio en Umami (medicion.websiteId)', siteData.medicion.websiteId);
pendiente('hora límite de entrega el mismo día, lunes a viernes (entrega.horaLimiteSemana)',
    siteData.negocio.entrega.horaLimiteSemana);
pendiente('hora límite de entrega el mismo día, sábados (entrega.horaLimiteSabado)',
    siteData.negocio.entrega.horaLimiteSabado);

const assert = require('node:assert/strict');
const legal = siteData.negocio.legal || {};
pendiente('razón social del negocio (legal.razonSocial)', legal.razonSocial ?? null);
pendiente('RUC del negocio, 13 dígitos (legal.ruc)', legal.ruc ?? null,
    (ruc) => assert.match(ruc, /^\d{13}$/, 'el RUC debe tener 13 dígitos'));
pendiente('ciudad del negocio (legal.ciudad)', legal.ciudad ?? null);
pendiente('entidad certificadora acreditada (legal.entidadCertificadora)', legal.entidadCertificadora ?? null);

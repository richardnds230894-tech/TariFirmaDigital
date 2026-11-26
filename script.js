/**
 * Lógica del catálogo individual, selector de contribuyente
 * y conexión directa con Asesor 1 y Asesor 2 vía WhatsApp.
 *
 * Organización del archivo:
 *   1. DATOS DEL NEGOCIO   - única fuente de precios, asesores, horarios y promociones
 *   2. FUNCIONES PURAS     - formato y armado de textos, sin acceso al DOM (se prueban con node --test)
 *   3. RENDERIZADO Y DOM   - tarjetas, modal y eventos
 *   4. ARRANQUE            - solo se ejecuta en el navegador
 *   5. EXPORTACIÓN         - solo para las pruebas en Node
 */

/* ==========================================================================
   1. DATOS DEL NEGOCIO
   Para cambiar un precio, un número de asesor, un horario o una promoción,
   edita únicamente este objeto. Los precios son números y ya incluyen IVA.
   ========================================================================== */

const siteData = {
    asesores: [
        { id: 'asesor1', nombre: 'Asesor 1', whatsapp: '593960178652' },
        { id: 'asesor2', nombre: 'Asesor 2', whatsapp: '593969790890' }
    ],

    negocio: {
        nombre: "Tari's Firma Digital",
        facebookUrl: 'https://www.facebook.com/profile.php?id=61595452224986',
        // Tramos en hora de Ecuador (HH:MM); "fin" es exclusivo. El domingo no se atiende.
        horario: {
            semana: { inicio: '09:00', fin: '18:00' },
            sabado: { inicio: '10:00', fin: '14:00' }
        },
        // Hora límite (HH:MM) para entregar el mismo día; null = pendiente del responsable.
        // Mientras falten ambas, la página muestra "Entrega ágil" sin prometer tiempo (FR-003).
        entrega: {
            horaLimiteSemana: null,
            horaLimiteSabado: null
        },
        // Identidad legal (FR-012, FR-013). null = pendiente del responsable: el dato no se
        // muestra hasta tenerlo y `PUBLICAR=1 node --test` impide publicar sin él.
        legal: {
            razonSocial: null,
            ruc: null,
            ciudad: null,
            entidadCertificadora: null
        },
        mensajes: {
            info: 'Hola {negocio}, deseo información sobre Firma y Facturación Electrónica.',
            // El saludo no usa el rótulo interno del asesor (FR-026): el número ya lo identifica
            ayuda: 'Hola, equipo de {negocio}, necesito ayuda.',
            producto: 'Hola, equipo de {negocio}, estoy interesado en adquirir:\n*{producto}*\n\nPor favor ayúdeme con el proceso.'
        }
    },

    // Planes individuales de Firma Electrónica (Archivo P12).
    // "anios" es null en los planes por días; si es número, coincide con "duracion".
    firmaPlans: [
        { duracion: '10 DÍAS', anios: null, precio: 8.50, etiqueta: 'Trámite puntual', popular: false },
        { duracion: '30 DÍAS', anios: null, precio: 10.50, etiqueta: 'Corto plazo', popular: false },
        { duracion: '1 AÑO', anios: 1, precio: 15.00, etiqueta: 'Más solicitado', popular: true },
        { duracion: '2 AÑOS', anios: 2, precio: 21.00, etiqueta: 'Ahorro recomendado', popular: false },
        { duracion: '3 AÑOS', anios: 3, precio: 30.00, etiqueta: 'Larga duración', popular: false },
        { duracion: '4 AÑOS', anios: 4, precio: 35.00, etiqueta: 'Empresarial', popular: false },
        { duracion: '5 AÑOS', anios: 5, precio: 46.00, etiqueta: 'Máxima vigencia', popular: false }
    ],

    // Planes individuales de Comprobantes (Facturación Electrónica - 1 Año)
    comprobantesPlans: [
        // "total" es la cantidad de comprobantes del año; la etiqueta visible sale de formatVoucherLabel
        { total: 50, precioNatural: 7.00, precioJuridica: 7.50, descripcion: 'Ideal para emprendedores iniciales' },
        { total: 70, precioNatural: 8.00, precioJuridica: 9.50, descripcion: 'Para facturación mensual moderada' },
        { total: 100, precioNatural: 10.00, precioJuridica: 13.00, descripcion: 'Plan equilibrado para profesionales' },
        { total: 200, precioNatural: 12.00, precioJuridica: 21.00, descripcion: 'Para negocios en crecimiento' },
        { total: 400, precioNatural: 15.50, precioJuridica: 25.00, descripcion: 'Alto volumen de emisión anual' },
        { total: 600, precioNatural: 17.00, precioJuridica: 35.00, descripcion: 'Máxima capacidad comercial' }
    ],

    // Promociones con vigencia (fechas AAAA-MM-DD, hora de Ecuador, día de fin incluido)
    // Cada variante indica los años que se pagan y los que se reciben. Si no lleva "precio",
    // se usa el del plan de firma de "pagaAnios" años (que debe existir en firmaPlans).
    // Para publicar otra promoción basta con agregarla aquí: el HTML no se toca.
    promociones: [
        {
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
        }
    ],

    // Medición sin cookies (contracts/analytics-events.md). null = pendiente del responsable;
    // sin websiteId o fuera de "dominio" no se envía nada.
    medicion: {
        websiteId: null,
        endpoint: 'https://gateway.umami.is/api/send',
        dominio: 'tari-firma-digital.vercel.app'
    }
};

/* ==========================================================================
   2. FUNCIONES PURAS
   ========================================================================== */

/**
 * Da formato a un precio con coma decimal y dos decimales (ej. 14.99 → "14,99").
 * @param {number} precio - Precio con IVA incluido.
 * @returns {string} Precio formateado sin el símbolo $.
 */
function formatPrice(precio) {
    return precio.toFixed(2).replace('.', ',');
}

/**
 * Da formato visible a un tramo de horario (ej. {inicio:'09:00', fin:'18:00'} → "9:00 a 18:00").
 * @param {{inicio: string, fin: string}} tramo - Horas HH:MM en hora de Ecuador.
 * @returns {string} Tramo legible, sin cero inicial en la hora.
 */
function formatSchedule(tramo) {
    return `${formatHour(tramo.inicio)} a ${formatHour(tramo.fin)}`;
}

/**
 * Quita el cero inicial de una hora HH:MM (ej. "09:00" → "9:00").
 * @param {string} hora - Hora HH:MM.
 * @returns {string} Hora legible.
 */
function formatHour(hora) {
    return hora.replace(/^0(\d)/, '$1');
}

/**
 * Arma la condición de la entrega el mismo día a partir de las horas límite (FR-003).
 * @param {{horaLimiteSemana: ?string, horaLimiteSabado: ?string}} entrega - Horas HH:MM o null.
 * @returns {string} Condición legible, o "Entrega ágil" si no hay horas límite.
 */
function formatDeliveryCondition(entrega) {
    const semana = entrega.horaLimiteSemana;
    const sabado = entrega.horaLimiteSabado;
    if (semana && sabado) {
        return `Mismo día si envías requisitos y pago antes de las ${formatHour(semana)} (sábados, ${formatHour(sabado)})`;
    }
    if (semana) {
        return `Mismo día si envías requisitos y pago antes de las ${formatHour(semana)} (lunes a viernes)`;
    }
    if (sabado) {
        return `Mismo día los sábados si envías requisitos y pago antes de las ${formatHour(sabado)}`;
    }
    return 'Entrega ágil';
}

/**
 * Escapa los caracteres con significado especial en HTML para mostrarlos como texto literal.
 * @param {*} valor - Valor a insertar en una plantilla HTML.
 * @returns {string} Texto seguro para interpolar en innerHTML.
 */
function escapeHtml(valor) {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Da formato visible a un número de WhatsApp (ej. "593960178652" → "+593 96 017 8652").
 * @param {string} whatsapp - 12 dígitos sin "+" ni espacios.
 * @returns {string} Número con prefijo y grupos 3-2-3-4.
 */
function formatPhone(whatsapp) {
    return `+${whatsapp.slice(0, 3)} ${whatsapp.slice(3, 5)} ${whatsapp.slice(5, 8)} ${whatsapp.slice(8)}`;
}

/**
 * Sustituye {negocio}, {asesor} y {producto} en una plantilla de mensaje.
 * @param {string} plantilla - Texto con marcadores entre llaves.
 * @param {Object<string, string>} valores - Valor de cada marcador.
 * @returns {string} Texto final.
 */
function fillTemplate(plantilla, valores) {
    return plantilla.replace(/\{(\w+)\}/g, (marcador, nombre) =>
        Object.prototype.hasOwnProperty.call(valores, nombre) ? valores[nombre] : marcador);
}

/**
 * Busca un asesor por su identificador.
 * @param {string} asesorId - Ej. "asesor1".
 * @returns {Object|undefined} Asesor encontrado.
 */
function findAdvisor(asesorId) {
    return siteData.asesores.find(a => a.id === asesorId);
}

/**
 * Construye el enlace de WhatsApp con el mensaje prellenado (contracts/whatsapp-links.md).
 * @param {string} asesorId - Ej. "asesor1".
 * @param {string} mensaje - Texto final, sin codificar.
 * @returns {string|null} URL https://wa.me/…, o null si el asesor no existe.
 */
function buildWhatsAppUrl(asesorId, mensaje) {
    const asesor = findAdvisor(asesorId);
    if (!asesor) return null;
    return `https://wa.me/${asesor.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

const MESES_CORTOS =['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Genera un rango de fechas corto (ej. "9 al 30 Nov" o "25 Nov al 5 Dic").
 * @param {string} inicio - Fecha AAAA-MM-DD.
 * @param {string} fin - Fecha AAAA-MM-DD.
 * @returns {string} Rango legible en español.
 */
function formatShortDateRange(inicio, fin) {
    const [, mesInicio, diaInicio] = inicio.split('-').map(Number);
    const [, mesFin, diaFin] = fin.split('-').map(Number);
    if (mesInicio === mesFin) {
        return `${diaInicio} al ${diaFin} ${MESES_CORTOS[mesFin - 1]}`;
    }
    return `${diaInicio} ${MESES_CORTOS[mesInicio - 1]} al ${diaFin} ${MESES_CORTOS[mesFin - 1]}`;
}

const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Ecuador continental usa UTC−5 todo el año (sin horario de verano)
const DESFASE_ECUADOR_MS = 5 * 60 * 60 * 1000;

/**
 * Devuelve la fecha (AAAA-MM-DD) que corresponde a un instante en hora de Ecuador continental.
 * @param {Date} ahora - Instante a convertir.
 * @returns {string} Fecha en Ecuador.
 */
function getEcuadorDateString(ahora) {
    return new Date(ahora.getTime() - DESFASE_ECUADOR_MS).toISOString().slice(0, 10);
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/**
 * Devuelve el tramo de atención de un día de la semana (0 = domingo … 6 = sábado).
 * @param {Object} horario - siteData.negocio.horario.
 * @param {number} dia - Día de la semana.
 * @returns {?{inicio: string, fin: string}} Tramo, o null si ese día no se atiende.
 */
function getScheduleForDay(horario, dia) {
    if (dia === 0) return null;
    return dia === 6 ? horario.sabado : horario.semana;
}

/**
 * Calcula si hay atención en un instante y, si no, cuándo se reanuda (hora de Ecuador).
 * El "fin" de cada tramo es exclusivo. Los feriados no se consideran.
 * @param {Object} horario - siteData.negocio.horario.
 * @param {Date} ahora - Instante a evaluar.
 * @returns {{abierto: boolean, proxima: ?{cuando: string, hora: string}}} Estado de atención.
 */
function getAttentionStatus(horario, ahora) {
    const ecuador = new Date(ahora.getTime() - DESFASE_ECUADOR_MS);
    const dia = ecuador.getUTCDay();
    const horaActual = ecuador.toISOString().slice(11, 16);
    const hoy = getScheduleForDay(horario, dia);

    if (hoy && horaActual >= hoy.inicio && horaActual < hoy.fin) {
        return { abierto: true, proxima: null };
    }
    if (hoy && horaActual < hoy.inicio) {
        return { abierto: false, proxima: { cuando: 'hoy', hora: formatHour(hoy.inicio) } };
    }
    for (let salto = 1; salto <= 7; salto += 1) {
        const otroDia = (dia + salto) % 7;
        const tramo = getScheduleForDay(horario, otroDia);
        if (tramo) {
            const cuando = salto === 1 ? 'mañana' : `el ${DIAS_SEMANA[otroDia]}`;
            return { abierto: false, proxima: { cuando, hora: formatHour(tramo.inicio) } };
        }
    }
    return { abierto: false, proxima: null };
}

/**
 * Texto visible del estado de atención (FR-024, FR-025).
 * @param {{abierto: boolean, proxima: ?{cuando: string, hora: string}}} estado - Ver getAttentionStatus.
 * @returns {string} "Atendiendo ahora" o "Fuera de horario · Te respondemos … desde las …".
 */
function formatAttentionStatus(estado) {
    if (estado.abierto) return 'Atendiendo ahora';
    if (!estado.proxima) return 'Fuera de horario';
    return `Fuera de horario · Te respondemos ${estado.proxima.cuando} desde las ${estado.proxima.hora}`;
}

/**
 * Elige el asesor sugerido de la visita; cada asesor tiene la misma probabilidad (FR-027).
 * @param {Array<{id: string}>} asesores - siteData.asesores.
 * @param {function(): number} aleatorio - Devuelve un número en [0, 1) (ej. Math.random).
 * @returns {string} Id del asesor sugerido.
 */
function pickSuggestedAdvisor(asesores, aleatorio) {
    const indice = Math.min(Math.floor(aleatorio() * asesores.length), asesores.length - 1);
    return asesores[indice].id;
}

/**
 * Indica si una promoción está vigente; el día de fin cuenta completo.
 * @param {{inicio: string, fin: string}} promo - Fechas AAAA-MM-DD.
 * @param {Date} ahora - Instante a evaluar.
 * @returns {boolean} true si inicio ≤ hoy (Ecuador) ≤ fin.
 */
function isPromotionActive(promo, ahora) {
    const hoy = getEcuadorDateString(ahora);
    return promo.inicio <= hoy && hoy <= promo.fin;
}

/**
 * Redondea un importe a centavos para evitar residuos de coma flotante.
 * @param {number} valor - Importe.
 * @returns {number} Importe con dos decimales como máximo.
 */
function roundCents(valor) {
    return Math.round(valor * 100) / 100;
}

/**
 * Calcula el costo por año de un plan de firma de 2 años o más (FR-021).
 * @param {{anios: ?number, precio: number}} plan - Plan de firma.
 * @returns {?number} Precio por año, o null si el plan es por días o de 1 año.
 */
function calculateYearlyCost(plan) {
    if (plan.anios === null || plan.anios < 2) return null;
    return roundCents(plan.precio / plan.anios);
}

/**
 * Calcula el ahorro de un plan largo frente a pagar el plan de 1 año cada año (FR-021).
 * @param {{anios: ?number, precio: number}} plan - Plan de firma.
 * @param {{precio: number}} planAnual - Plan de firma de 1 año.
 * @returns {?number} Ahorro (puede ser 0 o negativo), o null si el plan es por días o de 1 año.
 */
function calculateSavings(plan, planAnual) {
    if (plan.anios === null || plan.anios < 2 || !planAnual) return null;
    return roundCents(planAnual.precio * plan.anios - plan.precio);
}

/**
 * Arma el texto de costo por año y ahorro de una tarjeta de firma, con el formato de
 * precio del catálogo e indicando el IVA (Principio V).
 * @param {Object} plan - Plan de firma.
 * @param {Object} planAnual - Plan de firma de 1 año.
 * @returns {?string} Texto, o null si no aplica o no hay ahorro.
 */
function formatYearlyCostText(plan, planAnual) {
    const porAnio = calculateYearlyCost(plan);
    const ahorro = calculateSavings(plan, planAnual);
    if (porAnio === null || ahorro === null || ahorro <= 0) return null;
    return `$${formatPrice(porAnio)} por año · Ahorras $${formatPrice(ahorro)} (IVA incluido)`;
}

/**
 * Promedio aproximado de comprobantes por mes de un plan anual (FR-022).
 * @param {number} total - Comprobantes del año.
 * @returns {number} Comprobantes por mes, redondeado.
 */
function calculateMonthlyVouchers(total) {
    return Math.round(total / 12);
}

/**
 * Etiqueta visible de un plan de comprobantes (ej. 50 → "50 COMPROBANTES").
 * @param {number} total - Comprobantes del año.
 * @returns {string} Etiqueta.
 */
function formatVoucherLabel(total) {
    return `${total} COMPROBANTES`;
}

/**
 * Devuelve las promociones vigentes en un instante (hora de Ecuador).
 * @param {Array<Object>} promos - Promociones de siteData.
 * @param {Date} ahora - Instante a evaluar.
 * @returns {Array<Object>} Promociones vigentes, en el mismo orden.
 */
function getActivePromotions(promos, ahora) {
    return promos.filter(promo => isPromotionActive(promo, ahora));
}

/**
 * Resuelve el precio de cada variante de una promoción: el suyo propio o, si no lo tiene,
 * el del plan de firma de "pagaAnios" años. Omite las variantes sin precio posible.
 * @param {{variantes: Array<Object>}} promo - Promoción con variantes.
 * @param {Array<Object>} firmaPlans - Planes de firma (con "anios" y "precio").
 * @returns {Array<{pagaAnios: number, recibeAnios: number, precio: number}>} Variantes listas.
 */
function getActiveVariants(promo, firmaPlans) {
    return promo.variantes
        .map(variante => {
            const plan = firmaPlans.find(p => p.anios === variante.pagaAnios);
            const precio = typeof variante.precio === 'number' ? variante.precio : (plan && plan.precio);
            return { pagaAnios: variante.pagaAnios, recibeAnios: variante.recibeAnios, precio };
        })
        .filter(variante => typeof variante.precio === 'number');
}

/**
 * Escribe una cantidad de años en singular o plural (ej. 1 → "1 año", 3 → "3 años").
 * @param {number} anios - Cantidad de años.
 * @returns {string} Texto legible.
 */
function formatYears(anios) {
    return `${anios} ${anios === 1 ? 'año' : 'años'}`;
}

/**
 * Genera el texto de vigencia (ej. "Del 9 de noviembre al 30 de noviembre").
 * @param {string} inicio - Fecha AAAA-MM-DD.
 * @param {string} fin - Fecha AAAA-MM-DD.
 * @returns {string} Rango legible en español.
 */
function formatDateRange(inicio, fin) {
    const texto = (fecha) => {
        const [, mes, dia] = fecha.split('-').map(Number);
        return `${dia} de ${MESES_LARGOS[mes - 1]}`;
    };
    return `Del ${texto(inicio)} al ${texto(fin)}`;
}

/**
 * Construye los datos estructurados del negocio para buscadores (contracts/page-metadata.md).
 * Todo sale de siteData, así teléfonos y horario siguen teniendo una sola fuente.
 * @param {Object} datos - Objeto con la forma de siteData.
 * @returns {Object} Objeto schema.org de tipo ProfessionalService, listo para JSON.stringify.
 */
function buildStructuredData(datos) {
    const { negocio, asesores, medicion } = datos;
    const tramo = (dias, { inicio, fin }) => ({
        '@type': 'OpeningHoursSpecification', dayOfWeek: dias, opens: inicio, closes: fin
    });
    const resultado = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: negocio.nombre
    };
    if (medicion && medicion.dominio) {
        resultado.url = `https://${medicion.dominio}/`;
        resultado.image = `https://${medicion.dominio}/img/og-tari.jpg`;
    }
    const legal = negocio.legal || {};
    if (legal.razonSocial) {
        resultado.legalName = legal.razonSocial;
    }
    if (legal.ruc) {
        resultado.taxID = legal.ruc;
    }
    Object.assign(resultado, {
        areaServed: { '@type': 'Country', name: 'Ecuador' },
        telephone: formatPhone(asesores[0].whatsapp),
        contactPoint: asesores.map(asesor => ({
            '@type': 'ContactPoint',
            telephone: formatPhone(asesor.whatsapp),
            contactType: 'sales',
            availableLanguage: 'es'
        })),
        openingHoursSpecification: [
            tramo(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], negocio.horario.semana),
            tramo('Saturday', negocio.horario.sabado)
        ],
        sameAs: [negocio.facebookUrl]
    });
    return resultado;
}

/**
 * Indica si se debe enviar la medición (contracts/analytics-events.md → "Cuándo se envía").
 * @param {{websiteId: ?string, dominio: ?string}} medicion - siteData.medicion.
 * @param {{hostname: string, doNotTrack: ?string}} entorno - Datos del navegador.
 * @returns {boolean} true solo con websiteId, en el dominio público y sin "No rastrear".
 */
function shouldTrack(medicion, entorno) {
    return Boolean(medicion.websiteId)
        && Boolean(medicion.dominio)
        && entorno.hostname === medicion.dominio
        && entorno.doNotTrack !== '1';
}

/**
 * Arma el cuerpo de un envío a Umami (contracts/analytics-events.md → "Petición").
 * La url es solo la ruta: nunca se envían la consulta ni el fragmento.
 * @param {string} tipo - "pageview" o "evento".
 * @param {?string} nombre - Nombre del evento (se omite en pageview).
 * @param {?Object} datos - Propiedades del evento, sin datos del visitante.
 * @param {Object} entorno - websiteId, hostname, ruta, titulo, idioma, ancho, alto y referente.
 * @returns {{type: string, payload: Object}} Cuerpo listo para JSON.stringify.
 */
function buildAnalyticsPayload(tipo, nombre, datos, entorno) {
    const payload = {
        website: entorno.websiteId,
        hostname: entorno.hostname,
        url: entorno.ruta.split(/[?#]/)[0],
        title: entorno.titulo,
        language: entorno.idioma,
        screen: `${entorno.ancho}x${entorno.alto}`,
        referrer: entorno.referente
    };
    if (tipo !== 'pageview' && nombre) {
        payload.name = nombre;
        if (datos) {
            payload.data = datos;
        }
    }
    return { type: 'event', payload };
}

/**
 * Traduce la clave de un botón al origen que se mide: los planes se identifican por su
 * etiqueta y no por su índice, para que las cifras sigan siendo comparables.
 * @param {string} clave - Clave de data-plan o data-open-advisor.
 * @param {string} tipoContribuyente - "natural" o "juridica".
 * @returns {string} Origen del evento (ej. "firma:1 AÑO", "comprobantes:50:natural").
 */
function buildEventOrigin(clave, tipoContribuyente) {
    const [tipo, valor, variante] = clave.split(':');
    if (tipo === 'firma' && siteData.firmaPlans[Number(valor)]) {
        return `firma:${siteData.firmaPlans[Number(valor)].duracion}`;
    }
    if (tipo === 'comprobantes' && siteData.comprobantesPlans[Number(valor)]) {
        return `comprobantes:${siteData.comprobantesPlans[Number(valor)].total}:${tipoContribuyente}`;
    }
    if (tipo === 'promo') {
        return `promo:${valor}:${variante || '0'}`;
    }
    return clave;
}

/**
 * Devuelve el año en hora de Ecuador, para el copyright (FR-036).
 * @param {Date} ahora - Instante a evaluar.
 * @returns {string} Año de cuatro cifras.
 */
function getEcuadorYear(ahora) {
    return getEcuadorDateString(ahora).slice(0, 4);
}

/**
 * Construye la descripción del producto que se muestra en el modal y se envía al asesor.
 * Es la única fuente de ese texto, para que tarjeta, modal y mensaje coincidan.
 * @param {string} clave - "firma:<i>", "comprobantes:<i>", "promo:<id>[:<v>]", "general", "flotante", "renovacion" o "banco".
 * @param {string} tipoContribuyente - "natural" o "juridica" (solo para comprobantes).
 * @returns {string|null} Descripción, o null si la clave no existe.
 */
function buildProductDescription(clave, tipoContribuyente) {
    const separador = clave.indexOf(':');
    const tipo = separador === -1 ? clave : clave.slice(0, separador);
    const valor = separador === -1 ? '' : clave.slice(separador + 1);

    if (tipo === 'firma') {
        const plan = siteData.firmaPlans[Number(valor)];
        if (!plan) return null;
        return `Firma Electrónica (${plan.duracion}) - Valor: $${formatPrice(plan.precio)} inc. IVA`;
    }
    if (tipo === 'comprobantes') {
        const plan = siteData.comprobantesPlans[Number(valor)];
        if (!plan) return null;
        const esNatural = tipoContribuyente !== 'juridica';
        const etiqueta = esNatural ? 'Persona Natural' : 'Persona Jurídica';
        const precio = esNatural ? plan.precioNatural : plan.precioJuridica;
        return `Plan de Facturación: ${formatVoucherLabel(plan.total)} (${etiqueta}) - Valor: $${formatPrice(precio)} inc. IVA`;
    }
    if (tipo === 'promo') {
        // promo:<id> equivale a promo:<id>:0
        const [promoId, indiceTexto = '0'] = valor.split(':');
        const promo = siteData.promociones.find(p => p.id === promoId);
        if (!promo || !/^\d+$/.test(indiceTexto)) return null;
        const variante = getActiveVariants(promo, siteData.firmaPlans)[Number(indiceTexto)];
        if (!variante) return null;
        return `PROMOCIÓN VIGENTE (${formatShortDateRange(promo.inicio, promo.fin)}): ${promo.producto} por ${formatYears(variante.recibeAnios)} (pagas ${variante.pagaAnios}) - Valor: $${formatPrice(variante.precio)} inc. IVA`;
    }
    if (clave === 'general') {
        return `Asesoría General - ${siteData.negocio.nombre}`;
    }
    if (clave === 'flotante') {
        return `Consulta general desde la web de ${siteData.negocio.nombre}`;
    }
    if (clave === 'renovacion') {
        return 'Renovación de Firma Electrónica';
    }
    if (clave === 'banco') {
        return 'Solicito los datos bancarios para realizar el pago por transferencia';
    }
    return null;
}

/* ==========================================================================
   3. RENDERIZADO Y DOM
   ========================================================================== */

// Estado actual del tipo de RUC seleccionado
let currentTaxpayerType = 'natural';

// Elemento que abrió el modal, para devolverle el foco al cerrarlo
let modalTrigger = null;

// Asesor sugerido en esta visita: se elige una vez al cargar la página y solo vive en memoria
let asesorSugeridoId = 'asesor1';

// Origen medido del modal abierto (ej. "firma:1 AÑO"), para el evento elegir-asesor
let origenModal = null;

/**
 * Genera las tarjetas individuales de Firma Electrónica en el DOM. Si una variante de
 * promoción vigente se paga con los años de un plan, su tarjeta muestra el aviso (FR-019).
 * @param {Array<Object>} [vigentes=[]] - Promociones vigentes (ver getActivePromotions).
 */
function renderFirmaCards(vigentes = []) {
    const container = document.getElementById('firma-cards-container');
    if (!container) return;

    const planAnual = siteData.firmaPlans.find(plan => plan.anios === 1);
    const avisoDe = (plan) => {
        for (const promo of vigentes) {
            const variante = getActiveVariants(promo, siteData.firmaPlans)
                .find(v => plan.anios !== null && v.pagaAnios === plan.anios);
            if (variante) {
                return `<a href="#promociones" data-ver-promocion="tarjeta"
                           class="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#FACC15] hover:underline">
                            <i class="fa-solid fa-fire text-red-500"></i>
                            Promo: recibes ${escapeHtml(formatYears(variante.recibeAnios))} por $${escapeHtml(formatPrice(variante.precio))} (IVA incluido)
                        </a>`;
            }
        }
        return '';
    };

    container.innerHTML = siteData.firmaPlans.map((plan, indice) => `
        <div class="bg-[#081018] rounded-2xl border ${plan.popular ? 'border-taris-gold shadow-gold' : 'border-white/10 hover:border-taris-gold/50'} p-5 flex flex-col justify-between transition group relative">
            ${plan.popular ? `<span class="absolute -top-3 right-4 gold-gradient text-taris-dark text-xs font-black uppercase px-3 py-0.5 rounded-full shadow">Popular</span>` : ''}
            <div>
                <div class="flex items-center justify-between mb-3">
                    <span class="w-10 h-10 rounded-xl bg-taris-emerald/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                        <i class="fa-regular fa-calendar-check text-lg"></i>
                    </span>
                    <span class="text-xs font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-md">${escapeHtml(plan.etiqueta)}</span>
                </div>
                <h3 class="text-xl font-black text-white tracking-tight">${escapeHtml(plan.duracion)}</h3>
                <p class="text-xs text-slate-400 mt-0.5">Firma Electrónica Archivo P12</p>
                ${formatYearlyCostText(plan, planAnual) ? `<p class="text-xs font-bold text-emerald-300 mt-2">${escapeHtml(formatYearlyCostText(plan, planAnual))}</p>` : ''}
                ${avisoDe(plan)}

                <div class="my-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                    <span class="text-xs font-bold text-slate-400 uppercase">Cliente Final</span>
                    <div class="text-right">
                        <span class="text-emerald-400 font-black text-xl mr-0.5">$</span>
                        <span class="text-3xl font-black text-white">${escapeHtml(formatPrice(plan.precio))}</span>
                        <span class="block text-xs text-emerald-400 font-semibold">IVA incluido</span>
                    </div>
                </div>
            </div>

            <button type="button" data-plan="firma:${indice}"
                    class="w-full py-3 px-4 rounded-xl bg-taris-emerald hover:bg-taris-emeraldHover text-white font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/20">
                <i class="fa-brands fa-whatsapp text-base"></i>
                <span>Comprar Plan</span>
            </button>
        </div>
    `).join('');
}

/**
 * Cambia entre Persona Natural y Persona Jurídica y actualiza los precios
 * @param {string} type - "natural" o "juridica".
 */
function setTaxpayerType(type) {
    currentTaxpayerType = type;
    const btnNatural = document.getElementById('btn-natural');
    const btnJuridica = document.getElementById('btn-juridica');

    if (type === 'natural') {
        btnNatural.className = "flex-1 sm:flex-initial px-5 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 bg-taris-emerald text-white shadow cursor-pointer";
        btnJuridica.className = "flex-1 sm:flex-initial px-5 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 text-slate-400 hover:text-white cursor-pointer";
    } else {
        btnJuridica.className = "flex-1 sm:flex-initial px-5 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 bg-taris-royal text-white shadow cursor-pointer";
        btnNatural.className = "flex-1 sm:flex-initial px-5 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 text-slate-400 hover:text-white cursor-pointer";
    }

    // Estado anunciado a los lectores de pantalla (FR-031)
    btnNatural.setAttribute('aria-pressed', String(type === 'natural'));
    btnJuridica.setAttribute('aria-pressed', String(type === 'juridica'));

    // Avisos del tipo de contribuyente: solo se ve el del tipo activo
    document.querySelectorAll('[data-taxpayer-note]').forEach(aviso => {
        aviso.classList.toggle('hidden', aviso.dataset.taxpayerNote !== type);
    });
    renderComprobantesCards();
}

/**
 * Genera las tarjetas individuales de Planes de Comprobantes en el DOM
 */
function renderComprobantesCards() {
    const container = document.getElementById('comprobantes-cards-container');
    if (!container) return;

    const isNatural = currentTaxpayerType === 'natural';
    const labelType = isNatural ? 'Persona Natural' : 'Persona Jurídica';

    container.innerHTML = siteData.comprobantesPlans.map((plan, indice) => {
        const activePrice = formatPrice(isNatural ? plan.precioNatural : plan.precioJuridica);
        const accentColor = isNatural ? 'text-taris-gold' : 'text-sky-400';
        const btnStyle = isNatural
            ? 'bg-taris-emerald hover:bg-taris-emeraldHover border-emerald-400/20'
            : 'bg-taris-royal hover:bg-[#264D8F] border-sky-400/20';

        return `
        <div class="bg-[#081018] rounded-2xl border border-white/10 hover:border-taris-gold/50 p-6 flex flex-col justify-between transition">
            <div>
                <div class="flex items-center justify-between mb-3">
                    <span class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-emerald-400 flex items-center justify-center">
                        <i class="fa-regular fa-file-lines text-lg"></i>
                    </span>
                    <span class="text-xs font-bold uppercase px-2.5 py-1 rounded-md ${isNatural ? 'bg-taris-emerald/40 text-emerald-300' : 'bg-taris-royal/60 text-sky-300'}">
                        ${escapeHtml(labelType)}
                    </span>
                </div>

                <h3 class="text-xl font-black text-white">${escapeHtml(formatVoucherLabel(plan.total))}</h3>
                <p class="text-xs font-bold text-emerald-300 mt-1">≈ ${escapeHtml(calculateMonthlyVouchers(plan.total))} por mes</p>
                <p class="text-xs text-slate-400 mt-1">${escapeHtml(plan.descripcion)}</p>

                <div class="my-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                    <span class="text-xs font-bold text-slate-400 uppercase">Vigencia 1 Año</span>
                    <div class="text-right">
                        <span class="text-emerald-400 font-black text-xl mr-0.5">$</span>
                        <span class="text-3xl font-black ${accentColor}">${escapeHtml(activePrice)}</span>
                        <span class="block text-xs text-emerald-400 font-semibold">IVA incluido</span>
                    </div>
                </div>
            </div>

            <button type="button" data-plan="comprobantes:${indice}"
                    class="w-full py-3 px-4 rounded-xl ${btnStyle} text-white font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer border">
                <i class="fa-brands fa-whatsapp text-base"></i>
                <span>Solicitar Plan</span>
            </button>
        </div>
        `;
    }).join('');
}

// Estilos de los enlaces de asesor del modal: el sugerido (dorado) y el alterno (oscuro)
const advisorLinkStyle = {
    sugerido: {
        enlace: 'w-full gold-gradient text-taris-dark font-extrabold p-4 rounded-2xl shadow-gold hover:brightness-110 transition flex items-center justify-between',
        rotulo: 'block text-xs uppercase font-black tracking-wider text-taris-navy',
        chip: 'text-xs font-extrabold bg-taris-dark/15 px-3 py-1.5 rounded-lg'
    },
    alterno: {
        enlace: 'w-full bg-[#112442] border border-taris-gold/50 hover:bg-[#173159] text-white font-extrabold p-4 rounded-2xl transition flex items-center justify-between',
        rotulo: 'block text-xs uppercase font-black tracking-wider text-taris-gold',
        chip: 'text-xs font-extrabold bg-white/10 px-3 py-1.5 rounded-lg'
    }
};

/**
 * Aplica al enlace de un asesor el estilo de sugerido o de alterno, incluidos su rótulo,
 * su botón "Enviar" y la etiqueta "Sugerido".
 * @param {HTMLElement} enlace - #link-asesor-1 o #link-asesor-2.
 * @param {boolean} esSugerido - true si es el asesor sugerido de la visita.
 */
function applyAdvisorStyle(enlace, esSugerido) {
    const estilo = esSugerido ? advisorLinkStyle.sugerido : advisorLinkStyle.alterno;
    enlace.className = estilo.enlace;
    enlace.querySelector('[data-advisor-label]').className = estilo.rotulo;
    enlace.querySelector('[data-advisor-chip]').className = estilo.chip;
    enlace.querySelector('[data-suggested-badge]').classList.toggle('hidden', !esSugerido);
}

/**
 * Indica si el modal de selección de asesor está abierto.
 * @returns {boolean} true si está visible.
 */
function isModalOpen() {
    const modal = document.getElementById('advisor-modal');
    return Boolean(modal) && !modal.classList.contains('hidden');
}

/**
 * Abre la ventana modal para elegir entre Asesor 1 o Asesor 2 con mensaje prellenado.
 * Guarda el elemento que lo abrió y mueve el foco dentro del modal.
 * @param {string} productDescription - Texto del producto (ver buildProductDescription).
 */
function openAdvisorModal(productDescription) {
    const modal = document.getElementById('advisor-modal');
    const productText = document.getElementById('modal-product-text');
    const link1 = document.getElementById('link-asesor-1');
    const link2 = document.getElementById('link-asesor-2');

    productText.textContent = productDescription;

    const mensaje = fillTemplate(siteData.negocio.mensajes.producto, {
        negocio: siteData.negocio.nombre,
        producto: productDescription
    });
    [[link1, 'asesor1'], [link2, 'asesor2']].forEach(([enlace, asesorId]) => {
        enlace.href = buildWhatsAppUrl(asesorId, mensaje);
    });

    // Asesor sugerido de esta visita (FR-027): va primero en el DOM (así también es el primero
    // con Tab), con el estilo dorado y la etiqueta "Sugerido"; el otro sigue disponible.
    const sugerido = asesorSugeridoId === 'asesor2' ? link2 : link1;
    const alterno = sugerido === link1 ? link2 : link1;
    applyAdvisorStyle(sugerido, true);
    applyAdvisorStyle(alterno, false);
    sugerido.parentElement.prepend(sugerido);

    renderAttentionStatus();
    if (!isModalOpen()) {
        modalTrigger = document.activeElement;
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    sugerido.focus();
}

/**
 * Cierra la ventana modal de selección de asesor y devuelve el foco a quien la abrió.
 */
function closeAdvisorModal() {
    if (!isModalOpen()) return;
    const modal = document.getElementById('advisor-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');

    if (modalTrigger && document.contains(modalTrigger)) {
        modalTrigger.focus();
    }
    modalTrigger = null;
}

/**
 * Abre o cierra el menú móvil y anuncia su estado con aria-expanded (FR-030).
 * @param {boolean} abierto - true para abrirlo.
 */
function setMobileMenuOpen(abierto) {
    const boton = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!boton || !menu) return;
    menu.classList.toggle('hidden', !abierto);
    boton.setAttribute('aria-expanded', String(abierto));
    boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
}

/**
 * Teclado: con el modal abierto, Escape lo cierra y Tab / Shift+Tab hacen ciclo entre sus
 * elementos enfocables sin salir de él. Sin modal, Escape cierra el menú móvil si está abierto.
 * @param {KeyboardEvent} evento - Tecla pulsada en el documento.
 */
function handleModalKeydown(evento) {
    if (!isModalOpen()) {
        const menu = document.getElementById('mobile-menu');
        if (evento.key === 'Escape' && menu && !menu.classList.contains('hidden')) {
            setMobileMenuOpen(false);
            document.getElementById('mobile-menu-btn').focus();
        }
        return;
    }

    if (evento.key === 'Escape') {
        evento.preventDefault();
        closeAdvisorModal();
        return;
    }
    if (evento.key !== 'Tab') return;

    const modal = document.getElementById('advisor-modal');
    const enfocables = [...modal.querySelectorAll('a[href], button:not([disabled])')];
    if (enfocables.length === 0) return;

    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    const dentro = modal.contains(document.activeElement);

    if (evento.shiftKey && (document.activeElement === primero || !dentro)) {
        evento.preventDefault();
        ultimo.focus();
    } else if (!evento.shiftKey && (document.activeElement === ultimo || !dentro)) {
        evento.preventDefault();
        primero.focus();
    }
}

/**
 * Atiende todos los clics del sitio con un único listener (delegación de eventos).
 * Los botones indican qué producto abren con data-plan o data-open-advisor;
 * el texto del producto nunca viaja dentro del botón.
 * @param {MouseEvent} evento - Clic en cualquier parte del documento.
 */
function handleDocumentClick(evento) {
    const selectorTipo = evento.target.closest('[data-taxpayer]');
    if (selectorTipo) {
        setTaxpayerType(selectorTipo.dataset.taxpayer);
        return;
    }

    // Elegir asesor en el modal: se mide antes de cerrar (sin preventDefault: el enlace abre WhatsApp)
    const enlaceAsesor = evento.target.closest('#link-asesor-1, #link-asesor-2');
    if (enlaceAsesor) {
        const asesor = enlaceAsesor.id === 'link-asesor-1' ? 'asesor1' : 'asesor2';
        trackEvent('elegir-asesor', { asesor, sugerido: asesor === asesorSugeridoId, origen: origenModal });
    }
    if (enlaceAsesor || evento.target.closest('[data-modal-close]')) {
        closeAdvisorModal();
        return;
    }

    const directo = evento.target.closest('a[data-whatsapp]');
    if (directo) {
        trackEvent('contacto-directo', { asesor: directo.dataset.whatsapp, mensaje: directo.dataset.mensaje || 'info' });
        return;
    }

    const haciaPromocion = evento.target.closest('[data-ver-promocion]');
    if (haciaPromocion) {
        trackEvent('ver-promocion', { desde: haciaPromocion.dataset.verPromocion });
    }

    const disparador = evento.target.closest('[data-plan], [data-open-advisor]');
    if (!disparador) return;

    const clave = disparador.dataset.plan || disparador.dataset.openAdvisor;
    const descripcion = buildProductDescription(clave, currentTaxpayerType);
    if (descripcion) {
        origenModal = buildEventOrigin(clave, currentTaxpayerType);
        trackEvent('abrir-contacto', { origen: origenModal });
        openAdvisorModal(descripcion);
    }
}

/**
 * Envía la medición a Umami sin cargar scripts de terceros (contracts/analytics-events.md).
 * No hace nada si shouldTrack es falso, y cualquier error de red se ignora: la medición
 * nunca retrasa ni bloquea la apertura de WhatsApp (FR-037a).
 * @param {?string} nombre - Nombre del evento; null para la visita a la página (pageview).
 * @param {?Object} [datos=null] - Propiedades del evento, sin datos del visitante.
 */
function trackEvent(nombre, datos = null) {
    const medicion = siteData.medicion;
    const entorno = {
        websiteId: medicion.websiteId,
        hostname: window.location.hostname,
        ruta: window.location.pathname,
        titulo: document.title,
        idioma: navigator.language,
        ancho: window.screen.width,
        alto: window.screen.height,
        referente: document.referrer,
        doNotTrack: navigator.doNotTrack
    };
    if (!shouldTrack(medicion, entorno) || typeof fetch !== 'function') return;

    const cuerpo = buildAnalyticsPayload(nombre ? 'evento' : 'pageview', nombre, datos, entorno);
    fetch(medicion.endpoint, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo)
    }).catch(() => {});
}

/**
 * Rellena los datos de contacto del HTML desde siteData (contracts/dom-hooks.md):
 * enlaces de WhatsApp y Facebook, números visibles y horarios.
 */
function hydrateContactData() {
    const negocio = siteData.negocio;

    document.querySelectorAll('[data-whatsapp]').forEach(enlace => {
        const asesor = findAdvisor(enlace.dataset.whatsapp);
        if (!asesor) return;
        const plantilla = negocio.mensajes[enlace.dataset.mensaje || 'info'] || negocio.mensajes.info;
        const mensaje = fillTemplate(plantilla, { negocio: negocio.nombre });
        enlace.href = buildWhatsAppUrl(asesor.id, mensaje);
    });

    document.querySelectorAll('[data-phone]').forEach(elemento => {
        const asesor = findAdvisor(elemento.dataset.phone);
        if (asesor) {
            elemento.textContent = formatPhone(asesor.whatsapp);
        }
    });

    document.querySelectorAll('[data-facebook]').forEach(enlace => {
        enlace.href = negocio.facebookUrl;
    });

    document.querySelectorAll('[data-horario]').forEach(elemento => {
        const tramo = negocio.horario[elemento.dataset.horario];
        if (tramo) {
            elemento.textContent = formatSchedule(tramo);
        }
    });

    document.querySelectorAll('[data-entrega]').forEach(elemento => {
        elemento.textContent = formatDeliveryCondition(negocio.entrega);
    });
}

/**
 * Muestra u oculta cada promoción y sus enlaces de menú según su vigencia,
 * y escribe su texto de vigencia. Se puede llamar desde la consola con otra
 * fecha para probar, por ejemplo: applyPromotions(new Date('2026-12-01T00:00:00-05:00')).
 * @param {Date} [ahora=new Date()] - Instante a evaluar.
 */
function applyPromotions(ahora = new Date()) {
    const vigentes = getActivePromotions(siteData.promociones, ahora);
    renderPromotions(vigentes);
    document.querySelectorAll('[data-promo-any]')
        .forEach(elemento => elemento.classList.toggle('hidden', vigentes.length === 0));
    renderFirmaCards(vigentes);
}

/**
 * Genera una tarjeta por promoción vigente en #promociones-container, con un botón por
 * variante (data-plan="promo:<id>:<v>"). Todos los textos pasan por escapeHtml.
 * @param {Array<Object>} vigentes - Promociones vigentes (ver getActivePromotions).
 */
function renderPromotions(vigentes) {
    const contenedor = document.getElementById('promociones-container');
    if (!contenedor) return;

    contenedor.innerHTML = vigentes.map(promo => {
        const variantes = getActiveVariants(promo, siteData.firmaPlans);
        const destacada = variantes[0];
        if (!destacada) return '';
        const resto = promo.titulo.startsWith(promo.producto) ? promo.titulo.slice(promo.producto.length) : '';
        const titular = resto
            ? `${escapeHtml(promo.producto)} <span class="text-[#FACC15]">${escapeHtml(resto.trim())}</span>`
            : escapeHtml(promo.titulo);
        const botones = variantes.map((variante, indice) => `
            <button type="button" data-plan="promo:${escapeHtml(promo.id)}:${indice}"
                    class="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-[#FACC15] rounded-2xl p-3.5 text-center transition cursor-pointer">
                <span class="block text-xs text-sky-200 font-semibold">Pagas ${escapeHtml(formatYears(variante.pagaAnios))}</span>
                <span class="block text-lg font-black text-white mt-0.5">
                    <i class="fa-solid fa-arrow-right text-[#FACC15] text-xs mr-1"></i> Te damos <span class="text-[#FACC15] text-xl">${escapeHtml(variante.recibeAnios)}</span>
                </span>
                <span class="block text-sm font-extrabold text-white mt-1">$${escapeHtml(formatPrice(variante.precio))}</span>
                <span class="block text-xs text-emerald-300 font-semibold">IVA incluido</span>
            </button>`).join('');

        return `
        <div class="promo-banner-bg rounded-3xl border-2 border-taris-gold shadow-card overflow-hidden animate-pulse-gold">
            <div class="grid lg:grid-cols-12 items-center">
                <div class="lg:col-span-7 p-6 sm:p-10 space-y-5">
                    <div class="flex flex-wrap items-center gap-3">
                        <span class="bg-red-600 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-lg uppercase tracking-wide shadow-md transform -rotate-1">¡Solo por tiempo limitado!</span>
                        <span class="bg-[#FACC15] text-taris-dark font-extrabold text-xs sm:text-sm px-4 py-1.5 rounded-lg flex items-center gap-2 shadow-md">
                            <i class="fa-regular fa-calendar-check"></i>
                            <span>Vigencia: ${escapeHtml(formatDateRange(promo.inicio, promo.fin))}</span>
                        </span>
                    </div>
                    <div>
                        <h3 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase leading-tight">${titular}</h3>
                        <p class="text-sky-200 text-sm sm:text-base mt-1 font-medium">Elige tu opción y recibe más años de vigencia por el mismo pago.</p>
                    </div>
                    <div class="grid sm:grid-cols-3 gap-3 pt-1">${botones}</div>
                </div>

                <div class="lg:col-span-5 bg-[#041229]/80 border-t lg:border-t-0 lg:border-l border-taris-gold/30 p-6 sm:p-10 flex flex-col items-center justify-center text-center h-full">
                    <span class="text-xs uppercase tracking-widest text-taris-gold font-bold mb-2">Precio Especial Promo</span>
                    <div class="bg-[#061A3A] border-2 border-taris-gold rounded-3xl px-8 py-5 shadow-gold mb-5 w-full max-w-xs">
                        <div class="flex items-start justify-center text-[#FACC15] font-black leading-none">
                            <span class="text-3xl sm:text-4xl mt-1 mr-1">$</span>
                            <span class="text-6xl sm:text-7xl tracking-tighter">${escapeHtml(formatPrice(destacada.precio))}</span>
                        </div>
                        <span class="block text-white font-extrabold text-lg mt-1">por ${escapeHtml(formatYears(destacada.recibeAnios))}</span>
                        <span class="block text-xs text-emerald-400 font-semibold mt-1">IVA incluido</span>
                    </div>
                    <button type="button" data-plan="promo:${escapeHtml(promo.id)}:0"
                            class="w-full max-w-xs gold-gradient text-taris-dark font-black text-base py-4 px-6 rounded-2xl shadow-gold hover:brightness-110 transition flex items-center justify-center gap-2.5 cursor-pointer">
                        <i class="fa-brands fa-whatsapp text-xl text-emerald-950"></i>
                        <span>¡Aprovechar Promoción!</span>
                    </button>
                    <p class="text-xs text-slate-400 mt-3">Elige tu asesor preferido al hacer clic</p>
                </div>
            </div>
        </div>`;
    }).join('');
}

/**
 * Rellena los datos legales del negocio (contracts/dom-hooks.md → data-legal):
 * cada [data-legal] recibe su dato o se oculta si es null; cada [data-legal-group] se
 * oculta si todos sus datos faltan, y su [data-legal-fallback] hermano hace lo contrario.
 */
function hydrateLegalData() {
    const legal = siteData.negocio.legal;
    document.querySelectorAll('[data-legal]').forEach(elemento => {
        const valor = legal[elemento.dataset.legal];
        elemento.textContent = valor || '';
        elemento.classList.toggle('hidden', !valor);
    });
    document.querySelectorAll('[data-legal-group]').forEach(grupo => {
        const datos = [...grupo.querySelectorAll('[data-legal]')];
        const algunoExiste = datos.some(elemento => Boolean(legal[elemento.dataset.legal]));
        grupo.classList.toggle('hidden', !algunoExiste);
        const alternativo = grupo.nextElementSibling;
        if (alternativo && alternativo.hasAttribute('data-legal-fallback')) {
            alternativo.classList.toggle('hidden', algunoExiste);
        }
    });
}

/**
 * Muestra en cada [data-atencion] si hay atención ahora o cuándo se reanuda.
 * Se puede llamar desde la consola con otra hora para probar, por ejemplo:
 * renderAttentionStatus(new Date('2026-11-28T14:30:00-05:00')).
 * @param {Date} [ahora=new Date()] - Instante a evaluar.
 */
function renderAttentionStatus(ahora = new Date()) {
    const estado = getAttentionStatus(siteData.negocio.horario, ahora);
    document.querySelectorAll('[data-atencion]').forEach(elemento => {
        elemento.textContent = formatAttentionStatus(estado);
        elemento.classList.toggle('text-emerald-300', estado.abierto);
        elemento.classList.toggle('text-amber-300', !estado.abierto);
    });
}

/**
 * Escribe los datos estructurados en el <script type="application/ld+json"> de la página.
 * Usa textContent: el JSON nunca se interpreta como HTML.
 */
function renderStructuredData() {
    const contenedor = document.querySelector('script[data-structured-data]');
    if (contenedor) {
        contenedor.textContent = JSON.stringify(buildStructuredData(siteData));
    }
}

/* ==========================================================================
   4. ARRANQUE (solo en el navegador)
   ========================================================================== */

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        renderComprobantesCards();
        applyPromotions(); // también dibuja las tarjetas de firma con sus avisos de promoción
        hydrateContactData();
        hydrateLegalData();
        renderStructuredData();
        asesorSugeridoId = pickSuggestedAdvisor(siteData.asesores, Math.random);
        renderAttentionStatus();
        document.querySelectorAll('[data-anio]').forEach(elemento => {
            elemento.textContent = getEcuadorYear(new Date());
        });
        trackEvent(null); // visita a la página (pageview)
        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleModalKeydown);

        // Cerrar modal al hacer clic fuera de la tarjeta
        const modal = document.getElementById('advisor-modal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeAdvisorModal();
                }
            });
        }

        // Control del menú desplegable en móviles (FR-030)
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => setMobileMenuOpen(mobileMenu.classList.contains('hidden')));
            // Al elegir una opción, el menú se cierra
            mobileMenu.addEventListener('click', (evento) => {
                if (evento.target.closest('a')) {
                    setMobileMenuOpen(false);
                }
            });
        }
    });
}

/* ==========================================================================
   5. EXPORTACIÓN (solo para pruebas en Node; el navegador la ignora)
   ========================================================================== */

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        siteData,
        formatPrice,
        formatSchedule,
        formatDeliveryCondition,
        escapeHtml,
        formatPhone,
        fillTemplate,
        buildWhatsAppUrl,
        formatShortDateRange,
        buildProductDescription,
        buildStructuredData,
        getEcuadorDateString,
        isPromotionActive,
        getActivePromotions,
        getActiveVariants,
        formatYears,
        calculateYearlyCost,
        calculateSavings,
        formatYearlyCostText,
        calculateMonthlyVouchers,
        formatVoucherLabel,
        getAttentionStatus,
        formatAttentionStatus,
        pickSuggestedAdvisor,
        shouldTrack,
        buildAnalyticsPayload,
        buildEventOrigin,
        getEcuadorYear,
        formatDateRange
    };
}

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
        horario: {
            semana: '9:00 a 18:00',
            sabado: '10:00 a 14:00'
        },
        mensajes: {
            info: 'Hola {negocio}, deseo información sobre Firma y Facturación Electrónica.',
            ayuda: 'Hola {asesor} de {negocio}, necesito ayuda.',
            producto: 'Hola {asesor} de {negocio}, estoy interesado en adquirir:\n*{producto}*\n\nPor favor ayúdeme con el proceso.'
        }
    },

    // Planes individuales de Firma Electrónica (Archivo P12)
    firmaPlans: [
        { duracion: '10 DÍAS', precio: 8.50, etiqueta: 'Trámite puntual', popular: false },
        { duracion: '30 DÍAS', precio: 10.50, etiqueta: 'Corto plazo', popular: false },
        { duracion: '1 AÑO', precio: 15.00, etiqueta: 'Más solicitado', popular: true },
        { duracion: '2 AÑOS', precio: 21.00, etiqueta: 'Ahorro recomendado', popular: false },
        { duracion: '3 AÑOS', precio: 30.00, etiqueta: 'Larga duración', popular: false },
        { duracion: '4 AÑOS', precio: 35.00, etiqueta: 'Empresarial', popular: false },
        { duracion: '5 AÑOS', precio: 46.00, etiqueta: 'Máxima vigencia', popular: false }
    ],

    // Planes individuales de Comprobantes (Facturación Electrónica - 1 Año)
    comprobantesPlans: [
        { cantidad: '50 COMPROBANTES', precioNatural: 7.00, precioJuridica: 7.50, descripcion: 'Ideal para emprendedores iniciales' },
        { cantidad: '70 COMPROBANTES', precioNatural: 8.00, precioJuridica: 9.50, descripcion: 'Para facturación mensual moderada' },
        { cantidad: '100 COMPROBANTES', precioNatural: 10.00, precioJuridica: 13.00, descripcion: 'Plan equilibrado para profesionales' },
        { cantidad: '200 COMPROBANTES', precioNatural: 12.00, precioJuridica: 21.00, descripcion: 'Para negocios en crecimiento' },
        { cantidad: '400 COMPROBANTES', precioNatural: 15.50, precioJuridica: 25.00, descripcion: 'Alto volumen de emisión anual' },
        { cantidad: '600 COMPROBANTES', precioNatural: 17.00, precioJuridica: 35.00, descripcion: 'Máxima capacidad comercial' }
    ],

    // Promociones con vigencia (fechas AAAA-MM-DD, hora de Ecuador, día de fin incluido)
    promociones: [
        {
            id: 'firma-2-anios-nov-2026',
            titulo: 'Firma Electrónica por 2 años',
            precio: 14.99,
            inicio: '2026-11-09',
            fin: '2026-11-30'
        }
    ]
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

/**
 * Construye la descripción del producto que se muestra en el modal y se envía al asesor.
 * Es la única fuente de ese texto, para que tarjeta, modal y mensaje coincidan.
 * @param {string} clave - "firma:<i>", "comprobantes:<i>", "promo:<id>", "general", "flotante" o "banco".
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
        return `Plan de Facturación: ${plan.cantidad} (${etiqueta}) - Valor: $${formatPrice(precio)} inc. IVA`;
    }
    if (tipo === 'promo') {
        const promo = siteData.promociones.find(p => p.id === valor);
        if (!promo) return null;
        return `PROMOCIÓN VIGENTE (${formatShortDateRange(promo.inicio, promo.fin)}): ${promo.titulo} a $${formatPrice(promo.precio)}`;
    }
    if (clave === 'general') {
        return `Asesoría General - ${siteData.negocio.nombre}`;
    }
    if (clave === 'flotante') {
        return `Consulta general desde la web de ${siteData.negocio.nombre}`;
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

/**
 * Genera las tarjetas individuales de Firma Electrónica en el DOM
 */
function renderFirmaCards() {
    const container = document.getElementById('firma-cards-container');
    if (!container) return;

    container.innerHTML = siteData.firmaPlans.map((plan, indice) => `
        <div class="bg-[#081018] rounded-2xl border ${plan.popular ? 'border-taris-gold shadow-gold' : 'border-white/10 hover:border-taris-gold/50'} p-5 flex flex-col justify-between transition group relative">
            ${plan.popular ? `<span class="absolute -top-3 right-4 gold-gradient text-taris-dark text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow">Popular</span>` : ''}
            <div>
                <div class="flex items-center justify-between mb-3">
                    <span class="w-10 h-10 rounded-xl bg-taris-emerald/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                        <i class="fa-regular fa-calendar-check text-lg"></i>
                    </span>
                    <span class="text-[11px] font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-md">${escapeHtml(plan.etiqueta)}</span>
                </div>
                <h3 class="text-xl font-black text-white tracking-tight">${escapeHtml(plan.duracion)}</h3>
                <p class="text-xs text-slate-400 mt-0.5">Firma Electrónica Archivo P12</p>

                <div class="my-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                    <span class="text-xs font-bold text-slate-400 uppercase">Cliente Final</span>
                    <div class="text-right">
                        <span class="text-emerald-400 font-black text-xl mr-0.5">$</span>
                        <span class="text-3xl font-black text-white">${escapeHtml(formatPrice(plan.precio))}</span>
                        <span class="block text-[10px] text-emerald-400 font-semibold">IVA incluido</span>
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
                    <span class="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md ${isNatural ? 'bg-taris-emerald/40 text-emerald-300' : 'bg-taris-royal/60 text-sky-300'}">
                        ${escapeHtml(labelType)}
                    </span>
                </div>

                <h3 class="text-xl font-black text-white">${escapeHtml(plan.cantidad)}</h3>
                <p class="text-xs text-slate-400 mt-1">${escapeHtml(plan.descripcion)}</p>

                <div class="my-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                    <span class="text-xs font-bold text-slate-400 uppercase">Vigencia 1 Año</span>
                    <div class="text-right">
                        <span class="text-emerald-400 font-black text-xl mr-0.5">$</span>
                        <span class="text-3xl font-black ${accentColor}">${escapeHtml(activePrice)}</span>
                        <span class="block text-[10px] text-emerald-400 font-semibold">IVA incluido</span>
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

    [[link1, 'asesor1'], [link2, 'asesor2']].forEach(([enlace, asesorId]) => {
        const asesor = findAdvisor(asesorId);
        const mensaje = fillTemplate(siteData.negocio.mensajes.producto, {
            negocio: siteData.negocio.nombre,
            asesor: asesor.nombre,
            producto: productDescription
        });
        enlace.href = buildWhatsAppUrl(asesorId, mensaje);
    });

    if (!isModalOpen()) {
        modalTrigger = document.activeElement;
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    link1.focus();
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
 * Teclado dentro del modal: Escape lo cierra y Tab / Shift+Tab hacen ciclo
 * entre sus elementos enfocables sin salir de él.
 * @param {KeyboardEvent} evento - Tecla pulsada en el documento.
 */
function handleModalKeydown(evento) {
    if (!isModalOpen()) return;

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

    // Cerrar con la X o al elegir asesor (sin preventDefault: el enlace abre WhatsApp)
    if (evento.target.closest('[data-modal-close], #link-asesor-1, #link-asesor-2')) {
        closeAdvisorModal();
        return;
    }

    const disparador = evento.target.closest('[data-plan], [data-open-advisor]');
    if (!disparador) return;

    const clave = disparador.dataset.plan || disparador.dataset.openAdvisor;
    const descripcion = buildProductDescription(clave, currentTaxpayerType);
    if (descripcion) {
        openAdvisorModal(descripcion);
    }
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
        const mensaje = fillTemplate(plantilla, { negocio: negocio.nombre, asesor: asesor.nombre });
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
        const horario = negocio.horario[elemento.dataset.horario];
        if (horario) {
            elemento.textContent = horario;
        }
    });
}

/**
 * Muestra el precio de cada promoción en los elementos marcados con data-promo-precio.
 */
function renderPromotionPrices() {
    document.querySelectorAll('[data-promo-precio]').forEach(elemento => {
        const promo = siteData.promociones.find(p => p.id === elemento.dataset.promoPrecio);
        if (promo) {
            elemento.textContent = formatPrice(promo.precio);
        }
    });
}

/* ==========================================================================
   4. ARRANQUE (solo en el navegador)
   ========================================================================== */

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        renderFirmaCards();
        renderComprobantesCards();
        renderPromotionPrices();
        hydrateContactData();
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

        // Control del menú desplegable en móviles
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
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
        escapeHtml,
        formatPhone,
        fillTemplate,
        buildWhatsAppUrl,
        formatShortDateRange,
        buildProductDescription
    };
}

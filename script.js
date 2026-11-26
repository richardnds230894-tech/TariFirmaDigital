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

/* ==========================================================================
   3. RENDERIZADO Y DOM
   ========================================================================== */

// Estado actual del tipo de RUC seleccionado
let currentTaxpayerType = 'natural';

/**
 * Genera las tarjetas individuales de Firma Electrónica en el DOM
 */
function renderFirmaCards() {
    const container = document.getElementById('firma-cards-container');
    if (!container) return;

    container.innerHTML = siteData.firmaPlans.map(plan => `
        <div class="bg-[#081018] rounded-2xl border ${plan.popular ? 'border-taris-gold shadow-gold' : 'border-white/10 hover:border-taris-gold/50'} p-5 flex flex-col justify-between transition group relative">
            ${plan.popular ? `<span class="absolute -top-3 right-4 gold-gradient text-taris-dark text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow">Popular</span>` : ''}
            <div>
                <div class="flex items-center justify-between mb-3">
                    <span class="w-10 h-10 rounded-xl bg-taris-emerald/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                        <i class="fa-regular fa-calendar-check text-lg"></i>
                    </span>
                    <span class="text-[11px] font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-md">${plan.etiqueta}</span>
                </div>
                <h3 class="text-xl font-black text-white tracking-tight">${plan.duracion}</h3>
                <p class="text-xs text-slate-400 mt-0.5">Firma Electrónica Archivo P12</p>

                <div class="my-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                    <span class="text-xs font-bold text-slate-400 uppercase">Cliente Final</span>
                    <div class="text-right">
                        <span class="text-emerald-400 font-black text-xl mr-0.5">$</span>
                        <span class="text-3xl font-black text-white">${formatPrice(plan.precio)}</span>
                        <span class="block text-[10px] text-emerald-400 font-semibold">IVA incluido</span>
                    </div>
                </div>
            </div>

            <button onclick="openAdvisorModal('Firma Electrónica (${plan.duracion}) - Valor: $${formatPrice(plan.precio)} inc. IVA')"
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

    container.innerHTML = siteData.comprobantesPlans.map(plan => {
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
                        ${labelType}
                    </span>
                </div>

                <h3 class="text-xl font-black text-white">${plan.cantidad}</h3>
                <p class="text-xs text-slate-400 mt-1">${plan.descripcion}</p>

                <div class="my-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                    <span class="text-xs font-bold text-slate-400 uppercase">Vigencia 1 Año</span>
                    <div class="text-right">
                        <span class="text-emerald-400 font-black text-xl mr-0.5">$</span>
                        <span class="text-3xl font-black ${accentColor}">${activePrice}</span>
                        <span class="block text-[10px] text-emerald-400 font-semibold">IVA incluido</span>
                    </div>
                </div>
            </div>

            <button onclick="openAdvisorModal('Plan de Facturación: ${plan.cantidad} (${labelType}) - Valor: $${activePrice} inc. IVA')"
                    class="w-full py-3 px-4 rounded-xl ${btnStyle} text-white font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer border">
                <i class="fa-brands fa-whatsapp text-base"></i>
                <span>Solicitar Plan</span>
            </button>
        </div>
        `;
    }).join('');
}

/**
 * Abre la ventana modal para elegir entre Asesor 1 o Asesor 2 con mensaje prellenado
 */
function openAdvisorModal(productDescription) {
    const modal = document.getElementById('advisor-modal');
    const productText = document.getElementById('modal-product-text');
    const link1 = document.getElementById('link-asesor-1');
    const link2 = document.getElementById('link-asesor-2');

    productText.textContent = productDescription;

    const message1 = encodeURIComponent(`Hola Asesor 1 de Tari's Firma Digital, estoy interesado en adquirir:\n*${productDescription}*\n\nPor favor ayúdeme con el proceso.`);
    const message2 = encodeURIComponent(`Hola Asesor 2 de Tari's Firma Digital, estoy interesado en adquirir:\n*${productDescription}*\n\nPor favor ayúdeme con el proceso.`);

    link1.href = `https://wa.me/593960178652?text=${message1}`;
    link2.href = `https://wa.me/593969790890?text=${message2}`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

/**
 * Cierra la ventana modal de selección de asesor
 */
function closeAdvisorModal() {
    const modal = document.getElementById('advisor-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

/* ==========================================================================
   4. ARRANQUE (solo en el navegador)
   ========================================================================== */

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        renderFirmaCards();
        renderComprobantesCards();

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
        escapeHtml
    };
}

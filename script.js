/**
 * Lógica del catálogo individual, selector de contribuyente
 * y conexión directa con Asesor 1 y Asesor 2 vía WhatsApp.
 */

// 1. Planes individuales de Firma Electrónica (Archivo P12)
const firmaPlans = [
    { duration: "10 DÍAS", price: "8,50", badge: "Trámite puntual", popular: false },
    { duration: "30 DÍAS", price: "10,50", badge: "Corto plazo", popular: false },
    { duration: "1 AÑO", price: "15,00", badge: "Más solicitado", popular: true },
    { duration: "2 AÑOS", price: "21,00", badge: "Ahorro recomendado", popular: false },
    { duration: "3 AÑOS", price: "30,00", badge: "Larga duración", popular: false },
    { duration: "4 AÑOS", price: "35,00", badge: "Empresarial", popular: false },
    { duration: "5 AÑOS", price: "46,00", badge: "Máxima vigencia", popular: false }
];

// 2. Planes individuales de Comprobantes (Facturación Electrónica - 1 Año)
const comprobantesPlans = [
    { count: "50 COMPROBANTES", natural: "7,00", juridica: "7,50", desc: "Ideal para emprendedores iniciales" },
    { count: "70 COMPROBANTES", natural: "8,00", juridica: "9,50", desc: "Para facturación mensual moderada" },
    { count: "100 COMPROBANTES", natural: "10,00", juridica: "13,00", desc: "Plan equilibrado para profesionales" },
    { count: "200 COMPROBANTES", natural: "12,00", juridica: "21,00", desc: "Para negocios en crecimiento" },
    { count: "400 COMPROBANTES", natural: "15,50", juridica: "25,00", desc: "Alto volumen de emisión anual" },
    { count: "600 COMPROBANTES", natural: "17,00", juridica: "35,00", desc: "Máxima capacidad comercial" }
];

// Estado actual del tipo de RUC seleccionado
let currentTaxpayerType = 'natural';

/**
 * Genera las tarjetas individuales de Firma Electrónica en el DOM
 */
function renderFirmaCards() {
    const container = document.getElementById('firma-cards-container');
    if (!container) return;

    container.innerHTML = firmaPlans.map(plan => `
        <div class="bg-[#081018] rounded-2xl border ${plan.popular ? 'border-taris-gold shadow-gold' : 'border-white/10 hover:border-taris-gold/50'} p-5 flex flex-col justify-between transition group relative">
            ${plan.popular ? `<span class="absolute -top-3 right-4 gold-gradient text-taris-dark text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow">Popular</span>` : ''}
            <div>
                <div class="flex items-center justify-between mb-3">
                    <span class="w-10 h-10 rounded-xl bg-taris-emerald/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                        <i class="fa-regular fa-calendar-check text-lg"></i>
                    </span>
                    <span class="text-[11px] font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-md">${plan.badge}</span>
                </div>
                <h3 class="text-xl font-black text-white tracking-tight">${plan.duration}</h3>
                <p class="text-xs text-slate-400 mt-0.5">Firma Electrónica Archivo P12</p>

                <div class="my-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                    <span class="text-xs font-bold text-slate-400 uppercase">Cliente Final</span>
                    <div class="text-right">
                        <span class="text-emerald-400 font-black text-xl mr-0.5">$</span>
                        <span class="text-3xl font-black text-white">${plan.price}</span>
                        <span class="block text-[10px] text-emerald-400 font-semibold">IVA incluido</span>
                    </div>
                </div>
            </div>

            <button onclick="openAdvisorModal('Firma Electrónica (${plan.duration}) - Valor: $${plan.price} inc. IVA')"
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

    container.innerHTML = comprobantesPlans.map(plan => {
        const activePrice = isNatural ? plan.natural : plan.juridica;
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

                <h3 class="text-xl font-black text-white">${plan.count}</h3>
                <p class="text-xs text-slate-400 mt-1">${plan.desc}</p>

                <div class="my-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                    <span class="text-xs font-bold text-slate-400 uppercase">Vigencia 1 Año</span>
                    <div class="text-right">
                        <span class="text-emerald-400 font-black text-xl mr-0.5">$</span>
                        <span class="text-3xl font-black ${accentColor}">${activePrice}</span>
                        <span class="block text-[10px] text-emerald-400 font-semibold">IVA incluido</span>
                    </div>
                </div>
            </div>

            <button onclick="openAdvisorModal('Plan de Facturación: ${plan.count} (${labelType}) - Valor: $${activePrice} inc. IVA')"
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

// Eventos al cargar el documento
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
// ==========================================
// CONFIGURACIÓN - Variables globales
// ==========================================

const CONFIG = {
    // Datos de la tienda
    storeName: 'ETERNA FRAGANCIA',
    storeDescription: 'Todo lo que buscás, en un solo lugar.',
    storeLogo: '🏪',
    
    // Contacto
    whatsappNumber: '5491234567890',
    instagramUsername: '@rbpolirubro',
    storeAddress: 'Calle Principal 123, Ciudad',
    storeHours: 'Lunes a Viernes 9:00 - 18:00',
    
    heroEyebrow: 'Calidad & Elegancia a tu alcance',
    heroTitle: 'Todo lo que buscás, en un solo lugar',
    heroDescription: 'Descubrí nuestra selección de sahumerios, aromatización, velas, bienestar, decoración y mucho más con atención personalizada por WhatsApp.',
    heroImage: '',
    
    // LocalStorage keys
    STORAGE_PRODUCTS: 'rb_products',
    STORAGE_CART: 'rb_cart',
    STORAGE_ORDERS: 'rb_orders',
    STORAGE_CONFIG: 'rb_config',
};

window.CONFIG = CONFIG;

// Función para cargar configuración desde localStorage
function loadConfig() {
    const saved = localStorage.getItem(CONFIG.STORAGE_CONFIG);
    if (saved) {
        const customConfig = JSON.parse(saved);
        Object.assign(CONFIG, customConfig);
    }
}

// Función para guardar configuración en localStorage
function saveConfig() {
    localStorage.setItem(CONFIG.STORAGE_CONFIG, JSON.stringify({
        storeName: CONFIG.storeName,
        storeDescription: CONFIG.storeDescription,
        whatsappNumber: CONFIG.whatsappNumber,
        instagramUsername: CONFIG.instagramUsername,
        storeAddress: CONFIG.storeAddress,
        storeHours: CONFIG.storeHours,
        heroEyebrow: CONFIG.heroEyebrow,
        heroTitle: CONFIG.heroTitle,
        heroDescription: CONFIG.heroDescription,
        heroImage: CONFIG.heroImage,
    }));
}

function updatePublicHero() {
    const eyebrow = document.querySelector('.hero-subtitle');
    const title = document.querySelector('.hero-title');
    const description = document.querySelector('.hero-description');
    if (eyebrow) eyebrow.textContent = CONFIG.heroEyebrow || '';
    if (title) title.textContent = CONFIG.heroTitle || '';
    if (description) description.textContent = CONFIG.heroDescription || '';
    const hero = document.querySelector('.hero-banner');
    if (hero) {
        const publicHeroImage = new URL('HEADER PRINCIPAL.png', document.baseURI).href;
        hero.style.setProperty('--hero-image', `url("${publicHeroImage}")`);
        hero.classList.add('has-hero-image');
    }
}

window.saveConfig = saveConfig;
window.updatePublicHero = updatePublicHero;

// Función para formatear precios con separadores de miles
function formatPrice(price) {
    const num = Number(price) || 0;
    return num.toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

// Función global para mostrar notificaciones Toast
function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast hidden';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    // Clear previous timeout if any
    if (window._toastTimeout) {
        clearTimeout(window._toastTimeout);
    }
    
    window._toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Cargar configuración al iniciar
loadConfig();
document.addEventListener('DOMContentLoaded', updatePublicHero);


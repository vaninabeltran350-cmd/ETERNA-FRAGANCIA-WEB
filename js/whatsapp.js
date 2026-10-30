// ==========================================
// INTEGRACIÓN CON WHATSAPP
// ==========================================

// Generar mensaje de pedido
function generateOrderMessage(cartItems, paymentMethod, customerData = {}) {
    let message = `Hola! Me interesa realizar el siguiente pedido:\n\n`;
    
    cartItems.forEach(item => {
        const itemPrice = Number(item.precio) || 0;
        const itemQty = Number(item.cantidad) || 1;
        const subtotal = itemPrice * itemQty;
        const aromaText = item.aroma ? ` — Aroma: ${item.aroma}` : '';
        message += `- ${item.nombre}${aromaText} x${itemQty} — $${formatPrice(subtotal)}\n`;
    });
    
    const total = cartItems.reduce((sum, item) => sum + ((Number(item.precio) || 0) * (Number(item.cantidad) || 1)), 0);
    
    message += `\nTotal: $${formatPrice(total)}\n\n`;
    message += `Medio de pago: ${paymentMethod === 'transferencia' ? 'Transferencia.' : 'Efectivo.'}\n`;

    if (customerData && typeof customerData === 'object' && customerData.name) {
        message += `Cliente: ${customerData.name}\n`;
    }
    
    message += `\nQuisiera consultar disponibilidad. ¡Gracias!`;
    
    return message;
}

// Generar enlace de WhatsApp
function generateWhatsAppLink(message) {
    const phoneNumber = normalizeWhatsAppNumber(CONFIG.whatsappNumber);
    if (!phoneNumber) return null;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

function generateCartWhatsAppMessage(cartItems) {
    let message = 'Hola! Me interesa realizar el siguiente pedido:\n\n';

    cartItems.forEach((item) => {
        const quantity = Number(item.cantidad) || 0;
        const unitPrice = Number(item.precio) || 0;
        const aromaText = item.aroma ? ` — Aroma: ${item.aroma}` : '';
        message += `- ${item.nombre}${aromaText} x${quantity} — $${formatPrice(unitPrice * quantity)}\n`;
    });

    message += `\nTotal: $${formatPrice(cartItems.reduce(
        (sum, item) => sum + ((Number(item.precio) || 0) * (Number(item.cantidad) || 0)),
        0,
    ))}\n\n`;
    message += 'Quisiera consultar disponibilidad. ¡Gracias!';
    return message;
}

function sendCartToWhatsApp(cartItems) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        showToast('El carrito está vacío.', 'warning');
        return false;
    }

    return openWhatsAppChat(generateCartWhatsAppMessage(cartItems));
}

function normalizeWhatsAppNumber(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

function createOrderKey() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Abrir WhatsApp con mensaje
function openWhatsAppChat(message) {
    const link = generateWhatsAppLink(message);
    if (!link) {
        showToast('El número de WhatsApp configurado no es válido.', 'error');
        return false;
    }
    try {
        const popup = window.open(link, '_blank', 'noopener,noreferrer');
        if (popup) return true;
    } catch (error) {
        console.warn('No se pudo abrir WhatsApp automáticamente:', error);
    }

    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = '';
        const messageEl = document.createElement('span');
        messageEl.textContent = 'WhatsApp fue bloqueado. ';
        const linkEl = document.createElement('a');
        linkEl.href = link;
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
        linkEl.textContent = 'Abrir el pedido manualmente';
        toast.append(messageEl, linkEl);
        toast.className = 'toast warning';
        toast.classList.remove('hidden');
        if (window._toastTimeout) clearTimeout(window._toastTimeout);
        window._toastTimeout = setTimeout(() => toast.classList.add('hidden'), 6000);
    } else {
        showToast('WhatsApp fue bloqueado. Permití ventanas emergentes y volvé a intentarlo.', 'warning');
    }
    return false;
}

function createOrderRecord(cartItems, paymentMethod, customerData) {
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem(CONFIG.STORAGE_ORDERS) || '[]');
        if (!Array.isArray(orders)) orders = [];
    } catch (error) {
        console.warn('No se pudo leer el historial local; se continúa con Supabase:', error);
    }
    const newOrderId = Math.max(...orders.map(o => o.id || 0), 1000) + 1;
    return {
        id: newOrderId,
        orderKey: createOrderKey(),
        fecha: new Date().toISOString(),
        cliente: {
            nombre: customerData.name,
            email: customerData.email,
            telefono: customerData.phone,
        },
        items: cartItems,
        subtotal: cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
        total: cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
        metodoPago: paymentMethod,
        notas: customerData.notes || '',
        estado: 'pendiente',
    };
}

// Copia local de compatibilidad; la fuente de verdad es Supabase.
function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem(CONFIG.STORAGE_ORDERS) || '[]');
    orders.push(order);
    localStorage.setItem(CONFIG.STORAGE_ORDERS, JSON.stringify(orders));
    return order;
}

// Procesar checkout
async function processCheckout(cartItems, paymentMethod, customerData) {
    if (!cartItems || cartItems.length === 0) {
        showToast('El carrito está vacío', 'error');
        return { persisted: false, whatsappOpened: false };
    }
    
    if (!customerData.name || !customerData.email || !customerData.phone) {
        showToast('Por favor completa todos tus datos', 'error');
        return { persisted: false, whatsappOpened: false };
    }
    
    const order = createOrderRecord(cartItems, paymentMethod, customerData);

    try {
        const { createSupabaseOrder } = await import('./supabase-products.js');
        const persistedOrder = await createSupabaseOrder({
            orderKey: order.orderKey,
            items: cartItems,
            customerName: customerData.name,
            customerEmail: customerData.email,
            customerPhone: customerData.phone,
            paymentMethod,
            notes: customerData.notes || '',
        });
        order.id = persistedOrder.id;
        order.subtotal = persistedOrder.subtotal;
        order.total = persistedOrder.total;
    } catch (error) {
        console.error('Error persistiendo pedido en Supabase:', {
            code: error?.code ?? null,
            message: error?.message ?? null,
            details: error?.details ?? null,
            hint: error?.hint ?? null,
            status: error?.status ?? null,
        });
        showToast(error?.message || 'No se pudo registrar el pedido en Supabase.', 'error');
        return { persisted: false, whatsappOpened: false };
    }

    try {
        saveOrder(order);
    } catch (error) {
        console.warn('El pedido ya fue guardado en Supabase, pero no se pudo guardar la copia local:', error);
    }
    
    // Generar mensaje
    const message = generateOrderMessage(cartItems, paymentMethod, customerData);
    
    // Guardar en sessionStorage para mostrar confirmación
    try {
        sessionStorage.setItem('lastOrder', JSON.stringify(order));
    } catch (error) {
        console.warn('El pedido ya fue guardado en Supabase, pero no se pudo guardar la sesión local:', error);
    }
    
    // Abrir WhatsApp
    const whatsappOpened = openWhatsAppChat(message);
    
    return { persisted: true, whatsappOpened };
}

// Actualizar links del footer
function updateFooterLinks() {
    const whatsappLink = document.getElementById('footerWhatsApp');
    const instagramLink = document.getElementById('footerInstagram');
    
    if (whatsappLink) {
        const link = generateWhatsAppLink('Hola, tengo una consulta sobre R&B.');
        if (!link) return;
        whatsappLink.href = link;
        whatsappLink.target = '_blank';
    }
    
    if (instagramLink) {
        instagramLink.href = `https://instagram.com/${CONFIG.instagramUsername.replace('@', '')}`;
        instagramLink.target = '_blank';
    }
}

// Actualizar datos del footer
function updateFooterData() {
    const addressEl = document.getElementById('footerAddress');
    const hoursEl = document.getElementById('footerHours');
    
    if (addressEl) {
        addressEl.textContent = CONFIG.storeAddress;
    }
    
    if (hoursEl) {
        hoursEl.textContent = CONFIG.storeHours;
    }
    
    updateFooterLinks();
}

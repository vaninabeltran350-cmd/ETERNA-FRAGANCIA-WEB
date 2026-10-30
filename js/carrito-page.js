// ==========================================
// FUNCIONALIDAD DE LA PÁGINA DEL CARRITO
// ==========================================

async function initCartPage() {
    try {
        await loadProducts();
    } catch (error) {
        console.error('Error cargando productos en la página del carrito:', error);
        showToast(error.message || 'No se pudieron cargar los productos desde Supabase.', 'error');
    }
    displayCartItems();
    updateSummary();
    setupCheckout();
    
    // Escuchar eventos de actualización del carrito
    window.addEventListener('cartUpdated', () => {
        displayCartItems();
        updateSummary();
    });
}

// Mostrar items del carrito
function displayCartItems() {
    const cartItemsDiv = document.getElementById('cartItems');
    const emptyMessage = document.getElementById('emptyCartMessage');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartItemsDiv) return;
    
    const items = getCart();
    
    if (items.length === 0) {
        cartItemsDiv.innerHTML = '';
        if (emptyMessage) emptyMessage.classList.remove('hidden');
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    if (emptyMessage) emptyMessage.classList.add('hidden');
    if (cartSummary) cartSummary.style.display = 'block';
    
    const fallbackImg = getOptimizedImageUrl('', 300, 300);
    
    cartItemsDiv.innerHTML = items.map(item => {
        const itemSubtotal = (Number(item.precio) || 0) * (Number(item.cantidad) || 1);
        return `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-img-wrap">
                    <img src="${getOptimizedImageUrl(item.imagen, 300, 300)}" 
                         alt="${item.nombre}" 
                         class="cart-item-image"
                         width="300"
                         height="300"
                         decoding="async"
                         onerror="this.onerror=null; this.src='${fallbackImg}';">
                </div>
                
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.nombre}</h3>
                    <span class="cart-item-category">${item.categoria || 'General'}</span>
                    ${item.aroma ? `<span class="cart-item-category">Aroma: ${item.aroma}</span>` : ''}
                    <span class="cart-item-price">$${formatPrice(item.precio)} c/u</span>
                </div>
                
                <div class="cart-item-actions">
                    <div class="cart-item-subtotal-block">
                        <span class="subtotal-label">Subtotal:</span>
                        <span class="cart-item-subtotal">$${formatPrice(itemSubtotal)}</span>
                    </div>
                    
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="decreaseQuantity(${item.id}, ${item.variantId ?? 'null'}); updateCartDisplay()" title="Disminuir">−</button>
                        <span class="quantity-value">${item.cantidad}</span>
                        <button class="quantity-btn" onclick="increaseQuantity(${item.id}, ${item.variantId ?? 'null'}); updateCartDisplay()" title="Aumentar">+</button>
                    </div>
                    
                    <button class="btn-remove" onclick="removeFromCart(${item.id}, ${item.variantId ?? 'null'}); updateCartDisplay()" title="Eliminar producto">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Actualizar resumen de compra
function updateSummary() {
    const totalEl = document.getElementById('total');
    if (totalEl) totalEl.textContent = `$${formatPrice(getCartTotal())}`;
}

// Actualizar display del carrito en pantalla
function updateCartDisplay() {
    displayCartItems();
    updateSummary();
    updateCartCount();
}

// Configurar checkout
function setupCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', performCheckout);
}

// Abrir WhatsApp con el pedido preparado; el pedido no se registra ni se vacía el carrito.
function performCheckout() {
    const cartItems = getCart();
    
    if (cartItems.length === 0) {
        showToast('Tu carrito está vacío. Agrega productos para continuar.', 'warning');
        return;
    }
    sendCartToWhatsApp(cartItems);
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initCartPage();
});

// ==========================================
// GESTIÓN DEL CARRITO
// ==========================================

let cart = [];

// Cargar carrito desde localStorage
function loadCart() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_CART);
        cart = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(cart)) cart = [];
    } catch (e) {
        console.error('Error cargando carrito desde localStorage:', e);
        cart = [];
    }
    updateCartCount();
    return cart;
}

// Guardar carrito en localStorage y emitir actualización
function saveCart() {
    localStorage.setItem(CONFIG.STORAGE_CART, JSON.stringify(cart));
    updateCartCount();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
}

// Agregar producto al carrito
function findCartItem(productId, variantId = null) {
    const numId = Number(productId);
    const normalizedVariantId = variantId === null || variantId === undefined || variantId === '' ? null : Number(variantId);
    return cart.findIndex((item) => Number(item.id) === numId && (item.variantId ?? null) === normalizedVariantId);
}

function addToCart(productId, selectedVariant = null) {
    const numId = Number(productId);
    
    if (!productsData || productsData.length === 0) {
        showToast('No hay productos disponibles para agregar al carrito.', 'error');
        return;
    }
    
    const product = getProductById(numId);
    
    if (!product) {
        showToast('Producto no encontrado', 'error');
        return;
    }
    
    const hasVariants = Array.isArray(product.variantes) && product.variantes.length > 0;
    let variant = null;
    if (hasVariants) {
        const selectedVariantId = selectedVariant?.id ?? selectedVariant?.variantId;
        variant = product.variantes.find((item) => Number(item.id) === Number(selectedVariantId));
        if (!variant) {
            showToast('Seleccioná un aroma antes de agregar el producto.', 'warning');
            return;
        }
    }
    const availableStock = variant ? Number(variant.stock) : Number(product.stock);
    if (product.estado !== 'disponible' || availableStock <= 0) {
        showToast('Producto no disponible o sin stock', 'error');
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const existingIndex = findCartItem(numId, variant?.id ?? null);
    
    if (existingIndex !== -1) {
        const item = cart[existingIndex];
        if (item.cantidad < availableStock) {
            item.cantidad++;
            saveCart();
            showToast(`+1 ${product.nombre} (Total: ${item.cantidad})`, 'success');
        } else {
            showToast(`Alcanzaste el stock disponible (${availableStock} u.)`, 'warning');
            return;
        }
    } else {
        cart.push({
            id: Number(product.id),
            variantId: variant ? Number(variant.id) : null,
            aroma: variant ? variant.aroma : null,
            nombre: product.nombre,
            precio: Number(product.precio),
            categoria: product.categoria,
            imagen: product.imagen,
            cantidad: 1,
            stock: availableStock,
        });
        saveCart();
        showToast(`✓ "${product.nombre}" agregado al carrito`, 'success');
    }
}

// Eliminar producto del carrito
function removeFromCart(productId, variantId = null) {
    const numId = Number(productId);
    const index = findCartItem(numId, variantId);
    if (index !== -1) {
        const item = cart[index];
        cart.splice(index, 1);
        saveCart();
        showToast(`"${item.nombre}" eliminado del carrito`, 'info');
        return true;
    }
    return false;
}

// Aumentar cantidad
function increaseQuantity(productId, variantId = null) {
    const numId = Number(productId);
    const item = cart.find((candidate) => Number(candidate.id) === numId && (candidate.variantId ?? null) === (variantId === null ? null : Number(variantId)));
    if (item) {
        const product = getProductById(numId);
        const variant = product?.variantes?.find((candidate) => Number(candidate.id) === Number(item.variantId));
        const maxStock = variant ? Number(variant.stock) : (product ? Number(product.stock) : (Number(item.stock) || 99));
        
        if (item.cantidad < maxStock) {
            item.cantidad++;
            saveCart();
        } else {
            showToast(`Stock máximo alcanzado (${maxStock} u.)`, 'warning');
        }
    }
}

// Disminuir cantidad
function decreaseQuantity(productId, variantId = null) {
    const numId = Number(productId);
    const item = cart.find((candidate) => Number(candidate.id) === numId && (candidate.variantId ?? null) === (variantId === null ? null : Number(variantId)));
    if (item) {
        if (item.cantidad > 1) {
            item.cantidad--;
            saveCart();
        } else {
            removeFromCart(productId, variantId);
        }
    }
}

// Obtener cantidad total de items en el carrito
function getCartCount() {
    return cart.reduce((total, item) => total + (Number(item.cantidad) || 0), 0);
}

// Obtener total monetario del carrito
function getCartTotal() {
    return cart.reduce((total, item) => total + ((Number(item.precio) || 0) * (Number(item.cantidad) || 0)), 0);
}

// Actualizar todos los contadores de carrito en pantalla
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
    const count = getCartCount();
    cartCountElements.forEach(el => {
        el.textContent = count;
        if (count > 0) {
            el.classList.remove('hidden');
        }
    });
}

// Vaciar carrito
function clearCart() {
    cart = [];
    saveCart();
}

// Obtener copia del carrito
function getCart() {
    return cart;
}

// Cargar carrito inmediatamente al cargar el script
loadCart();


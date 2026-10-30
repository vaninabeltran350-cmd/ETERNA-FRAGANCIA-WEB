// ==========================================
// GESTIÓN DE MODALES
// ==========================================

let currentProductId = null;
let currentProductVariants = [];
let currentModalImages = [];
let currentModalImageIndex = 0;

function getModalProductImages(product) {
    const sources = Array.isArray(product?.imagenes) && product.imagenes.length
        ? product.imagenes
        : [product?.imagen];
    return [...new Set(sources.map((source) => String(source ?? '').trim()).filter(Boolean))];
}

function setModalImage(index) {
    const modalImg = document.getElementById('modalImage');
    const gallery = document.getElementById('modalImageGallery');
    if (!modalImg || !currentModalImages.length) return;
    currentModalImageIndex = ((index % currentModalImages.length) + currentModalImages.length) % currentModalImages.length;
    modalImg.src = getOptimizedImageUrl(currentModalImages[currentModalImageIndex], 500, 500);
    modalImg.onerror = function() {
        this.onerror = null;
        this.src = getOptimizedImageUrl('', 500, 500);
    };
    gallery?.querySelectorAll('.modal-image-dot').forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === currentModalImageIndex);
        dot.setAttribute('aria-current', dotIndex === currentModalImageIndex ? 'true' : 'false');
    });
}

function changeModalImage(direction) {
    setModalImage(currentModalImageIndex + direction);
}

function renderModalImageGallery(product) {
    const gallery = document.getElementById('modalImageGallery');
    if (!gallery) return;
    currentModalImages = getModalProductImages(product);
    currentModalImageIndex = 0;
    if (currentModalImages.length <= 1) {
        gallery.innerHTML = '';
        gallery.classList.add('hidden');
        setModalImage(0);
        return;
    }
    gallery.innerHTML = `
        <button type="button" class="modal-image-control modal-image-control-prev" aria-label="Imagen anterior" onclick="changeModalImage(-1)">‹</button>
        <div class="modal-image-dots">
            ${currentModalImages.map((_, index) => `<button type="button" class="modal-image-dot${index === 0 ? ' active' : ''}" aria-label="Mostrar imagen ${index + 1} de ${currentModalImages.length}" aria-current="${index === 0 ? 'true' : 'false'}" onclick="setModalImage(${index})"></button>`).join('')}
        </div>
        <button type="button" class="modal-image-control modal-image-control-next" aria-label="Imagen siguiente" onclick="changeModalImage(1)">›</button>
    `;
    gallery.classList.remove('hidden');
    setModalImage(0);
}

// Abrir modal de producto
function openProductModal(productId) {
    const product = getProductById(productId);
    
    if (!product) {
        showToast('Producto no encontrado', 'error');
        return;
    }
    
    currentProductId = Number(product.id);
    
    currentProductVariants = Array.isArray(product.variantes) ? product.variantes : [];
    const hasVariants = currentProductVariants.length > 0;
    const isAvailable = product.estado === 'disponible' && product.stock > 0;
    const availabilityClass = isAvailable ? 'available' : 'sold-out';
    const availabilityText = isAvailable ? `✓ Disponible (${product.stock} unidades)` : '✗ Agotado';
    
    const modalImg = document.getElementById('modalImage');
    if (modalImg) modalImg.alt = product.nombre;
    renderModalImageGallery(product);
    
    const modalName = document.getElementById('modalName');
    if (modalName) modalName.textContent = product.nombre;
    
    const modalCategory = document.getElementById('modalCategory');
    if (modalCategory) modalCategory.textContent = product.categoria;
    
    const modalPrice = document.getElementById('modalPrice');
    if (modalPrice) modalPrice.textContent = `$${formatPrice(product.precio)}`;
    
    const modalAvailability = document.getElementById('modalAvailability');
    if (modalAvailability) {
        modalAvailability.textContent = availabilityText;
        modalAvailability.className = `modal-availability ${availabilityClass}`;
    }
    
    const modalDescription = document.getElementById('modalDescription');
    if (modalDescription) {
        modalDescription.textContent = product.descripcion || '';
    }

    const modalVariants = document.getElementById('modalVariants');
    if (modalVariants) {
        if (hasVariants) {
            modalVariants.classList.remove('hidden');
            modalVariants.innerHTML = `
                <label for="modalVariantSelect">Elegí un aroma</label>
                <select id="modalVariantSelect" class="form-input">
                    <option value="">Seleccioná un aroma</option>
                    ${currentProductVariants.map((variant) => `<option value="${variant.id}" ${variant.stock <= 0 ? 'disabled' : ''}>${variant.aroma}${variant.stock <= 0 ? ' — Agotado' : ` — ${variant.stock} disponibles`}</option>`).join('')}
                </select>
            `;
        } else {
            modalVariants.classList.add('hidden');
            modalVariants.innerHTML = '';
        }
    }
    
    const modalAddBtn = document.getElementById('modalAddBtn');
    if (modalAddBtn) {
        if (isAvailable && !hasVariants) {
            modalAddBtn.disabled = false;
            modalAddBtn.innerHTML = 'Agregar al carrito';
        } else if (isAvailable && hasVariants) {
            modalAddBtn.disabled = true;
            modalAddBtn.innerHTML = 'Seleccioná un aroma';
        } else {
            modalAddBtn.disabled = true;
            modalAddBtn.innerHTML = 'No disponible';
        }
    }

    const variantSelect = document.getElementById('modalVariantSelect');
    if (variantSelect && modalAddBtn) {
        variantSelect.addEventListener('change', () => {
            const selected = currentProductVariants.find((variant) => Number(variant.id) === Number(variantSelect.value));
            modalAddBtn.disabled = !selected || selected.stock <= 0;
            modalAddBtn.innerHTML = selected && selected.stock > 0 ? 'Agregar al carrito' : 'Seleccioná un aroma';
        });
    }
    
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

// Cerrar modal de producto
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    currentProductId = null;
    currentProductVariants = [];
    currentModalImages = [];
    currentModalImageIndex = 0;
}

// Agregar al carrito desde el modal
function addFromModal() {
    if (currentProductId !== null) {
        const variantSelect = document.getElementById('modalVariantSelect');
        const selectedVariant = currentProductVariants.find((variant) => Number(variant.id) === Number(variantSelect?.value));
        if (currentProductVariants.length && !selectedVariant) {
            showToast('Seleccioná un aroma antes de agregar el producto.', 'warning');
            return;
        }
        addToCart(currentProductId, selectedVariant);
        closeProductModal();
    }
}

// Cerrar modal de pedidos
function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Abrir modal de detalles de pedido (Dashboard)
function openOrderModal(orderId) {
    const orders = Array.isArray(window.supabaseOrders) ? window.supabaseOrders : [];
    const order = orders.find(o => Number(o.id) === Number(orderId));
    
    if (!order) {
        showToast('Pedido no encontrado', 'error');
        return;
    }
    
    let itemsHTML = '';
    (order.items || []).forEach(item => {
        const itemTotal = (Number(item.precio) || 0) * (Number(item.cantidad) || 1);
        const canModifyItems = ['pendiente', 'cancelado'].includes(order.estado);
        const removeButton = canModifyItems && item.itemId
            ? `<button type="button" class="btn-delete order-item-remove" onclick="removeOrderItem(${order.id}, ${item.itemId})">Eliminar</button>`
            : '';
        itemsHTML += `
            <div class="order-item">
                <div class="order-item-details">
                    <div class="order-item-name">${item.nombre}${item.aroma ? ` — Aroma: ${item.aroma}` : ''}</div>
                    <div class="order-item-qty">Cantidad: ${item.cantidad} × $${formatPrice(item.precio)}</div>
                </div>
                <div class="order-item-price">$${formatPrice(itemTotal)}</div>
                ${removeButton}
            </div>
        `;
    });
    
    const statusBadge = `<span class="status-badge ${order.estado}">${order.estado}</span>`;
    
    const modalContent = `
        <h2>Pedido #${order.id}</h2>
        <div class="order-details">
            <div class="detail-group">
                <h3>Información General</h3>
                <div class="detail-item">
                    <span class="detail-label">Fecha:</span>
                    <span class="detail-value">${new Date(order.fecha).toLocaleString('es-AR')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Estado:</span>
                    <span class="detail-value">${statusBadge}</span>
                </div>
            </div>
            
            <div class="detail-group">
                <h3>Cliente</h3>
                <div class="detail-item">
                    <span class="detail-label">Nombre:</span>
                    <span class="detail-value">${order.cliente?.nombre || 'No informado'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${order.cliente?.email || 'No informado'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Teléfono:</span>
                    <span class="detail-value">${order.cliente?.telefono || 'No informado'}</span>
                </div>
            </div>
            
            <div class="order-items-list">
                <h3 style="margin-bottom: 1rem;">Productos Solicitados</h3>
                ${itemsHTML || '<p>Sin productos registrados</p>'}
                ${!['pendiente', 'cancelado'].includes(order.estado) ? '<p class="order-items-note">Este pedido no se puede modificar porque su estado actual no lo permite.</p>' : ''}
            </div>
            
            <div class="detail-group">
                <h3>Resumen</h3>
                <div class="detail-item">
                    <span class="detail-label">Subtotal:</span>
                    <span class="detail-value">$${formatPrice(order.subtotal || order.total)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total:</span>
                    <span class="detail-value">$${formatPrice(order.total)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Medio de pago:</span>
                    <span class="detail-value">${order.metodoPago === 'transferencia' ? 'Transferencia bancaria' : 'Pago en efectivo'}</span>
                </div>
            </div>
            
            ${order.notas ? `<div class="detail-group">
                <h3>Notas del Cliente</h3>
                <p>${order.notas}</p>
            </div>` : ''}
            
            <div class="modal-actions">
                <select class="status-select" id="statusSelect" onchange="updateOrderStatus('${order.id}', this.value)">
                    <option value="">Cambiar estado actual...</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="preparando">Preparando</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
                <button class="btn-cancel-modal" onclick="closeOrderModal()">Cerrar</button>
            </div>
        </div>
    `;
    
    const contentEl = document.getElementById('orderModalContent');
    const orderModal = document.getElementById('orderModal');
    if (contentEl) contentEl.innerHTML = modalContent;
    if (orderModal) {
        orderModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

async function removeOrderItem(orderId, itemId) {
    const orders = Array.isArray(window.supabaseOrders) ? window.supabaseOrders : [];
    const order = orders.find(o => Number(o.id) === Number(orderId));
    if (!order) return;

    if (!['pendiente', 'cancelado'].includes(order.estado)) {
        showToast('Este pedido no se puede modificar en su estado actual.', 'error');
        return;
    }

    if (!window.confirm('¿Querés eliminar este producto del pedido?')) return;

    try {
        const { removeSupabaseOrderItem } = await import('./supabase-products.js');
        const result = await removeSupabaseOrderItem(order.id, itemId);
        await displayOrders();
        if (result?.order_deleted) {
            closeOrderModal();
            showToast('Producto eliminado y pedido quitado del sistema.', 'success');
        } else {
            showToast('Producto eliminado del pedido.', 'success');
            openOrderModal(order.id);
        }
    } catch (error) {
        console.error('Error eliminando producto del pedido:', {
            code: error?.code ?? null,
            message: error?.message ?? null,
            details: error?.details ?? null,
            hint: error?.hint ?? null,
            status: error?.status ?? null,
        });
        showToast(error?.message || 'No se pudo eliminar el producto del pedido.', 'error');
        openOrderModal(order.id);
    }
}

// Actualizar estado del pedido
async function updateOrderStatus(orderId, newStatus) {
    if (!newStatus) return;

    const orders = Array.isArray(window.supabaseOrders) ? window.supabaseOrders : [];
    const order = orders.find(o => Number(o.id) === Number(orderId));
    
    if (!order) return;

    if (newStatus === 'confirmado' && order.estado !== 'confirmado') {
        try {
            const { confirmSupabaseOrderStock } = await import('./supabase-products.js');
            const result = await confirmSupabaseOrderStock(order.orderKey);
            if (result?.already_confirmed) {
                showToast('Este pedido ya había descontado su stock.', 'info');
            } else {
                showToast('✓ Pedido confirmado y stock actualizado.', 'success');
            }
        } catch (error) {
            console.error('Error confirmando pedido y descontando stock:', {
                code: error?.code ?? null,
                message: error?.message ?? null,
                details: error?.details ?? null,
                hint: error?.hint ?? null,
                status: error?.status ?? null,
            });
            showToast(error?.message || 'No se pudo confirmar el pedido ni descontar el stock.', 'error');
            openOrderModal(orderId);
            return;
        }
    } else if (newStatus !== 'confirmado' && order.estado !== newStatus) {
        try {
            const { updateSupabaseOrderStatus } = await import('./supabase-products.js');
            await updateSupabaseOrderStatus(order.orderKey, newStatus);
        } catch (error) {
            console.error('Error actualizando el estado del pedido:', error);
            showToast(error?.message || 'No se pudo actualizar el estado del pedido.', 'error');
            openOrderModal(orderId);
            return;
        }
    }

    order.estado = newStatus;
    if (newStatus !== 'confirmado') showToast(`Estado actualizado a: ${newStatus}`, 'success');
    openOrderModal(orderId);
    if (typeof displayOrders === 'function') await displayOrders();
}

// Event listeners para modales
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modal al hacer click en X
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    // Cerrar modal al hacer click fuera
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
    
    const orderModal = document.getElementById('orderModal');
    if (orderModal) {
        orderModal.addEventListener('click', function(e) {
            if (e.target === orderModal) {
                closeOrderModal();
            }
        });
    }
    
    // Agregar al carrito desde modal
    const modalAddBtn = document.getElementById('modalAddBtn');
    if (modalAddBtn) {
        modalAddBtn.addEventListener('click', addFromModal);
    }
    
    // Cerrar con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
            closeOrderModal();
        }
    });
});


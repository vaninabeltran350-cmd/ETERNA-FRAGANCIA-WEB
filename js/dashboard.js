// ==========================================
// DASHBOARD ADMINISTRATIVO
// ==========================================

// Variables globales del dashboard
let editingProductId = null;
let currentImageBase64 = '';
let currentImageBlobs = [];
let currentImagePreviewUrls = [];
let currentImageUrls = [];
let currentImageFileKeys = new Set();
let imagesDirty = false;
let supabaseOrders = [];

function getProductVariantsFromForm() {
    const rows = [...document.querySelectorAll('#productVariantsList .product-variant-row')];
    const seen = new Set();
    return rows.map((row) => {
        const aroma = row.querySelector('.variant-aroma')?.value.trim() || '';
        const stockText = row.querySelector('.variant-stock')?.value.trim() || '';
        const stock = Number(stockText);
        const id = row.dataset.variantId ? Number(row.dataset.variantId) : null;
        const key = aroma.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (!aroma) throw new Error('Cada variante debe tener un aroma.');
        if (seen.has(key)) throw new Error('No puede haber aromas repetidos en un producto.');
        if (!/^\d+$/.test(stockText) || !Number.isInteger(stock) || stock < 0) throw new Error(`El stock de "${aroma}" debe ser un número entero mayor o igual a cero.`);
        seen.add(key);
        return { id, aroma, stock };
    });
}

function updateVariantSummary() {
    const rows = document.querySelectorAll('#productVariantsList .product-variant-row');
    const stockInput = document.getElementById('productStock');
    const statusInput = document.getElementById('productStatus');
    const hasVariants = rows.length > 0;
    const totalStock = [...rows].reduce((sum, row) => sum + (Number(row.querySelector('.variant-stock')?.value) || 0), 0);
    if (stockInput) {
        stockInput.readOnly = hasVariants;
        if (hasVariants) stockInput.value = totalStock;
    }
    if (statusInput) {
        statusInput.disabled = hasVariants;
        if (hasVariants) statusInput.value = totalStock > 0 ? 'disponible' : 'agotado';
    }
}

function renderProductVariants(variants = []) {
    const list = document.getElementById('productVariantsList');
    if (!list) return;
    list.innerHTML = variants.map((variant) => `
        <div class="product-variant-row" data-variant-id="${variant.id || ''}" style="display:flex;gap:.5rem;align-items:center;margin-bottom:.5rem;">
            <input type="text" class="form-input variant-aroma" placeholder="Aroma" value="${variant.aroma || ''}" required>
            <input type="number" class="form-input variant-stock" placeholder="Stock" min="0" step="1" value="${Number(variant.stock) || 0}" required>
            <button type="button" class="btn-delete remove-product-variant" title="Quitar aroma">Quitar</button>
        </div>
    `).join('');
    updateVariantSummary();
}

// Inicializar dashboard
async function initDashboard() {
    const authenticated = await checkAdminLogin();
    if (!authenticated) return;
    if (window.supabaseConfigReady) await window.supabaseConfigReady;
    initDashboardTheme();
    setupSidebar();
    loadDashboardData();
    setupProductForm();
    setupConfigForm();
    updateFooterData();
}

// Inicializar Modo Oscuro / Claro
function initDashboardTheme() {
    const savedTheme = localStorage.getItem('polirrubro-theme') || localStorage.getItem('rb_dashboard_theme') || 'light';
    applyDashboardTheme(savedTheme);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleDashboardTheme);
    }

    const sidebarThemeToggle = document.getElementById('sidebarThemeToggle');
    if (sidebarThemeToggle) {
        sidebarThemeToggle.addEventListener('click', toggleDashboardTheme);
    }
}

// Alternar entre modo oscuro y claro
function toggleDashboardTheme() {
    const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyDashboardTheme(newTheme);
    localStorage.setItem('polirrubro-theme', newTheme);
    showToast(`Modo ${newTheme === 'dark' ? 'Oscuro' : 'Claro'} activado`, 'info');
}

// Aplicar tema en el DOM
function applyDashboardTheme(theme) {
    const isDark = theme === 'dark';
    if (isDark) {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.removeAttribute('data-theme');
    }

    // Actualizar iconos y textos en header y sidebar
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');
    const sidebarThemeIcon = document.getElementById('sidebarThemeIcon');
    const sidebarThemeLabel = document.getElementById('sidebarThemeLabel');

    if (themeToggleBtn) {
        const actionLabel = isDark ? 'Activar modo claro' : 'Activar modo oscuro';
        themeToggleBtn.classList.toggle('is-dark', isDark);
        themeToggleBtn.setAttribute('aria-label', actionLabel);
        themeToggleBtn.title = actionLabel;
    }
    if (themeIcon) themeIcon.classList.toggle('is-dark', isDark);
    if (themeLabel) themeLabel.textContent = isDark ? 'Activar modo claro' : 'Activar modo oscuro';
    if (sidebarThemeIcon) sidebarThemeIcon.textContent = '';
    if (sidebarThemeLabel) sidebarThemeLabel.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
}

// Setup del sidebar
function setupSidebar() {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn:not(#sidebarThemeToggle):not(#sidebarLogout)');
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            if (section) {
                switchSection(section);
            }
        });
    });
}

// Cambiar sección del dashboard
function switchSection(sectionName) {
    const sections = document.querySelectorAll('.dashboard-section');
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    sidebarBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionName) {
            btn.classList.add('active');
        }
    });
    
    // Si cambiamos a 'agregar' sin estar editando, resetear formulario a nuevo
    if (sectionName === 'agregar' && !editingProductId) {
        resetProductForm();
    }
    
    const targetId = `seccion${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`;
    const sectionElement = document.getElementById(targetId);
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
}

// Cargar datos del dashboard
async function loadDashboardData() {
    try {
        await loadProducts();
    } catch (error) {
        const originalError = error?.cause || error;
        console.error('Error cargando productos para el dashboard:', {
            code: originalError?.code ?? null,
            message: originalError?.message ?? error?.message ?? null,
            details: originalError?.details ?? null,
            hint: originalError?.hint ?? null,
            status: originalError?.status ?? null,
        });
        showToast(error.message || 'No se pudieron cargar los productos desde Supabase.', 'error');
    }
    await displayOrders();
    displayStats();
    displayProducts();
    loadConfigForm();
}

// Mostrar estadísticas (Productos, Disponibles, Agotados, Pedidos)
function displayStats() {
    const totalProducts = productsData.length;
    const availableProducts = productsData.filter(p => p.estado === 'disponible' && p.stock > 0).length;
    const outOfStockProducts = productsData.filter(p => p.estado === 'agotado' || p.stock <= 0).length;
    
    const totalOrders = supabaseOrders.length;
    
    const totalProductsEl = document.getElementById('totalProducts');
    const availableProductsEl = document.getElementById('availableProducts');
    const outOfStockProductsEl = document.getElementById('outOfStockProducts');
    const totalOrdersEl = document.getElementById('totalOrders');
    
    if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    if (availableProductsEl) availableProductsEl.textContent = availableProducts;
    if (outOfStockProductsEl) outOfStockProductsEl.textContent = outOfStockProducts;
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
}

// Mostrar productos en la tabla
function displayProducts() {
    const tableBody = document.getElementById('productsTableBody');
    const noProductsMsg = document.getElementById('noProducts');
    
    if (!tableBody) return;
    
    if (productsData.length === 0) {
        tableBody.innerHTML = '';
        if (noProductsMsg) noProductsMsg.classList.remove('hidden');
        return;
    }
    
    if (noProductsMsg) noProductsMsg.classList.add('hidden');
    
    const fallbackImg = getOptimizedImageUrl('', 200, 200);
    
    tableBody.innerHTML = productsData.map(product => `
        <tr data-id="${product.id}">
            <td>
                <img src="${getOptimizedImageUrl(product.imagen, 200, 200)}" 
                     alt="${product.nombre}" 
                     class="product-image-small"
                     width="50"
                     height="50"
                     loading="lazy"
                     decoding="async"
                     onerror="this.onerror=null; this.src='${fallbackImg}';">
            </td>
            <td>
                <strong>${product.nombre}</strong>
                ${product.destacado ? '<span class="badge-mini-gold">Destacado</span>' : ''}
            </td>
            <td style="text-transform: capitalize;">${product.categoria}</td>
            <td><strong>$${formatPrice(product.precio)}</strong></td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${product.estado}">${product.estado === 'disponible' ? 'Disponible' : 'Agotado'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="editProduct(${product.id})" title="Editar producto">Editar</button>
                    <button class="btn-delete" onclick="confirmDelete(${product.id})" title="Eliminar producto">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    setupProductSearch();
}

// Búsqueda de productos en la tabla administrativa
function setupProductSearch() {
    const searchInput = document.getElementById('searchProducts');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        filterProductsTable(this.value);
    });
}

// Filtrar tabla de productos
function filterProductsTable(query) {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;
    const rows = tableBody.querySelectorAll('tr');
    
    query = (query || '').toLowerCase().trim();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

// Helper: comprimir y redimensionar imagen en Canvas como Blob WebP.
function resizeImage(file, maxWidth = 600, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('No se pudo generar el Blob WebP.'));
                        return;
                    }
                    resolve(blob);
                }, 'image/webp', quality);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// Actualizar vista previa de imagen
function updateImagePreview(src) {
    const previewContainer = document.getElementById('imagePreview');
    const previewError = document.getElementById('previewError');
    if (!previewContainer) return;

    const sources = Array.isArray(src) ? src.filter(Boolean) : (src ? [src] : []);
    previewContainer.innerHTML = '';
    if (!sources.length) {
        previewContainer.classList.add('hidden');
        if (previewError) previewError.classList.add('hidden');
        return;
    }

    if (previewError) previewError.classList.add('hidden');
    sources.forEach((source, index) => {
        const previewImg = document.createElement('img');
        previewImg.src = source;
        previewImg.alt = `Vista previa ${index + 1} de ${sources.length}`;
        previewImg.addEventListener('error', () => {
            previewImg.remove();
            if (!previewContainer.querySelector('img') && previewError) {
                previewError.textContent = '⚠️ No se pudo cargar ninguna imagen.';
                previewError.classList.remove('hidden');
            }
        });
        previewContainer.appendChild(previewImg);
    });
    previewContainer.classList.remove('hidden');
}

// Resetear formulario de producto
function resetProductForm() {
    editingProductId = null;
    currentImageBase64 = '';
    currentImageBlobs = [];
    currentImageUrls = [];
    currentImageFileKeys = new Set();
    imagesDirty = false;
    currentImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    currentImagePreviewUrls = [];
    
    const form = document.getElementById('productForm');
    if (form) form.reset();
    renderProductVariants([]);
    
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'Agregar Nuevo Producto';
    
    const previewContainer = document.getElementById('imagePreview');
    if (previewContainer) previewContainer.classList.add('hidden');
    
    const previewError = document.getElementById('previewError');
    if (previewError) previewError.classList.add('hidden');
}

// Editar producto
function editProduct(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    editingProductId = Number(productId);
    currentImageBase64 = product.imagen || '';
    currentImageBlobs = [];
    currentImageUrls = Array.isArray(product.imagenes) && product.imagenes.length
        ? [...product.imagenes]
        : (product.imagen ? [product.imagen] : []);
    currentImageFileKeys = new Set();
    imagesDirty = false;
    currentImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    currentImagePreviewUrls = [];
    
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = `Editar Producto: ${product.nombre}`;
    
    document.getElementById('productName').value = product.nombre;
    document.getElementById('productCategory').value = product.categoria;
    document.getElementById('productPrice').value = product.precio;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.descripcion || '';
    
    // Si la imagen es URL web tradicional, poblar input de URL
    const urlInput = document.getElementById('productImageUrl');
    if (urlInput) {
        urlInput.value = currentImageUrls.join('\n');
    }
    
    // Limpiar input file
    const fileInput = document.getElementById('productImageFile');
    if (fileInput) fileInput.value = '';
    
    document.getElementById('productStatus').value = product.estado || 'disponible';
    document.getElementById('productHighlight').checked = Boolean(product.destacado);
    renderProductVariants(product.variantes || []);
    
    updateImagePreview(currentImageUrls);
    
    switchSection('agregar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Confirmar eliminación
function confirmDelete(productId) {
    const product = getProductById(productId);
    const prodName = product ? `"${product.nombre}"` : 'este producto';
    
    if (!confirm(`¿Estás seguro de que deseas eliminar ${prodName}?`)) return;

    (async () => {
        try {
            const { deleteSupabaseProduct } = await import('./supabase-products.js');
            await deleteSupabaseProduct(productId);
            await loadProducts();
            displayStats();
            displayProducts();
            showToast('✓ Producto eliminado de Supabase', 'success');
        } catch (error) {
            console.error('Error eliminando producto en Supabase:', error);
            showToast(error.message || 'No se pudo eliminar el producto en Supabase.', 'error');
        }
    })();
}

// Setup formulario de producto con selector DUAL (Archivo Local / URL)
function setupProductForm() {
    const form = document.getElementById('productForm');
    const fileInput = document.getElementById('productImageFile');
    const urlInput = document.getElementById('productImageUrl');
    
    if (!form) return;

    const variantsList = document.getElementById('productVariantsList');
    const addVariantButton = document.getElementById('addProductVariantBtn');
    if (addVariantButton) {
        addVariantButton.addEventListener('click', () => {
            const current = [...(variantsList?.querySelectorAll('.product-variant-row') || [])].map((row) => ({
                id: row.dataset.variantId || null,
                aroma: row.querySelector('.variant-aroma')?.value || '',
                stock: row.querySelector('.variant-stock')?.value || 0,
            }));
            current.push({ id: null, aroma: '', stock: 0 });
            renderProductVariants(current);
        });
    }
    if (variantsList) {
        variantsList.addEventListener('input', updateVariantSummary);
        variantsList.addEventListener('click', (event) => {
            if (!event.target.classList.contains('remove-product-variant')) return;
            event.target.closest('.product-variant-row')?.remove();
            updateVariantSummary();
        });
    }
    
    // 1. Selector de Archivo Local desde la computadora
    if (fileInput) {
        fileInput.addEventListener('change', async function() {
            if (this.files && this.files.length) {
                const files = [...this.files];
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                
                if (files.some((file) => !validTypes.includes(file.type.toLowerCase()))) {
                    showToast('Uno de los archivos no tiene un formato soportado. Usa JPG, PNG o WEBP.', 'error');
                    this.value = '';
                    return;
                }
                
                try {
                    const newFiles = files.filter((file) => {
                        const key = `${file.name}|${file.size}|${file.lastModified}`;
                        if (currentImageFileKeys.has(key)) return false;
                        currentImageFileKeys.add(key);
                        return true;
                    });
                    if (!newFiles.length) {
                        this.value = '';
                        showToast('Esas imágenes ya fueron seleccionadas.', 'info');
                        return;
                    }

                    showToast('Procesando imágenes...', 'info');
                    const optimizedBlobs = await Promise.all(newFiles.map((file) => resizeImage(file, 600, 600, 0.82)));
                    currentImageBlobs = [...currentImageBlobs, ...optimizedBlobs];
                    imagesDirty = true;
                    currentImageBase64 = '';
                    const newPreviewUrls = optimizedBlobs.map((blob) => URL.createObjectURL(blob));
                    currentImagePreviewUrls = [...currentImagePreviewUrls, ...newPreviewUrls];
                    updateImagePreview([...currentImageUrls, ...currentImagePreviewUrls]);
                    this.value = '';
                    showToast(`✓ ${newFiles.length} imagen${newFiles.length === 1 ? '' : 'es'} agregada${newFiles.length === 1 ? '' : 's'}`, 'success');
                } catch (error) {
                    console.error('Error al procesar imagen:', error);
                    showToast('Error al leer la imagen del dispositivo', 'error');
                }
            }
        });
    }
    
    // 2. Campo de URL de imagen
    if (urlInput) {
        urlInput.addEventListener('input', function() {
            currentImageUrls = this.value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
            currentImageBase64 = currentImageUrls[0] || '';
            imagesDirty = true;
            updateImagePreview([...currentImageUrls, ...currentImagePreviewUrls]);
        });
    }
    
    // Envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nameVal = document.getElementById('productName').value.trim();
        const categoryVal = document.getElementById('productCategory').value;
        const priceText = document.getElementById('productPrice').value.trim();
        const stockText = document.getElementById('productStock').value.trim();
        const priceVal = Number(priceText);
        const stockVal = Number(stockText);
        const descVal = document.getElementById('productDescription').value.trim();
        const statusVal = document.getElementById('productStatus').value;
        const highlightVal = document.getElementById('productHighlight').checked;
        let variants;
        try {
            variants = getProductVariantsFromForm();
        } catch (variantError) {
            showToast(variantError.message, 'error');
            return;
        }
        
        const productId = editingProductId || getNextProductId();
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        let imageUrls = [...currentImageUrls];

        try {
            if (currentImageBlobs.length) {
                if (!window.SupabaseImageStorage?.isConfigured) {
                    throw new Error('Supabase Storage no está configurado. No se guardará la imagen como Base64.');
                }
                const uploadedImages = await Promise.all(currentImageBlobs.map((blob) =>
                    window.SupabaseImageStorage.uploadProductImage(blob, productId)
                ));
                imageUrls = [...imageUrls, ...uploadedImages];
            }
        } catch (err) {
            console.error('Error subiendo imagen a Supabase Storage:', err);
            showToast(err.message || 'No se pudo subir la imagen a Supabase Storage.', 'error');
            if (submitButton) submitButton.disabled = false;
            return;
        }
        
        const productData = {
            nombre: nameVal,
            id: productId,
            categoria: categoryVal,
            precio: priceVal,
            stock: stockVal,
            descripcion: descVal,
            imagen: imageUrls[0] || (editingProductId ? null : 'https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=500&h=500&fit=crop'),
            imagenes: imageUrls.length ? imageUrls : (editingProductId ? [] : ['https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=500&h=500&fit=crop']),
            estado: statusVal,
            destacado: highlightVal,
            variantes: variants,
        };
        
        try {
            const supabaseProducts = await import('./supabase-products.js');
            if (editingProductId) {
                await supabaseProducts.updateSupabaseProduct(editingProductId, productData);
            } else {
                await supabaseProducts.createSupabaseProduct(productData);
            }

            await loadProducts();
            showToast(`✓ Producto "${nameVal}" ${editingProductId ? 'actualizado' : 'agregado'} en Supabase`, 'success');
            resetProductForm();
            displayStats();
            displayProducts();
            switchSection('productos');
        } catch (err) {
            console.error('Error guardando producto en Supabase:', err);
            showToast(err.message || 'No se pudo guardar el producto en Supabase. Verificá que tu usuario sea administrador.', 'error');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

function renderOrdersTable(orders) {
    const tableBody = document.getElementById('ordersTableBody');
    const noOrdersMsg = document.getElementById('noOrders');
    if (!tableBody) return;

    if (orders.length === 0) {
        tableBody.innerHTML = '';
        if (noOrdersMsg) noOrdersMsg.classList.remove('hidden');
        return;
    }
    if (noOrdersMsg) noOrdersMsg.classList.add('hidden');
    tableBody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>#${order.id}</strong></td>
            <td>${new Date(order.fecha).toLocaleDateString('es-AR')}</td>
            <td>${order.cliente?.nombre || 'Cliente'}</td>
            <td><strong>$${formatPrice(order.total)}</strong></td>
            <td><span class="status-badge ${order.estado}">${order.estado}</span></td>
            <td>
                <button class="btn-edit" onclick="openOrderModal('${order.id}')">Ver detalle</button>
            </td>
        </tr>
    `).join('');
}

// Mostrar órdenes persistidas en Supabase
async function displayOrders() {
    try {
        const { getSupabaseOrders } = await import('./supabase-products.js');
        supabaseOrders = await getSupabaseOrders();
        window.supabaseOrders = supabaseOrders;
    } catch (error) {
        console.error('Error cargando pedidos desde Supabase:', {
            code: error?.code ?? null,
            message: error?.message ?? null,
            details: error?.details ?? null,
            hint: error?.hint ?? null,
            status: error?.status ?? null,
        });
        supabaseOrders = [];
        window.supabaseOrders = [];
        showToast(error?.message || 'No se pudieron cargar los pedidos desde Supabase.', 'error');
    }

    renderOrdersTable(supabaseOrders);

    const filterSelect = document.getElementById('filterOrders');
    if (filterSelect) {
        filterSelect.onchange = function() {
            filterOrders(this.value);
        };
    }
}

// Filtrar órdenes por estado
function filterOrders(status) {
    let filtered = supabaseOrders;
    if (status && status !== 'todos') {
        filtered = supabaseOrders.filter(o => o.estado === status);
    }
    if (filtered.length === 0) {
        const tableBody = document.getElementById('ordersTableBody');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">No hay pedidos con este estado.</td></tr>';
        const noOrdersMsg = document.getElementById('noOrders');
        if (noOrdersMsg) noOrdersMsg.classList.add('hidden');
        return;
    }
    renderOrdersTable(filtered);
}

// Setup formulario de configuración
function setupConfigForm() {
    const form = document.getElementById('configForm');
    if (!form) return;
    const heroFile = document.getElementById('heroImageFile');
    const heroUrl = document.getElementById('heroImageUrl');
    const removeHeroImageBtn = document.getElementById('removeHeroImageBtn');
    if (heroUrl) heroUrl.addEventListener('change', updateHeroPreview);
    if (removeHeroImageBtn) removeHeroImageBtn.addEventListener('click', () => {
        if (!window.confirm('¿Querés quitar la imagen del header? Deberás guardar la configuración para aplicarlo en la tienda.')) return;

        if (heroUrl) {
            heroUrl.value = '';
            heroUrl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (heroFile) heroFile.value = '';
        CONFIG.heroImage = '';
    });
    if (heroFile) heroFile.addEventListener('change', function () {
        const file = this.files?.[0];
        if (!file || !file.type.startsWith('image/')) { showToast('Seleccioná una imagen válida.', 'error'); return; }
        const reader = new FileReader();
        reader.onload = () => { document.getElementById('heroImageUrl').value = reader.result; updateHeroPreview(); };
        reader.readAsDataURL(file);
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        CONFIG.storeName = document.getElementById('storeName').value.trim();
        CONFIG.storeDescription = document.getElementById('storeDescription').value.trim();
        CONFIG.storeLogo = document.getElementById('storeLogo')?.value || '🏪';
        CONFIG.whatsappNumber = document.getElementById('whatsappNumber').value.trim();
        CONFIG.instagramUsername = document.getElementById('instagramUsername').value.trim();
        CONFIG.storeAddress = document.getElementById('storeAddress').value.trim();
        CONFIG.storeHours = document.getElementById('storeHours').value.trim();
        CONFIG.heroEyebrow = document.getElementById('heroEyebrow')?.value.trim() || '';
        CONFIG.heroTitle = document.getElementById('heroTitle')?.value.trim() || '';
        CONFIG.heroDescription = document.getElementById('heroDescription')?.value.trim() || '';
        CONFIG.heroImage = document.getElementById('heroImageUrl')?.value.trim() || '';

        const phone = normalizeWhatsAppNumber(CONFIG.whatsappNumber);
        if (!phone) {
            showToast('El número de WhatsApp configurado no es válido.', 'error');
            return;
        }
        if (CONFIG.heroImage) {
            try { new URL(CONFIG.heroImage); } catch {
                showToast('La URL de la imagen del header no es válida.', 'error');
                return;
            }
        }
        CONFIG.whatsappNumber = phone;

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;
        try {
            if (CONFIG.heroImage.startsWith('data:image/')) {
                if (!window.SupabaseImageStorage?.uploadHeroImage) {
                    throw new Error('Supabase Storage no está disponible para guardar el hero.');
                }
                CONFIG.heroImage = await window.SupabaseImageStorage.uploadHeroImage(CONFIG.heroImage);
            }
            if (!window.SupabaseStoreConfig?.saveRemoteStoreConfig) {
                throw new Error('La configuración remota de Supabase no está disponible.');
            }
            await window.SupabaseStoreConfig.saveRemoteStoreConfig(CONFIG);
            updateFooterData();
            showToast('Configuración guardada correctamente en Supabase.', 'success');
        } catch (error) {
            console.error('Error guardando configuración en Supabase:', error);
            showToast(error.message || 'No se pudo guardar la configuración en Supabase.', 'error');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

// Cargar datos del formulario de configuración
function loadConfigForm() {
    if (document.getElementById('storeName')) document.getElementById('storeName').value = CONFIG.storeName || '';
    if (document.getElementById('storeDescription')) document.getElementById('storeDescription').value = CONFIG.storeDescription || '';
    if (document.getElementById('storeLogo')) document.getElementById('storeLogo').value = CONFIG.storeLogo || '';
    if (document.getElementById('whatsappNumber')) document.getElementById('whatsappNumber').value = CONFIG.whatsappNumber || '';
    if (document.getElementById('instagramUsername')) document.getElementById('instagramUsername').value = CONFIG.instagramUsername || '';
    if (document.getElementById('storeAddress')) document.getElementById('storeAddress').value = CONFIG.storeAddress || '';
    if (document.getElementById('storeHours')) document.getElementById('storeHours').value = CONFIG.storeHours || '';
    if (document.getElementById('heroEyebrow')) document.getElementById('heroEyebrow').value = CONFIG.heroEyebrow || '';
    if (document.getElementById('heroTitle')) document.getElementById('heroTitle').value = CONFIG.heroTitle || '';
    if (document.getElementById('heroDescription')) document.getElementById('heroDescription').value = CONFIG.heroDescription || '';
    if (document.getElementById('heroImageUrl')) document.getElementById('heroImageUrl').value = CONFIG.heroImage || '';
    updateHeroPreview();
}

function updateHeroPreview() {
    const preview = document.getElementById('heroImagePreview');
    const source = document.getElementById('heroImageUrl')?.value.trim();
    if (!preview) return;
    if (!source) {
        preview.removeAttribute('src');
        preview.classList.add('hidden');
        return;
    }
    preview.src = source;
    preview.classList.remove('hidden');
    preview.onerror = () => { preview.classList.add('hidden'); showToast('No se pudo cargar la imagen del header.', 'error'); };
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});


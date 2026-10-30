// ==========================================
// GESTIÓN DE PRODUCTOS
// ==========================================

let productsData = [];

// Catálogo por defecto integrado
const DEFAULT_PRODUCTS = [
  {
    "id": 1,
    "nombre": "Vaso Térmico Acero Inoxidable",
    "categoria": "bazar",
    "descripcion": "Vaso térmico de acero inoxidable de 500ml, mantiene bebidas frías o calientes por horas.",
    "precio": 12500,
    "stock": 15,
    "imagen": "https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=500&h=500&fit=crop",
    "destacado": true,
    "estado": "disponible"
  },
  {
    "id": 2,
    "nombre": "Juego de Platos de Cerámica Artesanal",
    "categoria": "bazar",
    "descripcion": "Set de 4 platos de cerámica artesanal de alta calidad, resistentes y elegantes para toda ocasión.",
    "precio": 28000,
    "stock": 8,
    "imagen": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500&h=500&fit=crop",
    "destacado": true,
    "estado": "disponible"
  },
  {
    "id": 3,
    "nombre": "Bandeja de Madera Rectangular",
    "categoria": "bazar",
    "descripcion": "Bandeja de madera natural lustrada, perfecta para servir alimentos o decoración de interiores.",
    "precio": 8900,
    "stock": 20,
    "imagen": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 4,
    "nombre": "Juguete de Peluche - Osito Clásico",
    "categoria": "jugueteria",
    "descripcion": "Osito de peluche extra suave y adorable con moño satinado, hipoalergénico, ideal para regalar.",
    "precio": 9500,
    "stock": 25,
    "imagen": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&h=500&fit=crop",
    "destacado": true,
    "estado": "disponible"
  },
  {
    "id": 5,
    "nombre": "Auto a Fricción Speedster",
    "categoria": "jugueteria",
    "descripcion": "Vehículo de colección a fricción con detalles realistas y colores brillantes de alta resistencia.",
    "precio": 4500,
    "stock": 30,
    "imagen": "https://images.unsplash.com/photo-1578789719453-ac6900fb2f6c?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 6,
    "nombre": "Bloques de Construcción Didácticos",
    "categoria": "jugueteria",
    "descripcion": "Set de 50 bloques multicolores para estimular la creatividad, motricidad fina y concentración.",
    "precio": 7800,
    "stock": 12,
    "imagen": "https://images.unsplash.com/photo-1609269585289-03519db7a398?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 7,
    "nombre": "Paleta de Sombras Glamour Gold",
    "categoria": "maquillaje",
    "descripcion": "Paleta de 12 tonos de sombras ultra pigmentadas (mate y satinadas), fórmula de larga duración.",
    "precio": 15800,
    "stock": 10,
    "imagen": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop",
    "destacado": true,
    "estado": "disponible"
  },
  {
    "id": 8,
    "nombre": "Base Líquida Efecto Seda",
    "categoria": "maquillaje",
    "descripcion": "Base líquida de larga duración, acabado mate natural aterciopelado y cobertura modulable.",
    "precio": 12000,
    "stock": 18,
    "imagen": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 9,
    "nombre": "Set de Brochas Profesionales Premium",
    "categoria": "maquillaje",
    "descripcion": "Set de 7 brochas con cerdas ultrasuaves de alta densidad y mango ergonómico dorado.",
    "precio": 14900,
    "stock": 14,
    "imagen": "https://images.unsplash.com/photo-1631214174882-e127c9ebcc65?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 10,
    "nombre": "Juego de Sábanas 100% Algodón Egipcio",
    "categoria": "blanqueria",
    "descripcion": "Juego de sábanas Queen Size de 400 hilos, frescura, máxima suavidad y confort térmico inigualable.",
    "precio": 35000,
    "stock": 7,
    "imagen": "https://images.unsplash.com/photo-1611007866919-48416eae58e4?w=500&h=500&fit=crop",
    "destacado": true,
    "estado": "disponible"
  },
  {
    "id": 11,
    "nombre": "Almohada Viscoelástica Cervical",
    "categoria": "blanqueria",
    "descripcion": "Almohada ortopédica con memoria viscoelástica y funda lavable hipoalergénica con hilo de plata.",
    "precio": 18500,
    "stock": 11,
    "imagen": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 12,
    "nombre": "Toallón de Baño Hotelero Premium",
    "categoria": "blanqueria",
    "descripcion": "Toallón de 600 gr/m² de puro algodón peinado, secado ultra rápido y tacto mullido.",
    "precio": 11200,
    "stock": 35,
    "imagen": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 13,
    "nombre": "Perfume Eau de Parfum Royale 100ml",
    "categoria": "perfumeria",
    "descripcion": "Fragancia cautivadora con notas amaderadas, toques florales de jazmín y fondo de vainilla Bourbon.",
    "precio": 29900,
    "stock": 9,
    "imagen": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop",
    "destacado": true,
    "estado": "disponible"
  },
  {
    "id": 14,
    "nombre": "Bruma Corporal Refrescante Golden Glow",
    "categoria": "perfumeria",
    "descripcion": "Body mist aromatizado con destellos sutiles de brillo y fragancia fresca de orquídeas y ámbar.",
    "precio": 9800,
    "stock": 22,
    "imagen": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 15,
    "nombre": "Difusor de Aromas con Varillas de Bambú",
    "categoria": "perfumeria",
    "descripcion": "Ambientador aromático de 250ml con aceites esenciales puros de bergamota y sándalo.",
    "precio": 8500,
    "stock": 28,
    "imagen": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 16,
    "nombre": "Mochila Escolar Ergonómica Reforzada",
    "categoria": "escolar",
    "descripcion": "Mochila con compartimento acolchado para notebook, espalda antitranspirante y costuras reforzadas.",
    "precio": 24500,
    "stock": 13,
    "imagen": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    "destacado": true,
    "estado": "disponible"
  },
  {
    "id": 17,
    "nombre": "Set de Marcadores Pastel & Metalizados",
    "categoria": "escolar",
    "descripcion": "Kit de 18 resaltadores y microfibras en tonos pastel y metalizados, tinta al agua no traspasable.",
    "precio": 9400,
    "stock": 16,
    "imagen": "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 18,
    "nombre": "Cuaderno Tapa Dura Universitario 100 Hojas",
    "categoria": "escolar",
    "descripcion": "Cuaderno rayado con encuadernación anillada doble alambre y hojas de 80g de alta densidad.",
    "precio": 5200,
    "stock": 40,
    "imagen": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 19,
    "nombre": "Cartuchera Desplegable Multicompartimento",
    "categoria": "escolar",
    "descripcion": "Cartuchera de gran capacidad con divisiones internas para lápices, calculadora y accesorios.",
    "precio": 7900,
    "stock": 25,
    "imagen": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  },
  {
    "id": 20,
    "nombre": "Organizador Metálico de Escritorio",
    "categoria": "escolar",
    "descripcion": "Organizador de 4 compartimentos metálicos con acabado en pintura electrostática negra mate.",
    "precio": 6700,
    "stock": 19,
    "imagen": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop",
    "destacado": false,
    "estado": "disponible"
  }
];

// Cargar productos exclusivamente desde Supabase.
// DEFAULT_PRODUCTS queda disponible solo como datos de demostración explícitos.
async function loadProducts() {
    console.time('Catálogo: loadProducts');
    try {
        const { getSupabaseProducts } = await import('./supabase-products.js');
        const supabaseProducts = await getSupabaseProducts();
        productsData = supabaseProducts;
        return productsData;
    } catch (error) {
        const originalError = error?.cause || error;
        console.error('Error cargando productos desde Supabase; se conserva la lista actual en memoria:', {
            query: originalError?.query ?? null,
            code: originalError?.code ?? null,
            message: originalError?.message ?? error?.message ?? null,
            details: originalError?.details ?? null,
            hint: originalError?.hint ?? null,
        });
        const diagnostic = [originalError?.code, originalError?.message, originalError?.details, originalError?.hint]
            .filter(Boolean)
            .join(' — ');
        throw new Error(
            `No se pudieron cargar los productos desde Supabase.${diagnostic ? ` ${diagnostic}` : ''}`,
            { cause: originalError },
        );
    } finally {
        console.timeEnd('Catálogo: loadProducts');
    }
}

// Guardar productos en localStorage
function saveProducts() {
    localStorage.setItem(CONFIG.STORAGE_PRODUCTS, JSON.stringify(productsData));
}

// Obtener todos los productos
function getAllProducts() {
    return productsData;
}

function getNextProductId() {
    return productsData.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
}

// Obtener producto por ID (soporta string o number)
function getProductById(id) {
    const numId = Number(id);
    return productsData.find(p => Number(p.id) === numId);
}

// Obtener productos por categoría
function getProductsByCategory(category) {
    const normalizeCategory = (value) => String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const selectedCategory = normalizeCategory(category);

    if (!selectedCategory || selectedCategory === 'todos') {
        return productsData;
    }
    return productsData.filter((product) => normalizeCategory(product.categoria) === selectedCategory);
}

// Agregar producto
function addProduct(product) {
    const newId = Number(product.id) || getNextProductId();
    
    const newProduct = {
        id: newId,
        nombre: product.nombre.trim(),
        categoria: product.categoria,
        descripcion: (product.descripcion || '').trim(),
        precio: parseFloat(product.precio) || 0,
        stock: parseInt(product.stock) || 0,
        imagen: product.imagen || 'https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=500&h=500&fit=crop',
        destacado: Boolean(product.destacado),
        estado: product.estado || 'disponible',
    };
    
    productsData.push(newProduct);
    saveProducts();
    return newProduct;
}

// Actualizar producto
function updateProduct(id, updates) {
    const product = getProductById(id);
    if (product) {
        if (updates.nombre !== undefined) product.nombre = updates.nombre.trim();
        if (updates.categoria !== undefined) product.categoria = updates.categoria;
        if (updates.descripcion !== undefined) product.descripcion = updates.descripcion.trim();
        if (updates.precio !== undefined) product.precio = parseFloat(updates.precio) || 0;
        if (updates.stock !== undefined) product.stock = parseInt(updates.stock) || 0;
        if (updates.imagen !== undefined && updates.imagen !== '') product.imagen = updates.imagen;
        if (updates.destacado !== undefined) product.destacado = Boolean(updates.destacado);
        if (updates.estado !== undefined) product.estado = updates.estado;
        
        saveProducts();
        return product;
    }
    return null;
}

// Eliminar producto
function deleteProduct(id) {
    const numId = Number(id);
    const index = productsData.findIndex(p => Number(p.id) === numId);
    if (index !== -1) {
        productsData.splice(index, 1);
        saveProducts();
        return true;
    }
    return false;
}

// Obtener productos destacados
function getFeaturedProducts() {
    return productsData.filter(p => p.destacado && p.estado === 'disponible');
}

// Pide a Unsplash una variante WebP optimizada sin alterar la URL original
// guardada por el administrador. Las URLs locales y de otros proveedores se
// conservan intactas para no romper imágenes cargadas manualmente.
function getOptimizedImageUrl(source, width = 500, height = 500) {
    const fallback = 'https://images.unsplash.com/photo-1514432324607-2e467f4af445?auto=format&fm=webp&q=82&w=500&h=500&fit=crop';
    if (!source) return fallback;

    try {
        const url = new URL(source, window.location.href);
        if (url.hostname === 'images.unsplash.com') {
            url.searchParams.set('auto', 'format');
            url.searchParams.set('fm', 'webp');
            url.searchParams.set('q', '82');
            url.searchParams.set('w', String(width));
            url.searchParams.set('h', String(height));
            url.searchParams.set('fit', 'crop');
            return url.toString();
        }
    } catch (error) {
        // Mantener la fuente original permite al administrador seguir usando
        // data URLs y valores que aún no tengan una URL absoluta válida.
    }

    return source;
}

function getProductImages(product) {
    const sources = Array.isArray(product?.imagenes) && product.imagenes.length
        ? product.imagenes
        : [product?.imagen];
    return [...new Set(sources.map((source) => String(source ?? '').trim()).filter(Boolean))];
}

function setProductCarouselIndex(carousel, nextIndex) {
    const slides = carousel?.querySelector('.product-image-track');
    const dots = [...(carousel?.querySelectorAll('.product-image-dot') || [])];
    const total = dots.length;
    if (!slides || total < 2) return;
    const index = ((nextIndex % total) + total) % total;
    carousel.dataset.carouselIndex = String(index);
    slides.style.transform = `translateX(-${index * (100 / total)}%)`;
    dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
        dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });
}

function shiftProductCarousel(button, direction) {
    const carousel = button?.closest('.product-card-image-wrap');
    if (!carousel) return;
    setProductCarouselIndex(carousel, Number(carousel.dataset.carouselIndex || 0) + direction);
}

function isProductCarouselControl(event) {
    return Boolean(event.target?.closest?.('.product-image-control, .product-image-dot'));
}

function handleProductCarouselPointerDown(event, carousel) {
    if (isProductCarouselControl(event)) return;
    if (carousel.querySelectorAll('.product-image-slide').length < 2) return;
    carousel.dataset.pointerStartX = String(event.clientX);
    carousel.dataset.pointerDragging = 'true';
    carousel.dataset.swipeMoved = 'false';
    carousel.setPointerCapture?.(event.pointerId);
}

function handleProductCarouselPointerUp(event, carousel) {
    if (isProductCarouselControl(event)) return;
    if (carousel.dataset.pointerDragging !== 'true') return;
    const startX = Number(carousel.dataset.pointerStartX || event.clientX);
    const delta = event.clientX - startX;
    carousel.dataset.pointerDragging = 'false';
    carousel.releasePointerCapture?.(event.pointerId);
    if (Math.abs(delta) < 35) return;
    carousel.dataset.swipeMoved = 'true';
    setProductCarouselIndex(carousel, Number(carousel.dataset.carouselIndex || 0) + (delta < 0 ? 1 : -1));
    window.setTimeout(() => { carousel.dataset.swipeMoved = 'false'; }, 0);
}

function handleProductCarouselClick(event, carousel) {
    if (isProductCarouselControl(event)) return;
    if (carousel.dataset.swipeMoved === 'true') {
        event.preventDefault();
        event.stopPropagation();
        carousel.dataset.swipeMoved = 'false';
    }
}

// Ordenar productos
function sortProductsList(products, sortBy) {
    const sorted = [...products];
    
    switch(sortBy) {
        case 'price-asc':
            sorted.sort((a, b) => a.precio - b.precio);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.precio - a.precio);
            break;
        case 'name-asc':
            sorted.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
            break;
        default:
            // Por defecto mantener orden
            break;
    }
    
    return sorted;
}

// Renderizar tarjeta de producto en HTML
function renderProductCard(product, isPriority = false) {
    const hasVariants = Array.isArray(product.variantes) && product.variantes.length > 0;
    const isAvailable = product.estado === 'disponible' && product.stock > 0;
    const availabilityClass = isAvailable ? 'available' : 'sold-out';
    const availabilityText = isAvailable ? 'Disponible' : 'Agotado';
    const badgeHtml = product.destacado ? '<span class="product-badge">Destacado</span>' : '';
    
    // Placeholder seguro en caso de imagen rota
    const imageSources = getProductImages(product);
    const fallbackImg = getOptimizedImageUrl('', 500, 500);
    const hasImageCarousel = imageSources.length > 1;
    const slidesHtml = imageSources.map((source, index) => `
                    <div class="product-image-slide">
                        <img src="${getOptimizedImageUrl(source, 500, 500)}"
                             alt="${product.nombre} - imagen ${index + 1} de ${imageSources.length}"
                             class="product-image"
                             width="500"
                             height="500"
                             loading="${isPriority && index === 0 ? 'eager' : 'lazy'}"
                             fetchpriority="${isPriority && index === 0 ? 'high' : 'auto'}"
                             decoding="async"
                             onerror="this.onerror=null; this.src='${fallbackImg}';">
                    </div>
                `).join('');
    const dotsHtml = hasImageCarousel ? imageSources.map((_, index) => `
                    <button type="button" class="product-image-dot${index === 0 ? ' active' : ''}"
                            aria-label="Mostrar imagen ${index + 1} de ${imageSources.length}"
                            aria-current="${index === 0 ? 'true' : 'false'}"
                            onclick="event.stopPropagation(); setProductCarouselIndex(this.closest('.product-card-image-wrap'), ${index})"></button>
                `).join('') : '';
    const controlsHtml = hasImageCarousel ? `
                    <button type="button" class="product-image-control product-image-control-prev" aria-label="Imagen anterior" onclick="event.stopPropagation(); shiftProductCarousel(this, -1)">‹</button>
                    <button type="button" class="product-image-control product-image-control-next" aria-label="Imagen siguiente" onclick="event.stopPropagation(); shiftProductCarousel(this, 1)">›</button>
                    <div class="product-image-dots" aria-label="Imágenes del producto">${dotsHtml}</div>
                ` : '';
    
    return `
        <div class="product-card ${product.destacado ? 'is-featured' : ''}" data-id="${product.id}">
            <div class="product-card-image-wrap${hasImageCarousel ? ' has-image-carousel' : ''}"
                 onclick="handleProductCarouselClick(event, this); if (event.defaultPrevented) return; openProductModal(${product.id})"
                 onpointerdown="handleProductCarouselPointerDown(event, this)"
                 onpointerup="handleProductCarouselPointerUp(event, this)"
                 onpointercancel="handleProductCarouselPointerUp(event, this)"
                 role="button" tabindex="0" aria-label="Ver detalle de ${product.nombre}"
                 onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProductModal(${product.id}); }">
                ${badgeHtml}
                <div class="product-image-track" style="--product-image-count: ${imageSources.length};">${slidesHtml}</div>
                ${controlsHtml}
            </div>
            <div class="product-info">
                <span class="product-category">${product.categoria}</span>
                <h3 class="product-name" title="${product.nombre}" onclick="openProductModal(${product.id})">${product.nombre}</h3>
                <div class="product-pricing">
                    <span class="product-price">$${formatPrice(product.precio)}</span>
                </div>
                <div class="product-meta">
                    <span class="product-availability ${availabilityClass}">
                        <span class="availability-dot"></span>
                        ${availabilityText}
                    </span>
                    <span class="product-stock-count">${isAvailable ? `${product.stock} en stock` : 'Sin stock'}</span>
                </div>
                <div class="product-actions">
                    <button class="btn-view" onclick="openProductModal(${product.id})">Ver detalle</button>
                    <button class="btn-add-cart" 
                            onclick="${hasVariants ? `openProductModal(${product.id})` : `addToCart(${product.id})`}"
                            ${!isAvailable ? 'disabled' : ''}>
                        ${isAvailable ? (hasVariants ? 'Elegir aroma' : 'Agregar') : 'Agotado'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Obtener productos por defecto
function getDefaultProducts() {
    return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
}


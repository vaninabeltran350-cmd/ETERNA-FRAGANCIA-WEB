// ==========================================
// FILTROS Y CATEGORÍAS
// ==========================================

let currentCategory = 'todos';
let currentSort = 'default';
let currentPage = 1;
let currentSearchQuery = '';
const PRODUCTS_PER_PAGE = 12;

// Inicializar filtros
function initFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const sortSelect = document.getElementById('sortBy');
    const categoriesContainer = document.getElementById('categoriesContainer');

    initCategoryScrolling(categoriesContainer);
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterByCategory(this.dataset.category);
        });
    });
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
    
    // Filtros en footer
    const footerLinks = document.querySelectorAll('.category-link');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            filterByCategory(this.dataset.category);
            const filterSec = document.querySelector('.filter-section');
            if (filterSec) {
                filterSec.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// Filtrar por categoría
function filterByCategory(category) {
    currentCategory = category || 'todos';
    currentSort = 'default';
    currentSearchQuery = '';
    currentPage = 1;
    
    // Actualizar botones activos
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === currentCategory) {
            btn.classList.add('active');
        }
    });
    
    // Resetear selector de ordenamiento
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.value = 'default';
    }
    
    // Si hay un buscador, limpiarlo para reflejar la categoría seleccionada
    const searchInput = document.getElementById('buscador');
    if (searchInput && searchInput.value) {
        searchInput.value = '';
    }
    
    renderProducts();
}

// Ordenar productos
function sortProducts(sortBy) {
    currentSort = sortBy;
    currentPage = 1;
    renderProducts();
}

function initCategoryScrolling(categoriesContainer) {
    if (!categoriesContainer) return;

    requestAnimationFrame(() => {
        categoriesContainer.scrollLeft = 0;
    });

    categoriesContainer.addEventListener('wheel', (event) => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        event.preventDefault();
        categoriesContainer.scrollLeft += event.deltaY;
    }, { passive: false });

    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;
    let suppressClick = false;

    categoriesContainer.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        dragging = true;
        moved = false;
        startX = event.clientX;
        startScrollLeft = categoriesContainer.scrollLeft;
    });

    categoriesContainer.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        const distance = event.clientX - startX;
        if (Math.abs(distance) > 4) {
            if (!moved) {
                moved = true;
                categoriesContainer.setPointerCapture(event.pointerId);
            }
        }
        categoriesContainer.scrollLeft = startScrollLeft - distance;
        if (moved) event.preventDefault();
    });

    const stopDragging = (event) => {
        if (!dragging) return;
        dragging = false;
        suppressClick = moved;
        if (categoriesContainer.hasPointerCapture(event.pointerId)) {
            categoriesContainer.releasePointerCapture(event.pointerId);
        }
        window.setTimeout(() => {
            suppressClick = false;
        }, 0);
    };

    categoriesContainer.addEventListener('pointerup', stopDragging);
    categoriesContainer.addEventListener('pointercancel', stopDragging);
    categoriesContainer.addEventListener('click', (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
    }, true);
}

// Renderizar sección de productos destacados
function renderFeaturedProducts() {
    const featuredGrid = document.getElementById('featuredGrid');
    const featuredSection = document.getElementById('featuredSection');
    if (!featuredGrid) return;
    
    if (currentCategory !== 'todos' || currentSearchQuery) {
        if (featuredSection) featuredSection.classList.add('hidden');
        return;
    }

    const featured = getFeaturedProducts();

    if (featured.length === 0) {
        if (featuredSection) featuredSection.classList.add('hidden');
        return;
    }
    
    if (featuredSection) featuredSection.classList.remove('hidden');
    console.time('Catálogo: tarjetas destacadas');
    featuredGrid.innerHTML = featured.slice(0, 4).map(p => renderProductCard(p, true)).join('');
    console.timeEnd('Catálogo: tarjetas destacadas');
}

// Renderizar productos con filtros aplicados
function renderProducts() {
    console.time('Catálogo: renderProducts');
    const grid = document.getElementById('productsGrid');
    if (!grid) {
        console.timeEnd('Catálogo: renderProducts');
        return;
    }
    
    let products = getProductsByCategory(currentCategory);
    if (currentSearchQuery) {
        products = products.filter(product => {
            return (product.nombre && product.nombre.toLowerCase().includes(currentSearchQuery)) ||
                   (product.categoria && product.categoria.toLowerCase().includes(currentSearchQuery)) ||
                   (product.descripcion && product.descripcion.toLowerCase().includes(currentSearchQuery));
        });
    }
    products = sortProductsList(products, currentSort);
    
    // Actualizar texto de resultados
    updateResultsText(currentCategory, products.length);
    
    // Renderizar destacados si corresponde
    renderFeaturedProducts();
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon" aria-hidden="true"></div>
                <h3>${currentSearchQuery ? `Sin resultados para "${currentSearchQuery}"` : 'No encontramos productos'}</h3>
                <p>${currentSearchQuery ? 'Intenta con otros términos o explora por categorías.' : 'No hay productos disponibles en esta categoría por el momento.'}</p>
                <button class="btn-primary" onclick="filterByCategory('todos')">Ver todos los productos</button>
            </div>
        `;
        renderPagination(0);
        console.timeEnd('Catálogo: renderProducts');
        return;
    }
    
    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const pageProducts = products.slice(start, start + PRODUCTS_PER_PAGE);

    console.time('Catálogo: tarjetas de productos');
    grid.innerHTML = pageProducts.map(p => renderProductCard(p)).join('');
    console.timeEnd('Catálogo: tarjetas de productos');
    renderPagination(totalPages);
    console.timeEnd('Catálogo: renderProducts');
}

// Actualizar texto de resultados
function updateResultsText(category, count) {
    const resultsText = document.getElementById('resultsText');
    if (!resultsText) return;
    
    if (count === 0) {
        resultsText.innerHTML = currentSearchQuery
            ? `No encontramos productos para la búsqueda <strong>"${currentSearchQuery}"</strong>`
            : 'No hay productos disponibles.';
        return;
    }

    if (currentSearchQuery) {
        const text = count === 1 ? 'producto encontrado' : 'productos encontrados';
        resultsText.innerHTML = `Mostrando <strong>${count}</strong> ${text} para <strong>"${currentSearchQuery}"</strong>`;
        return;
    }
    
    const catLabels = {
        todos: 'todo el catálogo',
        sahumerios: 'Sahumerios',
        aromatizacion: 'Aromatización',
        'velas-velones': 'Velas/velones',
        'porta-sahumerios': 'Porta sahumerios',
        piedras: 'Piedras',
        amuletos: 'Amuletos',
        bienestar: 'Bienestar',
        decoracion: 'Decoración',
        kits: 'Kits'
    };
    
    const catLabel = catLabels[category.toLowerCase()] || category;
    const text = count === 1 ? 'producto' : 'productos';
    resultsText.innerHTML = `Mostrando <strong>${count}</strong> ${text} en <strong>${catLabel}</strong>`;
}

function goToPage(page) {
    const nextPage = Number(page);
    if (!Number.isInteger(nextPage) || nextPage < 1) return;
    currentPage = nextPage;
    renderProducts();

    // Esperar a que la grilla y la paginación se actualicen antes de volver al catálogo.
    requestAnimationFrame(() => {
        const catalog = document.querySelector('.catalog-container');
        if (!catalog) return;

        const top = catalog.getBoundingClientRect().top + window.scrollY - 16;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('catalogPagination');
    if (!pagination) return;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        pagination.classList.add('hidden');
        return;
    }

    const pageButtons = [];
    const firstPage = Math.max(1, currentPage - 2);
    const lastPage = Math.min(totalPages, currentPage + 2);

    if (firstPage > 1) {
        pageButtons.push('<button type="button" class="pagination-btn" onclick="goToPage(1)">1</button>');
        if (firstPage > 2) pageButtons.push('<span class="pagination-ellipsis" aria-hidden="true">…</span>');
    }

    for (let page = firstPage; page <= lastPage; page++) {
        const active = page === currentPage;
        pageButtons.push(`<button type="button" class="pagination-btn${active ? ' active' : ''}" onclick="goToPage(${page})"${active ? ' aria-current="page"' : ''}>${page}</button>`);
    }

    if (lastPage < totalPages) {
        if (lastPage < totalPages - 1) pageButtons.push('<span class="pagination-ellipsis" aria-hidden="true">…</span>');
        pageButtons.push(`<button type="button" class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`);
    }

    pagination.innerHTML = `
        <button type="button" class="pagination-btn pagination-nav" aria-label="Página anterior" onclick="goToPage(${currentPage - 1})"${currentPage === 1 ? ' disabled' : ''}>‹</button>
        <span class="pagination-pages" aria-label="Páginas">${pageButtons.join('')}</span>
        <button type="button" class="pagination-btn pagination-nav" aria-label="Página siguiente" onclick="goToPage(${currentPage + 1})"${currentPage === totalPages ? ' disabled' : ''}>›</button>
    `;
    pagination.classList.remove('hidden');
}


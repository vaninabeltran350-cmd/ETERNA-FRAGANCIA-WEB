// ==========================================
// BUSCADOR
// ==========================================

let searchTimeout;

// Inicializar buscador
function initSearch() {
    const searchInput = document.getElementById('buscador');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 250);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(searchTimeout);
                performSearch(this.value);
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const input = document.getElementById('buscador');
            if (input) {
                performSearch(input.value);
            }
        });
    }
}

// Realizar búsqueda
function performSearch(query) {
    query = (query || '').trim().toLowerCase();

    currentSearchQuery = query;
    currentPage = 1;
    if (!query) {
        currentSort = 'default';
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) sortSelect.value = 'default';
    }
    renderProducts();
}


// ==========================================
// APLICACIÓN PRINCIPAL
// ==========================================

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Cargar datos
        await loadProducts();
        
        // Actualizar carrito
        updateCartCount();
        
        // Inicializar funcionalidades
        initFilters();
        initSearch();
        updateFooterData();
        
        // Mostrar productos
        renderProducts();
        
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        showToast(error.message || 'No se pudieron cargar los productos desde Supabase.', 'error');
    }
});

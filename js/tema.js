// Tema visual persistente para la tienda pública.
(function () {
    const STORAGE_KEY = 'polirrubro-theme';
    const root = document.documentElement;

    function getInitialTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        root.dataset.theme = theme;
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;
        const dark = theme === 'dark';
        toggle.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
        toggle.title = dark ? 'Activar modo claro' : 'Activar modo oscuro';
        toggle.classList.toggle('is-dark', dark);
    }

    // Establecer el tema antes de que el navegador pinte la página evita que
    // los selectores claros por defecto se mezclen con el tema persistido.
    applyTheme(getInitialTheme());

    document.addEventListener('DOMContentLoaded', function () {
        const toggle = document.getElementById('themeToggle');
        if (toggle) toggle.addEventListener('click', function () {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem(STORAGE_KEY, next);
            applyTheme(next);
        });
    });
})();

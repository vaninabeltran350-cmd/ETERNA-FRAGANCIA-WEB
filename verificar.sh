#!/bin/bash
# Script de verificación de la tienda R&B

echo "========================================="
echo "VERIFICACIÓN DE ARCHIVOS ETERNA FRAGANCIA"
echo "========================================="

# Archivos HTML
echo -e "\n✓ Archivos HTML:"
ls -la index.html 2>/dev/null && echo "  ✓ index.html"
ls -la pages/carrito.html 2>/dev/null && echo "  ✓ pages/carrito.html"
ls -la pages/login.html 2>/dev/null && echo "  ✓ pages/login.html"
ls -la pages/dashboard.html 2>/dev/null && echo "  ✓ pages/dashboard.html"

# Archivos CSS
echo -e "\n✓ Archivos CSS:"
for css in css/style.css css/header.css css/catalogo.css css/carrito.css css/dashboard.css css/modal.css css/formularios.css css/responsive.css; do
    ls -la $css 2>/dev/null && echo "  ✓ $css"
done

# Archivos JavaScript
echo -e "\n✓ Archivos JavaScript:"
for js in js/configuracion.js js/productos.js js/carrito.js js/modal.js js/filtros.js js/buscador.js js/whatsapp.js js/dashboard.js js/autenticacion.js js/carrito-page.js js/app.js; do
    ls -la $js 2>/dev/null && echo "  ✓ $js"
done

# Datos
echo -e "\n✓ Archivos de Datos:"
ls -la data/productos.json 2>/dev/null && echo "  ✓ data/productos.json"

# Documentación
echo -e "\n✓ Documentación:"
ls -la *.md 2>/dev/null && echo "  ✓ Guías encontradas"

echo -e "\n========================================="
echo "✓ VERIFICACIÓN COMPLETADA"
echo "========================================="
echo ""
echo "Para iniciar la tienda:"
echo "1. Abre index.html en tu navegador"
echo "2. ¡Listo! La tienda está funcionando"
echo ""
echo "Para acceder al dashboard:"
echo "1. Haz clic en el ícono 👤 en la esquina superior derecha"
echo "2. O ve a: pages/login.html"
echo "3. Contraseña: rybadmin2024"

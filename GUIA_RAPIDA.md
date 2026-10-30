# ETERNA FRAGANCIA - Guía Rápida

## 🚀 Cómo Empezar

### Abrir la tienda
1. Abre `index.html` en tu navegador
2. ¡Listo! La tienda está funcionando

### Contraseñas y Accesos
- **Panel Admin**: Haz clic en 👤 en el header o ve a `/pages/login.html`
- **Contraseña**: `rybadmin2024`

---

## 📁 Estructura de Archivos

```
R&B/
├── index.html                    ← Página principal
├── pages/
│   ├── carrito.html              ← Carrito de compras
│   ├── login.html                ← Login del admin
│   └── dashboard.html            ← Panel administrativo
├── css/
│   ├── style.css                 ← Estilos globales
│   ├── header.css                ← Header
│   ├── catalogo.css              ← Catálogo y footer
│   ├── carrito.css               ← Carrito
│   ├── dashboard.css             ← Dashboard
│   ├── modal.css                 ← Modales
│   ├── formularios.css           ← Formularios
│   └── responsive.css            ← Diseño móvil
├── js/
│   ├── configuracion.js          ← Variables globales
│   ├── productos.js              ← Gestión de productos
│   ├── carrito.js                ← Lógica del carrito
│   ├── modal.js                  ← Ventanas modales
│   ├── filtros.js                ← Filtros y categorías
│   ├── buscador.js               ← Búsqueda
│   ├── whatsapp.js               ← Integración WhatsApp
│   ├── dashboard.js              ← Panel admin
│   ├── autenticacion.js          ← Login
│   ├── carrito-page.js           ← Página del carrito
│   └── app.js                    ← Inicialización
└── data/
    └── productos.json            ← Productos de ejemplo
```

---

## 🎯 Funcionalidades Principales

### Para Clientes
- ✅ Ver catálogo de productos
- ✅ Filtrar por categoría
- ✅ Ordenar por precio/nombre
- ✅ Buscar productos
- ✅ Ver detalles en modal
- ✅ Agregar al carrito
- ✅ Modificar cantidad
- ✅ Finalizar compra por WhatsApp

### Para Administrador
- ✅ Agregar productos
- ✅ Editar productos
- ✅ Eliminar productos
- ✅ Ver pedidos
- ✅ Cambiar estado de pedidos
- ✅ Configurar datos de la tienda

---

## 🔧 Configuración

### Cambiar datos de la tienda
1. Ve al **Dashboard** (👤 → contraseña: `rybadmin2024`)
2. Click en **Configuración**
3. Edita los datos que necesites:
   - Nombre del negocio
   - Número de WhatsApp
   - Alias bancario
   - Dirección
   - Horarios
4. Click en **Guardar Configuración**

### Cambiar contraseña del admin
Edita el archivo `js/configuracion.js`:
```javascript
adminPassword: 'tu_nueva_contraseña',
```

### Agregar productos
1. Ve al **Dashboard**
2. Click en **Agregar Producto** o **Productos**
3. Completa el formulario con:
   - Nombre
   - Categoría
   - Precio
   - Stock
   - Descripción
   - Imagen (URL)
   - Estado
4. Click en **Guardar Producto**

---

## 💾 Datos Almacenados

Todo se guarda automáticamente en **localStorage**:

- **Productos**: `rb_products`
- **Carrito**: `rb_cart`
- **Pedidos**: `rb_orders`
- **Configuración**: `rb_config`
- **Sesión Admin**: `rb_admin_session`

### Para borrar datos (desarrollo)
Abre la consola (F12) y ejecuta:
```javascript
// Borrar todo
localStorage.clear();

// O borrar solo un elemento
localStorage.removeItem('rb_products');
localStorage.removeItem('rb_cart');
localStorage.removeItem('rb_orders');
```

---

## 📱 Responsive Design

La tienda funciona perfectamente en:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1024px)
- ✅ Móvil (hasta 768px)
- ✅ Móvil pequeño (480px)

---

## 🌐 Integración con WhatsApp

Cuando un cliente finaliza su compra:
1. Se genera automáticamente un mensaje con todos los productos
2. Se abre WhatsApp con el mensaje preparado
3. El cliente solo tiene que hacer click en "Enviar"
4. El pedido se guarda en el dashboard

**Número configurado**: `5491234567890` (cambiar en Configuración)

---

## 🎨 Personalizaciones Fáciles

### Cambiar colores
Edita `css/style.css`:
```css
:root {
    --color-primary-black: #1a1a1a;      /* Negro */
    --color-primary-gold: #d4af37;       /* Dorado */
}
```

### Cambiar logo
El logo actual es "R&B" en texto. Para cambiar:
1. Edita `index.html` línea ~20
2. Reemplaza el contenido de `<div class="logo-text">`

### Agregar categorías nuevas
1. Edita `index.html` y agrega un botón en `.categories`
2. Edita `data/productos.json` y agrega productos con esa categoría

---

## 🐛 Solucionar Problemas

### "No se cargan los productos"
- Verifica que `data/productos.json` existe
- Revisa la consola (F12 → Console)
- Comprueba que el archivo JSON sea válido

### "El carrito no se guarda"
- El navegador debe permitir localStorage
- No funciona en modo anónimo/privado
- Revisa en F12 → Application → Local Storage

### "WhatsApp no abre"
- Verifica que el número esté en formato correcto: `5491234567890`
- Usa números sin espacios ni guiones
- Revisa en Configuración del Dashboard

### "El login no funciona"
- La contraseña es: `rybadmin2024`
- Revisa que escribas correctamente
- Verifica que localStorage esté habilitado

---

## 📊 Estadísticas

- **Archivos HTML**: 4
- **Archivos CSS**: 8
- **Archivos JavaScript**: 11
- **Productos de ejemplo**: 20
- **Tamaño total**: < 500 KB
- **Velocidad de carga**: Muy rápida (sin dependencias)

---

## ✅ Checklist de Implementación

Si quieres hacer cambios:
- [ ] Editar datos en `js/configuracion.js`
- [ ] Agregar productos en `data/productos.json`
- [ ] Cambiar estilos en `css/`
- [ ] Modificar HTML en `index.html` o `pages/`
- [ ] Probar en móvil (F12 → Device Toolbar)
- [ ] Verificar enlaces internos
- [ ] Probar localStorage en consola
- [ ] Verificar que WhatsApp abre correctamente

---

## 🚀 Deploy / Publicar

Para publicar en línea:
1. Copia todos los archivos a tu servidor
2. No necesitas servidor especial (HTML puro)
3. Los datos se guardan en localStorage del navegador
4. Si publicamos en diferentes dominios, cada uno tendrá sus propios datos

**Opciones populares**:
- GitHub Pages (gratis)
- Netlify (gratis)
- Vercel (gratis)
- Tu propio hosting

---

## 📞 Soporte

Si tienes dudas sobre las funcionalidades:
1. Revisa los comentarios en el código
2. Busca la función en `js/` que corresponda
3. Abre la consola (F12) para ver errores
4. Verifica que todos los archivos estén presentes

---

**¡Disfruta tu tienda R&B! 🎉**

# 🛠️ Guía de Desarrollo - ETERNA FRAGANCIA

## 📦 Instalación

### Requisitos Previos
- Node.js 16+ instalado
- npm o yarn
- Git (opcional)

### Pasos de Instalación

```bash
# 1. Navegar al directorio del proyecto
cd c:\Users\vanin\OneDrive\Desktop\r&b-boutique

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# El proyecto estará disponible en: http://localhost:5173
```

---

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   ├── Header.tsx                 # Encabezado con búsqueda y carrito
│   ├── Hero.tsx                   # Banner principal
│   ├── CategoryFilter.tsx         # Filtros de categoría
│   ├── ProductCard.tsx            # Tarjeta de producto
│   ├── ProductModal.tsx           # Modal de producto ampliado
│   ├── CartDrawer.tsx             # Panel lateral de carrito
│   ├── CheckoutModal.tsx          # Formulario de checkout
│   ├── Footer.tsx                 # Pie de página
│   ├── Toast.tsx                  # Notificaciones
│   └── admin/
│       ├── LoginAdmin.tsx         # Login de administrador
│       ├── AdminSidebar.tsx       # Menú lateral admin
│       ├── AdminDashboard.tsx     # Dashboard estadísticas
│       ├── AdminProducts.tsx      # Gestión de productos
│       ├── AdminOrders.tsx        # Gestión de órdenes
│       ├── AdminSettings.tsx      # Configuración de tienda
│       └── ProductFormModal.tsx   # Formulario agregar/editar producto
├── data/
│   └── initialData.ts             # Datos iniciales (productos, órdenes, config)
├── utils/
│   └── formatters.ts              # Funciones utilitarias (formateo, WhatsApp)
├── types.ts                       # Definiciones TypeScript
├── App.tsx                        # Componente principal
├── index.css                      # Estilos globales
└── main.tsx                       # Punto de entrada

public/
└── vite.svg

package.json                       # Dependencias y scripts
tsconfig.json                      # Configuración TypeScript
vite.config.ts                     # Configuración Vite
tailwind.config.js                 # Configuración Tailwind CSS
index.html                         # HTML principal
```

---

## 🔨 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor con hot reload

# Compilación
npm run build           # Compila para producción
npm run preview         # Vista previa del build

# Linting (si está configurado)
npm run lint            # Verificar errores de linting
npm run format          # Formatear código
```

---

## 📝 Editar Productos Iniciales

### Archivo: `src/data/initialData.ts`

Para agregar productos:

```typescript
{
  id: 'prod-unique-id',
  name: 'Nombre del Producto',
  category: 'Bazar', // O Juguetería, Maquillaje, etc.
  price: 15000,
  stock: 20,
  image: 'URL_DE_IMAGEN',
  description: 'Descripción del producto',
  featured: true // Para destacar en inicio
}
```

### Categorías Disponibles
- Bazar
- Juguetería
- Maquillaje
- Perfumería
- Blanquería

---

## 🔐 Cambiar Contraseña Admin

### Archivo: `src/components/admin/LoginAdmin.tsx`

Encontrar línea:
```typescript
const ADMIN_PASSWORD = 'rybadmin2024';
```

Cambiar a tu contraseña:
```typescript
const ADMIN_PASSWORD = 'tuContraseñaSegura123!';
```

⚠️ **IMPORTANTE**: Usar contraseña fuerte en producción

---

## 💄 Personalizar Colores

### Archivo: `src/index.css` y archivos de componentes

Buscar y reemplazar:
- `#D4AF37` → Nuevo color dorado/acento
- `#000000` → Nuevo color negro/primario
- `#f9f9f9` → Nuevo color fondo claro

### Usando Tailwind
Colores personalizados en componentes:
```tsx
className="bg-[#D4AF37] text-black"  // Dorado y negro
```

---

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"  // Iconos
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^4.3.9",
    "tailwindcss": "^3.3.0"
  }
}
```

### Agregar Dependencias
```bash
npm install nombre-paquete
```

---

## 🚀 Deployment

### Opción 1: Vercel (Recomendado)
```bash
npm install -g vercel
vercel login
vercel
```

### Opción 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Opción 3: GitHub Pages
1. Crear repositorio en GitHub
2. Agregar a `vite.config.ts`:
```typescript
export default {
  base: '/r&b-boutique/',  // Tu repositorio
}
```
3. Configurar en GitHub Actions

### Opción 4: Hosting Tradicional
```bash
npm run build
# Subir contenido de la carpeta 'dist/' al servidor
```

---

## 🐛 Debugging

### Ver errores en la consola
- Abrir DevTools: F12 o Ctrl+Shift+I
- Ir a pestaña "Console"
- Revisar localStorage: `Application` → `localStorage`

### Limpiar datos locales
```javascript
// En la consola del navegador:
localStorage.clear()
location.reload()
```

### Variables de desarrollo útiles
En `App.tsx` puedes agregar:
```typescript
console.log('Productos:', products);
console.log('Carrito:', cart);
console.log('Órdenes:', orders);
```

---

## 📊 Estadísticas de Proyect

- **Componentes React**: 18
- **Líneas de código**: ~3,500
- **Productos de ejemplo**: 40+
- **Categorías**: 6
- **Funcionalidades**: 30+

---

## 🔒 Seguridad en Producción

### Antes de publicar:
- ❌ NO guardes contraseñas en código
- ❌ NO uses localhost URLs
- ✅ Usa variables de entorno (`.env`)
- ✅ Implementa HTTPS
- ✅ Valida datos en servidor
- ✅ Usa base de datos real (no localStorage)

### Archivo `.env` (crear en raíz)
```env
VITE_ADMIN_PASSWORD=contraseña_segura
VITE_WHATSAPP_NUMBER=549XXXXXXXXX
VITE_API_URL=https://api.tudominio.com
```

### Usar en código:
```typescript
const password = import.meta.env.VITE_ADMIN_PASSWORD
```

---

## 🎯 Próximas Mejoras Recomendadas

- [ ] Backend con Node/Express
- [ ] Base de datos MongoDB/Firebase
- [ ] Autenticación robusta (JWT)
- [ ] Pagos reales (Stripe/MercadoPago)
- [ ] Email transaccional
- [ ] Sistema de reseñas
- [ ] Wishlist/Favoritos
- [ ] Códigos descuento
- [ ] Analytics avanzado
- [ ] Chat en vivo

---

## 📞 Soporte Técnico

Si tienes problemas:

1. Verifica que Node.js esté instalado: `node -v`
2. Limpia caché: `npm cache clean --force`
3. Borra node_modules: `rm -rf node_modules && npm install`
4. Reinicia el servidor: `npm run dev`

---

**Última actualización**: Agosto 2026
**Versión**: 2.4
**Estado**: ✅ Producción Ready


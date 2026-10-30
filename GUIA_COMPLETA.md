# 🎀 ETERNA FRAGANCIA - Guía Completa

## ✨ Bienvenido a ETERNA FRAGANCIA

Plataforma e-commerce moderna y elegante para ETERNA FRAGANCIA, con catálogo, carrito de compras, integración WhatsApp y panel de administración.

---

## 🚀 Inicio Rápido

### Acceso Público (Tienda)
- **URL**: localhost:5173
- **Características**: Ver catálogo, buscar productos, agregar al carrito, checkout por WhatsApp

### Acceso Admin (Panel de Administración)
- **Botón**: Esquina superior derecha "Ir a Panel Admin"
- **Contraseña**: `rybadmin2024`
- **Funciones**: Gestionar productos, órdenes, configuración

---

## 📋 Funcionalidades Principales

### 1️⃣ PÁGINA PÚBLICA
✅ **Catálogo Completo**
- 40+ productos en 6 categorías (Bazar, Juguetería, Maquillaje, Perfumería, Blanquería)
- Filtro por categoría
- Búsqueda por nombre, categoría o descripción
- Visualización ampliada de productos (modal)

✅ **Carrito de Compras**
- Agregar/quitar productos
- Modificar cantidades
- Cálculo automático del total
- Persistencia en localStorage

✅ **Checkout Integrado**
- Selección de medio de pago (transferencia / efectivo)
- Datos de contacto
- Modalidad de entrega (domicilio / retiro)
- Datos bancarios (mostrados para transferencia)
- **Finalización por WhatsApp** con mensaje automático

✅ **Diseño**
- Elegante esquema negro y dorado
- 100% responsive (móvil, tablet, desktop)
- Animaciones suaves
- Toast notifications

---

### 2️⃣ PANEL ADMIN

#### Dashboard
- **Estadísticas**: Total de productos, disponibles, agotados
- **Órdenes recientes**
- **Acceso rápido** a agregar productos

#### Gestión de Productos
- ✅ **Agregar**: Crear nuevos productos con imagen, precio, stock, etc.
- ✅ **Editar**: Modificar cualquier producto existente
- ✅ **Eliminar**: Remover productos (con confirmación)
- Tabla visual de todos los productos

#### Gestión de Órdenes
- Visualizar todos los pedidos
- Cambiar estados (Processing → Shipped → Delivered → Cancelled)
- Ver detalles completos de cada orden

#### Configuración
- **Datos de la tienda**: Nombre, email, teléfono, dirección
- **WhatsApp**: Número para recibir órdenes
- **Datos bancarios**: CBU, Alias, Titular
- Todos los cambios se guardan automáticamente

---

## 📦 Categorías de Productos

| Categoría | Productos | Ejemplos |
|-----------|-----------|----------|
| 🛒 Bazar | 10 | Vasos, tazas, floreros, organizadores |
| 💄 Maquillaje | 6 | Brochas, paletas, bases, labiales |
| 🌹 Perfumería | 5 | Perfumes, colonias, sprays |
| 🎲 Juguetería | 7 | Ajedrez, puzles, bloques, muñecas |
| 🛏️ Blanquería | 5 | Sábanas, almohadas, frazadas, toallas |

---

## 💳 Métodos de Pago

### Transferencia Bancaria
- Datos configurable en Admin → Configuración
- Se muestra al cliente en checkout
- Datos de ejemplo: CBU, Alias, Banco

### Efectivo
- Contra entrega (envíos)
- Al retirar en sucursal

---

## 🔒 Autenticación

### Admin
- **Login requerido**: Sí
- **Contraseña por defecto**: `rybadmin2024`
- **Almacenamiento**: localStorage
- ⚠️ **IMPORTANTE**: Cambiar en producción

### Cliente
- **Login requerido**: No
- Acceso público al catálogo y compra

---

## 💾 Almacenamiento de Datos

Todo se guarda en **localStorage** del navegador:
- `rb_products`: Catálogo de productos
- `rb_orders`: Órdenes creadas
- `rb_settings`: Configuración de tienda
- `rb_cart`: Carrito actual
- `rb_admin_authenticated`: Sesión admin

**Nota**: Los datos se pierden al limpiar caché del navegador. En producción, usar una base de datos real.

---

## 🎨 Esquema de Colores

| Elemento | Color | Código |
|----------|-------|--------|
| Primario | Negro | #000000 |
| Acento | Dorado | #D4AF37 |
| Fondo | Gris Claro | #f9f9f9 |
| Texto | Gris Oscuro | #1a1c1c |
| Bordes | Gris Medio | #e8e8e8 |

---

## 📱 Responsive Design

✅ Optimizado para:
- 📱 Teléfono (320px - 768px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (1024px+)

Características:
- Menú adaptable
- Grillas responsivas
- Botones touch-friendly
- Mejor legibilidad en móvil

---

## 🔧 Tecnologías Usadas

- **Framework**: React 18 + TypeScript
- **Bundler**: Vite
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Almacenamiento**: localStorage
- **Integración**: WhatsApp API

---

## 📝 Datos de Ejemplo Incluidos

### Productos de Demostración
✅ 40+ productos reales con:
- Imágenes de calidad
- Descripciones completas
- Precios variados
- Stock disponible
- Categorías asignadas

### Órdenes de Demostración
✅ 3 órdenes ejemplo en diferentes estados para ver el panel de admin

### Configuración Inicial
- **Nombre Tienda**: ETERNA FRAGANCIA
- **WhatsApp**: +54 9 11 1234 5678
- **Dirección**: Honduras 4820, Palermo Soho, CABA
- **Banco**: Banco de la Nacion (datos ficticios)

---

## 🚀 Próximos Pasos

### Personalización Básica
1. Cambiar contraseña admin (en el código `LoginAdmin.tsx`)
2. Actualizar número de WhatsApp en Admin → Configuración
3. Actualizar datos bancarios en Admin → Configuración
4. Reemplazar imágenes de productos

### Para Producción
1. Usar base de datos real (Firebase, Supabase, MongoDB)
2. Implementar autenticación robusta (JWT, OAuth)
3. Agregar métodos de pago reales (Stripe, MercadoPago)
4. Configurar dominio personalizado
5. Agregar certificado SSL
6. Implementar analytics

---

## ❓ FAQ

**¿Cómo agrego nuevos productos?**
→ Panel Admin → Productos → Agregar Producto

**¿Dónde veo las órdenes?**
→ Panel Admin → Órdenes

**¿Puedo cambiar los colores?**
→ Sí, en `index.css` y componentes (buscar #D4AF37 y #000000)

**¿Puedo agregar más categorías?**
→ Sí, actualizar `types.ts` y `App.tsx`

**¿Cómo funciona el checkout?**
→ El cliente ingresa datos → Se genera mensaje WhatsApp con detalles → Se abre WhatsApp automáticamente

**¿Dónde están guardados mis datos?**
→ En localStorage del navegador (no en servidor)

---

## 📞 Contacto & Soporte

Para mejoras o soporte técnico, contacta al desarrollador.

---

**ETERNA FRAGANCIA** ✨  
*Elegancia en cada detalle*


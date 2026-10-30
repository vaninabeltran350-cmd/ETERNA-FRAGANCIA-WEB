# 🚀 EMPEZAR AQUÍ - ETERNA FRAGANCIA

## 1️⃣ Instalación (5 minutos)

### Si aún no tienes Node.js instalado:
1. Descarga desde [nodejs.org](https://nodejs.org/)
2. Instala la versión LTS (recomendado)
3. Verifica: Abre PowerShell/CMD y escribe `node -v` y `npm -v`

### Instalación del proyecto:
```powershell
cd c:\Users\vanin\OneDrive\Desktop\r&b-boutique
npm install
npm run dev
```

### Abre en tu navegador:
```
http://localhost:5173
```

---

## 2️⃣ Prueba Rápida (2 minutos)

### Tienda Pública
1. ✅ Busca un producto (ej: "Perfume")
2. ✅ Haz clic en una tarjeta
3. ✅ Agrega al carrito
4. ✅ Haz clic en el ícono carrito
5. ✅ Haz clic "Finalizar Pedido"
6. ✅ Ingresa tu nombre
7. ✅ Selecciona "Transferencia"
8. ✅ Copia los datos bancarios
9. ✅ Clic en "Finalizar por WhatsApp" (se abrirá)

### Panel Admin
1. ✅ Clic en "Ir a Panel Admin" (esquina superior derecha)
2. ✅ Ingresa contraseña: `rybadmin2024`
3. ✅ Explora Dashboard, Productos, Órdenes, Configuración
4. ✅ Prueba agregar un producto
5. ✅ Regresa a la Tienda con el botón "Volver a la Tienda"

---

## 📱 Acceso en Móvil

```
http://tuIP:5173

# Para encontrar tu IP local:
# Windows: ipconfig
# Mac/Linux: ifconfig
```

---

## 🎨 Personalización Rápida

### Cambiar Contraseña Admin
Archivo: `src/components/admin/LoginAdmin.tsx`
```typescript
const ADMIN_PASSWORD = 'tu_nueva_contraseña';
```

### Cambiar Número WhatsApp
1. Entra al Panel Admin
2. Ir a "Configuración"
3. Cambiar "Número de WhatsApp"
4. Guardar (automático)

### Cambiar Datos Bancarios
1. Panel Admin → Configuración
2. Editar: Banco, CBU, Alias, Titular
3. Guardar (automático)

### Cambiar Colores Principales
Buscar en archivos `.tsx`:
- `#D4AF37` → Nuevo color dorado
- `#000000` → Nuevo color negro

---

## 📚 Documentación Completa

- **GUIA_COMPLETA.md** - Para usuarios y tienda
- **GUIA_DESARROLLO.md** - Para desarrolladores
- **CHECKLIST_PRUEBA.md** - Lista de verificación

---

## 🆘 Solución de Problemas

### "npm no está instalado"
→ Descargar [Node.js LTS](https://nodejs.org/)

### "El puerto 5173 ya está en uso"
→ Ejecutar: `npm run dev -- --port 5174`

### "Las imágenes no cargan"
→ Es normal si no hay conexión. En producción usar imágenes propias.

### "Datos se borraron"
→ Se guardaban en localStorage. Abre DevTools (F12) e importa datos.

---

## 📦 Estructura Rápida

```
📁 r&b-boutique/
├── 📁 src/
│   ├── components/     ← Componentes React
│   ├── data/          ← Productos, órdenes, config
│   ├── utils/         ← Funciones útiles
│   └── App.tsx        ← App principal
├── 📄 GUIA_COMPLETA.md
├── 📄 GUIA_DESARROLLO.md
├── 📄 CHECKLIST_PRUEBA.md
└── 📄 package.json
```

---

## ✨ Features Principales

✅ **Catálogo Completo**
- 40+ productos
- 6 categorías
- Búsqueda avanzada
- Filtros

✅ **Carrito Funcional**
- Agregar/quitar
- Actualizar cantidad
- Totales automáticos

✅ **Checkout por WhatsApp**
- Medio de pago seleccionable
- Datos bancarios
- Envío o retiro
- Mensaje automático

✅ **Panel Admin**
- Agregar/editar/eliminar productos
- Ver órdenes y cambiar estados
- Configurar tienda

✅ **Diseño Premium**
- Negro y Dorado
- Responsive
- Animaciones suaves

---

## 🔐 Credenciales

### Admin
- **Usuario**: (no requiere)
- **Contraseña**: `rybadmin2024`

### Datos de Ejemplo
- **Teléfono**: +54 9 11 1234 5678
- **Dirección**: Honduras 4820, Palermo Soho
- **Banco**: Banco de la Nación (datos ficticios)

---

## 📞 Soporte Técnico

Si tienes problemas:

1. Revisa CHECKLIST_PRUEBA.md
2. Abre Developer Tools (F12)
3. Revisa la consola (Console tab)
4. Contacta al equipo técnico

---

## 🎯 Próximos Pasos

1. ✅ Instala y prueba
2. ✅ Personaliza (colores, datos)
3. ✅ Agrega tus productos
4. ✅ Deploy a producción
5. ✅ ¡Anuncia tu tienda!

---

**¡Bienvenido a ETERNA FRAGANCIA!** 🎀

Versión: 2.4 | Estado: ✅ Listo para Usar


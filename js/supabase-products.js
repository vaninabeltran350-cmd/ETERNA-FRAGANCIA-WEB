import { supabase } from './supabase-client.js';
const PRODUCT_SELECT = `id, nombre, descripcion, precio, categoria_id, imagen_url, stock, estado, destacado, created_at, updated_at`;

function getSupabaseErrorInfo(error) {
    return {
        query: error?.query ?? null,
        code: error?.code ?? null,
        message: error?.message ?? null,
        details: error?.details ?? null,
        hint: error?.hint ?? null,
        status: error?.status ?? null,
    };
}

function markSupabaseQueryError(error, query) {
    if (error && typeof error === 'object') error.query = query;
    return error;
}

function logSupabaseError(context, error) {
    console.error(`[Supabase] ${context}`, getSupabaseErrorInfo(error));
}

function requireClient() {
    if (!supabase) throw new Error('Supabase Database no está configurado.');
    return supabase;
}

function normalizeCategoryName(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function normalizeCategorySlug(value) {
    return normalizeCategoryName(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function statusToDatabaseValue(status) {
    if (status === 'disponible' || status === true) return true;
    if (status === 'agotado' || status === false) return false;
    throw new Error('El estado del producto no es válido.');
}

function normalizeVariants(variants) {
    if (variants === undefined || variants === null) return [];
    if (!Array.isArray(variants)) throw new Error('Las variantes del producto no son válidas.');
    const seen = new Set();
    return variants.map((variant) => {
        const aroma = String(variant?.aroma ?? '').trim();
        const stock = Number(variant?.stock);
        const key = normalizeCategoryName(aroma);
        if (!aroma) throw new Error('Cada variante debe tener un aroma.');
        if (seen.has(key)) throw new Error('No puede haber aromas repetidos en un producto.');
        if (variant?.stock === '' || variant?.stock === null || variant?.stock === undefined || !Number.isInteger(stock) || stock < 0) throw new Error(`El stock de "${aroma}" debe ser un número entero mayor o igual a cero.`);
        seen.add(key);
        return { id: Number.isInteger(Number(variant?.id)) && Number(variant.id) > 0 ? Number(variant.id) : null, aroma, stock };
    });
}

function normalizeProductInput(product) {
    const variants = normalizeVariants(product?.variantes);
    const imageList = Array.isArray(product?.imagenes)
        ? product.imagenes.map((image) => String(image ?? '').trim()).filter(Boolean)
        : (product?.imagen ? [String(product.imagen).trim()] : []);
    const uniqueImages = [...new Set(imageList)];
    const priceValue = product?.precio;
    const stockValue = product?.stock;
    const requestedStock = Number(stockValue);
    const stock = variants.length ? variants.reduce((sum, variant) => sum + variant.stock, 0) : requestedStock;
    const status = variants.length ? (stock > 0 ? 'disponible' : 'agotado') : String(product?.estado ?? '').trim();
    const normalized = {
        nombre: String(product?.nombre ?? '').trim(),
        descripcion: String(product?.descripcion ?? '').trim(),
        categoria: String(product?.categoria ?? '').trim(),
        precio: Number(priceValue),
        stock,
        imagen: uniqueImages[0] || null,
        imagenes: uniqueImages,
        destacado: Boolean(product?.destacado),
        estado: status,
        variantes: variants,
    };
    if (!normalized.nombre) throw new Error('El nombre del producto es obligatorio.');
    if (!normalized.categoria) throw new Error('La categoría del producto es obligatoria.');
    if (priceValue === '' || priceValue === null || priceValue === undefined || !Number.isFinite(normalized.precio) || normalized.precio < 0) throw new Error('El precio debe ser un número válido mayor o igual a cero.');
    if ((!variants.length && (stockValue === '' || stockValue === null || stockValue === undefined)) || !Number.isInteger(normalized.stock) || normalized.stock < 0) throw new Error('El stock debe ser un número entero mayor o igual a cero.');
    if (!['disponible', 'agotado'].includes(normalized.estado)) throw new Error('El estado del producto no es válido.');
    return normalized;
}

async function requireAuthenticatedClient() {
    const authenticatedClient = requireClient();
    const { data, error } = await authenticatedClient.auth.getUser();
    if (error || !data?.user) throw new Error('La operación requiere una sesión autenticada de Supabase.');
    return authenticatedClient;
}

async function requireAdminClient() {
    const authenticatedClient = await requireAuthenticatedClient();
    const { data, error } = await authenticatedClient.rpc('es_admin');

    if (error) {
        throw new Error('No se pudo verificar la autorización administrativa. Aplicá primero la migración de permisos.');
    }
    if (data !== true) {
        throw new Error('La sesión actual no tiene permisos de administrador para gestionar productos o variantes.');
    }

    return authenticatedClient;
}

async function resolveCategoryId(supabaseClient, value) {
    const { data, error } = await supabaseClient.from('categorias').select('id, nombre');
    if (error) throw error;
    const slug = normalizeCategorySlug(value);
    const category = data.find((item) => normalizeCategorySlug(item.nombre) === slug);
    if (!category) throw new Error('La categoría seleccionada no existe en Supabase.');
    return category.id;
}

function toDatabaseProduct(product, categoriaId) {
    return { nombre: product.nombre, descripcion: product.descripcion, precio: product.precio, stock: product.stock, categoria_id: categoriaId, imagen_url: product.imagen, destacado: product.destacado, estado: statusToDatabaseValue(product.estado) };
}

function adaptVariant(variant) {
    return { id: variant.id, aroma: variant.aroma, stock: Number(variant.stock) || 0, disponible: Number(variant.stock) > 0 };
}

function adaptSupabaseProduct(product, categoryMap, variants = [], images = []) {
    // Las variantes con stock 0 pueden conservarse por pedidos históricos,
    // pero no deben obligar a elegir un aroma ni controlar el stock general.
    const adaptedVariants = variants.map(adaptVariant).filter((variant) => variant.stock > 0);
    const hasVariants = adaptedVariants.length > 0;
    const stock = hasVariants ? adaptedVariants.reduce((sum, variant) => sum + variant.stock, 0) : Number(product.stock) || 0;
    const primaryImage = String(product.imagen_url ?? '').trim();
    const relatedImages = images.map((image) => String(image?.imagen_url ?? '').trim());
    const imagenes = [...new Set([primaryImage, ...relatedImages].filter(Boolean))];
    return {
        id: product.id,
        nombre: product.nombre,
        categoria: normalizeCategorySlug(categoryMap.get(String(product.categoria_id))),
        descripcion: product.descripcion,
        precio: product.precio,
        stock,
        imagen: product.imagen_url ?? null,
        imagenes,
        destacado: product.destacado,
        estado: hasVariants ? (stock > 0 ? 'disponible' : 'agotado') : (product.estado ? 'disponible' : 'agotado'),
        variantes: adaptedVariants,
        created_at: product.created_at,
        updated_at: product.updated_at,
    };
}

function isMissingVariantsTableError(error) {
    const errorCode = String(error?.code || '').toUpperCase();
    return errorCode === '42P01' || errorCode === 'PGRST205';
}

function isMissingImagesTableError(error) {
    const errorCode = String(error?.code || '').toUpperCase();
    return errorCode === '42P01' || errorCode === 'PGRST205';
}

async function getVariantsByProductIds(supabaseClient, ids, allowMissingTable = false) {
    if (!ids.length) return new Map();
    const { data, error } = await supabaseClient.from('producto_variantes').select('id, producto_id, aroma, stock, created_at, updated_at').in('producto_id', ids);
    if (error) {
        if (allowMissingTable && isMissingVariantsTableError(error)) {
            console.warn('La tabla producto_variantes todavía no existe; se continúa con productos sin variantes.');
            return new Map();
        }
        const queryError = markSupabaseQueryError(error, 'producto_variantes');
        logSupabaseError('No se pudieron consultar producto_variantes', queryError);
        throw queryError;
    }
    return data.reduce((map, variant) => {
        if (!map.has(variant.producto_id)) map.set(variant.producto_id, []);
        map.get(variant.producto_id).push(variant);
        return map;
    }, new Map());
}

async function getImagesByProductIds(supabaseClient, ids) {
    if (!ids.length) return new Map();
    const { data, error } = await supabaseClient
        .from('producto_imagenes')
        .select('id, producto_id, imagen_url, imagen_storage_path, orden, created_at, updated_at')
        .in('producto_id', ids)
        .order('orden', { ascending: true })
        .order('id', { ascending: true });
    if (error) {
        if (isMissingImagesTableError(error)) {
            console.warn('La tabla producto_imagenes todavía no existe; se utiliza imagen_url como fallback.');
            return new Map();
        }
        const queryError = markSupabaseQueryError(error, 'producto_imagenes');
        logSupabaseError('No se pudieron consultar imágenes de productos', queryError);
        throw queryError;
    }
    return data.reduce((map, image) => {
        if (!map.has(image.producto_id)) map.set(image.producto_id, []);
        map.get(image.producto_id).push(image);
        return map;
    }, new Map());
}

async function getSupabaseCategories() {
    const { data, error } = await requireClient().from('categorias').select('id, nombre');
    if (error) {
        const queryError = markSupabaseQueryError(error, 'categorias');
        logSupabaseError('No se pudieron consultar categorias', queryError);
        throw queryError;
    }
    return data;
}

async function getSupabaseProducts() {
    const supabaseClient = requireClient();
    console.time('Catálogo: getSupabaseProducts');
    console.time('Supabase categorías');
    let categories;
    try {
        categories = await getSupabaseCategories();
    } finally {
        console.timeEnd('Supabase categorías');
    }
    // Supabase puede serializar un bigint/UUID de forma distinta entre consultas.
    // La clave textual evita perder la relación categoria_id -> nombre por una
    // diferencia de representación (por ejemplo, 1 frente a "1").
    const categoryMap = new Map(categories.map((category) => [String(category.id), category.nombre]));
    console.time('Supabase productos');
    let data;
    let error;
    try {
        ({ data, error } = await supabaseClient.from('productos').select(PRODUCT_SELECT));
    } finally {
        console.timeEnd('Supabase productos');
    }
    if (error) {
        const queryError = markSupabaseQueryError(error, 'productos');
        logSupabaseError('No se pudieron consultar productos', queryError);
        throw queryError;
    }
    const productIds = data.map((product) => product.id);
    const [variants, images] = await Promise.all([
        (async () => {
            console.time('Supabase variantes');
            try {
                return await getVariantsByProductIds(supabaseClient, productIds, true);
            } finally {
                console.timeEnd('Supabase variantes');
            }
        })(),
        (async () => {
            console.time('Supabase imágenes');
            try {
                return await getImagesByProductIds(supabaseClient, productIds);
            } finally {
                console.timeEnd('Supabase imágenes');
            }
        })(),
    ]);
    console.time('Catálogo: adaptación de productos');
    const adaptedProducts = data.map((product) => adaptSupabaseProduct(product, categoryMap, variants.get(product.id) || [], images.get(product.id) || []));
    console.timeEnd('Catálogo: adaptación de productos');
    console.timeEnd('Catálogo: getSupabaseProducts');
    return adaptedProducts;
}

async function saveProductVariants(supabaseClient, productId, variants) {
    const existing = await supabaseClient.from('producto_variantes').select('id, aroma').eq('producto_id', productId);
    if (existing.error) {
        if (isMissingVariantsTableError(existing.error) && !variants.length) {
            console.warn('La tabla producto_variantes todavía no existe; se guarda el producto sin variantes.');
            return;
        }
        if (isMissingVariantsTableError(existing.error)) {
            throw new Error('La tabla producto_variantes todavía no existe en Supabase. Revisá y ejecutá la migración SQL antes de guardar aromas.');
        }
        throw existing.error;
    }
    const existingRows = existing.data || [];
    const existingIds = new Set(existingRows.map((variant) => Number(variant.id)));
    const existingByAroma = new Map(existingRows.map((variant) => [normalizeCategoryName(variant.aroma), Number(variant.id)]));
    const matchedExistingIds = new Set();
    const variantsToSave = variants.map((variant) => {
        const explicitId = variant.id && existingIds.has(variant.id) ? variant.id : null;
        const matchingId = existingByAroma.get(normalizeCategoryName(variant.aroma));
        const id = explicitId || (!matchedExistingIds.has(matchingId) ? matchingId : null);
        if (id) matchedExistingIds.add(id);
        return { ...variant, id: id || null };
    });
    const incomingIds = new Set(variantsToSave.filter((variant) => variant.id).map((variant) => variant.id));
    const removedIds = [...existingIds].filter((id) => !incomingIds.has(id));
    const referencedIds = new Set();
    if (removedIds.length) {
        const references = await supabaseClient
            .from('pedido_items')
            .select('variante_id')
            .in('variante_id', removedIds);
        if (references.error) {
            if (!['42P01', 'PGRST205'].includes(references.error.code)) throw references.error;
            console.warn('No se pudo consultar pedido_items; se continúa porque la tabla todavía no existe.');
        } else {
            (references.data || []).forEach((item) => referencedIds.add(Number(item.variante_id)));
        }
    }
    const deletableIds = removedIds.filter((id) => !referencedIds.has(id));
    if (deletableIds.length) {
        const { error } = await supabaseClient.from('producto_variantes').delete().in('id', deletableIds);
        if (error) throw error;
    }
    if (referencedIds.size) {
        const { error } = await supabaseClient
            .from('producto_variantes')
            .update({ stock: 0, updated_at: new Date().toISOString() })
            .in('id', [...referencedIds]);
        if (error) throw error;
    }
    if (!variantsToSave.length) return;
    const rows = variantsToSave.map((variant) => ({
        ...(variant.id && existingIds.has(variant.id) ? { id: variant.id } : {}),
        producto_id: productId,
        aroma: variant.aroma,
        stock: variant.stock,
        updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseClient.from('producto_variantes').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
}

async function saveProductImages(supabaseClient, productId, images) {
    const normalizedImages = [...new Set((images || []).map((image) => String(image ?? '').trim()).filter(Boolean))];
    const existing = await supabaseClient.from('producto_imagenes').select('id').eq('producto_id', productId);
    if (existing.error) {
        if (isMissingImagesTableError(existing.error) && normalizedImages.length <= 1) {
            console.warn('La tabla producto_imagenes todavía no existe; se conserva imagen_url como fuente única.');
            return;
        }
        if (isMissingImagesTableError(existing.error)) {
            throw new Error('La tabla producto_imagenes todavía no existe en Supabase. Revisá y ejecutá la migración 007 antes de guardar varias imágenes.');
        }
        throw existing.error;
    }
    const existingIds = (existing.data || []).map((image) => image.id);
    if (existingIds.length) {
        const { error } = await supabaseClient.from('producto_imagenes').delete().in('id', existingIds);
        if (error) throw error;
    }
    if (!normalizedImages.length) return;
    const rows = normalizedImages.map((imagen_url, orden) => ({
        producto_id: productId,
        imagen_url,
        orden,
        updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseClient.from('producto_imagenes').insert(rows);
    if (error) throw error;
}

async function createSupabaseProduct(product) {
    const supabaseClient = await requireAdminClient();
    const normalized = normalizeProductInput(product);
    const categoryId = await resolveCategoryId(supabaseClient, normalized.categoria);
    const { data, error } = await supabaseClient.from('productos').insert(toDatabaseProduct(normalized, categoryId)).select(PRODUCT_SELECT).single();
    if (error) throw error;
    try {
        if (normalized.variantes.length) await saveProductVariants(supabaseClient, data.id, normalized.variantes);
        await saveProductImages(supabaseClient, data.id, normalized.imagenes);
    } catch (variantError) {
        // Intentar limpiar las filas auxiliares antes de quitar el producto.
        // La FK de variantes es RESTRICT, por eso el orden es importante.
        await saveProductVariants(supabaseClient, data.id, []).catch(() => {});
        await supabaseClient.from('producto_imagenes').delete().eq('producto_id', data.id);
        await supabaseClient.from('productos').delete().eq('id', data.id);
        throw new Error(`El producto no se guardó porque fallaron sus variantes o imágenes: ${variantError.message}`);
    }
    return data;
}

async function updateSupabaseProduct(id, product) {
    const supabaseClient = await requireAdminClient();
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) throw new Error('El identificador del producto no es válido.');
    const normalized = normalizeProductInput(product);
    const categoryId = await resolveCategoryId(supabaseClient, normalized.categoria);
    const { data, error } = await supabaseClient.from('productos').update(toDatabaseProduct(normalized, categoryId)).eq('id', productId).select(PRODUCT_SELECT).single();
    if (error) throw error;
    await saveProductVariants(supabaseClient, productId, normalized.variantes);
    await saveProductImages(supabaseClient, productId, normalized.imagenes);
    return data;
}

async function deleteSupabaseProduct(id) {
    const supabaseClient = await requireAdminClient();
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) throw new Error('El identificador del producto no es válido.');
    const { data, error } = await supabaseClient.from('productos').delete().eq('id', productId).select('id');
    if (error) throw error;
    if (!data?.length) throw new Error('El producto no existe en Supabase o no puede eliminarse con la sesión actual.');
    return data[0];
}

async function createSupabaseOrder(order) {
    const supabaseClient = requireClient();
    const items = (order.items || []).map((item) => ({
        product_id: Number(item.id),
        variant_id: item.variantId === null || item.variantId === undefined || item.variantId === '' ? null : Number(item.variantId),
        quantity: Number(item.cantidad),
    }));
    const { data, error } = await supabaseClient.rpc('create_pending_order', {
        p_order_key: String(order.orderKey || ''),
        p_customer_name: String(order.customerName || ''),
        p_customer_email: String(order.customerEmail || ''),
        p_customer_phone: String(order.customerPhone || ''),
        p_payment_method: String(order.paymentMethod || ''),
        p_notes: String(order.notes || ''),
        p_items: items,
    });
    if (error) throw error;
    return data;
}

async function getSupabaseOrders() {
    const supabaseClient = await requireAdminClient();
    const { data: orders, error: ordersError } = await supabaseClient
        .from('pedidos')
        .select('id, order_key, creado_at, estado, customer_name, customer_email, customer_phone, payment_method, notes, subtotal, total, confirmado_at, confirmado_por')
        .order('creado_at', { ascending: false });
    if (ordersError) throw ordersError;
    if (!orders.length) return [];

    const { data: items, error: itemsError } = await supabaseClient
        .from('pedido_items')
        .select('id, pedido_id, producto_id, variante_id, producto_nombre, aroma, cantidad, precio_unitario, subtotal')
        .in('pedido_id', orders.map((order) => order.id))
        .order('id');
    if (itemsError) throw itemsError;

    const itemsByOrder = items.reduce((map, item) => {
        if (!map.has(item.pedido_id)) map.set(item.pedido_id, []);
        map.get(item.pedido_id).push({
            itemId: item.id,
            id: item.producto_id,
            variantId: item.variante_id,
            nombre: item.producto_nombre,
            aroma: item.aroma,
            cantidad: item.cantidad,
            precio: item.precio_unitario,
            subtotal: item.subtotal,
        });
        return map;
    }, new Map());

    return orders.map((order) => ({
        id: order.id,
        orderKey: order.order_key,
        fecha: order.creado_at,
        estado: order.estado,
        cliente: { nombre: order.customer_name, email: order.customer_email, telefono: order.customer_phone },
        metodoPago: order.payment_method,
        notas: order.notes,
        subtotal: order.subtotal,
        total: order.total,
        items: itemsByOrder.get(order.id) || [],
    }));
}

async function updateSupabaseOrderStatus(orderKey, status) {
    const supabaseClient = await requireAdminClient();
    const { data, error } = await supabaseClient.rpc('update_order_status', {
        p_order_key: String(orderKey || ''),
        p_status: String(status || ''),
    });
    if (error) throw error;
    return data;
}

async function removeSupabaseOrderItem(orderId, itemId) {
    const supabaseClient = await requireAdminClient();
    const { data, error } = await supabaseClient.rpc('remove_order_item', {
        p_order_id: Number(orderId),
        p_item_id: Number(itemId),
    });
    if (error) throw error;
    return data;
}

async function confirmSupabaseOrderStock(orderKey) {
    const supabaseClient = await requireAdminClient();
    const { data, error } = await supabaseClient.rpc('confirm_order_stock', {
        p_order_key: String(orderKey || ''),
    });
    if (error) throw error;
    return data;
}

export { getSupabaseProducts, getSupabaseCategories, adaptSupabaseProduct, createSupabaseProduct, updateSupabaseProduct, deleteSupabaseProduct, createSupabaseOrder, getSupabaseOrders, updateSupabaseOrderStatus, removeSupabaseOrderItem, confirmSupabaseOrderStock };

import { isSupabaseConfigured, supabase } from './supabase-client.js';
const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_IMAGES_BUCKET || 'product-images';

function assertConfigured() {
    if (!supabase) {
        throw new Error('Supabase Storage no está configurado. Completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
    }
}

async function uploadProductImage(blob, productId) {
    assertConfigured();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        throw new Error('La subida requiere una sesión autenticada de Supabase.');
    }

    if (!(blob instanceof Blob) || blob.type !== 'image/webp') {
        throw new Error('La imagen debe ser un Blob WebP válido.');
    }

    const safeProductId = String(productId).replace(/[^a-zA-Z0-9_-]/g, '-');
    const uniqueName = `${crypto.randomUUID()}.webp`;
    const path = `products/${safeProductId}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, blob, {
            cacheControl: '31536000',
            contentType: 'image/webp',
            upsert: false,
        });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('Supabase no devolvió una URL pública para la imagen.');
    return data.publicUrl;
}

async function uploadHeroImage(source) {
    assertConfigured();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        throw new Error('La subida del hero requiere una sesión autenticada de Supabase.');
    }

    const blob = source instanceof Blob
        ? source
        : typeof source === 'string' && source.startsWith('data:image/')
            ? await fetch(source).then((response) => {
                if (!response.ok) throw new Error('No se pudo leer la imagen del hero.');
                return response.blob();
            })
            : null;
    if (!blob) {
        throw new Error('La imagen remota del hero ya está guardada; no es necesario volver a subirla.');
    }

    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedTypes.includes(blob.type.toLowerCase())) {
        throw new Error('La imagen del hero debe ser JPG, JPEG, PNG o WEBP.');
    }

    const uploadBlob = blob.type.toLowerCase() === 'image/webp'
        ? blob
        : await convertImageToWebp(blob);
    const path = `hero/${crypto.randomUUID()}.webp`;
    const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, uploadBlob, {
            cacheControl: '31536000',
            contentType: 'image/webp',
            upsert: false,
        });

    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('Supabase no devolvió una URL pública para el hero.');
    return data.publicUrl;
}

function convertImageToWebp(blob, quality = 0.9) {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(blob);
        const image = new Image();

        image.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                const context = canvas.getContext('2d');
                if (!context) throw new Error('No se pudo preparar la imagen del hero.');
                context.drawImage(image, 0, 0);
                canvas.toBlob((webpBlob) => {
                    if (!webpBlob) {
                        reject(new Error('El navegador no pudo convertir la imagen del hero a WEBP.'));
                        return;
                    }
                    resolve(webpBlob);
                }, 'image/webp', quality);
            } catch (error) {
                reject(error);
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('No se pudo leer la imagen del hero.'));
        };
        image.src = objectUrl;
    });
}

window.SupabaseImageStorage = {
    bucket: STORAGE_BUCKET,
    isConfigured: isSupabaseConfigured,
    uploadProductImage,
    uploadHeroImage,
};

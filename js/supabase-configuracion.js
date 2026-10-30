import { supabase } from './supabase-client.js';

const CONFIG_ID = 1;
const PUBLIC_CONFIG_FIELDS = [
    'storeName',
    'storeDescription',
    'storeLogo',
    'whatsappNumber',
    'instagramUsername',
    'storeAddress',
    'storeHours',
    'heroEyebrow',
    'heroTitle',
    'heroDescription',
    'heroImage',
];

const DATABASE_FIELDS = {
    storeName: 'store_name',
    storeDescription: 'store_description',
    storeLogo: 'store_logo',
    whatsappNumber: 'whatsapp_number',
    instagramUsername: 'instagram_username',
    storeAddress: 'store_address',
    storeHours: 'store_hours',
    heroEyebrow: 'hero_eyebrow',
    heroTitle: 'hero_title',
    heroDescription: 'hero_description',
    heroImage: 'hero_image_url',
};

function requireClient() {
    if (!supabase) throw new Error('Supabase Database no está configurado.');
    return supabase;
}

function getErrorInfo(error) {
    return {
        code: error?.code ?? null,
        message: error?.message ?? null,
        details: error?.details ?? null,
        hint: error?.hint ?? null,
    };
}

function logConfigError(context, error) {
    console.error(`[Supabase] ${context}`, getErrorInfo(error));
}

function mapDatabaseConfig(row) {
    if (!row || typeof row !== 'object') return null;
    return Object.fromEntries(PUBLIC_CONFIG_FIELDS.map((field) => [field, row[field] ?? '']));
}

function buildDatabaseConfig(config) {
    return Object.fromEntries(Object.entries(DATABASE_FIELDS).map(([field, column]) => [
        column,
        config[field] ?? null,
    ]));
}

async function loadRemoteStoreConfig() {
    try {
        const client = requireClient();
        const { data, error } = await client.rpc('get_public_store_config');
        if (error) throw error;

        const remoteConfig = mapDatabaseConfig(data);
        if (remoteConfig) {
            Object.assign(window.CONFIG, remoteConfig);
            if (typeof window.saveConfig === 'function') window.saveConfig();
            if (typeof window.updatePublicHero === 'function') window.updatePublicHero();
            window.dispatchEvent(new CustomEvent('supabase-config-loaded', { detail: remoteConfig }));
        }
        return remoteConfig;
    } catch (error) {
        logConfigError('No se pudo cargar la configuración remota; se conserva el respaldo local.', error);
        window.dispatchEvent(new CustomEvent('supabase-config-load-failed', { detail: getErrorInfo(error) }));
        return null;
    }
}

async function saveRemoteStoreConfig(config = window.CONFIG) {
    const client = requireClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData?.user) {
        throw new Error('La configuración requiere una sesión autenticada de Supabase.');
    }

    const { data: isAdmin, error: adminError } = await client.rpc('es_admin');
    if (adminError) throw adminError;
    if (isAdmin !== true) throw new Error('La sesión actual no tiene permisos de administrador.');

    const { data, error } = await client
        .from('configuracion')
        .upsert({ id: CONFIG_ID, ...buildDatabaseConfig(config) }, { onConflict: 'id' })
        .select('*')
        .single();
    if (error) throw error;

    const savedConfig = mapDatabaseConfig(data);
    Object.assign(window.CONFIG, savedConfig);
    if (typeof window.saveConfig === 'function') window.saveConfig();
    if (typeof window.updatePublicHero === 'function') window.updatePublicHero();
    window.dispatchEvent(new CustomEvent('supabase-config-saved', { detail: savedConfig }));
    return savedConfig;
}

window.SupabaseStoreConfig = {
    isConfigured: Boolean(supabase),
    loadRemoteStoreConfig,
    saveRemoteStoreConfig,
};

window.supabaseConfigReady = loadRemoteStoreConfig();

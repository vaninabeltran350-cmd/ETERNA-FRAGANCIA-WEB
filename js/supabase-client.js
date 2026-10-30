const viteEnv = import.meta.env || {};
const SUPABASE_URL = viteEnv.VITE_SUPABASE_URL || 'https://ldxgmtkhwaqvtlauntmq.supabase.co';
const SUPABASE_ANON_KEY = viteEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vDNoUQRRz2B2mf_lOGEZzw_ekJULNql';
const createClient = globalThis.supabase?.createClient;

if (typeof createClient !== 'function') {
    throw new Error('No se encontró createClient en el bundle UMD de Supabase.');
}

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export const isSupabaseConfigured = Boolean(supabase);

import { createClient } from '@supabase/supabase-js';

const viteEnv = import.meta.env || {};
const SUPABASE_URL = viteEnv.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = viteEnv.VITE_SUPABASE_ANON_KEY;

const missingEnvironmentVariables = [
    !SUPABASE_URL ? 'VITE_SUPABASE_URL' : null,
    !SUPABASE_ANON_KEY ? 'VITE_SUPABASE_ANON_KEY' : null,
].filter(Boolean);

const hasSecretKey = typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY.startsWith('sb_secret_');
const hasPublicKey = typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY.startsWith('sb_publishable_');

if (missingEnvironmentVariables.length > 0) {
    console.error(
        `[Supabase] Configuración incompleta. Faltan: ${missingEnvironmentVariables.join(', ')}. ` +
        'Definí estas variables en el entorno de Vite/Netlify.',
    );
}

if (hasSecretKey) {
    console.error('[Supabase] VITE_SUPABASE_ANON_KEY no puede ser una clave secreta.');
}

if (SUPABASE_ANON_KEY && !hasPublicKey && !hasSecretKey) {
    console.error('[Supabase] VITE_SUPABASE_ANON_KEY debe ser una clave pública sb_publishable_.');
}

const canInitializeSupabase =
    missingEnvironmentVariables.length === 0 &&
    hasPublicKey &&
    !hasSecretKey;

export const supabase = canInitializeSupabase
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export const isSupabaseConfigured = Boolean(supabase);

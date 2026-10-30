import { isSupabaseConfigured, supabase } from './supabase-client.js';
import '@hcaptcha/vanilla-hcaptcha';

const PASSWORD_RESET_REDIRECT = 'https://polirrubro.test:3001/pages/reset-password.html';

function requireClient() {
    if (!supabase) throw new Error('Supabase Auth no está configurado.');
    return supabase;
}

async function signInWithPassword(email, password, captchaToken) {
    const { data, error } = await requireClient().auth.signInWithPassword({
        email,
        password,
        options: {
            captchaToken
        }
    });
    if (error) throw error;
    return data;
}

async function resetPasswordForEmail(email, captchaToken) {
    const { error } = await requireClient().auth.resetPasswordForEmail(email, {
        redirectTo: PASSWORD_RESET_REDIRECT,
        captchaToken
    });
    if (error) throw error;
}

async function updatePassword(password) {
    const { data, error } = await requireClient().auth.updateUser({ password });
    if (error) throw error;
    return data;
}

async function getSession() {
    const { data, error } = await requireClient().auth.getSession();
    if (error) throw error;
    return data.session;
}

function onAuthStateChange(callback) {
    return requireClient().auth.onAuthStateChange(callback);
}

async function signOut() {
    const { error } = await requireClient().auth.signOut();
    if (error) throw error;
}

window.SupabaseAuth = {
    isConfigured: isSupabaseConfigured,
    signInWithPassword,
    resetPasswordForEmail,
    updatePassword,
    getSession,
    onAuthStateChange,
    signOut,
};

window.dispatchEvent(new CustomEvent('supabase-auth-ready'));

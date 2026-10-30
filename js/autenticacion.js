// ==========================================
// AUTENTICACIÓN DEL ADMINISTRADOR (Supabase Auth)
// ==========================================

const ADMIN_IDLE_TIMEOUT_MS = 20 * 60 * 1000;
let adminIdleTimer = null;
let adminLastActivityAt = 0;
let adminInactivityMonitorStarted = false;
let adminAutoLogoutInProgress = false;

const adminActivityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'pointerdown'];

function stopAdminInactivityMonitor() {
    if (adminIdleTimer !== null) {
        window.clearTimeout(adminIdleTimer);
        adminIdleTimer = null;
    }

    if (!adminInactivityMonitorStarted) return;

    adminActivityEvents.forEach((eventName) => {
        document.removeEventListener(eventName, handleAdminActivity);
    });
    document.removeEventListener('visibilitychange', checkAdminInactivityOnVisibilityChange);
    window.removeEventListener('focus', checkAdminInactivityOnFocus);
    adminInactivityMonitorStarted = false;
}

async function expireAdminSession() {
    if (adminAutoLogoutInProgress) return;
    adminAutoLogoutInProgress = true;
    stopAdminInactivityMonitor();

    try {
        await window.SupabaseAuth.signOut();
    } catch (error) {
        console.error('Error cerrando la sesión por inactividad:', error);
    } finally {
        window.location.href = getAdminLoginUrl();
    }
}

function scheduleAdminInactivityLogout() {
    if (!adminInactivityMonitorStarted || adminAutoLogoutInProgress) return;

    if (adminIdleTimer !== null) window.clearTimeout(adminIdleTimer);
    const elapsed = Date.now() - adminLastActivityAt;
    const remaining = ADMIN_IDLE_TIMEOUT_MS - elapsed;

    if (remaining <= 0) {
        void expireAdminSession();
        return;
    }

    adminIdleTimer = window.setTimeout(() => {
        if (Date.now() - adminLastActivityAt >= ADMIN_IDLE_TIMEOUT_MS) {
            void expireAdminSession();
        } else {
            scheduleAdminInactivityLogout();
        }
    }, remaining);
}

function handleAdminActivity() {
    if (!adminInactivityMonitorStarted || adminAutoLogoutInProgress) return;
    adminLastActivityAt = Date.now();
    scheduleAdminInactivityLogout();
}

function checkAdminInactivityOnVisibilityChange() {
    if (document.visibilityState === 'visible') scheduleAdminInactivityLogout();
}

function checkAdminInactivityOnFocus() {
    scheduleAdminInactivityLogout();
}

function startAdminInactivityMonitor() {
    stopAdminInactivityMonitor();
    adminAutoLogoutInProgress = false;
    adminLastActivityAt = Date.now();
    adminInactivityMonitorStarted = true;

    adminActivityEvents.forEach((eventName) => {
        document.addEventListener(eventName, handleAdminActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', checkAdminInactivityOnVisibilityChange);
    window.addEventListener('focus', checkAdminInactivityOnFocus);
    scheduleAdminInactivityLogout();
}

async function checkAdminLogin() {
    try {
        if (await window.SupabaseAuth.getSession()) {
            startAdminInactivityMonitor();
            return true;
        }
    } catch (error) {
        console.error('Error verificando la sesión de Supabase:', error);
    }

    if (window.location.pathname.toLowerCase().includes('dashboard.html')) {
        window.location.href = getAdminLoginUrl();
    }
    return false;
}

function isRootAdminEntry() {
    return window.location.pathname.toLowerCase().endsWith('/admin.html') ||
           window.location.pathname.toLowerCase() === 'admin.html';
}

function getAdminLoginUrl() {
    return isRootAdminEntry() ? 'admin.html' : 'login.html';
}

function getAdminDashboardUrl() {
    return isRootAdminEntry() ? 'pages/dashboard.html' : 'dashboard.html';
}

async function handleLogin(email, password, captchaToken) {
    await window.SupabaseAuth.signInWithPassword(email, password, captchaToken);
    showToast('¡Bienvenido al Panel de Administración!', 'success');
    setTimeout(() => {
        window.location.href = getAdminDashboardUrl();
    }, 500);
}

async function logout() {
    if (!confirm('¿Deseas cerrar sesión del Panel Administrador?')) return;

    stopAdminInactivityMonitor();

    try {
        await window.SupabaseAuth.signOut();
    } catch (error) {
        console.error('Error cerrando la sesión de Supabase:', error);
    } finally {
        window.location.href = window.location.pathname.toLowerCase().includes('/pages/') ? 'login.html' : '../admin.html';
    }
}

function initPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const input = document.getElementById(toggle.dataset.passwordTarget);
            if (!input) return;

            const visible = input.type === 'text';
            input.type = visible ? 'password' : 'text';
            toggle.classList.toggle('is-visible', !visible);
            toggle.setAttribute('aria-pressed', String(!visible));
            toggle.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
        });
    });
}

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    const loginCaptcha = document.getElementById('loginCaptcha');
    let captchaToken = '';

    loginCaptcha?.addEventListener('verified', (event) => {
        captchaToken = event.token || '';
    });

    loginCaptcha?.addEventListener('expired', () => {
        captchaToken = '';
    });

    loginCaptcha?.addEventListener('error', () => {
        captchaToken = '';
    });

    function resetLoginCaptcha() {
        captchaToken = '';
        try {
            loginCaptcha?.reset();
        } catch (error) {
            console.error('Error reiniciando hCaptcha del login:', error);
        }
    }

    window.SupabaseAuth.getSession().then((session) => {
        if (session) window.location.href = getAdminDashboardUrl();
    }).catch((error) => console.error('Error verificando la sesión de Supabase:', error));

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const errorDiv = document.getElementById('loginError');
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!captchaToken) {
            if (errorDiv) {
                errorDiv.textContent = 'Completá la verificación CAPTCHA para continuar.';
                errorDiv.classList.remove('hidden');
            }
            showToast('Completá la verificación CAPTCHA para continuar.', 'error');
            return;
        }

        try {
            await handleLogin(email, password, captchaToken);
        } catch (error) {
            console.error('Error iniciando sesión con Supabase:', error);
            if (errorDiv) {
                errorDiv.textContent = 'El correo o la contraseña son incorrectos.';
                errorDiv.classList.remove('hidden');
            }
            if (passwordInput) passwordInput.value = '';
            showToast('El correo o la contraseña son incorrectos.', 'error');
        } finally {
            resetLoginCaptcha();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const path = (window.location.pathname + window.location.href).toLowerCase();

    if (path.includes('login.html') || path.endsWith('/admin.html') || path.endsWith('admin.html')) {
        initLogin();
    }

    if (path.includes('dashboard.html')) {
        const logoutBtns = document.querySelectorAll('#logoutBtn, .btn-logout, .sidebar-logout');
        logoutBtns.forEach(btn => btn.addEventListener('click', logout));
    }

    initPasswordToggles();
});

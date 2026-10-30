import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

const legacyScripts = [
  'js/configuracion.js',
  'js/productos.js',
  'js/carrito.js',
  'js/modal.js',
  'js/filtros.js',
  'js/buscador.js',
  'js/whatsapp.js',
  'js/tema.js',
  'js/app.js',
  'js/autenticacion.js',
  'js/dashboard.js',
  'js/carrito-page.js'
];

function copyLegacyScripts() {
  return {
    name: 'copy-legacy-scripts',
    writeBundle(outputOptions) {
      for (const relativePath of legacyScripts) {
        const sourcePath = resolve(rootDir, relativePath);
        const targetPath = resolve(outputOptions.dir, relativePath);
        fs.mkdirSync(resolve(targetPath, '..'), { recursive: true });
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  };
}

export default defineConfig(({ command }) => {
  const keyPath = resolve(rootDir, 'polirrubro.test-key.pem');
  const certPath = resolve(rootDir, 'polirrubro.test.pem');
  const localCertificatesAvailable =
    command === 'serve' &&
    fs.existsSync(keyPath) &&
    fs.existsSync(certPath);

  return {
    plugins: [copyLegacyScripts()],
    server: {
      allowedHosts: ['polirrubro.test'],
      ...(localCertificatesAvailable
        ? {
            https: {
              key: fs.readFileSync(keyPath),
              cert: fs.readFileSync(certPath)
            }
          }
        : {})
    },
    build: {
      rollupOptions: {
        preserveEntrySignatures: 'strict',
        input: {
          tienda: resolve(rootDir, 'index.html'),
          admin: resolve(rootDir, 'admin.html'),
          login: resolve(rootDir, 'pages/login.html'),
          resetPassword: resolve(rootDir, 'pages/reset-password.html'),
          dashboard: resolve(rootDir, 'pages/dashboard.html'),
          carrito: resolve(rootDir, 'pages/carrito.html'),
          supabaseProducts: resolve(rootDir, 'js/supabase-products.js'),
          supabaseClient: resolve(rootDir, 'js/supabase-client.js')
        },
        output: {
          entryFileNames: (chunk) => {
            if (chunk.name === 'supabaseProducts') {
              return 'js/supabase-products.js';
            }
            if (chunk.name === 'supabaseClient') {
              return 'js/supabase-client.js';
            }
            return 'assets/[name]-[hash].js';
          }
        }
      }
    }
  };
});

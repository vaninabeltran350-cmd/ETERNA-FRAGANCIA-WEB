import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ command }) => {
  const keyPath = resolve(rootDir, 'polirrubro.test-key.pem');
  const certPath = resolve(rootDir, 'polirrubro.test.pem');
  const localCertificatesAvailable =
    command === 'serve' &&
    fs.existsSync(keyPath) &&
    fs.existsSync(certPath);

  return {
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
      input: {
        tienda: resolve(rootDir, 'index.html'),
        admin: resolve(rootDir, 'admin.html'),
        login: resolve(rootDir, 'pages/login.html'),
        resetPassword: resolve(rootDir, 'pages/reset-password.html'),
        dashboard: resolve(rootDir, 'pages/dashboard.html'),
        carrito: resolve(rootDir, 'pages/carrito.html')
      }
    }
  }
  };
});

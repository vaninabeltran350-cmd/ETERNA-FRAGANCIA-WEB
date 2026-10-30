import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
 server: {
  allowedHosts: ['polirrubro.test'],
  https: {
    key: fs.readFileSync(resolve(rootDir, 'polirrubro.test-key.pem')),
    cert: fs.readFileSync(resolve(rootDir, 'polirrubro.test.pem'))
  }
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
});

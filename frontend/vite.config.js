import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno del archivo .env desde la raíz
  const env = loadEnv(mode, path.resolve(process.cwd(), '..'), '');

  return {
    envDir: '..',
    plugins: [
      react(),
      tailwindcss(),
    ],
    preview: { port: 443, host: true },
    resolve: {
      alias: {
        '@assets': path.resolve(__dirname, './src/assets'),
        '@components': path.resolve(__dirname, './src/components'),
        '@context': path.resolve(__dirname, './src/context'),
        '@helpers': path.resolve(__dirname, './src/helpers'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@styles': path.resolve(__dirname, './src/styles'),
      }
    },
    optimizeDeps: {
      include: ['maplibre-gl']
    },
    define: {
      global: 'globalThis',
      'process.env': {},
      'process.platform': '"browser"',
      'process.version': '"v16.0.0"',
      'process.versions': '{}',
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: env.VITE_BACKEND_URL || 'http://localhost:3000',
          ws: true,
          changeOrigin: true,
        },
      }
    }
  };
});
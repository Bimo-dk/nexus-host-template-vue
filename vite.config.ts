import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  server: {
    port: 8667,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8670',
        changeOrigin: true,
      },
    },
  },
});

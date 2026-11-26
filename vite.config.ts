import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Long-lived vendor chunk so app changes don't bust the framework cache
          vendor: ['react', 'react-dom', 'react-router-dom', 'motion/react'],
        },
      },
    },
  },
});

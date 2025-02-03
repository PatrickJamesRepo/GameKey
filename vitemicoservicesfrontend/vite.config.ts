import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import path from 'path';

export default defineConfig({
  plugins: [
    wasm(), // enable WASM integration via the plugin
    react(),
  ],
  resolve: {
    alias: {
      '@meshsdk/core': path.resolve(__dirname, 'node_modules/@meshsdk/core'),
      '@meshsdk/core-csl': path.resolve(__dirname, 'node_modules/@meshsdk/core-csl'),
    },
  },
  optimizeDeps: {
    include: ['@meshsdk/core', '@meshsdk/core-csl'],
  },
});

import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import path from 'path';  // Add this line

// https://vite.dev/config/
export default defineConfig({
  plugins: [wasm()],
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

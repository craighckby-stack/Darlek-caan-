/**
 * ARCHITECTURAL VITE CONFIGURATION
 * Role: Orchestrates build environment, plugin integration, and diagnostic validation.
 * Integration: Connects to vite-diagnostic-utils.ts for environment health checks.
 * Dependencies: @tailwindcss/vite, @vitejs/plugin-react, vite-diagnostic-utils
 */

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { validateBuildEnvironment } from './vite-diagnostic-utils';

// Execute diagnostic gatekeeper before configuration initialization
validateBuildEnvironment();

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is managed via diagnostic-aware environment variables.
      // Do not modifyâ€”file watching is controlled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  };
});
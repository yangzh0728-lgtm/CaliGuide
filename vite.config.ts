import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: ['www.caliguide.org'],
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/motion/')) {
              return 'motion';
            }
            if (id.includes('/node_modules/@supabase/')) {
              return 'supabase';
            }
            if (id.includes('/node_modules/lucide-react/')) {
              return 'icons';
            }
            if (
              id.includes('/src/lib/blogContent.ts') ||
              id.includes('/src/lib/blogLocalization.ts') ||
              id.includes('/src/lib/blogBodyTranslations.ts') ||
              id.includes('/src/lib/guideCitations.ts')
            ) {
              return 'guide-content';
            }
          },
        },
      },
    },
  };
});

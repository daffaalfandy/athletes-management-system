import { defineConfig } from 'vite';
import { builtinModules } from 'module';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        rollupOptions: {
            // Externalize all Node built-ins and better-sqlite3
            external: [
                ...builtinModules,
                ...builtinModules.map(m => `node:${m}`),
                'better-sqlite3',
                'electron',
                'pdfkit', // PDFKit needs to be external to access font files
            ],
            output: {
                format: 'cjs', // Ensure CommonJS output
            },
        },
    },
    optimizeDeps: {
        exclude: ['better-sqlite3', 'pdfkit'],
    },
});

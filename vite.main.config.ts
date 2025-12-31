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
            ],
        },
    },
    optimizeDeps: {
        exclude: ['better-sqlite3'],
    },
});

import { defineConfig } from 'vite';
import { builtinModules } from 'module';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        rollupOptions: {
            // Externalize all Node built-ins and native modules
            external: [
                ...builtinModules,
                ...builtinModules.map(m => `node:${m}`),
                'electron',
            ],
            output: {
                format: 'cjs', // Ensure CommonJS output
            },
        },
    },
});

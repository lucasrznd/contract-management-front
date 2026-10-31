/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ command, mode }) => {
    // Without it every request goes to "undefined/...", which the dev server answers with index.html.
    if (mode !== 'test' && !loadEnv(mode, process.cwd()).VITE_API_BASE_URL) {
        const message =
            'VITE_API_BASE_URL is not set. Copy .env.example to .env and point it at contract-management-api.';
        if (command === 'build') {
            throw new Error(message);
        }
        console.warn(`\n  ⚠ ${message}\n`);
    }

    return {
        plugins: [react()],
        resolve: {
            alias: { '@': path.resolve(import.meta.dirname, 'src') },
        },
        // Same port and output folder as the old react-scripts setup, so the API's CORS
        // config and any existing deploy pipeline keep working.
        build: {
            outDir: 'build',
        },
        test: {
            environment: 'jsdom',
            setupFiles: './src/setupTests.ts',
        },
    };
});

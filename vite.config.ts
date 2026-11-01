/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'node:path';

// Lara (PrimeReact's theme) hardcodes its grays and blues. Swapping them for the app's tokens makes every
// PrimeReact component follow the light/dark theme. Light stays the same: the tokens have Lara's values.
// Keyed by property, since a color can't always change the same way (white text on buttons stays white).
const LARA_TOKENS: Record<'background' | 'color' | 'border', Record<string, string>> = {
    background: {
        '#ffffff': 'var(--color-surface)',
        '#f9fafb': 'var(--color-gray-50)',
        '#f3f4f6': 'var(--color-gray-100)',
        '#e5e7eb': 'var(--color-gray-200)',
        '#d1d5db': 'var(--color-gray-300)',
        '#eff6ff': 'var(--color-primary-soft)',
    },
    color: {
        '#1f2937': 'var(--color-gray-800)',
        '#374151': 'var(--color-gray-700)',
        '#4b5563': 'var(--color-gray-600)',
        '#6b7280': 'var(--color-gray-500)',
        '#1d4ed8': 'var(--color-accent-text)',
    },
    border: {
        '#ffffff': 'var(--color-surface)',
        '#f3f4f6': 'var(--color-gray-100)',
        '#e5e7eb': 'var(--color-gray-200)',
        '#d1d5db': 'var(--color-gray-300)',
    },
};

function laraThemeTokens(): Plugin {
    return {
        name: 'lara-theme-tokens',
        enforce: 'pre',
        transform(code, id) {
            if (!/primereact\/resources\/themes\/lara-light-blue\/theme\.css/.test(id)) return null;
            return code.replace(
                /(^|[{;\s])(background(?:-color)?|color|border(?:-(?:top|right|bottom|left))?(?:-color)?)(\s*:\s*)([^;{}]*)/g,
                (match, before: string, property: string, colon: string, value: string) => {
                    const map =
                        LARA_TOKENS[
                            property.startsWith('border') ? 'border' : property === 'color' ? 'color' : 'background'
                        ];
                    const replaced = value.replace(/#[0-9a-f]{6}\b/gi, (hex) => map[hex.toLowerCase()] ?? hex);
                    return replaced === value ? match : `${before}${property}${colon}${replaced}`;
                },
            );
        },
    };
}

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
        plugins: [
            react(),
            laraThemeTokens(),
            // `import Logo from './logo.svg?react'` renders the SVG inline, so CSS variables (theme) reach its fills.
            svgr({ svgrOptions: { dimensions: false } }),
        ],
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

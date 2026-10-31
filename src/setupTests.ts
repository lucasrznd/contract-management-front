// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Without vitest globals, Testing Library can't register its automatic cleanup.
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

// jsdom doesn't implement matchMedia, which some primereact components use for their breakpoints.
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }),
});

// jsdom doesn't implement scrolling; the layout scrolls to the top on every navigation.
window.scrollTo = () => {};

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

// jsdom doesn't implement object URLs, which image previews use.
URL.createObjectURL = () => 'blob:preview';
URL.revokeObjectURL = () => {};

// jsdom never loads images, so react-easy-crop would never report the crop area. The stub reports
// a fixed one right away; `cropImage` (which needs a canvas) is mocked in the tests that crop.
vi.mock('react-easy-crop', async () => {
    const { createElement, useEffect } = await vi.importActual<typeof import('react')>('react');
    const area = { x: 0, y: 0, width: 800, height: 800 };
    return {
        default: function CropperStub({
            onCropComplete,
        }: {
            onCropComplete?: (a: typeof area, b: typeof area) => void;
        }) {
            useEffect(() => onCropComplete?.(area, area), []);
            return createElement('div', { 'data-testid': 'cropper' });
        },
    };
});

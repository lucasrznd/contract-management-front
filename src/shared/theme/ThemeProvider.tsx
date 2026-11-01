import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark';

// Same key and fallback as the inline script in index.html, which applies the theme before the first paint.
const STORAGE_KEY = 'egc-theme';
const THEME_COLOR: Record<Theme, string> = { light: '#f5f6f8', dark: '#0d1118' };
// Lets the switch knob finish most of its slide before the page starts changing.
const REVEAL_DELAY_MS = 220;
const FADE_MS = 400;

function initialTheme(): Theme {
    const applied = document.documentElement.dataset.theme;
    if (applied === 'light' || applied === 'dark') return applied;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
    } catch {
        // Storage blocked: fall through to the system preference.
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

interface ThemeApi {
    /** The theme the page is painted with. */
    theme: Theme;
    /** The theme the switch shows: changes right away, while `theme` follows after the reveal delay. */
    uiTheme: Theme;
    /** Toggles the theme; the new one is revealed in a circle growing from `origin` (the switch). */
    toggleTheme: (origin?: HTMLElement) => void;
}

const ThemeContext = createContext<ThemeApi | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(initialTheme);
    const [uiTheme, setUiTheme] = useState<Theme>(theme);
    const revealTimer = useRef<number>(undefined);
    const fadeTimer = useRef<number>(undefined);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    useEffect(
        () => () => {
            window.clearTimeout(revealTimer.current);
            window.clearTimeout(fadeTimer.current);
        },
        [],
    );

    const toggleTheme = useCallback(
        (origin?: HTMLElement) => {
            const next: Theme = uiTheme === 'dark' ? 'light' : 'dark';
            const root = document.documentElement;
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // Storage blocked: the theme still changes for this visit.
            }

            if (origin) {
                const rect = origin.getBoundingClientRect();
                const x = rect.right - 20;
                const y = rect.top + rect.height / 2;
                const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
                root.style.setProperty('--vt-x', `${x}px`);
                root.style.setProperty('--vt-y', `${y}px`);
                root.style.setProperty('--vt-r', `${radius}px`);
            }

            // The DOM must hold the new theme when the callback returns, so the transition snapshots it.
            const apply = () => {
                flushSync(() => setTheme(next));
                applyTheme(next);
            };

            setUiTheme(next);
            window.clearTimeout(revealTimer.current);
            const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            if (document.startViewTransition && !reduceMotion) {
                revealTimer.current = window.setTimeout(() => document.startViewTransition(apply), REVEAL_DELAY_MS);
            } else {
                root.classList.add('egc-fade');
                apply();
                window.clearTimeout(fadeTimer.current);
                fadeTimer.current = window.setTimeout(() => root.classList.remove('egc-fade'), FADE_MS);
            }
        },
        [uiTheme],
    );

    const api = useMemo<ThemeApi>(() => ({ theme, uiTheme, toggleTheme }), [theme, uiTheme, toggleTheme]);

    return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used inside ThemeProvider');
    }
    return context;
}

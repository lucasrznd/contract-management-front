import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test } from 'vitest';
import ThemeSwitch from '@/shared/components/layout/ThemeSwitch';
import { ThemeProvider } from './ThemeProvider';

function renderSwitch() {
    render(
        <ThemeProvider>
            <ThemeSwitch showLabel />
        </ThemeProvider>,
    );
}

beforeEach(() => localStorage.clear());

afterEach(() => {
    delete document.documentElement.dataset.theme;
});

test('starts with the theme index.html applied', () => {
    document.documentElement.dataset.theme = 'dark';
    renderSwitch();

    expect(screen.getByRole('switch', { name: 'Mudar para tema claro' })).toBeChecked();
    expect(screen.getByText('Tema escuro')).toBeInTheDocument();
});

test('toggles the theme on the page and remembers it', async () => {
    const user = userEvent.setup();
    renderSwitch();

    const toggle = screen.getByRole('switch', { name: 'Mudar para tema escuro' });
    expect(toggle).not.toBeChecked();

    await user.click(toggle);

    // jsdom has no View Transitions API, so the theme applies right away (the fade fallback).
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('egc-theme')).toBe('dark');
    expect(screen.getByRole('switch', { name: 'Mudar para tema claro' })).toBeChecked();
    expect(screen.getByText('Tema escuro')).toBeInTheDocument();

    await user.click(screen.getByRole('switch'));
    expect(document.documentElement.dataset.theme).toBe('light');
});

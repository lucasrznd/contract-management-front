import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import AppSidenav, { MOBILE_QUERY } from './AppSidenav';

const desktopMatchMedia = window.matchMedia;

function renderSidenav(path = '/vendedores') {
    render(
        <MemoryRouter initialEntries={[path]}>
            <ThemeProvider>
                <AppSidenav />
            </ThemeProvider>
        </MemoryRouter>,
    );
}

function mockMobileViewport() {
    window.matchMedia = (query: string) => ({ ...desktopMatchMedia(query), matches: query === MOBILE_QUERY });
}

beforeEach(() => localStorage.clear());

afterEach(() => {
    window.matchMedia = desktopMatchMedia;
});

test('links every section and marks the current one', () => {
    renderSidenav('/vendedores');

    const nav = screen.getByRole('navigation', { name: 'Principal' });
    expect(nav).toHaveTextContent('Contratos');
    expect(nav).toHaveTextContent('Empresas');
    expect(screen.getByRole('link', { name: 'Vendedores' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('img', { name: 'Rádio Educadora' })).toBeInTheDocument();
});

test('collapses to icons and remembers the choice', async () => {
    const user = userEvent.setup();
    renderSidenav();

    await user.click(screen.getByRole('button', { name: 'Recolher menu' }));

    expect(screen.getByRole('button', { name: 'Expandir menu' })).toBeInTheDocument();
    expect(screen.queryByText('Empresas')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Empresas' })).toHaveAttribute('title', 'Empresas');
    expect(localStorage.getItem('egc-nav')).toBe('0');
});

test('starts collapsed when that was the last choice', () => {
    localStorage.setItem('egc-nav', '0');
    renderSidenav();

    expect(screen.getByRole('button', { name: 'Expandir menu' })).toBeInTheDocument();
});

test('on small screens opens as a drawer that closes with Escape', async () => {
    mockMobileViewport();
    const user = userEvent.setup();
    renderSidenav();

    const menuButton = screen.getByRole('button', { name: 'Abrir menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
});

test('the drawer closes after picking a section', async () => {
    mockMobileViewport();
    const user = userEvent.setup();
    renderSidenav('/');

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    await user.click(screen.getByRole('link', { name: 'Empresas' }));

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false');
});

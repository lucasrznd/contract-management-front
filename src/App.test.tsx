import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import axios from 'axios';
import { expect, test, vi } from 'vitest';
import { AppRouteTree } from './routes/Routes';

function renderRoute(path: string) {
    const location = { pathname: path };
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    function LocationProbe() {
        location.pathname = useLocation().pathname;
        return null;
    }

    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true }}>
                <AppRouteTree />
                <LocationProbe />
            </MemoryRouter>
        </QueryClientProvider>,
    );

    return location;
}

test.each(['/', '/empresas', '/contratos', '/vendedores'])(
    'renders %s even when the API is unreachable',
    async (path) => {
        vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));
        renderRoute(path);

        expect(await screen.findByText(/Todos os direitos reservados/i)).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: /Erro de conexão com servidor/i })).toBeInTheDocument();
    },
);

// A missing VITE_API_BASE_URL makes requests hit the dev server, which answers 200 with index.html.
test('home page does not crash when the API answers with HTML instead of JSON', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: '<!DOCTYPE html><html></html>' });
    renderRoute('/');

    expect(await screen.findByRole('heading', { name: /Erro de conexão com servidor/i })).toBeInTheDocument();
});

test('unknown paths redirect to the home page', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));
    const location = renderRoute('/rota-que-nao-existe');

    await vi.waitFor(() => expect(location.pathname).toBe('/'));
});

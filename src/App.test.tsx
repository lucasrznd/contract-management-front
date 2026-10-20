import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { expect, test, vi } from 'vitest';
import App from './App';

test.each(['/', '/empresas', '/contratos', '/vendedores'])(
    'renders %s even when the API is unreachable',
    async (path) => {
        vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));
        window.history.pushState({}, '', path);
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

        render(
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>,
        );

        expect(screen.getByText(/Todos os direitos reservados/i)).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: /Erro de conexão com servidor/i })).toBeInTheDocument();
    },
);

// A missing VITE_API_BASE_URL makes requests hit the dev server, which answers 200 with index.html.
test('home page does not crash when the API answers with HTML instead of JSON', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: '<!DOCTYPE html><html></html>' });
    window.history.pushState({}, '', '/');
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: /Erro de conexão com servidor/i })).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { expect, test, vi } from 'vitest';
import App from './App';

test.each(['/', '/empresas', '/contratos', '/vendedores'])('renders %s even when the API is unreachable', async (path) => {
  vi.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));
  window.history.pushState({}, '', path);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );

  expect(screen.getByText(/Todos os direitos reservados/i)).toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: /Erro de conexão com servidor/i })).toBeInTheDocument();
});

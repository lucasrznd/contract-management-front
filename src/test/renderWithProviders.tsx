import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router';
import { ToastProvider } from '@/shared/components/ui/toast/ToastProvider';

/**
 * Renders a component with the providers AppLayout normally gives it, at `url` (lists read their state from it).
 * `location.search` follows the URL as the component changes it.
 */
export function renderWithProviders(ui: ReactElement, { url = '/' } = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const location = { search: '' };

    function LocationProbe() {
        location.search = useLocation().search;
        return null;
    }

    const result = render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[url]}>
                <ToastProvider>{ui}</ToastProvider>
                <LocationProbe />
            </MemoryRouter>
        </QueryClientProvider>,
    );
    return { ...result, location };
}

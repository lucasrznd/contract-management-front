import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/shared/components/ui/toast/ToastProvider';

/** Renders a component with the providers AppLayout normally gives it. */
export function renderWithProviders(ui: ReactElement) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <ToastProvider>{ui}</ToastProvider>
        </QueryClientProvider>,
    );
}

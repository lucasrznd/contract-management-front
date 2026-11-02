import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { expect, test, vi } from 'vitest';
import { apiErrorMessage, useApiMutation, useApiQuery } from './api.service';
import { renderWithProviders } from '@/test/renderWithProviders';

function responseError(message: string, { status = 400, errors }: { status?: number; errors?: object[] } = {}) {
    const config = { headers: new AxiosHeaders() };
    return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
        status,
        statusText: 'Bad Request',
        headers: {},
        config,
        data: { message, errors },
    });
}

test.each([
    [new AxiosError('Network Error', 'ERR_NETWORK'), 'Não foi possível conectar ao servidor.'],
    [responseError('Exception in validation attributes'), 'Erro no servidor ao validar campos.'],
    [responseError('java.lang.NullPointerException'), 'Falhou.'],
    [responseError('File exceeds the maximum allowed size', { status: 413 }), 'A imagem é maior que 5 MB.'],
    [
        responseError('Exception in validation attributes', {
            errors: [{ fieldName: 'image', message: 'File must be a JPEG, PNG or WebP image' }],
        }),
        'Formato de imagem não suportado. Envie JPG, PNG ou WebP.',
    ],
    [new Error('boom'), 'Falhou.'],
])('apiErrorMessage(%s)', (error, expected) => {
    expect(apiErrorMessage(error, 'Falhou.')).toContain(expected);
});

function FailingQuery() {
    useApiQuery({
        queryKey: ['failing'],
        queryFn: () => Promise.reject(new Error('boom')),
        errorMessage: 'Não foi possível carregar a lista.',
    });
    return null;
}

test('a failed query shows its error toast', async () => {
    renderWithProviders(<FailingQuery />);

    expect(await screen.findByText('Não foi possível carregar a lista.')).toBeInTheDocument();
});

function SaveButton({ mutationFn, onSuccess }: { mutationFn: () => Promise<unknown>; onSuccess: () => void }) {
    const { mutate } = useApiMutation({ mutationFn, errorMessage: 'Não foi possível salvar.' });
    return <button onClick={() => mutate(undefined, { onSuccess })}>Salvar</button>;
}

test('a failed mutation shows its error toast and skips onSuccess', async () => {
    const onSuccess = vi.fn();
    renderWithProviders(<SaveButton mutationFn={() => Promise.reject(new Error('boom'))} onSuccess={onSuccess} />);

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
});

test('a successful mutation calls onSuccess without a toast', async () => {
    const onSuccess = vi.fn();
    renderWithProviders(<SaveButton mutationFn={() => Promise.resolve()} onSuccess={onSuccess} />);

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(screen.queryByText('Não foi possível salvar.')).not.toBeInTheDocument();
});

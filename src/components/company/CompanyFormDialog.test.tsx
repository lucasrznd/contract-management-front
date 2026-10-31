import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { expect, test, vi } from 'vitest';
import CompanyFormDialog from './CompanyFormDialog';
import { renderWithProviders } from '../../test/renderWithProviders';

test('saving an empty form shows the validation messages and sends nothing', async () => {
    const post = vi.spyOn(axios, 'post');
    renderWithProviders(<CompanyFormDialog visible company={null} onHide={() => {}} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Cadastrar empresa' }));

    expect(await screen.findByText('Informe o nome fantasia.')).toBeInTheDocument();
    expect(screen.getByText('Informe o CNPJ.')).toBeInTheDocument();
    expect(screen.getByText('Informe o CEP.')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
});

test('a complete CEP fills in the address', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
        data: { logradouro: 'Rua Paraná', bairro: 'Centro', localidade: 'Jacarezinho', uf: 'PR' },
    });
    renderWithProviders(<CompanyFormDialog visible company={null} onHide={() => {}} />);

    await userEvent.type(await screen.findByLabelText(/CEP/), '86400000');

    expect(screen.getByLabelText(/CEP/)).toHaveValue('86400-000');
    await vi.waitFor(() => expect(screen.getByLabelText(/Cidade/)).toHaveValue('Jacarezinho'));
    expect(screen.getByLabelText(/Estado/)).toHaveValue('PR');
    expect(screen.getByLabelText(/Rua/)).toHaveValue('Rua Paraná');
    expect(screen.getByLabelText(/Bairro/)).toHaveValue('Centro');
});

test('a valid form is posted with documents and phone as digits', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
        data: { logradouro: 'Rua Paraná', bairro: 'Centro', localidade: 'Jacarezinho', uf: 'PR' },
    });
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: {} });
    const onHide = vi.fn();
    renderWithProviders(<CompanyFormDialog visible company={null} onHide={onHide} />);

    await userEvent.type(await screen.findByLabelText(/Nome fantasia/), 'Padaria Pão Quente');
    await userEvent.type(screen.getByLabelText(/Razão social/), 'Pão Quente LTDA');
    await userEvent.type(screen.getByLabelText(/CNPJ/), '12938192319839');
    await userEvent.type(screen.getByLabelText(/Telefone/), '43999392939');
    await userEvent.type(screen.getByLabelText(/CEP/), '86400000');
    await vi.waitFor(() => expect(screen.getByLabelText(/Cidade/)).toHaveValue('Jacarezinho'));
    await userEvent.type(screen.getByLabelText(/Número/), '12a3');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar empresa' }));

    await vi.waitFor(() => expect(onHide).toHaveBeenCalled());
    expect(post).toHaveBeenCalledWith(
        expect.stringMatching(/\/companies$/),
        expect.objectContaining({
            tradeName: 'Padaria Pão Quente',
            registrationNumber: '12938192319839',
            phoneNumber: '43999392939',
            zipCode: '86400-000',
            number: 123,
            city: 'Jacarezinho',
            state: 'PR',
            cpf: undefined,
        }),
    );
});

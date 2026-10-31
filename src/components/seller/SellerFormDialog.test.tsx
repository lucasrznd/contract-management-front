import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { expect, test, vi } from 'vitest';
import SellerFormDialog from './SellerFormDialog';
import { renderWithProviders } from '../../test/renderWithProviders';

const seller = { id: 7, name: 'Fernanda Rocha', phoneNumber: '19993818293', urlImage: '' };

test('new seller form shows the design texts', async () => {
    renderWithProviders(<SellerFormDialog visible seller={null} onHide={() => {}} />);

    expect(await screen.findByRole('dialog', { name: 'Novo vendedor' })).toBeInTheDocument();
    expect(screen.getByText('Preencha os dados para cadastrar.')).toBeInTheDocument();
    expect(screen.getByText('Celular ou fixo, com DDD.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar vendedor' })).toBeInTheDocument();
});

test('edit form starts from the seller data', async () => {
    renderWithProviders(<SellerFormDialog visible seller={seller} onHide={() => {}} />);

    expect(await screen.findByRole('dialog', { name: 'Editar vendedor' })).toBeInTheDocument();
    expect(screen.getByText('Código 007')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome/)).toHaveValue('Fernanda Rocha');
    expect(screen.getByLabelText(/Telefone/)).toHaveValue('(19) 9 9381-8293');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeInTheDocument();
});

test('saving an empty form shows the validation messages and sends nothing', async () => {
    const post = vi.spyOn(axios, 'post');
    renderWithProviders(<SellerFormDialog visible seller={null} onHide={() => {}} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Cadastrar vendedor' }));

    expect(await screen.findByText('Informe o nome do vendedor.')).toBeInTheDocument();
    expect(screen.getByText('Informe o telefone.')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
});

test('short names and incomplete phones are rejected', async () => {
    renderWithProviders(<SellerFormDialog visible seller={null} onHide={() => {}} />);

    await userEvent.type(await screen.findByLabelText(/Nome/), 'Jo');
    await userEvent.type(screen.getByLabelText(/Telefone/), '19993');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar vendedor' }));

    expect(await screen.findByText('O nome precisa ter pelo menos 3 letras.')).toBeInTheDocument();
    expect(screen.getByText('Telefone inválido. Use (DD) 9 9999-9999.')).toBeInTheDocument();
});

test('a valid form is posted with the phone digits only', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { ...seller, id: 8 } });
    const onHide = vi.fn();
    renderWithProviders(<SellerFormDialog visible seller={null} onHide={onHide} />);

    await userEvent.type(await screen.findByLabelText(/Nome/), '  Ana Paula  ');
    await userEvent.type(screen.getByLabelText(/Telefone/), '19993818293');
    expect(screen.getByLabelText(/Telefone/)).toHaveValue('(19) 9 9381-8293');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar vendedor' }));

    await vi.waitFor(() => expect(onHide).toHaveBeenCalled());
    expect(post).toHaveBeenCalledWith(
        expect.stringMatching(/\/sellers$/),
        expect.objectContaining({ name: 'Ana Paula', phoneNumber: '19993818293' }),
    );
    expect(await screen.findByText('Vendedor cadastrado')).toBeInTheDocument();
});

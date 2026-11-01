import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '@/shared/api/api';
import { expect, test, vi } from 'vitest';
import SellerPicker from './SellerPicker';
import { renderWithProviders } from '@/test/renderWithProviders';
import { pageOf } from '@/test/pageOf';

const sellers = [
    { id: 1, name: 'João Silva', phoneNumber: '19993818293', urlImage: '' },
    { id: 2, name: 'Joana Lima', phoneNumber: '43991234567', urlImage: '' },
];

test('suggests the sellers the API finds for the text and picks one', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(sellers) });
    const onChange = vi.fn();
    renderWithProviders(<SellerPicker inputId="seller" value={null} onChange={onChange} />);

    await userEvent.type(screen.getByRole('combobox'), 'joao');

    await userEvent.click(await screen.findByText('João Silva'));
    expect(onChange).toHaveBeenCalledWith(sellers[0]);
    expect(get).toHaveBeenCalledWith('/sellers', {
        params: { text: 'joao', page: undefined, size: 20, sort: ['name,asc', 'id,asc'] },
    });
});

test('the dropdown button lists the first sellers', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(sellers) });
    renderWithProviders(<SellerPicker inputId="seller" value={null} onChange={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Listar vendedores' }));

    expect(await screen.findByText('Joana Lima')).toBeInTheDocument();
    await waitFor(() => expect(get.mock.lastCall![1]!.params.text).toBeUndefined());
});

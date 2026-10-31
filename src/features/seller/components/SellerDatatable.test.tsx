import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '@/shared/api/api';
import { expect, test, vi } from 'vitest';
import SellerDatatable from './SellerDatatable';
import { renderWithProviders } from '@/test/renderWithProviders';

const sellers = [
    { id: 1, name: 'Jorge Silva', phoneNumber: '19993818293', urlImage: '' },
    { id: 2, name: 'Patrícia Gomes', phoneNumber: '43991234567', urlImage: '' },
    { id: 12, name: 'Ricardo Alves', phoneNumber: '1933815555', urlImage: '' },
];

function renderTable() {
    const props = { onNew: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() };
    renderWithProviders(<SellerDatatable {...props} />);
    return props;
}

const rowNames = () =>
    screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1].textContent);

test('lists sellers with code, masked phone and count', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: sellers });
    renderTable();

    expect(await screen.findByText('Jorge Silva')).toBeInTheDocument();
    expect(screen.getByText('001')).toBeInTheDocument();
    expect(screen.getByText('(19) 3381-5555')).toBeInTheDocument();
    const title = screen.getByRole('heading', { name: 'Vendedores' });
    expect(within(title.parentElement!).getByText('3')).toBeInTheDocument();
});

test.each([
    ['patricia', 'Patrícia Gomes'],
    ['9123', 'Patrícia Gomes'],
    ['3381-5555', 'Ricardo Alves'],
])('searching %j finds %s', async (query, expected) => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: sellers });
    renderTable();
    await screen.findByText('Jorge Silva');

    await userEvent.type(screen.getByRole('searchbox'), query);

    expect(rowNames()).toEqual([expect.stringContaining(expected)]);
});

test('shows a no-results state that clears the search', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: sellers });
    renderTable();
    await screen.findByText('Jorge Silva');

    await userEvent.type(screen.getByRole('searchbox'), 'xyz');
    expect(screen.getByRole('heading', { name: 'Nenhum resultado para “xyz”' })).toBeInTheDocument();

    // The search box's clear (x) button has the same name.
    await userEvent.click(screen.getByText('Limpar busca'));
    expect(await screen.findByText('Jorge Silva')).toBeInTheDocument();
});

test('shows an empty state when there are no sellers', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    const { onNew } = renderTable();

    expect(await screen.findByRole('heading', { name: 'Nenhum vendedor cadastrado' })).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: 'Novo vendedor' })[1]);
    expect(onNew).toHaveBeenCalled();
});

test('row actions edit and delete the seller', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: sellers });
    const { onEdit, onDelete } = renderTable();

    await userEvent.click(await screen.findByRole('button', { name: 'Editar Jorge Silva' }));
    await userEvent.click(screen.getByRole('button', { name: 'Excluir Jorge Silva' }));

    expect(onEdit).toHaveBeenCalledWith(sellers[0]);
    expect(onDelete).toHaveBeenCalledWith(sellers[0]);
});

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '@/shared/api/api';
import { useNavigate } from 'react-router';
import { expect, test, vi } from 'vitest';
import SellerDatatable from './SellerDatatable';
import { renderWithProviders } from '@/test/renderWithProviders';
import { pageOf } from '@/test/pageOf';

const sellers = [
    { id: 1, name: 'Jorge Silva', phoneNumber: '19993818293', urlImage: '' },
    { id: 2, name: 'Patrícia Gomes', phoneNumber: '43991234567', urlImage: '' },
    { id: 12, name: 'Ricardo Alves', phoneNumber: '1933815555', urlImage: '' },
];

function renderTable(url?: string) {
    const props = { onNew: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() };
    const { location } = renderWithProviders(<SellerDatatable {...props} />, { url });
    return { ...props, location };
}

/** Params of the last GET /sellers. */
const lastParams = (get: ReturnType<typeof vi.spyOn>) => get.mock.lastCall![1].params;

test('lists the first page with code, masked phone and the total count', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(sellers, { totalElements: 42 }) });
    renderTable();

    expect(await screen.findByText('Jorge Silva')).toBeInTheDocument();
    expect(screen.getByText('001')).toBeInTheDocument();
    expect(screen.getByText('(19) 3381-5555')).toBeInTheDocument();
    const title = screen.getByRole('heading', { name: 'Vendedores' });
    expect(within(title.parentElement!).getByText('42')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/sellers', {
        params: { text: undefined, page: 0, size: 10, sort: ['id,asc'] },
    });
});

test('searches on the API once the user stops typing, from the first page', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(sellers, { totalElements: 42 }) });
    renderTable();
    await screen.findByText('Jorge Silva');
    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    await waitFor(() => expect(lastParams(get).page).toBe(1));
    get.mockClear();

    await userEvent.type(screen.getByRole('searchbox'), 'patricia');

    await waitFor(() => expect(lastParams(get)).toMatchObject({ text: 'patricia', page: 0 }));
    // One request for the whole word, not one per keystroke.
    expect(get).toHaveBeenCalledTimes(1);
});

test('sends masked phone numbers as digits', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(sellers) });
    renderTable();
    await screen.findByText('Jorge Silva');

    await userEvent.type(screen.getByRole('searchbox'), '3381-5555');

    await waitFor(() => expect(lastParams(get).text).toBe('33815555'));
});

test('sorting a column asks the API for that order', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(sellers) });
    renderTable();
    await screen.findByText('Jorge Silva');

    await userEvent.click(screen.getByText('Vendedor'));
    await waitFor(() => expect(lastParams(get).sort).toEqual(['name,asc', 'id,asc']));

    await userEvent.click(screen.getByText('Vendedor'));
    await waitFor(() => expect(lastParams(get).sort).toEqual(['name,desc', 'id,asc']));
});

test('shows a no-results state that clears the search', async () => {
    const get = vi.spyOn(api, 'get').mockImplementation(async (_url, config) => ({
        data: pageOf(config?.params.text ? [] : sellers),
    }));
    renderTable();
    await screen.findByText('Jorge Silva');

    await userEvent.type(screen.getByRole('searchbox'), 'xyz');
    expect(await screen.findByRole('heading', { name: 'Nenhum resultado para “xyz”' })).toBeInTheDocument();

    // The search box's clear (x) button has the same name.
    await userEvent.click(screen.getByText('Limpar busca'));
    expect(await screen.findByText('Jorge Silva')).toBeInTheDocument();
    expect(lastParams(get).text).toBeUndefined();
});

test('shows an empty state when there are no sellers', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf([]) });
    const { onNew } = renderTable();

    expect(await screen.findByRole('heading', { name: 'Nenhum vendedor cadastrado' })).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: 'Novo vendedor' })[1]);
    expect(onNew).toHaveBeenCalled();
});

test('shows the error state when the API does not answer a page', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: '<!doctype html>' });
    renderTable();

    expect(await screen.findByRole('heading', { name: 'Erro de conexão com servidor.' })).toBeInTheDocument();
});

test('row actions edit and delete the seller', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(sellers) });
    const { onEdit, onDelete } = renderTable();

    await userEvent.click(await screen.findByRole('button', { name: 'Editar Jorge Silva' }));
    await userEvent.click(screen.getByRole('button', { name: 'Excluir Jorge Silva' }));

    expect(onEdit).toHaveBeenCalledWith(sellers[0]);
    expect(onDelete).toHaveBeenCalledWith(sellers[0]);
});

test('opens the search, sort and page the URL asks for', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(sellers, { totalElements: 60 }) });
    renderTable('/?text=silva&page=3&size=25&sort=name,desc');

    expect(await screen.findByRole('searchbox')).toHaveValue('silva');
    expect(get).toHaveBeenCalledWith('/sellers', {
        params: { text: 'silva', page: 2, size: 25, sort: ['name,desc', 'id,asc'] },
    });
});

test('falls back to the defaults for URL values it cannot use', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(sellers) });
    renderTable('/?page=abc&size=999&sort=password,desc');

    await screen.findByText('Jorge Silva');
    expect(get).toHaveBeenCalledWith('/sellers', {
        params: { text: undefined, page: 0, size: 10, sort: ['id,asc'] },
    });
});

test('keeps the search, sort and page in the URL, leaving defaults out', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(sellers, { totalElements: 42 }) });
    const { location } = renderTable();
    await screen.findByText('Jorge Silva');
    expect(location.search).toBe('');

    await userEvent.click(screen.getByText('Vendedor'));
    await waitFor(() => expect(location.search).toBe('?sort=name%2Casc'));

    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    await waitFor(() => expect(location.search).toBe('?sort=name%2Casc&page=2'));

    // A new search goes back to the first page.
    await userEvent.type(screen.getByRole('searchbox'), 'jorge');
    await waitFor(() => expect(location.search).toBe('?sort=name%2Casc&text=jorge'));

    await userEvent.clear(screen.getByRole('searchbox'));
    await waitFor(() => expect(location.search).toBe('?sort=name%2Casc'));
});

test('steps back to the last page when the one in the URL no longer exists', async () => {
    vi.spyOn(api, 'get').mockImplementation(async (_url, config) => ({
        data: pageOf(config?.params.page === 4 ? [] : sellers, { totalElements: 23 }),
    }));
    const { location } = renderTable('/?page=5');

    await waitFor(() => expect(location.search).toBe('?page=3'));
    expect(await screen.findByText('Jorge Silva')).toBeInTheDocument();
});

test('the back button restores the previous search in the input', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(sellers) });
    function Back() {
        const navigate = useNavigate();
        return <button onClick={() => navigate(-1)}>Voltar</button>;
    }
    const { location } = renderWithProviders(
        <>
            <SellerDatatable onNew={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
            <Back />
        </>,
        { url: '/?text=jorge' },
    );
    await screen.findByText('Jorge Silva');

    // Sorting adds a history entry; the search box keeps "jorge".
    await userEvent.click(screen.getByText('Vendedor'));
    await waitFor(() => expect(location.search).toContain('sort='));
    await userEvent.clear(screen.getByRole('searchbox'));
    await waitFor(() => expect(location.search).not.toContain('text='));

    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    await waitFor(() => expect(location.search).toBe('?text=jorge'));
    expect(screen.getByRole('searchbox')).toHaveValue('jorge');
});

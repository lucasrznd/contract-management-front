import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '@/shared/api/api';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import ContractDatatable from './ContractDatatable';
import { renderWithProviders } from '@/test/renderWithProviders';
import { pageOf } from '@/test/pageOf';
import type { Contract, ContractFilter } from '../types/contract.types';

const base: Contract = {
    id: 1,
    companyTradeName: 'Padaria Pão Quente',
    sellerName: 'Ana Paula',
    sellerImageUrl: '',
    advertisingOrder: '2025-031',
    spotDuration: 0.3,
    quantitySpotDay: 4,
    testimonialDuration: 1,
    testimonialQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2027-01-31',
    monthlyPriceFmt: 'R$ 780,00',
    flashQuantity: 0,
    newspaperParticipation: '',
    paymentMethod: 'PIX',
    paymentDueDay: 5,
    observation: '',
    token: null,
    pdfPath: null,
};

const contracts: Contract[] = [
    base,
    { ...base, id: 2, companyTradeName: 'Auto Peças Central', pdfPath: '\\\\server\\2.pdf', endDate: '2026-04-30' },
    { ...base, id: 3, companyTradeName: 'Farmácia Saúde', token: 'abc', sellerName: 'Carlos Lima' },
];

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 9, 31) });
});

afterEach(() => {
    vi.useRealTimers();
});

function renderTable(filter: ContractFilter | null = null) {
    const props = {
        filter,
        onOpenFilter: vi.fn(),
        onClearFilter: vi.fn(),
        onNew: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onOpenDocument: vi.fn(),
    };
    renderWithProviders(<ContractDatatable {...props} />);
    return props;
}

const rowOf = (text: string) => screen.getByText(text).closest('tr')!;

/** Params of the last GET /contracts. */
const lastParams = (get: ReturnType<typeof vi.spyOn>) => get.mock.lastCall![1].params;

const periodFilter: ContractFilter = {
    kind: 'period',
    label: 'jan–dez 2026',
    params: { startDate: '2026-01-01', endDate: '2026-12-31' },
};

test('shows the term status and the document action of each contract', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(contracts) });
    const { onOpenDocument } = renderTable();

    await screen.findByText('Padaria Pão Quente');
    expect(within(rowOf('Padaria Pão Quente')).getByText('Vigente')).toBeInTheDocument();
    expect(within(rowOf('Padaria Pão Quente')).getByRole('button', { name: /Gerar/ })).toBeInTheDocument();
    expect(within(rowOf('Auto Peças Central')).getByText('Encerrado')).toBeInTheDocument();
    expect(within(rowOf('Auto Peças Central')).getByRole('button', { name: /Ver PDF/ })).toBeInTheDocument();
    expect(within(rowOf('Farmácia Saúde')).getByRole('button', { name: /Assinatura/ })).toBeInTheDocument();
    expect(within(rowOf('Padaria Pão Quente')).getByText('OP 2025-031')).toBeInTheDocument();

    await userEvent.click(within(rowOf('Auto Peças Central')).getByRole('button', { name: /Ver PDF/ }));
    expect(onOpenDocument).toHaveBeenCalledWith(contracts[1]);
});

test('searches on the API, keeping the advertising order as typed', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(contracts) });
    renderTable();
    await screen.findByText('Padaria Pão Quente');

    await userEvent.type(screen.getByRole('searchbox'), '2025-031');

    await waitFor(() => expect(lastParams(get)).toMatchObject({ text: '2025-031', page: 0 }));
});

test('sorts company and seller by their entity paths', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf(contracts) });
    renderTable();
    await screen.findByText('Padaria Pão Quente');

    await userEvent.click(screen.getByText('Empresa'));
    await waitFor(() => expect(lastParams(get).sort).toEqual(['clientCompany.tradeName,asc', 'id,asc']));

    await userEvent.click(screen.getByText('Vendedor'));
    await waitFor(() => expect(lastParams(get).sort).toEqual(['seller.name,asc', 'id,asc']));
});

test('a filtered list is searched on screen, without asking the paginated endpoint', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: contracts });
    renderTable(periodFilter);
    await screen.findByText('Padaria Pão Quente');

    await userEvent.type(screen.getByRole('searchbox'), 'carlos');

    expect(screen.queryByText('Padaria Pão Quente')).not.toBeInTheDocument();
    expect(screen.getByText('Farmácia Saúde')).toBeInTheDocument();
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/contracts/list', { params: periodFilter.params });
});

test('shows an empty state when there are no contracts', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: pageOf([]) });
    renderTable();

    expect(await screen.findByRole('heading', { name: 'Nenhum contrato cadastrado' })).toBeInTheDocument();
});

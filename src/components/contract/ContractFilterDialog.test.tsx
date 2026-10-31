import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { expect, test, vi } from 'vitest';
import ContractFilterDialog from './ContractFilterDialog';
import { renderWithProviders } from '../../test/renderWithProviders';

test('company and seller are required in the first mode', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: [] });
    const onApply = vi.fn();
    renderWithProviders(<ContractFilterDialog visible onHide={() => {}} onApply={onApply} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Aplicar filtro' }));

    expect(await screen.findByText('Selecione a empresa.')).toBeInTheDocument();
    expect(screen.getByText('Selecione o vendedor.')).toBeInTheDocument();
    expect(onApply).not.toHaveBeenCalled();
});

test('the period mode asks for both dates and not for company or seller', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: [] });
    renderWithProviders(<ContractFilterDialog visible onHide={() => {}} onApply={() => {}} />);

    await userEvent.click(await screen.findByRole('tab', { name: 'Período' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar filtro' }));

    expect(await screen.findByText('Informe a data inicial.')).toBeInTheDocument();
    expect(screen.getByText('Informe a data final.')).toBeInTheDocument();
    expect(screen.queryByText('Selecione a empresa.')).not.toBeInTheDocument();
});

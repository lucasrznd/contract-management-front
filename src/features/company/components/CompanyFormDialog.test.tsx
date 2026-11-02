import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import { api } from '@/shared/api/api';
import { expect, test, vi } from 'vitest';
import CompanyFormDialog from './CompanyFormDialog';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { Company } from '../types/company.types';
import { cropImage } from '@/shared/helpers/cropImage.helper';

vi.mock('@/shared/helpers/cropImage.helper', () => ({ cropImage: vi.fn() }));

const company: Company = {
    id: 3,
    businessName: 'Pão Quente LTDA',
    tradeName: 'Padaria Pão Quente',
    registrationNumber: '12938192319839',
    cpf: null,
    stateRegistration: null,
    phoneNumber: '43999392939',
    email: 'contato@paoquente.com.br',
    streetName: 'Rua Paraná',
    avenueName: 'Centro',
    number: 123,
    city: 'Jacarezinho',
    state: 'PR',
    zipCode: '86400-000',
    urlImage: 'https://storage/pao-quente.png',
};

/** FormData sent by the last call of the spied method. */
const sentBody = (spy: { mock: { lastCall?: unknown[] } }) => spy.mock.lastCall![1] as FormData;

async function fillValidForm() {
    vi.spyOn(axios, 'get').mockResolvedValue({
        data: { logradouro: 'Rua Paraná', bairro: 'Centro', localidade: 'Jacarezinho', uf: 'PR' },
    });
    await userEvent.type(await screen.findByLabelText(/Nome fantasia/), 'Padaria Pão Quente');
    await userEvent.type(screen.getByLabelText(/Razão social/), 'Pão Quente LTDA');
    await userEvent.type(screen.getByLabelText(/CNPJ/), '12938192319839');
    await userEvent.type(screen.getByLabelText(/Telefone/), '43999392939');
    await userEvent.type(screen.getByLabelText(/CEP/), '86400000');
    await vi.waitFor(() => expect(screen.getByLabelText(/Cidade/)).toHaveValue('Jacarezinho'));
    await userEvent.type(screen.getByLabelText(/Número/), '12a3');
}

test('saving an empty form shows the validation messages and sends nothing', async () => {
    const post = vi.spyOn(api, 'post');
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

test('a valid form is posted as multipart with documents and phone as digits', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: {} });
    const onHide = vi.fn();
    renderWithProviders(<CompanyFormDialog visible company={null} onHide={onHide} />);

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar empresa' }));

    await vi.waitFor(() => expect(onHide).toHaveBeenCalled());
    expect(post).toHaveBeenCalledWith(expect.stringMatching(/\/companies$/), expect.any(FormData));
    expect(Object.fromEntries(sentBody(post))).toEqual({
        businessName: 'Pão Quente LTDA',
        tradeName: 'Padaria Pão Quente',
        registrationNumber: '12938192319839',
        phoneNumber: '43999392939',
        zipCode: '86400-000',
        streetName: 'Rua Paraná',
        number: '123',
        avenueName: 'Centro',
        city: 'Jacarezinho',
        state: 'PR',
    });
});

test('a picked logo is cropped and sent in the image field', async () => {
    vi.mocked(cropImage).mockResolvedValue(new File(['x'], 'logo.webp', { type: 'image/webp' }));
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: {} });
    const onHide = vi.fn();
    renderWithProviders(<CompanyFormDialog visible company={null} onHide={onHide} />);

    await fillValidForm();
    await userEvent.upload(
        screen.getByLabelText('Arquivo de imagem'),
        new File(['x'], 'logo.png', { type: 'image/png' }),
    );
    await screen.findByRole('dialog', { name: 'Ajustar imagem' });
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog', { name: 'Ajustar imagem' })).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar empresa' }));

    await vi.waitFor(() => expect(onHide).toHaveBeenCalled());
    expect((sentBody(post).get('image') as File).name).toBe('logo.webp');
});

test('editing shows the current logo and keeps it when no other is picked', async () => {
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: company });
    const onHide = vi.fn();
    renderWithProviders(<CompanyFormDialog visible company={company} onHide={onHide} />);

    expect(await screen.findByRole('img', { name: 'Padaria Pão Quente' })).toHaveAttribute('src', company.urlImage);
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await vi.waitFor(() => expect(onHide).toHaveBeenCalled());
    expect(put).toHaveBeenCalledWith('/companies/3', expect.any(FormData));
    expect(sentBody(put).get('tradeName')).toBe('Padaria Pão Quente');
    expect(sentBody(put).has('image')).toBe(false);
});

test('an image too large for the API shows a friendly toast', async () => {
    const config = { headers: new AxiosHeaders() };
    vi.spyOn(api, 'post').mockRejectedValue(
        new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
            status: 413,
            statusText: 'Payload Too Large',
            headers: {},
            config,
            data: { message: 'File exceeds the maximum allowed size' },
        }),
    );
    const onHide = vi.fn();
    renderWithProviders(<CompanyFormDialog visible company={null} onHide={onHide} />);

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar empresa' }));

    expect(await screen.findByText('A imagem é maior que 5 MB. Escolha um arquivo menor.')).toBeInTheDocument();
    expect(onHide).not.toHaveBeenCalled();
});

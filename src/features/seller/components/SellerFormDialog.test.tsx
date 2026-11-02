import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '@/shared/api/api';
import { expect, test, vi } from 'vitest';
import SellerFormDialog from './SellerFormDialog';
import { renderWithProviders } from '@/test/renderWithProviders';
import { cropImage } from '@/shared/helpers/cropImage.helper';

vi.mock('@/shared/helpers/cropImage.helper', () => ({ cropImage: vi.fn() }));

const seller = { id: 7, name: 'Fernanda Rocha', phoneNumber: '19993818293', urlImage: 'https://storage/fernanda.png' };

const image = (type = 'image/png', size = 10) => new File([new Uint8Array(size)], 'foto.png', { type });

/** FormData sent by the last call of the spied method. */
const sentBody = (spy: { mock: { lastCall?: unknown[] } }) => spy.mock.lastCall![1] as FormData;

async function fillValidForm() {
    await userEvent.type(await screen.findByLabelText(/Nome/), '  Ana Paula  ');
    await userEvent.type(screen.getByLabelText(/Telefone/), '19993818293');
}

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
    expect(screen.getByRole('img', { name: 'Fernanda Rocha' })).toHaveAttribute('src', seller.urlImage);
});

test('saving an empty form shows the validation messages and sends nothing', async () => {
    const post = vi.spyOn(api, 'post');
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

test('a valid form is posted as multipart with the phone digits only', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { ...seller, id: 8 } });
    const onHide = vi.fn();
    renderWithProviders(<SellerFormDialog visible seller={null} onHide={onHide} />);

    await fillValidForm();
    expect(screen.getByLabelText(/Telefone/)).toHaveValue('(19) 9 9381-8293');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar vendedor' }));

    await vi.waitFor(() => expect(onHide).toHaveBeenCalled());
    expect(post).toHaveBeenCalledWith(expect.stringMatching(/\/sellers$/), expect.any(FormData));
    const body = sentBody(post);
    expect(body.get('name')).toBe('Ana Paula');
    expect(body.get('phoneNumber')).toBe('19993818293');
    expect(body.has('image')).toBe(false);
    expect(await screen.findByText('Vendedor cadastrado')).toBeInTheDocument();
});

test('a picked photo is cropped, previewed and sent in the image field', async () => {
    const cropped = new File(['x'], 'foto.webp', { type: 'image/webp' });
    vi.mocked(cropImage).mockResolvedValue(cropped);
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { ...seller, id: 8 } });
    const onHide = vi.fn();
    renderWithProviders(<SellerFormDialog visible seller={null} onHide={onHide} />);

    await fillValidForm();
    // A photo bigger than the API takes is fine: only the cropped one is sent.
    await userEvent.upload(screen.getByLabelText('Arquivo de imagem'), image('image/jpeg', 8 * 1024 * 1024));
    await screen.findByRole('dialog', { name: 'Ajustar imagem' });
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog', { name: 'Ajustar imagem' })).not.toBeInTheDocument());
    expect(screen.getByRole('img', { name: 'Ana Paula' })).toHaveAttribute('src', 'blob:preview');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar vendedor' }));

    await vi.waitFor(() => expect(onHide).toHaveBeenCalled());
    expect((sentBody(post).get('image') as File).name).toBe('foto.webp');
});

test('cancelling the crop keeps the form without a new photo', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { ...seller, id: 8 } });
    const onHide = vi.fn();
    renderWithProviders(<SellerFormDialog visible seller={null} onHide={onHide} />);

    await fillValidForm();
    await userEvent.upload(screen.getByLabelText('Arquivo de imagem'), image());
    const cropper = await screen.findByRole('dialog', { name: 'Ajustar imagem' });
    await userEvent.click(within(cropper).getByRole('button', { name: 'Cancelar' }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog', { name: 'Ajustar imagem' })).not.toBeInTheDocument());
    expect(screen.getByRole('dialog', { name: 'Novo vendedor' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar vendedor' }));

    await vi.waitFor(() => expect(onHide).toHaveBeenCalled());
    expect(sentBody(post).has('image')).toBe(false);
});

test.each([
    ['a file that is not an image', image('application/pdf'), null, 'Formato não suportado. Envie JPG, PNG ou WebP.'],
    ['a crop still over 5 MB', image(), image('image/webp', 5 * 1024 * 1024 + 1), 'Arquivo maior que 5 MB.'],
])('%s is rejected before sending', async (_, file, cropped, message) => {
    if (cropped) vi.mocked(cropImage).mockResolvedValue(cropped);
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { ...seller, id: 8 } });
    const onHide = vi.fn();
    renderWithProviders(<SellerFormDialog visible seller={null} onHide={onHide} />);

    await fillValidForm();
    await userEvent.upload(screen.getByLabelText('Arquivo de imagem'), file, { applyAccept: false });
    if (cropped) {
        await screen.findByRole('dialog', { name: 'Ajustar imagem' });
        await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    }
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar vendedor' }));

    await vi.waitFor(() => expect(onHide).toHaveBeenCalled());
    expect(sentBody(post).has('image')).toBe(false);
});

test('editing without picking a photo keeps the current one', async () => {
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: seller });
    const onHide = vi.fn();
    renderWithProviders(<SellerFormDialog visible seller={seller} onHide={onHide} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Salvar alterações' }));

    await vi.waitFor(() => expect(onHide).toHaveBeenCalled());
    expect(put).toHaveBeenCalledWith('/sellers/7', expect.any(FormData));
    expect(sentBody(put).get('name')).toBe('Fernanda Rocha');
    expect(sentBody(put).has('image')).toBe(false);
});

test('a failed save shows a toast and keeps the dialog open', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(new Error('Request failed'));
    const onHide = vi.fn();
    renderWithProviders(<SellerFormDialog visible seller={null} onHide={onHide} />);

    await userEvent.type(await screen.findByLabelText(/Nome/), 'Ana Paula');
    await userEvent.type(screen.getByLabelText(/Telefone/), '19993818293');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar vendedor' }));

    expect(await screen.findByText('Não foi possível cadastrar o vendedor.')).toBeInTheDocument();
    expect(onHide).not.toHaveBeenCalled();
});

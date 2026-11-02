import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import ImageCropperDialog from './ImageCropperDialog';
import { cropImage } from '@/shared/helpers/cropImage.helper';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/shared/helpers/cropImage.helper', () => ({ cropImage: vi.fn() }));

const cropped = new File(['x'], 'foto.webp', { type: 'image/webp' });

function renderDialog() {
    const props = { onCancel: vi.fn(), onCrop: vi.fn() };
    renderWithProviders(<ImageCropperDialog src="blob:picked" fileName="foto.jpg" {...props} />);
    return props;
}

test('applying hands back the cropped file', async () => {
    vi.mocked(cropImage).mockResolvedValue(cropped);
    const { onCrop } = renderDialog();

    expect(await screen.findByRole('dialog', { name: 'Ajustar imagem' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    await vi.waitFor(() => expect(onCrop).toHaveBeenCalledWith(cropped));
    expect(cropImage).toHaveBeenCalledWith('blob:picked', { x: 0, y: 0, width: 800, height: 800 }, 'foto.jpg');
});

test('cancelling closes without cropping', async () => {
    const { onCancel, onCrop } = renderDialog();

    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalled();
    expect(onCrop).not.toHaveBeenCalled();
});

test('a failed crop shows the error and keeps the dialog open', async () => {
    vi.mocked(cropImage).mockRejectedValue(new Error('Não foi possível ler a imagem.'));
    const { onCrop } = renderDialog();

    await userEvent.click(await screen.findByRole('button', { name: 'Aplicar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível ler a imagem.');
    expect(onCrop).not.toHaveBeenCalled();
});

import type { Area } from 'react-easy-crop';

/** Side of the square images we send: plenty for avatars and keeps uploads small. */
export const CROPPED_IMAGE_SIZE = 512;

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
        image.src = src;
    });

/**
 * Cuts `area` (in pixels of the original image) out of `src` and scales it down to at most 512×512.
 * Encoded as WebP; browsers that can't encode WebP (Safari) give PNG, which the API also accepts.
 */
export async function cropImage(src: string, area: Area, fileName: string): Promise<File> {
    const image = await loadImage(src);
    const size = Math.min(CROPPED_IMAGE_SIZE, Math.round(area.width));
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível recortar a imagem.');

    context.imageSmoothingQuality = 'high';
    context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9));
    if (!blob) throw new Error('Não foi possível recortar a imagem.');

    const extension = blob.type === 'image/webp' ? 'webp' : 'png';
    const baseName = fileName.replace(/\.[^.]+$/, '') || 'imagem';
    return new File([blob], `${baseName}.${extension}`, { type: blob.type });
}

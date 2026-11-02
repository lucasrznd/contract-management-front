/** Largest image contract-management-api accepts. */
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** For the `accept` attribute of file inputs. */
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',');

/** Whether the file is an image the API takes, checked as soon as it is picked (its size only matters once cropped). */
export function imageTypeError(file: File): string | null {
    return IMAGE_TYPES.includes(file.type.toLowerCase()) ? null : 'Formato não suportado. Envie JPG, PNG ou WebP.';
}

/** Why the API would reject the file, or null when it is fine to send. */
export function imageFileError(file: File): string | null {
    return imageTypeError(file) ?? (file.size > IMAGE_MAX_SIZE ? 'Arquivo maior que 5 MB.' : null);
}

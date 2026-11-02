import { expect, test } from 'vitest';
import { IMAGE_MAX_SIZE, imageFileError } from './imageFile.helper';

const file = (type: string, size = 10) => new File([new Uint8Array(size)], 'photo', { type });

test.each(['image/jpeg', 'image/png', 'image/webp'])('accepts %s', (type) => {
    expect(imageFileError(file(type))).toBeNull();
});

test('rejects files that are not JPG, PNG or WebP', () => {
    expect(imageFileError(file('application/pdf'))).toBe('Formato não suportado. Envie JPG, PNG ou WebP.');
    expect(imageFileError(file('image/gif'))).toBe('Formato não suportado. Envie JPG, PNG ou WebP.');
});

test('rejects images larger than 5 MB', () => {
    expect(imageFileError(file('image/png', IMAGE_MAX_SIZE))).toBeNull();
    expect(imageFileError(file('image/png', IMAGE_MAX_SIZE + 1))).toBe('Arquivo maior que 5 MB.');
});

import { expect, test } from 'vitest';
import { toFormData } from './formData';

test('sends text, numbers and files, leaving empty values out', () => {
    const image = new File(['x'], 'logo.png', { type: 'image/png' });
    const body = toFormData({ name: 'Ana', number: 123, image, cpf: undefined, email: '', id: null });

    expect(body.get('name')).toBe('Ana');
    expect(body.get('number')).toBe('123');
    expect(body.get('image')).toBe(image);
    expect([...body.keys()]).toEqual(['name', 'number', 'image']);
});

import { beforeEach, expect, test, vi } from 'vitest';
import { cropImage } from './cropImage.helper';

const drawImage = vi.fn();
let encodedType = 'image/webp';

beforeEach(() => {
    drawImage.mockClear();
    encodedType = 'image/webp';
    // jsdom has no canvas and never loads images: fake both.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
        drawImage,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) =>
        callback(new Blob(['x'], { type: encodedType })),
    );
    vi.spyOn(HTMLImageElement.prototype, 'src', 'set').mockImplementation(function (this: HTMLImageElement) {
        queueMicrotask(() => this.onload?.(new Event('load')));
    });
});

test('scales the cropped area down to 512px and encodes it as WebP', async () => {
    const toBlob = vi.mocked(HTMLCanvasElement.prototype.toBlob);
    const file = await cropImage('blob:picked', { x: 10, y: 20, width: 2000, height: 2000 }, 'foto.jpeg');

    expect(drawImage).toHaveBeenCalledWith(expect.any(HTMLImageElement), 10, 20, 2000, 2000, 0, 0, 512, 512);
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.9);
    expect(file.name).toBe('foto.webp');
    expect(file.type).toBe('image/webp');
});

test('keeps small crops at their own size', async () => {
    await cropImage('blob:picked', { x: 0, y: 0, width: 300, height: 300 }, 'foto.png');

    expect(drawImage).toHaveBeenCalledWith(expect.any(HTMLImageElement), 0, 0, 300, 300, 0, 0, 300, 300);
});

test('falls back to PNG where the browser cannot encode WebP', async () => {
    encodedType = 'image/png';
    const file = await cropImage('blob:picked', { x: 0, y: 0, width: 600, height: 600 }, 'foto.jpg');

    expect(file.name).toBe('foto.png');
    expect(file.type).toBe('image/png');
});

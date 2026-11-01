import { expect, test } from 'vitest';
import { isPage, maskedNumberAsDigits, toPageParams } from './pagination';

test('sorts by the requested field with id as tiebreaker', () => {
    expect(toPageParams({ page: 2, size: 25, sort: { field: 'name', direction: 'desc' } })).toEqual({
        text: undefined,
        page: 2,
        size: 25,
        sort: ['name,desc', 'id,asc'],
    });
});

test('does not repeat id when sorting by it', () => {
    expect(toPageParams({ sort: { field: 'id', direction: 'asc' } }).sort).toEqual(['id,asc']);
});

test('maps response fields to entity paths', () => {
    const params = toPageParams({ sort: { field: 'sellerName', direction: 'asc' } }, { sellerName: 'seller.name' });
    expect(params.sort).toEqual(['seller.name,asc', 'id,asc']);
});

test.each([
    ['', undefined],
    ['   ', undefined],
    ['  joão silva ', 'joão silva'],
])('text %j is sent as %j', (text, expected) => {
    expect(toPageParams({ text }).text).toBe(expected);
});

test.each([
    ['(19) 3381-5555', '1933815555'],
    ['12.938.192/0001-39', '12938192000139'],
    ['joão', 'joão'],
    ['Rua 7', 'Rua 7'],
    [undefined, undefined],
])('maskedNumberAsDigits(%j) is %j', (text, expected) => {
    expect(maskedNumberAsDigits(text)).toBe(expected);
});

test('isPage rejects anything without a content list', () => {
    expect(isPage({ content: [], page: {} })).toBe(true);
    expect(isPage('<!doctype html>')).toBe(false);
    expect(isPage([])).toBe(false);
    expect(isPage(undefined)).toBe(false);
});

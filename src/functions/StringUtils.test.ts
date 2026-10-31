import { describe, expect, test } from 'vitest';
import {
    formatCode,
    initials,
    maskCnpj,
    maskPhone,
    maskZipCode,
    normalizeSearch,
    parseMoney,
    toIsoDate,
} from './StringUtils';

describe('maskPhone', () => {
    test.each([
        ['', ''],
        ['1', '(1'],
        ['19', '(19'],
        ['1993', '(19) 93'],
        ['193381', '(19) 3381'],
        ['1933818293', '(19) 3381-8293'],
        ['19993818293', '(19) 9 9381-8293'],
        ['(19) 9 9381-8293 ramal', '(19) 9 9381-8293'],
    ])('%j → %j', (input, expected) => {
        expect(maskPhone(input)).toBe(expected);
    });
});

test('formatCode pads ids to three digits', () => {
    expect(formatCode(7)).toBe('007');
    expect(formatCode(1234)).toBe('1234');
});

test('initials uses the first and last names', () => {
    expect(initials('Ana Paula Moreira')).toBe('AM');
    expect(initials('  jorge ')).toBe('J');
    expect(initials('')).toBe('');
});

test('normalizeSearch drops accents and case', () => {
    expect(normalizeSearch('Patrícia Gomes')).toBe('patricia gomes');
});

test('maskPattern masks as you type', () => {
    expect(maskCnpj('12938192319839')).toBe('12.938.192/3198-39');
    expect(maskCnpj('1293')).toBe('12.93');
    expect(maskZipCode('86400000')).toBe('86400-000');
});

test.each([
    ['R$ 1.500,00', 1500],
    ['R$ 780,50', 780.5],
    ['R$1500.00', 1500],
    ['R$0.00', 0],
    ['', null],
])('parseMoney(%j) → %j', (input, expected) => {
    expect(parseMoney(input)).toBe(expected);
});

test('toIsoDate keeps the local date', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
});

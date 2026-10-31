import { describe, expect, test } from 'vitest';
import { formatCode, initials, maskPhone, normalizeSearch } from './StringUtils';

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

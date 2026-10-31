import { expect, test } from 'vitest';
import { matchesSearch } from '@/shared/helpers/search.helper';

const company = { text: ['Padaria Pão Quente'], digits: ['12.938.192/3198-39'], id: 12 };

test.each([
    ['', true],
    ['pao', true],
    ['PÃO QUENTE', true],
    ['12.938', true],
    ['1293819', true],
    ['12', true],
    ['açougue', false],
    ['99', false],
])('%j → %s', (query, expected) => {
    expect(matchesSearch(query, company)).toBe(expected);
});

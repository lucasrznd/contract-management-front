import { normalizeSearch, onlyDigits } from '@/shared/helpers/stringUtils.helper';

interface Searchable {
    /** Matched ignoring case and accents. */
    text?: (string | null | undefined)[];
    /** Matched by digits only, so "(19) 9938" finds "19993818293". */
    digits?: (string | null | undefined)[];
    /** Matched exactly against the digits typed. */
    id?: number;
}

/** True when `query` is empty or matches any of the record's fields. */
export function matchesSearch(query: string, { text = [], digits = [], id }: Searchable) {
    const normalized = normalizeSearch(query.trim());
    if (!normalized) return true;

    const queryDigits = onlyDigits(query);
    return (
        text.some((value) => value && normalizeSearch(value).includes(normalized)) ||
        (!!queryDigits &&
            (digits.some((value) => value && onlyDigits(value).includes(queryDigits)) || String(id) === queryDigits))
    );
}

import { onlyDigits } from '@/shared/helpers/stringUtils.helper';
import type { Page, PageRequest } from '@/shared/types/api.types';

/**
 * Masked numbers ("(19) 3381-5555", "12.938.192/0001") reduced to their digits, the way phones and documents are
 * stored, so the API finds them. Anything with letters is left as typed.
 */
export function maskedNumberAsDigits(text: string | undefined) {
    return text && /^[\d\s().\-/]+$/.test(text.trim()) ? onlyDigits(text) : text;
}

/**
 * Query params for a list endpoint. `sortFields` maps response fields to the entity paths the API sorts by
 * (e.g. `companyTradeName` → `clientCompany.tradeName`); `id` breaks ties so pages don't overlap or skip rows.
 */
export function toPageParams({ text, page, size, sort }: PageRequest, sortFields: Record<string, string> = {}) {
    const field = sort && (sortFields[sort.field] ?? sort.field);
    return {
        text: text?.trim() || undefined,
        page,
        size,
        sort: field ? [`${field},${sort.direction}`, ...(field === 'id' ? [] : ['id,asc'])] : undefined,
    };
}

/** False when the API answers something else, e.g. a misconfigured URL serving index.html. */
export function isPage<T>(data: unknown): data is Page<T> {
    return !!data && typeof data === 'object' && Array.isArray((data as Page<T>).content);
}

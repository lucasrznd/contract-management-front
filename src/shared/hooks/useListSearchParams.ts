import { useSearchParams } from 'react-router';
import type { SortDirection } from '@/shared/types/api.types';

export interface ListParams {
    text: string;
    /** Zero-based; the URL shows it one-based (`?page=2` is the second page). */
    page: number;
    size: number;
    sort: { field: string; direction: SortDirection };
}

interface ListSearchParamsOptions {
    /** Fields that can be sorted by; any other `sort` in the URL falls back to `defaultSort`. */
    sortFields: string[];
    defaultSort: ListParams['sort'];
    /** Allowed page sizes; the first one is the default. */
    sizes: number[];
}

/**
 * Search, page and sort of a list kept in the URL (`?text=joao&page=2&size=25&sort=name,desc`), so a refresh or a
 * shared link opens the same view and the browser's back button steps through it. Defaults are left out of the URL,
 * and values it can't use (a hand-edited `size=999`, a sort field that no longer exists) fall back to them.
 */
export function useListSearchParams({ sortFields, defaultSort, sizes }: ListSearchParamsOptions) {
    const [searchParams, setSearchParams] = useSearchParams();

    const size = Number(searchParams.get('size'));
    const [sortField, sortDirection] = (searchParams.get('sort') ?? '').split(',');
    const params: ListParams = {
        text: searchParams.get('text')?.trim() ?? '',
        page: Math.max(1, Math.trunc(Number(searchParams.get('page'))) || 1) - 1,
        size: sizes.includes(size) ? size : sizes[0],
        sort: sortFields.includes(sortField)
            ? { field: sortField, direction: sortDirection === 'desc' ? 'desc' : 'asc' }
            : defaultSort,
    };

    /** Applies `changes` over the current params. `replace` swaps the history entry instead of adding one. */
    const setParams = (changes: Partial<ListParams>, { replace = false } = {}) => {
        const next = { ...params, ...changes };
        const isDefaultSort = next.sort.field === defaultSort.field && next.sort.direction === defaultSort.direction;

        setSearchParams(
            (current) => {
                // Other params on the URL are kept.
                const updated = new URLSearchParams(current);
                const write = (key: string, value: string | null) =>
                    value === null ? updated.delete(key) : updated.set(key, value);
                write('text', next.text || null);
                write('page', next.page > 0 ? String(next.page + 1) : null);
                write('size', next.size !== sizes[0] ? String(next.size) : null);
                write('sort', isDefaultSort ? null : `${next.sort.field},${next.sort.direction}`);
                return updated;
            },
            { replace },
        );
    };

    return [params, setParams] as const;
}

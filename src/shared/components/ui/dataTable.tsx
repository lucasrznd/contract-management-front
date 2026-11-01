import { useEffect, useRef, useState } from 'react';
import type { DataTablePropsSingle, DataTableStateEvent, DataTableValueArray } from 'primereact/datatable';
import type { PageRequest } from '@/shared/types/api.types';
import { useListSearchParams } from '@/shared/hooks/useListSearchParams';
import { paginatorClassName, paginatorTemplate, rowsPerPageOptions } from './paginator';
import styles from './dataTable.module.css';

/** Cell classes shared by the list tables: title/subtitle stacks, code, muted text. */
export { styles as tableStyles };

/** How long the search waits after the last keystroke before asking the API. */
export const SEARCH_DELAY = 350;

interface DataTableStateOptions {
    /** `field` of each sortable column; the first one is the default sort, ascending. */
    sortFields: [string, ...string[]];
    /**
     * true (default): the API searches, sorts and pages; send `request` to the list endpoint.
     * false: the DataTable sorts and pages the rows it gets, and the caller filters them by `search`.
     */
    lazy?: boolean;
}

/**
 * State for a list table in the design: search, sorting and pagination, kept in the URL query.
 * Spread `tableProps(totalRecords)` on the DataTable. A new search or sort goes back to the first page.
 */
export function useDataTableState<T extends DataTableValueArray>({ sortFields, lazy = true }: DataTableStateOptions) {
    const [params, setParams] = useListSearchParams({
        sortFields,
        defaultSort: { field: sortFields[0], direction: 'asc' },
        sizes: rowsPerPageOptions,
    });

    // What the input shows, updated on every keystroke. The URL gets it after SEARCH_DELAY, together with the
    // page reset, so no request goes out with the old text on the first page.
    const [search, setSearch] = useState(params.text);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);

    // The URL changed on its own (back/forward button): show its text in the input.
    useEffect(() => {
        if (params.text !== search.trim()) {
            clearTimeout(timer.current);
            setSearch(params.text);
        }
    }, [params.text]);

    const commitSearch = (value: string) => {
        if (value.trim() !== params.text) setParams({ text: value.trim(), page: 0 }, { replace: true });
    };

    const changeSearch = (value: string) => {
        setSearch(value);
        clearTimeout(timer.current);
        // Rows filtered on screen change right away, so the page has to follow.
        if (!lazy && params.page > 0) setParams({ page: 0 }, { replace: true });
        // Clearing shows everything again at once; typing waits for a pause.
        if (!value.trim()) commitSearch(value);
        else timer.current = setTimeout(() => commitSearch(value), SEARCH_DELAY);
    };

    const request: PageRequest = {
        text: params.text || undefined,
        page: params.page,
        size: params.size,
        sort: params.sort,
    };

    // Deleting the last row of the last page, or opening a link to a page that no longer exists,
    // leaves us past the end: step back to the last page.
    const total = useRef<number>(undefined);
    useEffect(() => {
        if (total.current === undefined || params.page === 0 || params.page * params.size < total.current) return;
        setParams({ page: Math.max(0, Math.ceil(total.current / params.size) - 1) }, { replace: true });
    });

    /** Props for the DataTable. `totalRecords` is the API's total with `lazy`, or the rows shown without it. */
    const tableProps = (totalRecords: number | undefined): Partial<DataTablePropsSingle<T>> => {
        total.current = totalRecords;

        return {
            className: styles.table,
            lazy,
            ...(lazy && { totalRecords: totalRecords ?? 0 }),
            sortField: params.sort.field,
            sortOrder: params.sort.direction === 'desc' ? -1 : 1,
            onSort: (e: DataTableStateEvent) =>
                setParams({ sort: { field: e.sortField, direction: e.sortOrder === -1 ? 'desc' : 'asc' }, page: 0 }),
            sortIcon: ({ sorted, sortOrder }) =>
                sorted ? <span className={styles.sortArrow}>{sortOrder === 1 ? '↑' : '↓'}</span> : null,
            paginator: true,
            first: params.page * params.size,
            rows: params.size,
            onPage: (e: DataTableStateEvent) => setParams({ page: Math.floor(e.first / e.rows), size: e.rows }),
            rowsPerPageOptions,
            paginatorTemplate,
            paginatorClassName,
        };
    };

    return {
        search,
        /** The text the current results were searched with; differs from `search` while the user is typing. */
        committedSearch: params.text,
        changeSearch,
        resetPage: () => params.page > 0 && setParams({ page: 0 }, { replace: true }),
        request,
        tableProps,
    };
}

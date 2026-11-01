import { useEffect, useRef, useState } from 'react';
import type { DataTablePropsSingle, DataTableStateEvent, DataTableValueArray } from 'primereact/datatable';
import type { SortOrder } from 'primereact/api';
import type { Page, PageRequest } from '@/shared/types/api.types';
import { paginatorClassName, paginatorTemplate, rowsPerPageOptions } from './paginator';
import styles from './dataTable.module.css';

/** Cell classes shared by the list tables: title/subtitle stacks, code, muted text. */
export { styles as tableStyles };

/** How long the search waits after the last keystroke before asking the API. */
export const SEARCH_DELAY = 350;

interface DataTableStateOptions {
    /**
     * true (default): the API searches, sorts and pages; send `request` to the list endpoint.
     * false: the DataTable sorts and pages the rows it gets, and the caller filters them by `search`.
     */
    lazy?: boolean;
}

/**
 * State for a list table in the design: search, sorting and pagination.
 * Spread `tableProps(page)` on the DataTable. A new search or sort goes back to the first page.
 */
export function useDataTableState<T extends DataTableValueArray>(
    defaultSortField: string,
    { lazy = true }: DataTableStateOptions = {},
) {
    // What the input shows, updated on every keystroke.
    const [search, setSearch] = useState('');
    // What the API is asked for. The search lands here after SEARCH_DELAY, together with the page reset,
    // so no request goes out with the old text on the first page.
    const [state, setState] = useState<{
        text: string;
        first: number;
        rows: number;
        sortField: string;
        sortOrder: SortOrder;
    }>({
        text: '',
        first: 0,
        rows: rowsPerPageOptions[0],
        sortField: defaultSortField,
        sortOrder: 1,
    });
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);

    const commitSearch = (value: string) =>
        setState((s) => (s.text === value.trim() ? s : { ...s, text: value.trim(), first: 0 }));

    const changeSearch = (value: string) => {
        setSearch(value);
        clearTimeout(timer.current);
        // Rows filtered on screen change right away, so the page has to follow.
        if (!lazy) setState((s) => ({ ...s, first: 0 }));
        // Clearing shows everything again at once; typing waits for a pause.
        if (!value.trim()) commitSearch(value);
        else timer.current = setTimeout(() => commitSearch(value), SEARCH_DELAY);
    };

    const request: PageRequest = {
        text: state.text || undefined,
        page: Math.floor(state.first / state.rows),
        size: state.rows,
        sort: { field: state.sortField, direction: state.sortOrder === -1 ? 'desc' : 'asc' },
    };

    /** Props for the DataTable. With `lazy`, pass the API's answer to `request` for the total and page links. */
    const tableProps = (page?: Page<T[number]>): Partial<DataTablePropsSingle<T>> => {
        const totalRecords = page?.page.totalElements;
        // Deleting the last row of the last page leaves us past the end: step back to the new last page.
        if (lazy && totalRecords !== undefined && state.first > 0 && state.first >= totalRecords) {
            const lastPageFirst = Math.max(0, Math.ceil(totalRecords / state.rows) - 1) * state.rows;
            setState((s) => ({ ...s, first: lastPageFirst }));
        }

        return {
            className: styles.table,
            lazy,
            ...(lazy && { totalRecords: totalRecords ?? 0 }),
            sortField: state.sortField,
            sortOrder: state.sortOrder,
            onSort: (e: DataTableStateEvent) =>
                setState((s) => ({ ...s, sortField: e.sortField, sortOrder: e.sortOrder ?? 1, first: 0 })),
            sortIcon: ({ sorted, sortOrder }) =>
                sorted ? <span className={styles.sortArrow}>{sortOrder === 1 ? '↑' : '↓'}</span> : null,
            paginator: true,
            first: state.first,
            rows: state.rows,
            onPage: (e: DataTableStateEvent) => setState((s) => ({ ...s, first: e.first, rows: e.rows })),
            rowsPerPageOptions,
            paginatorTemplate,
            paginatorClassName,
        };
    };

    return {
        search,
        /** The text the current results were searched with; differs from `search` while the user is typing. */
        committedSearch: state.text,
        changeSearch,
        resetPage: () => setState((s) => (s.first === 0 ? s : { ...s, first: 0 })),
        request,
        tableProps,
    };
}

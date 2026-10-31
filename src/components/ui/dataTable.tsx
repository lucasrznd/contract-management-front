import { useState } from 'react';
import type { DataTablePropsSingle, DataTableStateEvent, DataTableValueArray } from 'primereact/datatable';
import type { SortOrder } from 'primereact/api';
import { paginatorClassName, paginatorTemplate, rowsPerPageOptions } from './paginator';
import styles from './dataTable.module.css';

/** Cell classes shared by the list tables: title/subtitle stacks, code, muted text. */
export { styles as tableStyles };

/**
 * State for a list table in the design: search, sorting and pagination.
 * Spread `tableProps` on the DataTable; changing the search or sort goes back to the first page.
 */
export function useDataTableState<T extends DataTableValueArray>(defaultSortField: string) {
    const [search, setSearch] = useState('');
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(rowsPerPageOptions[0]);
    const [sortField, setSortField] = useState(defaultSortField);
    const [sortOrder, setSortOrder] = useState<SortOrder>(1);

    const changeSearch = (value: string) => {
        setSearch(value);
        setFirst(0);
    };

    const tableProps: Partial<DataTablePropsSingle<T>> = {
        className: styles.table,
        sortField,
        sortOrder,
        onSort: (e: DataTableStateEvent) => {
            setSortField(e.sortField);
            setSortOrder(e.sortOrder ?? 1);
            setFirst(0);
        },
        sortIcon: ({ sorted, sortOrder }) =>
            sorted ? <span className={styles.sortArrow}>{sortOrder === 1 ? '↑' : '↓'}</span> : null,
        paginator: true,
        first,
        rows,
        onPage: (e: DataTableStateEvent) => {
            setFirst(e.first);
            setRows(e.rows);
        },
        rowsPerPageOptions,
        paginatorTemplate,
        paginatorClassName,
    };

    return { search, changeSearch, resetPage: () => setFirst(0), tableProps };
}

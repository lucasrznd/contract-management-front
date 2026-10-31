import type { PaginatorTemplate } from 'primereact/paginator';
import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/components/icons';
import styles from './paginator.module.css';

/** Class for DataTable's `paginatorClassName`: report and page size on the left, page links on the right. */
export const paginatorClassName = styles.paginator;

export const rowsPerPageOptions = [10, 25, 50];

/** DataTable `paginatorTemplate` from the design: "Mostrando 1–10 de 23 · Por página [10]   ‹ 1 2 3 ›". */
export const paginatorTemplate: Exclude<PaginatorTemplate, string | undefined> = {
    layout: 'CurrentPageReport RowsPerPageDropdown PrevPageLink PageLinks NextPageLink',
    CurrentPageReport: ({ first, last, totalRecords }) => (
        <span className={styles.report}>
            Mostrando{' '}
            <strong>
                {totalRecords ? first : 0}–{last}
            </strong>{' '}
            de <strong>{totalRecords}</strong>
        </span>
    ),
    PrevPageLink: ({ onClick, className, disabled }) => (
        <button type="button" className={className} onClick={onClick} disabled={disabled} aria-label="Página anterior">
            <ChevronLeftIcon size={14} />
        </button>
    ),
    NextPageLink: ({ onClick, className, disabled }) => (
        <button type="button" className={className} onClick={onClick} disabled={disabled} aria-label="Próxima página">
            <ChevronRightIcon size={14} />
        </button>
    ),
    RowsPerPageDropdown: ({ value, options, onChange }) => (
        <label className={styles.pageSize}>
            Por página
            <select
                value={value}
                // The paginator only reads `value` from the event it gets back.
                onChange={(e) =>
                    onChange({ value: Number(e.target.value) } as unknown as Parameters<typeof onChange>[0])
                }
            >
                {options.map((option: { value: number }) => (
                    <option key={option.value} value={option.value}>
                        {option.value}
                    </option>
                ))}
            </select>
        </label>
    ),
};

import { useMemo, useState } from 'react';
import { DataTable, type DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import type { SortOrder } from 'primereact/api';
import PageCard from '../ui/PageCard';
import SearchInput from '../ui/SearchInput';
import EmptyState from '../ui/EmptyState';
import UserAvatar from '../ui/UserAvatar';
import { paginatorClassName, paginatorTemplate, rowsPerPageOptions } from '../ui/paginator';
import { CloudOffIcon, PencilIcon, PhoneIcon, PlusIcon, SearchIcon, TrashIcon, UserPlusIcon } from '../icons';
import { useSellerFindAll } from '../../hooks/seller/useSellerFindAll';
import { formatCode, maskPhone, normalizeSearch } from '../../functions/StringUtils';
import type { Seller } from '../../types';
import styles from './SellerDatatable.module.css';

interface SellerDatatableProps {
    onNew: () => void;
    onEdit: (seller: Seller) => void;
    onDelete: (seller: Seller) => void;
}

/** Matches the name (ignoring accents), the phone digits or the code. */
function matchesSearch(seller: Seller, search: string) {
    const text = normalizeSearch(search.trim());
    const digits = search.replace(/\D/g, '');
    if (!text) return true;
    return (
        normalizeSearch(seller.name).includes(text) ||
        (!!digits && (seller.phoneNumber.replace(/\D/g, '').includes(digits) || String(seller.id) === digits))
    );
}

export default function SellerDatatable({ onNew, onEdit, onDelete }: SellerDatatableProps) {
    const { data, isLoading, isError } = useSellerFindAll();
    const [search, setSearch] = useState('');
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(rowsPerPageOptions[0]);
    const [sortField, setSortField] = useState<keyof Seller>('id');
    const [sortOrder, setSortOrder] = useState<SortOrder>(1);

    // A misconfigured API URL answers with index.html instead of a list.
    const sellers = Array.isArray(data) ? data : undefined;
    const filtered = useMemo(
        () => (sellers ?? []).filter((seller) => matchesSearch(seller, search)),
        [sellers, search],
    );

    const changeSearch = (value: string) => {
        setSearch(value);
        setFirst(0);
    };

    const newSellerButton = <Button label="Novo vendedor" icon={<PlusIcon />} onClick={onNew} />;

    const sellerBody = (seller: Seller) => (
        <div className={styles.seller}>
            <UserAvatar name={seller.name} id={seller.id} src={seller.urlImage} />
            <div className={styles.sellerText}>
                <div className={styles.name}>{seller.name}</div>
                <div className={styles.phone}>
                    <PhoneIcon size={13} />
                    {maskPhone(seller.phoneNumber)}
                </div>
            </div>
        </div>
    );

    const actionsBody = (seller: Seller) => (
        <div className={styles.actions}>
            <Button
                text
                icon={<PencilIcon />}
                title="Editar"
                aria-label={`Editar ${seller.name}`}
                onClick={() => onEdit(seller)}
            />
            <Button
                text
                severity="danger"
                icon={<TrashIcon />}
                title="Excluir"
                aria-label={`Excluir ${seller.name}`}
                onClick={() => onDelete(seller)}
            />
        </div>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className={styles.loading}>
                    <ProgressSpinner />
                </div>
            );
        }

        if (isError || !sellers) {
            return (
                <EmptyState
                    tone="danger"
                    icon={<CloudOffIcon size={26} />}
                    title="Erro de conexão com servidor."
                    description="Não foi possível carregar os vendedores. Tente novamente em alguns instantes."
                />
            );
        }

        if (!sellers.length) {
            return (
                <EmptyState
                    icon={<UserPlusIcon size={26} />}
                    title="Nenhum vendedor cadastrado"
                    description="Cadastre o primeiro vendedor para poder vinculá-lo aos contratos."
                    action={newSellerButton}
                />
            );
        }

        if (!filtered.length) {
            return (
                <EmptyState
                    tone="neutral"
                    icon={<SearchIcon size={22} strokeWidth={1.9} />}
                    title={`Nenhum resultado para “${search}”`}
                    description="Confira a grafia ou busque pelo telefone ou código."
                    action={
                        <Button
                            label="Limpar busca"
                            outlined
                            className={styles.clearSearch}
                            onClick={() => changeSearch('')}
                        />
                    }
                />
            );
        }

        return (
            <DataTable
                value={filtered}
                dataKey="id"
                className={styles.table}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={(e: DataTableStateEvent) => {
                    setSortField(e.sortField as keyof Seller);
                    setSortOrder(e.sortOrder ?? 1);
                    setFirst(0);
                }}
                sortIcon={({ sorted, sortOrder }) =>
                    sorted ? <span className={styles.sortArrow}>{sortOrder === 1 ? '↑' : '↓'}</span> : null
                }
                paginator
                first={first}
                rows={rows}
                onPage={(e: DataTableStateEvent) => {
                    setFirst(e.first);
                    setRows(e.rows);
                }}
                rowsPerPageOptions={rowsPerPageOptions}
                paginatorTemplate={paginatorTemplate}
                paginatorClassName={paginatorClassName}
            >
                <Column
                    field="id"
                    header="Código"
                    sortable
                    body={(seller: Seller) => <span className={styles.code}>{formatCode(seller.id)}</span>}
                    headerStyle={{ width: 116 /* 96px + the row's 20px side padding */ }}
                />
                <Column field="name" header="Vendedor" sortable body={sellerBody} />
                <Column
                    header="Ações"
                    body={actionsBody}
                    headerStyle={{ width: 140 /* 120px + the row's 20px side padding */ }}
                    align="right"
                    alignHeader="right"
                />
            </DataTable>
        );
    };

    return (
        <PageCard
            title="Vendedores"
            count={sellers?.length}
            actions={
                <>
                    <SearchInput value={search} onChange={changeSearch} placeholder="Nome, telefone ou código" />
                    {newSellerButton}
                </>
            }
        >
            {renderContent()}
        </PageCard>
    );
}

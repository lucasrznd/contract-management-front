import { useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import PageCard from '../ui/PageCard';
import SearchInput from '../ui/SearchInput';
import ListContent from '../ui/ListContent';
import UserAvatar from '../ui/UserAvatar';
import { tableStyles, useDataTableState } from '../ui/dataTable';
import { PencilIcon, PhoneIcon, PlusIcon, TrashIcon, UserPlusIcon } from '../icons';
import { useSellerFindAll } from '../../hooks/seller/useSellerFindAll';
import { formatCode, maskPhone } from '../../functions/StringUtils';
import { matchesSearch } from '../../functions/search';
import type { Seller } from '../../types';

interface SellerDatatableProps {
    onNew: () => void;
    onEdit: (seller: Seller) => void;
    onDelete: (seller: Seller) => void;
}

export default function SellerDatatable({ onNew, onEdit, onDelete }: SellerDatatableProps) {
    const { data, isLoading, isError } = useSellerFindAll();
    const { search, changeSearch, tableProps } = useDataTableState<Seller[]>('id');

    // A misconfigured API URL answers with index.html instead of a list.
    const sellers = Array.isArray(data) ? data : undefined;
    const filtered = useMemo(
        () =>
            (sellers ?? []).filter((seller) =>
                matchesSearch(search, { text: [seller.name], digits: [seller.phoneNumber], id: seller.id }),
            ),
        [sellers, search],
    );

    const newSellerButton = <Button label="Novo vendedor" icon={<PlusIcon />} onClick={onNew} />;

    const sellerBody = (seller: Seller) => (
        <div className={tableStyles.entity}>
            <UserAvatar name={seller.name} id={seller.id} src={seller.urlImage} />
            <div className={tableStyles.stack}>
                <div className={tableStyles.title}>{seller.name}</div>
                <div className={tableStyles.subtitle}>
                    <PhoneIcon size={13} />
                    {maskPhone(seller.phoneNumber)}
                </div>
            </div>
        </div>
    );

    const actionsBody = (seller: Seller) => (
        <div className={tableStyles.actions}>
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
            <ListContent
                isLoading={isLoading}
                isError={isError || !sellers}
                total={sellers?.length ?? 0}
                visible={filtered.length}
                search={search}
                onClearSearch={() => changeSearch('')}
                errorSubject="os vendedores"
                empty={{
                    icon: <UserPlusIcon size={26} />,
                    title: 'Nenhum vendedor cadastrado',
                    description: 'Cadastre o primeiro vendedor para poder vinculá-lo aos contratos.',
                    action: newSellerButton,
                }}
                noResultsHint="Confira a grafia ou busque pelo telefone ou código."
            >
                <DataTable value={filtered} dataKey="id" {...tableProps}>
                    <Column
                        field="id"
                        header="Código"
                        sortable
                        body={(seller: Seller) => <span className={tableStyles.code}>{formatCode(seller.id)}</span>}
                        headerStyle={{ width: 100 /* 96px + 20px row padding - 16px column gap */ }}
                    />
                    <Column field="name" header="Vendedor" sortable body={sellerBody} />
                    <Column
                        header="Ações"
                        body={actionsBody}
                        headerStyle={{ width: 156 /* 120px + 20px row padding + 16px column gap */ }}
                        align="right"
                        alignHeader="right"
                    />
                </DataTable>
            </ListContent>
        </PageCard>
    );
}

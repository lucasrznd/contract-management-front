import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import PageCard from '@/shared/components/ui/PageCard';
import SearchInput from '@/shared/components/ui/SearchInput';
import ListContent from '@/shared/components/ui/ListContent';
import UserAvatar from '@/shared/components/ui/UserAvatar';
import { tableStyles, useDataTableState } from '@/shared/components/ui/dataTable';
import { PencilIcon, PhoneIcon, PlusIcon, TrashIcon, UserPlusIcon } from '@/shared/components/icons';
import { useSellerFindAll } from '../service/seller.service';
import { isPage } from '@/shared/api/pagination';
import { formatCode, maskPhone } from '@/shared/helpers/stringUtils.helper';
import type { Seller } from '../types/seller.types';

interface SellerDatatableProps {
    onNew: () => void;
    onEdit: (seller: Seller) => void;
    onDelete: (seller: Seller) => void;
}

export default function SellerDatatable({ onNew, onEdit, onDelete }: SellerDatatableProps) {
    const { search, committedSearch, changeSearch, request, tableProps } = useDataTableState<Seller[]>('id');
    const { data, isLoading, isError, isPlaceholderData } = useSellerFindAll(request);
    const page = isPage<Seller>(data) ? data : undefined;
    const total = page?.page.totalElements ?? 0;

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
            count={page?.page.totalElements}
            actions={
                <>
                    <SearchInput value={search} onChange={changeSearch} placeholder="Nome ou telefone" />
                    {newSellerButton}
                </>
            }
        >
            <ListContent
                isLoading={isLoading}
                isError={isError || !page}
                isEmpty={!committedSearch && !total}
                noResults={!!committedSearch && !total}
                search={committedSearch}
                onClearSearch={() => changeSearch('')}
                errorSubject="os vendedores"
                empty={{
                    icon: <UserPlusIcon size={26} />,
                    title: 'Nenhum vendedor cadastrado',
                    description: 'Cadastre o primeiro vendedor para poder vinculá-lo aos contratos.',
                    action: newSellerButton,
                }}
                noResultsHint="Confira a grafia ou busque pelo telefone."
            >
                <DataTable value={page?.content} dataKey="id" loading={isPlaceholderData} {...tableProps(page)}>
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

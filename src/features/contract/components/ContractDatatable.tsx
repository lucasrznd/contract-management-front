import { useEffect, useMemo, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import PageCard from '@/shared/components/ui/PageCard';
import SearchInput from '@/shared/components/ui/SearchInput';
import ListContent from '@/shared/components/ui/ListContent';
import UserAvatar from '@/shared/components/ui/UserAvatar';
import StatusBadge, { type BadgeTone } from '@/shared/components/ui/StatusBadge';
import { tableStyles, useDataTableState } from '@/shared/components/ui/dataTable';
import {
    CloseIcon,
    FileTextIcon,
    FilePlusIcon,
    FilterIcon,
    FolderIcon,
    PencilIcon,
    PlusIcon,
    SignatureIcon,
    TrashIcon,
} from '@/shared/components/icons';
import { useContractFindAll, useContractFilter } from '../service/contract.service';
import { formatCode } from '@/shared/helpers/stringUtils.helper';
import { isPage } from '@/shared/api/pagination';
import { contractStatus, formatDate, type ContractStatus } from '../helpers/contractStatus.helper';
import { matchesSearch } from '@/shared/helpers/search.helper';
import type { Contract, ContractFilter } from '../types/contract.types';
import styles from './ContractDatatable.module.css';

const statusTone: Record<ContractStatus['kind'], BadgeTone> = {
    upcoming: 'primary',
    active: 'success',
    expiring: 'warning',
    ended: 'neutral',
};

interface ContractDatatableProps {
    filter: ContractFilter | null;
    onOpenFilter: () => void;
    onClearFilter: () => void;
    onNew: () => void;
    onEdit: (contract: Contract) => void;
    onDelete: (contract: Contract) => void;
    /** Opens the PDF when there is one, the digital signature when it was sent, or the generator otherwise. */
    onOpenDocument: (contract: Contract) => void;
}

export default function ContractDatatable(props: ContractDatatableProps) {
    // The filter endpoints still answer whole lists, so a filtered view is searched, sorted and paged here.
    const isFiltering = props.filter !== null;
    const { search, committedSearch, changeSearch, resetPage, request, tableProps } = useDataTableState<Contract[]>({
        sortFields: ['id', 'companyTradeName', 'sellerName', 'endDate'],
        lazy: !isFiltering,
    });
    const all = useContractFindAll(request, { enabled: !isFiltering });
    const filtered = useContractFilter(props.filter);
    // A new filter starts from its first page; on mount, the page in the URL is kept.
    const previousFilter = useRef(props.filter);
    useEffect(() => {
        if (previousFilter.current !== props.filter) resetPage();
        previousFilter.current = props.filter;
    }, [props.filter]);

    const page = isPage<Contract>(all.data) ? all.data : undefined;
    // A misconfigured API URL answers with index.html instead of a list.
    const filteredContracts = Array.isArray(filtered.data) ? filtered.data : undefined;
    const filteredVisible = useMemo(
        () =>
            (filteredContracts ?? []).filter((contract) =>
                matchesSearch(search, {
                    text: [contract.companyTradeName, contract.sellerName, contract.advertisingOrder],
                    id: contract.id,
                }),
            ),
        [filteredContracts, search],
    );

    const list = isFiltering
        ? {
              ...filtered,
              rows: filteredVisible,
              count: filteredContracts?.length,
              isError: filtered.isError || !filteredContracts,
              isEmpty: !filteredContracts?.length,
              noResults: !filteredVisible.length,
              search,
          }
        : {
              ...all,
              rows: page?.content,
              count: page?.page.totalElements,
              isError: all.isError || !page,
              isEmpty: !committedSearch && !page?.page.totalElements,
              noResults: !!committedSearch && !page?.page.totalElements,
              search: committedSearch,
          };

    const newContractButton = <Button label="Novo contrato" icon={<PlusIcon />} onClick={props.onNew} />;

    const companyBody = (contract: Contract) => (
        <div className={tableStyles.stack}>
            <div className={tableStyles.title}>{contract.companyTradeName}</div>
            {contract.advertisingOrder && <div className={tableStyles.subtitle}>OP {contract.advertisingOrder}</div>}
        </div>
    );

    const sellerBody = (contract: Contract) => (
        <div className={tableStyles.entity}>
            <UserAvatar name={contract.sellerName} src={contract.sellerImageUrl} size={32} />
            <div className={tableStyles.text}>{contract.sellerName}</div>
        </div>
    );

    const termBody = (contract: Contract) => {
        const status = contractStatus(contract);
        return (
            <div className={tableStyles.stack}>
                <div className={`${tableStyles.text} ${tableStyles.numeric}`}>
                    {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
                </div>
                <StatusBadge tone={statusTone[status.kind]}>{status.label}</StatusBadge>
            </div>
        );
    };

    const priceBody = (contract: Contract) => <span className={styles.price}>{contract.monthlyPriceFmt}</span>;

    const documentBody = (contract: Contract) => {
        const [label, icon] = contract.pdfPath
            ? ['Ver PDF', <FileTextIcon />]
            : contract.token
              ? ['Assinatura', <SignatureIcon />]
              : ['Gerar', <FilePlusIcon />];
        return (
            <Button
                size="small"
                outlined
                label={label}
                icon={icon}
                className={styles.documentButton}
                aria-label={`${label} — contrato ${formatCode(contract.id)}`}
                onClick={() => props.onOpenDocument(contract)}
            />
        );
    };

    const actionsBody = (contract: Contract) => (
        <div className={tableStyles.actions}>
            <Button
                text
                icon={<PencilIcon />}
                title="Editar"
                aria-label={`Editar contrato ${formatCode(contract.id)}`}
                onClick={() => props.onEdit(contract)}
            />
            <Button
                text
                severity="danger"
                icon={<TrashIcon />}
                title="Excluir"
                aria-label={`Excluir contrato ${formatCode(contract.id)}`}
                onClick={() => props.onDelete(contract)}
            />
        </div>
    );

    return (
        <PageCard
            title="Contratos"
            count={list.count}
            actions={
                <>
                    <SearchInput value={search} onChange={changeSearch} placeholder="Empresa, vendedor ou OP" />
                    <Button
                        label="Filtrar"
                        outlined
                        icon={<FilterIcon />}
                        className={styles.filterButton}
                        onClick={props.onOpenFilter}
                    />
                    {newContractButton}
                </>
            }
        >
            {props.filter && (
                <div className={styles.filterBar} role="status">
                    <FilterIcon size={14} />
                    <span>
                        Filtrando por <strong>{props.filter.label}</strong>
                    </span>
                    <Button
                        text
                        size="small"
                        label="Limpar filtro"
                        icon={<CloseIcon size={14} />}
                        className={styles.clearFilter}
                        onClick={props.onClearFilter}
                    />
                </div>
            )}

            <ListContent
                isLoading={list.isLoading}
                isError={list.isError}
                isEmpty={list.isEmpty}
                noResults={list.noResults}
                search={list.search}
                onClearSearch={() => changeSearch('')}
                errorSubject="os contratos"
                empty={
                    props.filter
                        ? {
                              icon: <FilterIcon size={24} />,
                              title: 'Nenhum contrato encontrado',
                              description: 'Nenhum contrato corresponde ao filtro aplicado.',
                              action: <Button label="Limpar filtro" outlined onClick={props.onClearFilter} />,
                          }
                        : {
                              icon: <FolderIcon size={26} />,
                              title: 'Nenhum contrato cadastrado',
                              description: 'Cadastre o primeiro contrato de veiculação de uma empresa.',
                              action: newContractButton,
                          }
                }
                noResultsHint="Confira a grafia ou busque pela empresa, vendedor ou ordem de propaganda."
            >
                <DataTable
                    value={list.rows}
                    dataKey="id"
                    tableStyle={{ minWidth: '64rem' }}
                    loading={list.isPlaceholderData}
                    {...tableProps(isFiltering ? filteredVisible.length : page?.page.totalElements)}
                >
                    <Column
                        field="id"
                        header="Código"
                        sortable
                        body={(contract: Contract) => (
                            <span className={tableStyles.code}>{formatCode(contract.id)}</span>
                        )}
                        headerStyle={{ width: 100 }}
                    />
                    <Column field="companyTradeName" header="Empresa" sortable body={companyBody} />
                    <Column
                        field="sellerName"
                        header="Vendedor"
                        sortable
                        body={sellerBody}
                        headerStyle={{ width: 200 }}
                    />
                    <Column field="endDate" header="Vigência" sortable body={termBody} headerStyle={{ width: 210 }} />
                    <Column
                        header="Valor mensal"
                        body={priceBody}
                        headerStyle={{ width: 140 }}
                        align="right"
                        alignHeader="right"
                    />
                    <Column header="Contrato" body={documentBody} headerStyle={{ width: 150 }} />
                    <Column
                        header="Ações"
                        body={actionsBody}
                        headerStyle={{ width: 110 }}
                        align="right"
                        alignHeader="right"
                    />
                </DataTable>
            </ListContent>
        </PageCard>
    );
}

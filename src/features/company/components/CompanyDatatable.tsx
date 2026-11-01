import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import PageCard from '@/shared/components/ui/PageCard';
import SearchInput from '@/shared/components/ui/SearchInput';
import ListContent from '@/shared/components/ui/ListContent';
import UserAvatar from '@/shared/components/ui/UserAvatar';
import { tableStyles, useDataTableState } from '@/shared/components/ui/dataTable';
import { BuildingIcon, MailIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon } from '@/shared/components/icons';
import { useCompanyFindAll } from '../service/company.service';
import { isPage } from '@/shared/api/pagination';
import {
    buildEncodedStringAddress,
    formatCode,
    maskCnpj,
    maskCpf,
    maskPhone,
} from '@/shared/helpers/stringUtils.helper';
import type { Company } from '../types/company.types';

interface CompanyDatatableProps {
    onNew: () => void;
    onEdit: (company: Company) => void;
    onDelete: (company: Company) => void;
}

const openOnMaps = (company: Company) =>
    window.open(
        'https://www.google.com/maps/search/?api=1&query=' + buildEncodedStringAddress(company),
        '_blank',
        'noopener',
    );

export default function CompanyDatatable({ onNew, onEdit, onDelete }: CompanyDatatableProps) {
    const { search, committedSearch, changeSearch, request, tableProps } = useDataTableState<Company[]>({
        sortFields: ['id', 'tradeName', 'city'],
    });
    const { data, isLoading, isError, isPlaceholderData } = useCompanyFindAll(request);
    const page = isPage<Company>(data) ? data : undefined;
    const total = page?.page.totalElements ?? 0;

    const newCompanyButton = <Button label="Nova empresa" icon={<PlusIcon />} onClick={onNew} />;

    const companyBody = (company: Company) => (
        <div className={tableStyles.entity}>
            <UserAvatar name={company.tradeName} id={company.id} shape="square" />
            <div className={tableStyles.stack}>
                <div className={tableStyles.title}>{company.tradeName}</div>
                <div className={tableStyles.subtitle}>{company.businessName}</div>
            </div>
        </div>
    );

    const documentBody = (company: Company) => (
        <div className={tableStyles.stack}>
            <div className={`${tableStyles.text} ${tableStyles.numeric}`}>{maskCnpj(company.registrationNumber)}</div>
            {(company.cpf || company.stateRegistration) && (
                <div className={tableStyles.subtitle}>
                    {company.cpf ? `CPF ${maskCpf(company.cpf)}` : `IE ${company.stateRegistration}`}
                </div>
            )}
        </div>
    );

    const contactBody = (company: Company) => (
        <div className={tableStyles.stack}>
            <div className={`${tableStyles.text} ${tableStyles.numeric}`}>{maskPhone(company.phoneNumber)}</div>
            {company.email && (
                <div className={tableStyles.subtitle}>
                    <MailIcon size={13} />
                    {company.email.toLowerCase()}
                </div>
            )}
        </div>
    );

    const addressBody = (company: Company) => (
        <div className={tableStyles.stack}>
            <div className={tableStyles.text}>
                {company.city}/{company.state}
            </div>
            <div className={tableStyles.subtitle}>
                {company.streetName}, {company.number} · {company.avenueName}
            </div>
        </div>
    );

    const actionsBody = (company: Company) => (
        <div className={tableStyles.actions}>
            <Button
                text
                icon={<MapPinIcon />}
                title="Ver no mapa"
                aria-label={`Ver ${company.tradeName} no mapa`}
                onClick={() => openOnMaps(company)}
            />
            <Button
                text
                icon={<PencilIcon />}
                title="Editar"
                aria-label={`Editar ${company.tradeName}`}
                onClick={() => onEdit(company)}
            />
            <Button
                text
                severity="danger"
                icon={<TrashIcon />}
                title="Excluir"
                aria-label={`Excluir ${company.tradeName}`}
                onClick={() => onDelete(company)}
            />
        </div>
    );

    return (
        <PageCard
            title="Empresas"
            count={page?.page.totalElements}
            actions={
                <>
                    <SearchInput value={search} onChange={changeSearch} placeholder="Nome, CNPJ, CPF ou cidade" />
                    {newCompanyButton}
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
                errorSubject="as empresas"
                empty={{
                    icon: <BuildingIcon size={26} />,
                    title: 'Nenhuma empresa cadastrada',
                    description: 'Cadastre a primeira empresa para poder criar contratos com ela.',
                    action: newCompanyButton,
                }}
                noResultsHint="Confira a grafia ou busque pela razão social, CNPJ, CPF ou cidade."
            >
                <DataTable
                    value={page?.content}
                    dataKey="id"
                    tableStyle={{ minWidth: '60rem' }}
                    loading={isPlaceholderData}
                    {...tableProps(page?.page.totalElements)}
                >
                    <Column
                        field="id"
                        header="Código"
                        sortable
                        body={(company: Company) => <span className={tableStyles.code}>{formatCode(company.id)}</span>}
                        headerStyle={{ width: 100 }}
                    />
                    <Column field="tradeName" header="Empresa" sortable body={companyBody} />
                    <Column header="CNPJ" body={documentBody} headerStyle={{ width: 190 }} />
                    <Column header="Contato" body={contactBody} headerStyle={{ width: 240 }} />
                    <Column field="city" header="Endereço" sortable body={addressBody} headerStyle={{ width: 240 }} />
                    <Column
                        header="Ações"
                        body={actionsBody}
                        headerStyle={{ width: 150 }}
                        align="right"
                        alignHeader="right"
                    />
                </DataTable>
            </ListContent>
        </PageCard>
    );
}

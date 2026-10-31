import { useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import PageCard from '../ui/PageCard';
import SearchInput from '../ui/SearchInput';
import ListContent from '../ui/ListContent';
import UserAvatar from '../ui/UserAvatar';
import { tableStyles, useDataTableState } from '../ui/dataTable';
import { BuildingIcon, MailIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon } from '../icons';
import { useCompanyFindAll } from '../../hooks/company/useCompanyFindAll';
import { buildEncodedStringAddress, formatCode, maskCnpj, maskCpf, maskPhone } from '../../functions/StringUtils';
import { matchesSearch } from '../../functions/search';
import type { Company } from '../../types';

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
    const { data, isLoading, isError } = useCompanyFindAll();
    const { search, changeSearch, tableProps } = useDataTableState<Company[]>('id');

    // A misconfigured API URL answers with index.html instead of a list.
    const companies = Array.isArray(data) ? data : undefined;
    const filtered = useMemo(
        () =>
            (companies ?? []).filter((company) =>
                matchesSearch(search, {
                    text: [company.tradeName, company.businessName, company.city, company.email],
                    digits: [company.registrationNumber, company.cpf, company.phoneNumber],
                    id: company.id,
                }),
            ),
        [companies, search],
    );

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
            count={companies?.length}
            actions={
                <>
                    <SearchInput value={search} onChange={changeSearch} placeholder="Nome, CNPJ ou código" />
                    {newCompanyButton}
                </>
            }
        >
            <ListContent
                isLoading={isLoading}
                isError={isError || !companies}
                total={companies?.length ?? 0}
                visible={filtered.length}
                search={search}
                onClearSearch={() => changeSearch('')}
                errorSubject="as empresas"
                empty={{
                    icon: <BuildingIcon size={26} />,
                    title: 'Nenhuma empresa cadastrada',
                    description: 'Cadastre a primeira empresa para poder criar contratos com ela.',
                    action: newCompanyButton,
                }}
                noResultsHint="Confira a grafia ou busque pelo CNPJ, telefone ou código."
            >
                <DataTable value={filtered} dataKey="id" tableStyle={{ minWidth: '60rem' }} {...tableProps}>
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

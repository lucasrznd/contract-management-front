import { Panel } from 'primereact/panel';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import DeleteDialog from '../dialog/DeleteDialog';
import { useCompanyDelete } from '../../hooks/company/useCompanyDelete';
import { errorMsg, warnMsg } from '../../functions/ToastMessage';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useCompanyFindAll } from '../../hooks/company/useCompanyFindAll';
import { buildEncodedStringAddress, formatPhoneNumberDt, formatRegistrationNumberDt } from '../../functions/StringUtils';
import serverErrorImage from "../../assets/images/server-error.png";
import { Toast } from 'primereact/toast';

export default function CompanyDatatable(props) {
    const [company, setCompany] = useState({});
    const [globalFilter, setGlobalFilter] = useState(null);
    const { data, isLoading, isError: isErrorFindingAll, isSuccess: isSuccessFindingAll } = useCompanyFindAll();
    const { mutate, isSuccess: isSucessDeleting, isError: isErrorDeleting } = useCompanyDelete();
    const [deleteCompanyDialog, setDeleteCompanyDialog] = useState(false);
    const toast = useRef(null);

    useEffect(() => {
        hideDeleteDialog();
    }, [isSucessDeleting]);

    useEffect(() => {
        if (isErrorFindingAll) {
            errorMsg(toast, 'Erro de conexão com servidor.');
        }   
    }, [isErrorFindingAll]);

    const deleteCompany = () => {
        mutate(company.id);

        isErrorDeleting ? errorMsg(toast, 'Erro ao remover empresa.') : warnMsg(toast, 'Empresa removida com sucesso.');
    }

    const confirmDeleteCompany = (company) => {
        setCompany({ ...company });
        setDeleteCompanyDialog(true);
    };

    const hideDeleteDialog = () => {
        setDeleteCompanyDialog(false);
    };

    const tableHeader = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Empresas</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"> </InputIcon>
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </IconField>
        </div>
    );

    const tableActions = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded onClick={() => props.companyDetails(rowData)} />
                <span style={{ marginBottom: "1rem", marginLeft: "5px", marginRight: "5px" }} className="pi pi-ellipsis-v"></span>
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDeleteCompany(rowData)} />
            </React.Fragment>
        );
    };

    const addressBodyTemplate = (rowData) => {
        const address = buildEncodedStringAddress(rowData);

        return (
            <Button icon="pi pi-map-marker" rounded text severity="success" onClick={() => searchAddressOnMaps(address)} />
        );
    }

    const searchAddressOnMaps = (parameter) => {
        const searchUrl = 'https://www.google.com/maps/search/?api=1&query=' + parameter;

        window.open(searchUrl, 'blank');
    }

    const showDatatable = () => {
        if (isLoading) {
            return <div className='flex align-items-center justify-content-center'>
                <ProgressSpinner />
            </div>
        }

        if (isSuccessFindingAll && Array.isArray(data)) {
            return <div className="card">
                <DataTable value={data} tableStyle={{ minWidth: '50rem' }}
                    paginator globalFilter={globalFilter} header={tableHeader}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="{first} de {last} de {totalRecords} empresas"
                    rows={5} emptyMessage="Nenhum empresa encontrada." key="id">
                    <Column field="id" header="Código" align="center" alignHeader="center" />
                    <Column field="businessName" body={(rowData) => rowData.businessName.toUpperCase()} header="Razão Social" align="center" alignHeader="center" />
                    <Column field="tradeName" body={(rowData) => rowData.tradeName.toUpperCase()} header="Nome Fantasia" align="center" alignHeader="center" />
                    <Column field="registrationNumber" body={(rowData) => formatRegistrationNumberDt(rowData, 'registrationNumber')} header="CNPJ" align="center" alignHeader="center" />
                    <Column field="stateRegistration" header="Inscrição Estadual" align="center" alignHeader="center" />
                    <Column field="phoneNumber" body={(rowData) => formatPhoneNumberDt(rowData, 'phoneNumber')} header="Telefone" align="center" alignHeader="center" />
                    <Column field="email" body={(rowData) => rowData.email.toLowerCase()} header="Email" align="center" alignHeader="center" />
                    <Column field="street" body={(rowData) => addressBodyTemplate(rowData)} header="Endereço" align="center" alignHeader="center" />
                    <Column body={tableActions} exportable={false} style={{ minWidth: '12rem' }} align="center" header="Ações" alignHeader="center"></Column>
                </DataTable>
            </div>
        }

        return <div>
            <div className='flex align-items-center justify-content-center'>
                <i className="pi pi-exclamation-circle mr-2 text-red-500"></i>
                <h2 className='text-red-500'>Erro de conexão com servidor.</h2>
            </div>

            <div className="flex align-items-center justify-content-center">
                <img alt="logo" src={serverErrorImage} height={320} />
            </div>
        </div>
    }

    return (
        <div>
            <Toast ref={toast} />

            <Panel>
                <Toolbar style={{ marginBottom: "10px" }} start={props.startContent} />

                {showDatatable()}
            </Panel>

            <DeleteDialog deleteObjectDialog={deleteCompanyDialog} hideDeleteDialog={hideDeleteDialog} deleteObject={deleteCompany}
                hideDeleteObjectDialog={hideDeleteDialog} object={company} />
        </div>
    );

}
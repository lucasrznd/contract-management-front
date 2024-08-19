import { errorMsg, warnMsg } from '../../functions/ToastMessage';
import { Panel } from 'primereact/panel';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import DeleteDialog from '../dialog/DeleteDialog';
import { useContractFindAll } from "../../hooks/contract/useContractFindAll";
import { useContractDelete } from "../../hooks/contract/useContractDelete";
import { ProgressSpinner } from 'primereact/progressspinner';
import { addLocale } from 'primereact/api';
import { dateFormatDt } from '../../functions/StringUtils';

export default function ContractDatatable(props) {
    const [contract, setContract] = useState({});
    const { data, isLoading, isError: isErrorFindingAll, isSuccess: isSuccessFindingAll } = useContractFindAll();
    const { mutate, isSuccess: isSucessDeleting, isError: isErrorDeleting } = useContractDelete();
    const [deleteContractDialog, setDeleteContractDialog] = useState(false);

    addLocale('pt-BR', {
        firstDayOfWeek: 0,
        showMonthAfterYear: true,
        dayNames: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
        dayNamesShort: ['dom', 'seg', 'ter', 'quar', 'qui', 'sex', 'sab'],
        dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        monthNamesShort: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        today: 'Hoje',
        clear: 'Limpar'
    });

    const hideDeleteDialog = () => {
        setDeleteContractDialog(false);
    }

    useEffect(() => {
        hideDeleteDialog();
    }, [isSucessDeleting]);

    const deleteContract = () => {
        mutate(contract.id);

        isErrorDeleting ? errorMsg(props.toast, 'Erro ao remover contrato.') : warnMsg(props.toast, 'Contrato removido com sucesso.');
    }

    const confirmDeleteContract = (contract) => {
        setContract({ ...contract });
        setDeleteContractDialog(true);
    }

    const tableHeader = (
        <div>
            <h4 className="m-0">Contratos</h4>
        </div>
    );

    const tableActions = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded onClick={() => props.contractDetails(rowData)} />
                <span style={{ marginBottom: "1rem", marginLeft: "5px", marginRight: "5px" }} className="pi pi-ellipsis-v"></span>
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDeleteContract(rowData)} />
            </React.Fragment>
        );
    };

    const showDatatable = () => {
        if (isLoading) {
            return <div className='flex align-items-center justify-content-center'>
                <ProgressSpinner />
            </div>
        }

        if (isErrorFindingAll) {
            errorMsg(props.toast, 'Erro de conexão com servidor.');
        }

        if (isSuccessFindingAll && Array.isArray(data)) {
            return <div className="card">
                <DataTable value={data} tableStyle={{ minWidth: '50rem' }}
                    paginator header={tableHeader}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="{first} de {last} de {totalRecords} contratos"
                    rows={5} emptyMessage="Nenhum contrato encontrado." key="id">
                    <Column field="id" header="Código" align="center" alignHeader="center" sortable />
                    <Column field="companyBusinessName" body={(rowData) => rowData.companyBusinessName.toUpperCase()} header="Empresa" align="center" alignHeader="center" />
                    <Column field="advertisingOrder" header="Ordem de Propaganda" align="center" alignHeader="center" />
                    <Column field="quantitySpotDay" header="Quantidade Spots/Dia" align="center" alignHeader="center" />
                    <Column field="spotDuration" body={(rowData) => Number(rowData.spotDuration).toFixed(2)} header="Tempo do Spot" align="center" alignHeader="center" />
                    <Column field="startDate" body={(rowData) => dateFormatDt(rowData, 'startDate')} header="Data de Início" align="center" alignHeader="center" />
                    <Column field="endDate" body={(rowData) => dateFormatDt(rowData, 'endDate')} header="Data de Término" align="center" alignHeader="center" />
                    <Column field="monthlyPriceFmt" header="Preço Mensal" className="font-bold" align="center" alignHeader="center" />
                    <Column body={tableActions} exportable={false} style={{ minWidth: '12rem' }} align="center" header="Ações" alignHeader="center"></Column>
                </DataTable>
            </div>
        }
        return <div className='flex align-items-center justify-content-center'>
            <i className="pi pi-exclamation-circle mr-2 text-red-500"></i>
            <h2 className='text-red-500'>Erro de conexão com servidor.</h2>
        </div>
    }

    return (
        <div>
            <Panel>
                <Toolbar style={{ marginBottom: "10px" }} start={props.startContent} />

                {showDatatable()}
            </Panel>

            <DeleteDialog deleteObjectDialog={deleteContractDialog} hideDeleteDialog={hideDeleteDialog} deleteObject={deleteContract}
                hideDeleteObjectDialog={hideDeleteDialog} object={contract} />
        </div>
    );
}
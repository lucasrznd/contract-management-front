import { errorMsg, warnMsg } from '../../functions/ToastMessage';
import { Panel } from 'primereact/panel';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import DeleteDialog from '../dialog/DeleteDialog';
import { useContractFindAll } from "../../hooks/contract/useContractFindAll";
import { useContractDelete } from "../../hooks/contract/useContractDelete";
import { ProgressSpinner } from 'primereact/progressspinner';
import { addLocale } from 'primereact/api';
import { dateFormatDt } from '../../functions/StringUtils';
import serverErrorImage from "../../assets/images/server-error.png";
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import ImageDialog from "../dialog/ImageDialog";
import SearchDialog from './SearchDialog';

export default function ContractDatatable(props) {
    const [contract, setContract] = useState({});
    const [imageVisible, setImageVisible] = useState(false);
    const { data, isLoading, isError: isErrorFindingAll, isSuccess: isSuccessFindingAll } = useContractFindAll();
    const [contractList, setContractList] = useState([]);
    const { mutate, isSuccess: isSucessDeleting, isError: isErrorDeleting } = useContractDelete();
    const [deleteContractDialog, setDeleteContractDialog] = useState(false);
    const toast = useRef(null);

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
        setContractList(data);
    }, [data]);

    useEffect(() => {
        hideDeleteDialog();
    }, [isSucessDeleting]);

    useEffect(() => {
        if (isErrorFindingAll) {
            errorMsg(toast, 'Erro de conexão com servidor.');
        }
    }, [isErrorFindingAll]);

    const deleteContract = () => {
        mutate(contract.id);

        isErrorDeleting ? errorMsg(toast, 'Erro ao remover contrato.') : warnMsg(toast, 'Contrato removido com sucesso.');
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

    const sellerBodyImage = (rowData) => {
        return <div className='flex align-items-center justify-content-center'>
            <Avatar icon="pi pi-user" image={rowData.sellerImageUrl} onClick={(e) => openImgDialogSeller(e.target.currentSrc)} className="shadow-4" shape="circle" />
            <p>{rowData.sellerName.toUpperCase()}</p>
        </div>
    };

    const openImgDialogSeller = (rowData) => {
        setContract({ ...contract, sellerImageUrl: rowData });
        rowData !== undefined ? setImageVisible(true) : setImageVisible(false)
    }

    const closeTableImageDialog = () => {
        setImageVisible(false);
    }

    const showDatatable = () => {
        if (isLoading) {
            return <div className='flex align-items-center justify-content-center'>
                <ProgressSpinner />
            </div>
        }

        if (isSuccessFindingAll && Array.isArray(contractList)) {
            return <div className="card">
                <DataTable value={contractList} tableStyle={{ minWidth: '50rem' }}
                    paginator header={tableHeader}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="{first} de {last} de {totalRecords} contratos"
                    rows={5} emptyMessage="Nenhum contrato encontrado." key="id">
                    <Column field="id" header="Código" align="center" alignHeader="center" sortable />
                    <Column field="companyTradeName" body={(rowData) => rowData.companyTradeName.toUpperCase()} header="Empresa" align="center" alignHeader="center" />
                    <Column field="sellerName" body={(rowData) => sellerBodyImage(rowData)} header="Vendedor" align="center" alignHeader="center" />
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

            <ImageDialog visible={imageVisible} onHide={closeTableImageDialog} header="Imagem do Vendedor" src={contract.sellerImageUrl} />

            <SearchDialog searchVisible={props.searchVisible} closeSearchDialog={props.closeSearchDialog}
                companiesFilteredList={props.companiesFilteredList} companyCompleteMethod={props.companyCompleteMethod}
                sellersList={props.sellersList} setContractList={setContractList} />

            <DeleteDialog deleteObjectDialog={deleteContractDialog} hideDeleteDialog={hideDeleteDialog} deleteObject={deleteContract}
                hideDeleteObjectDialog={hideDeleteDialog} object={contract} />
        </div>
    );
}
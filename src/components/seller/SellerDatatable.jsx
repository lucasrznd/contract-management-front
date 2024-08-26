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
import { errorMsg, warnMsg } from '../../functions/ToastMessage';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useSellerFindAll } from '../../hooks/seller/useSellerFindAll';
import { useSellerDelete } from '../../hooks/seller/useSellerDelete';
import { formatPhoneNumberDt } from '../../functions/StringUtils';
import serverErrorImage from "../../assets/images/server-error.png";
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import ImageDialog from '../dialog/ImageDialog';

export default function SellerDatatable(props) {
    const [seller, setSeller] = useState({});
    const [globalFilter, setGlobalFilter] = useState(null);
    const [imageVisible, setImageVisible] = useState(false);
    const { data, isLoading, isError: isErrorFindingAll, isSuccess: isSuccessFindingAll } = useSellerFindAll();
    const { mutate, isSuccess: isSucessDeleting, isError: isErrorDeleting } = useSellerDelete();
    const [deleteSellerDialog, setDeleteSellerDialog] = useState(false);
    const toast = useRef(null);

    useEffect(() => {
        hideDeleteDialog();
    }, [isSucessDeleting]);

    useEffect(() => {
        if (isErrorFindingAll) {
            errorMsg(toast, 'Erro de conexão com servidor.');
        }
    }, [isErrorFindingAll]);

    const deleteSeller = () => {
        mutate(seller.id);

        isErrorDeleting ? errorMsg(toast, 'Erro ao remover vendedor.') : warnMsg(toast, 'Vendedor removido com sucesso.');
    }

    const confirmDeleteSeller = (seller) => {
        setSeller({ ...seller });
        setDeleteSellerDialog(true);
    };

    const hideDeleteDialog = () => {
        setDeleteSellerDialog(false);
    };

    const tableHeader = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Vendedores</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"> </InputIcon>
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </IconField>
        </div>
    );

    const tableActions = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded onClick={() => props.sellerDetails(rowData)} />
                <span style={{ marginBottom: "1rem", marginLeft: "5px", marginRight: "5px" }} className="pi pi-ellipsis-v"></span>
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDeleteSeller(rowData)} />
            </React.Fragment>
        );
    };

    const imageBody = (rowData) => {
        return <>
            <Avatar icon="pi pi-user" image={rowData.urlImage} onClick={(e) => openTableImageDialog(e.target.currentSrc)} size="xlarge" className="mr-2 shadow-4" shape="circle" />
        </>
    };

    const openTableImageDialog = (rowData) => {
        setSeller({ ...seller, urlImage: rowData });
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

        if (isSuccessFindingAll && Array.isArray(data)) {
            return <div className="card">
                <DataTable value={data} tableStyle={{ minWidth: '50rem' }}
                    paginator globalFilter={globalFilter} header={tableHeader}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="{first} de {last} de {totalRecords} vendedores"
                    rows={5} emptyMessage="Nenhum vendedor encontrado." key="id">
                    <Column field="id" header="Código" align="center" alignHeader="center" />
                    <Column field="name" body={(rowData) => rowData.name.toUpperCase()} header="Nome" align="center" alignHeader="center" />
                    <Column field="phoneNumber" body={(rowData) => formatPhoneNumberDt(rowData, 'phoneNumber')} header="Telefone" align="center" alignHeader="center" />
                    <Column field="urlImage" body={imageBody} header="Imagem" align="center" alignHeader="center" />
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

            <ImageDialog visible={imageVisible} onHide={closeTableImageDialog} header="Imagem do Vendedor" src={seller.urlImage} />

            <DeleteDialog deleteObjectDialog={deleteSellerDialog} hideDeleteDialog={hideDeleteDialog} deleteObject={deleteSeller}
                hideDeleteObjectDialog={hideDeleteDialog} object={seller} />
        </div>
    );

}
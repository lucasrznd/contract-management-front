import { useEffect, useRef, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { errorMsg, warnMsg } from "../../functions/ToastMessage";
import { useContractCount } from "../../hooks/contract/useContractCount";
import { useContractExpiring } from "../../hooks/contract/useContractExpiring";
import { useContractLastFive } from "../../hooks/contract/useContractLastFive";
import { useCompanyCount } from "../../hooks/company/useCompanyCount";
import { dateFormatDt, daysBetweenEndDate } from "../../functions/StringUtils";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Toast } from "primereact/toast";
import serverErrorImage from "../../assets/images/server-error.png";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import ImageDialog from "../dialog/ImageDialog";
import { useTotalEstimatedRevenue } from "../../hooks/contract/useTotalEstimatedRevenue";

export default function HomeBody() {
    const toast = useRef(null);
    const [contract, setContract] = useState({});
    const [imageVisible, setImageVisible] = useState(false);
    const { data: expiringContracts, isLoading: isLoadingExpiringContracts, isSuccess: isSucessFindExpiringContracts, isError: isErrorExpiringContracts } = useContractExpiring();
    const { data: lastContracts } = useContractLastFive();
    const { data: contractsCounter } = useContractCount();
    const { data: totalEstimatedRevenue } = useTotalEstimatedRevenue();
    const { data: companiesCounter } = useCompanyCount();

    useEffect(() => {
        if (isSucessFindExpiringContracts && expiringContracts !== undefined && expiringContracts.length !== 0) {
            warnMsg(toast, 'Contratos próximos do vencimento: ' + expiringContracts.length);
        }
    }, [isSucessFindExpiringContracts, expiringContracts]);

    useEffect(() => {
        if (isErrorExpiringContracts) {
            errorMsg(toast, 'Erro de conexão com servidor.');
        }
    }, [isErrorExpiringContracts]);

    const showEndDate = (rowData) => {
        var daysQuantity = daysBetweenEndDate(rowData.endDate);

        if (daysQuantity === 0) {
            return <span className="text-red-500 font-bold">{dateFormatDt(rowData, 'endDate')}</span>
        } else if (daysQuantity > 0 && daysQuantity <= 7) {
            return <span className="text-orange-500 font-bold">{dateFormatDt(rowData, 'endDate')}</span>
        }
        return <span className="text-green-500 font-bold">{dateFormatDt(rowData, 'endDate')}</span>
    }

    const statusBodyTemplate = (rowData) => {
        return daysBetweenEndDate(rowData.endDate) === 0
            ? <Tag value="hoje" severity="danger" />
            : <Tag value="proximo" severity="warning" />
    }

    const sellerBodyImage = (rowData) => {
        return <div className='flex align-items-center justify-content-center'>
            <Avatar icon="pi pi-user" image={rowData.sellerImageUrl} onClick={(e) => openImgDialogSeller(e.target.currentSrc)} className="mr-2 shadow-4" shape="circle" />
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

    const showBody = () => {
        if (isLoadingExpiringContracts) {
            return <div className='flex align-items-center justify-content-center'>
                <ProgressSpinner />
            </div>
        }

        if (isSucessFindExpiringContracts) {
            return <div>
                <div className="grid mt-1">
                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3 font-bold">Contratos</span>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-primary border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <a href="/contratos"><i className="pi pi-folder-open text-white text-xl"></i></a>
                                </div>
                            </div>
                            <div className="flex md:align-items-center align-items-stretch flex-wrap">
                                <span className="text-green-500 text-900 font-medium text-xl flex align-items-center justify-content-center">{contractsCounter}</span>
                                <span className="text-500 flex align-items-center justify-content-center ml-2">registrados.</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3 font-bold">Empresas</span>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-orange-400 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <a href="/empresas"><i className="pi pi-building text-white text-xl"></i></a>
                                </div>
                            </div>
                            <div className="flex md:align-items-center align-items-stretch flex-wrap">
                                <span className="text-green-500 text-900 font-medium text-xl flex align-items-center justify-content-center">{companiesCounter}</span>
                                <span className="text-500 flex align-items-center justify-content-center ml-2">registradas.</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 md:col-6 lg:col-3">
                        <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3 font-bold">Receita Total Estimada</span>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <i className="pi pi-dollar text-green-700 text-xl"></i>
                                </div>
                            </div>
                            <div className="flex md:align-items-center align-items-stretch flex-wrap">
                                <span className="text-600 font-bold text-xl flex align-items-center justify-content-center">{totalEstimatedRevenue}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {expiringContracts.length !== 0 ?
                    <div className="grid mt-1">
                        <div className="col-12 md:col-12">
                            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                                <div className="flex justify-content-between">
                                    <div>
                                        <span className="block text-primary font-bold mb-3">Contratos Próximos do Vencimento - (7 dias)</span>
                                    </div>
                                </div>
                                <DataTable value={expiringContracts} tableStyle={{ minWidth: '50rem' }} emptyMessage="Nenhum contrato encontrado."
                                    key="id" rows={5} paginator>
                                    <Column field="companyTradeName" body={(rowData) => rowData.companyTradeName.toUpperCase()} header="Empresa" align="center" alignHeader="center" />
                                    <Column field="sellerName" body={(rowData) => sellerBodyImage(rowData)} header="Vendedor" align="center" alignHeader="center" />
                                    <Column field="advertisingOrder" header="Ordem de Propaganda" align="center" alignHeader="center" />
                                    <Column field="quantitySpotDay" header="Quantidade Spots/Dia" align="center" alignHeader="center" />
                                    <Column field="spotDuration" body={(rowData) => Number(rowData.spotDuration).toFixed(2)} header="Tempo do Spot" align="center" alignHeader="center" />
                                    <Column field="startDate" body={(rowData) => dateFormatDt(rowData, 'startDate')} header="Data de Início" align="center" alignHeader="center" />
                                    <Column field="endDate" body={(rowData) => showEndDate(rowData)} header="Data de Término" align="center" alignHeader="center" />
                                    <Column field="monthlyPriceFmt" header="Preço Mensal" className="font-bold" align="center" alignHeader="center" />
                                    <Column field="dueDate" body={statusBodyTemplate} header="Vencimento" className="font-bold" align="center" alignHeader="center" />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                    : <></>
                }

                <div className="grid mt-1">
                    <div className="col-12 md:col-12">
                        <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                            <div className="flex justify-content-between">
                                <div>
                                    <span className="block text-primary font-bold mb-3">Últimos Contratos</span>
                                </div>
                            </div>
                            <DataTable value={lastContracts} tableStyle={{ minWidth: '50rem' }} emptyMessage="Nenhum contrato encontrado."
                                rows={5} key="id">
                                <Column field="id" header="Código" align="center" alignHeader="center" />
                                <Column field="companyTradeName" body={(rowData) => rowData.companyTradeName.toUpperCase()} header="Empresa" align="center" alignHeader="center" />
                                <Column field="sellerName" body={(rowData) => sellerBodyImage(rowData)} header="Vendedor" align="center" alignHeader="center" />
                                <Column field="advertisingOrder" header="Ordem de Propaganda" align="center" alignHeader="center" />
                                <Column field="quantitySpotDay" header="Quantidade Spots/Dia" align="center" alignHeader="center" />
                                <Column field="spotDuration" body={(rowData) => Number(rowData.spotDuration).toFixed(2)} header="Tempo do Spot" align="center" alignHeader="center" />
                                <Column field="startDate" body={(rowData) => dateFormatDt(rowData, 'startDate')} header="Data de Início" align="center" alignHeader="center" />
                                <Column field="endDate" body={(rowData) => showEndDate(rowData)} header="Data de Término" align="center" alignHeader="center" />
                                <Column field="monthlyPriceFmt" header="Preço Mensal" className="font-bold" align="center" alignHeader="center" />
                            </DataTable>
                        </div>
                    </div>
                </div>
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

            <ImageDialog visible={imageVisible} onHide={closeTableImageDialog} header="Imagem do Vendedor" src={contract.sellerImageUrl} />

            {showBody()}
        </div>
    );
}
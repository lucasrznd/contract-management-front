import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import { errorMsg, successMsg } from "../../functions/ToastMessage";
import axios from "axios";
import { InputText } from "primereact/inputtext";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/contracts/get-doc';

export default function DigitalContract(props) {
    const [contract, setContract] = useState(undefined);
    const toast = useRef(null);

    const getDigitalContract = async () => {
        const token = props.data.token;

        if (contract === undefined) {
            try {
                const response = await axios.get(API_URL, { params: { token: token } });
                setContract({ ...response.data });
                console.log(response.data)
                successMsg(toast, 'Contrato encontrado com sucesso.');
            } catch (error) {
                errorMsg(toast, error.message);
            }
        }
    }

    const closeDigitalDocDialog = () => {
        props.closeDigitalDocDialog();
        setContract(undefined);
    }

    const openOriginalFile = async () => {
        if (contract === undefined) {
            return errorMsg(toast, 'Consulte o contrato para visualizar o link.')
        }
        window.open(contract.original_file, 'blank');
    }

    const openSignUrl = async () => {
        if (contract === undefined) {
            return errorMsg(toast, 'Consulte o contrato para visualizar o link.')
        }

        window.open(contract.signers[0].sign_url, 'blank');
    }

    const modalFooter = (
        <div>
            <Button label="Consultar" type="submit" icon="pi pi-search" onClick={() => getDigitalContract()} />
            <Button label="Sair" icon="pi pi-times" outlined onClick={closeDigitalDocDialog} />
        </div>
    );

    return (
        <>
            <Toast ref={toast} />

            <Dialog header="Contrato Digital" visible={props.digitalDocVisible} style={{ width: '40vw', minWidth: "40vw" }}
                breakpoints={{ '1000px': '65vw', '641px': '70vw' }} footer={modalFooter}
                onHide={() => closeDigitalDocDialog()} draggable={false}>
                <Splitter style={{ height: '300px' }}>
                    <SplitterPanel className="flex align-items-center justify-content-center">
                        <div className="card p-fluid">
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 md:col-12">
                                    <label htmlFor="originalContract">Visualizar Arquivo Original</label>
                                    <div className="flex align-items-center justify-content-center">
                                        <Button id="originalContract" icon="pi pi-file-word" rounded outlined severity="info" onClick={() => openOriginalFile()} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SplitterPanel>
                    <SplitterPanel className="flex align-items-center justify-content-center">
                        <div className="card p-fluid">
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 md:col-10 ml-2">
                                    <label htmlFor='contractStatus' className="mb-1">Nome do Signatário:</label>
                                    <div className="">
                                        <InputText
                                            id="contractStatus"
                                            name="contractStatus"
                                            value={contract !== undefined ? contract.signers[0].name : ""}
                                            disabled />
                                    </div>
                                </div>
                                <div className="field col-12 md:col-10 ml-2">
                                    <label htmlFor='contractStatus' className="mb-1">Status da Assinatura:</label>
                                    <div className="">
                                        <InputText
                                            id="contractStatus"
                                            name="contractStatus"
                                            value={contract !== undefined ? contract.status : ""}
                                            disabled />
                                    </div>
                                </div>
                                <div className="field col-12 md:col-12 ml-2">
                                    <label htmlFor="originalContract">Link para Assinatura</label>
                                    <div className="">
                                        <Button id="originalContract" icon="pi pi-file-word" rounded outlined severity="warning" onClick={() => openSignUrl()} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SplitterPanel>
                </Splitter>
            </Dialog>
        </>
    )
}
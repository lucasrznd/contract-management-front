import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import { useFetchContractPdf } from "../../hooks/contract/useContractGetPDF";
import { errorMsg, successMsg } from "../../functions/ToastMessage";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ConfirmPopup } from "primereact/confirmpopup";
import { useContractCreateDigitalDoc } from "../../hooks/contract/useContractCreateDigitalDoc";

export default function PDFContract(props) {
    const toast = useRef(null);
    const { mutate: pdfMutate } = useFetchContractPdf();
    const { mutate: digitalContractMutate } = useContractCreateDigitalDoc();
    const buttonEl = useRef(null);
    const [visible, setVisible] = useState(false);

    const [tabs] = useState([
        {
            header: 'PDF',
            children: <p className="m-0">Gera o contrato em PDF para download e impressão.</p>
        },
        {
            header: 'Contrato Digital (Não disponível)',
            children: <p className="m-0">Gera o contrato digital para assinatura do Cliente.</p>
        }
    ]);

    const generatePDF = () => {
        pdfMutate(props.data, {
            onError: (error) => {
                errorMsg(error.message);
            },
            onSuccess: () => {
                successMsg(toast, "PDF gerado com sucesso.");
                props.closeGenerateContractDialog();
            }
        });
    }

    const createDigitalDoc = () => {
        digitalContractMutate(props.data, {
            onError: (error) => {
                errorMsg(error.message);
            }
        });
        successMsg(toast, 'Contrato gerado com sucesso.');
        props.closeGenerateContractDialog();
    }

    const createDynamicTabs = () => {
        return tabs.map((tab, i) => {
            return (
                <AccordionTab key={tab.header} header={tab.header} disabled={tab.disabled}>
                    {tab.children}
                </AccordionTab>
            );
        });
    };

    const modalFooter = (
        <div>
            <Button label="Sair" icon="pi pi-times" outlined onClick={props.closeGenerateContractDialog} />
        </div>
    );

    return (
        <>
            <Toast ref={toast} />

            <Dialog header="Gerar Contrato" visible={props.generateContractVisible} style={{ width: '40vw', minWidth: "40vw" }}
                breakpoints={{ '1000px': '65vw', '641px': '70vw' }} footer={modalFooter}
                onHide={() => props.closeGenerateContractDialog()} draggable={false}>
                <div className="card">
                    <Accordion>{createDynamicTabs()}</Accordion>
                </div>
                <Splitter style={{ height: '300px' }}>
                    <SplitterPanel className="flex align-items-center justify-content-center">
                        <Button icon="pi pi-file-pdf" label="PDF" severity="warning" onClick={() => generatePDF()} />
                    </SplitterPanel>
                    <SplitterPanel className="flex align-items-center justify-content-center">
                        <ConfirmPopup target={buttonEl.current} visible={visible} onHide={() => setVisible(false)}
                            message="Tem certeza que deseja prosseguir?" icon="pi pi-exclamation-triangle" acceptLabel="Sim" rejectLabel="Não"
                            accept={() => createDigitalDoc()} />
                        <div className="card flex justify-content-center">
                            <Button label="Contrato Digital" icon="pi pi-file-word" severity="info" disabled ref={buttonEl} onClick={() => setVisible(true)} />
                        </div>
                        {/* <Button icon="pi pi-file-word" label="Contrato Digital" severity="info" /> */}
                    </SplitterPanel>
                </Splitter>
            </Dialog>
        </>
    )
}
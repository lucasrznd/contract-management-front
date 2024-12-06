import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

export default function ContractPDFViewer(props) {
    const { height = 600 } = props;

    const modalFooter = (
        <div>
            <Button label="Sair" icon="pi pi-times" outlined onClick={props.closePdfViewerDialog} />
        </div>
    );

    return (
        <>
            <Dialog header="Visualizar Contrato" visible={props.pdfViewerVisible} style={{ width: '60vw', minWidth: "40vw" }} breakpoints={{ '1000px': '65vw', '641px': '70vw' }} onHide={props.closePdfViewerDialog}
                footer={modalFooter} draggable={false}>
                <iframe title="pdf" src={props.src} width="100%" height={height} allowFullScreen
                    style={{ borderRadius: "5px" }} />
            </Dialog >
        </>
    );
}
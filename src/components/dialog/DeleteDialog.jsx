import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import React from "react";

export default function DeleteDialog(props) {
    const deleteObjectFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={props.hideDeleteDialog} />
            <Button label="Sim" icon="pi pi-check" severity="danger" onClick={props.deleteObject} />
        </React.Fragment>
    );

    return (
        <div>
            <Dialog visible={props.deleteObjectDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmação" modal footer={deleteObjectFooter} onHide={props.hideDeleteObjectDialog}>
                <div className="confirmation-content" style={{ display: "flex", alignItems: "center" }}>
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {props.object && (
                        <span>
                            Deseja realmente excluir o registro?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    )
}
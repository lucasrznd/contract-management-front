import { useId, type ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Modal } from '../ui/Modal';
import { TrashIcon } from '../icons';
import styles from './DeleteDialog.module.css';

interface DeleteDialogProps {
    deleteObjectDialog: boolean;
    hideDeleteDialog: () => void;
    deleteObject: () => void;
    hideDeleteObjectDialog: () => void;
    object?: object;
    /** Defaults to "Excluir registro?". */
    title?: string;
    /** Defaults to a generic warning that the action can't be undone. */
    message?: ReactNode;
    loading?: boolean;
}

export default function DeleteDialog(props: DeleteDialogProps) {
    const titleId = useId();

    return (
        <Modal
            visible={props.deleteObjectDialog}
            onHide={props.hideDeleteObjectDialog}
            labelledBy={titleId}
            width={420}
            offsetTop="18vh"
            role="alertdialog"
        >
            <div className={styles.content}>
                <div className={styles.body}>
                    <div className={styles.icon}>
                        <TrashIcon size={18} strokeWidth={2} />
                    </div>
                    <div className={styles.text}>
                        <h2 id={titleId} className={styles.title}>
                            {props.title ?? 'Excluir registro?'}
                        </h2>
                        <div className={styles.message}>
                            {props.message ?? 'O registro será removido. Esta ação não pode ser desfeita.'}
                        </div>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Button label="Cancelar" outlined onClick={props.hideDeleteDialog} />
                    <Button label="Excluir" severity="danger" onClick={props.deleteObject} loading={props.loading} />
                </div>
            </div>
        </Modal>
    );
}

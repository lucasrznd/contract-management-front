import { useId } from 'react';
import { Button } from 'primereact/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/shared/components/ui/Modal';
import { ExternalLinkIcon } from '@/shared/components/icons';
import { formatCode, replacePdfPath } from '@/shared/helpers/stringUtils.helper';
import type { Contract } from '../types/contract.types';
import styles from './ContractDialogs.module.css';

interface ContractPdfDialogProps {
    visible: boolean;
    onHide: () => void;
    contract: Contract | null;
}

export default function ContractPdfDialog({ visible, onHide, contract }: ContractPdfDialogProps) {
    const titleId = useId();
    const src = replacePdfPath(contract?.pdfPath ?? null) ?? '';

    return (
        <Modal visible={visible} onHide={onHide} labelledBy={titleId} width={960} position="center">
            <ModalHeader
                id={titleId}
                title="Visualizar contrato"
                subtitle={contract && `Contrato ${formatCode(contract.id)} · ${contract.companyTradeName}`}
                onClose={onHide}
            />
            <ModalBody>
                <iframe title="Contrato em PDF" src={src} className={styles.pdf} />
            </ModalBody>
            <ModalFooter>
                <Button
                    type="button"
                    label="Abrir em nova aba"
                    outlined
                    icon={<ExternalLinkIcon size={14} />}
                    onClick={() => window.open(src, '_blank', 'noopener')}
                />
                <Button type="button" label="Fechar" onClick={onHide} />
            </ModalFooter>
        </Modal>
    );
}

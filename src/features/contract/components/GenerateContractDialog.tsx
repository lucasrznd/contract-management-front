import { useId, type ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/shared/components/ui/Modal';
import StatusBadge from '@/shared/components/ui/StatusBadge';
import { useToast } from '@/shared/components/ui/toast/ToastProvider';
import { DownloadIcon, FileTextIcon, SignatureIcon } from '@/shared/components/icons';
import { useFetchContractPdf } from '../service/contract.service';
import { formatCode } from '@/shared/helpers/stringUtils.helper';
import type { Contract } from '../types/contract.types';
import styles from './ContractDialogs.module.css';

interface GenerateContractDialogProps {
    visible: boolean;
    onHide: () => void;
    contract: Contract | null;
}

function Option(props: {
    icon: ReactNode;
    title: ReactNode;
    description: string;
    action: ReactNode;
    disabled?: boolean;
}) {
    return (
        <div className={props.disabled ? `${styles.option} ${styles.optionDisabled}` : styles.option}>
            <div className={styles.optionIcon}>{props.icon}</div>
            <div className={styles.optionText}>
                <div className={styles.optionTitle}>{props.title}</div>
                <div className={styles.optionDescription}>{props.description}</div>
            </div>
            {props.action}
        </div>
    );
}

export default function GenerateContractDialog({ visible, onHide, contract }: GenerateContractDialogProps) {
    const titleId = useId();
    const toast = useToast();
    const pdf = useFetchContractPdf();

    const downloadPdf = () => {
        if (!contract) return;
        pdf.mutate(contract, {
            onSuccess: () => {
                toast.success('PDF gerado');
                onHide();
            },
            onError: () => toast.error('Não foi possível gerar o PDF.'),
        });
    };

    return (
        <Modal visible={visible} onHide={onHide} labelledBy={titleId} width={520}>
            <ModalHeader
                id={titleId}
                title="Gerar contrato"
                subtitle={contract && `Contrato ${formatCode(contract.id)} · ${contract.companyTradeName}`}
                onClose={onHide}
            />
            <ModalBody>
                <div className={styles.options}>
                    <Option
                        icon={<FileTextIcon size={20} />}
                        title="Contrato em PDF"
                        description="Para download e impressão."
                        action={
                            <Button
                                size="small"
                                label="Baixar PDF"
                                icon={<DownloadIcon size={14} />}
                                loading={pdf.isPending}
                                onClick={downloadPdf}
                            />
                        }
                    />
                    {/* The signature provider integration is turned off in the API for now. */}
                    <Option
                        disabled
                        icon={<SignatureIcon size={20} />}
                        title={
                            <>
                                Contrato digital <StatusBadge>Em breve</StatusBadge>
                            </>
                        }
                        description="Envia o contrato para assinatura eletrônica do cliente."
                        action={<Button size="small" outlined label="Enviar" disabled />}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button type="button" label="Fechar" outlined onClick={onHide} />
            </ModalFooter>
        </Modal>
    );
}

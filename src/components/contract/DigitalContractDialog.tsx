import { useId } from 'react';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { CloudOffIcon, ExternalLinkIcon, FileTextIcon, SignatureIcon } from '../icons';
import { useContractDigitalDoc } from '../../hooks/contract/useContractDigitalDoc';
import { formatCode } from '../../functions/StringUtils';
import type { Contract } from '../../types';
import styles from './ContractDialogs.module.css';

interface DigitalContractDialogProps {
    visible: boolean;
    onHide: () => void;
    contract: Contract | null;
}

const openInNewTab = (url: string) => window.open(url, '_blank', 'noopener');

export default function DigitalContractDialog({ visible, onHide, contract }: DigitalContractDialogProps) {
    const titleId = useId();
    const { data, isLoading, isError } = useContractDigitalDoc(contract?.token, visible);
    const signer = data?.signers[0];

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className={styles.loading}>
                    <ProgressSpinner />
                </div>
            );
        }
        if (isError || !data) {
            return (
                <EmptyState
                    tone="danger"
                    icon={<CloudOffIcon size={26} />}
                    title="Não foi possível consultar a assinatura."
                    description="Tente novamente em alguns instantes."
                />
            );
        }
        return (
            <>
                <dl className={styles.details}>
                    <dt>Signatário</dt>
                    <dd>{signer?.name ?? '—'}</dd>
                    <dt>Status</dt>
                    <dd>
                        <StatusBadge tone="primary">{data.status}</StatusBadge>
                    </dd>
                </dl>
                <div className={styles.links}>
                    <Button
                        outlined
                        label="Arquivo original"
                        icon={<FileTextIcon />}
                        onClick={() => openInNewTab(data.original_file)}
                    />
                    <Button
                        label="Link de assinatura"
                        icon={<ExternalLinkIcon />}
                        disabled={!signer}
                        onClick={() => signer && openInNewTab(signer.sign_url)}
                    />
                </div>
            </>
        );
    };

    return (
        <Modal visible={visible} onHide={onHide} labelledBy={titleId} width={520}>
            <ModalHeader
                id={titleId}
                title={
                    <span className={styles.titleWithIcon}>
                        <SignatureIcon size={18} /> Contrato digital
                    </span>
                }
                subtitle={contract && `Contrato ${formatCode(contract.id)} · ${contract.companyTradeName}`}
                onClose={onHide}
            />
            <ModalBody>{renderContent()}</ModalBody>
            <ModalFooter>
                <Button type="button" label="Fechar" outlined onClick={onHide} />
            </ModalFooter>
        </Modal>
    );
}

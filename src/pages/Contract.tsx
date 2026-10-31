import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ContractDatatable from '../components/contract/ContractDatatable';
import ContractFormDialog from '../components/contract/ContractFormDialog';
import ContractFilterDialog from '../components/contract/ContractFilterDialog';
import GenerateContractDialog from '../components/contract/GenerateContractDialog';
import DigitalContractDialog from '../components/contract/DigitalContractDialog';
import ContractPdfDialog from '../components/contract/ContractPdfDialog';
import DeleteDialog from '../components/dialog/DeleteDialog';
import { useToast } from '../components/ui/toast/ToastProvider';
import { useContractDelete } from '../hooks/contract/useContractDelete';
import { useCompanyFindAll } from '../hooks/company/useCompanyFindAll';
import { useSellerFindAll } from '../hooks/seller/useSellerFindAll';
import { useDialogState } from '../hooks/useDialogState';
import type { ContractFilter } from '../hooks/contract/useContractFilter';
import { formatCode } from '../functions/StringUtils';
import type { Contract } from '../types';

export default function ContractPage() {
    const toast = useToast();
    const deleteContract = useContractDelete();
    const [filter, setFilter] = useState<ContractFilter | null>(null);
    const form = useDialogState<Contract>();
    const deletion = useDialogState<Contract>();
    const filterDialog = useDialogState<never>();
    const generate = useDialogState<Contract>();
    const digital = useDialogState<Contract>();
    const pdf = useDialogState<Contract>();

    // The form and the filter pick companies and sellers; load them before they're opened.
    useCompanyFindAll();
    useSellerFindAll();

    const openDocument = (contract: Contract) => {
        if (contract.pdfPath) pdf.open(contract);
        else if (contract.token) digital.open(contract);
        else generate.open(contract);
    };

    const confirmDelete = () => {
        if (!deletion.item) return;
        deleteContract.mutate(deletion.item.id, {
            onSuccess: () => {
                deletion.close();
                toast.success('Contrato excluído');
            },
            onError: () => toast.error('Não foi possível excluir o contrato.'),
        });
    };

    return (
        <>
            <Helmet>
                <title>Contratos · EducadoraGC</title>
            </Helmet>

            <ContractDatatable
                filter={filter}
                onOpenFilter={() => filterDialog.open()}
                onClearFilter={() => setFilter(null)}
                onNew={() => form.open()}
                onEdit={form.open}
                onDelete={deletion.open}
                onOpenDocument={openDocument}
            />

            {/* Remounted on every open so the form starts from the chosen contract's data. */}
            <ContractFormDialog key={form.key} visible={form.visible} contract={form.item} onHide={form.close} />

            <ContractFilterDialog
                key={`filter-${filterDialog.key}`}
                visible={filterDialog.visible}
                onHide={filterDialog.close}
                onApply={setFilter}
            />

            <GenerateContractDialog visible={generate.visible} contract={generate.item} onHide={generate.close} />
            <DigitalContractDialog visible={digital.visible} contract={digital.item} onHide={digital.close} />
            <ContractPdfDialog visible={pdf.visible} contract={pdf.item} onHide={pdf.close} />

            <DeleteDialog
                deleteObjectDialog={deletion.visible}
                hideDeleteDialog={deletion.close}
                hideDeleteObjectDialog={deletion.close}
                deleteObject={confirmDelete}
                loading={deleteContract.isPending}
                title="Excluir contrato?"
                message={
                    deletion.item && (
                        <>
                            O contrato <strong>{formatCode(deletion.item.id)}</strong> de{' '}
                            <strong>{deletion.item.companyTradeName}</strong> será removido. Esta ação não pode ser
                            desfeita.
                        </>
                    )
                }
            />
        </>
    );
}

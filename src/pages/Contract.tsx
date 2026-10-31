import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ContractDatatable from '@/features/contract/components/ContractDatatable';
import ContractFormDialog from '@/features/contract/components/ContractFormDialog';
import ContractFilterDialog from '@/features/contract/components/ContractFilterDialog';
import GenerateContractDialog from '@/features/contract/components/GenerateContractDialog';
import DigitalContractDialog from '@/features/contract/components/DigitalContractDialog';
import ContractPdfDialog from '@/features/contract/components/ContractPdfDialog';
import DeleteDialog from '@/shared/components/dialog/DeleteDialog';
import { useToast } from '@/shared/components/ui/toast/ToastProvider';
import { useContractDelete } from '@/features/contract/service/contract.service';
import { useCompanyFindAll } from '@/features/company/service/company.service';
import { useSellerFindAll } from '@/features/seller/service/seller.service';
import { useDialogState } from '@/shared/hooks/useDialogState';
import { formatCode } from '@/shared/helpers/stringUtils.helper';
import type { Contract, ContractFilter } from '@/features/contract/types/contract.types';

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
        deleteContract.mutate(
            { id: deletion.item.id },
            {
                onSuccess: () => {
                    deletion.close();
                    toast.success('Contrato excluído');
                },
            },
        );
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

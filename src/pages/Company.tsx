import { Helmet } from 'react-helmet-async';
import CompanyDatatable from '@/features/company/components/CompanyDatatable';
import CompanyFormDialog from '@/features/company/components/CompanyFormDialog';
import DeleteDialog from '@/shared/components/dialog/DeleteDialog';
import { useToast } from '@/shared/components/ui/toast/ToastProvider';
import { useCompanyDelete } from '@/features/company/service/company.service';
import { useDialogState } from '@/shared/hooks/useDialogState';
import type { Company } from '@/features/company/types/company.types';

export default function CompanyPage() {
    const toast = useToast();
    const deleteCompany = useCompanyDelete();
    const form = useDialogState<Company>();
    const deletion = useDialogState<Company>();

    const confirmDelete = () => {
        if (!deletion.item) return;
        deleteCompany.mutate(
            { id: deletion.item.id },
            {
                onSuccess: () => {
                    deletion.close();
                    toast.success('Empresa excluída');
                },
            },
        );
    };

    return (
        <>
            <Helmet>
                <title>Empresas · EducadoraGC</title>
            </Helmet>

            <CompanyDatatable onNew={() => form.open()} onEdit={form.open} onDelete={deletion.open} />

            {/* Remounted on every open so the form starts from the chosen company's data. */}
            <CompanyFormDialog key={form.key} visible={form.visible} company={form.item} onHide={form.close} />

            <DeleteDialog
                deleteObjectDialog={deletion.visible}
                hideDeleteDialog={deletion.close}
                hideDeleteObjectDialog={deletion.close}
                deleteObject={confirmDelete}
                loading={deleteCompany.isPending}
                title="Excluir empresa?"
                message={
                    <>
                        <strong>{deletion.item?.tradeName}</strong> será removida da lista. Esta ação não pode ser
                        desfeita.
                    </>
                }
            />
        </>
    );
}

import { Helmet } from 'react-helmet-async';
import CompanyDatatable from '../components/company/CompanyDatatable';
import CompanyFormDialog from '../components/company/CompanyFormDialog';
import DeleteDialog from '../components/dialog/DeleteDialog';
import { useToast } from '../components/ui/toast/ToastProvider';
import { useCompanyDelete } from '../hooks/company/useCompanyDelete';
import { useDialogState } from '../hooks/useDialogState';
import type { Company } from '../types';

export default function CompanyPage() {
    const toast = useToast();
    const deleteCompany = useCompanyDelete();
    const form = useDialogState<Company>();
    const deletion = useDialogState<Company>();

    const confirmDelete = () => {
        if (!deletion.item) return;
        deleteCompany.mutate(deletion.item.id, {
            onSuccess: () => {
                deletion.close();
                toast.success('Empresa excluída');
            },
            onError: () => toast.error('Não foi possível excluir a empresa.'),
        });
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

import { Helmet } from 'react-helmet-async';
import SellerDatatable from '@/features/seller/components/SellerDatatable';
import SellerFormDialog from '@/features/seller/components/SellerFormDialog';
import DeleteDialog from '@/shared/components/dialog/DeleteDialog';
import { useToast } from '@/shared/components/ui/toast/ToastProvider';
import { useSellerDelete } from '@/features/seller/service/seller.service';
import { useDialogState } from '@/shared/hooks/useDialogState';
import type { Seller } from '@/features/seller/types/seller.types';

export default function SellerPage() {
    const toast = useToast();
    const deleteSeller = useSellerDelete();
    const form = useDialogState<Seller>();
    const deletion = useDialogState<Seller>();

    const confirmDelete = () => {
        if (!deletion.item) return;
        deleteSeller.mutate(deletion.item.id, {
            onSuccess: () => {
                deletion.close();
                toast.success('Vendedor excluído');
            },
            onError: () => toast.error('Não foi possível excluir o vendedor.'),
        });
    };

    return (
        <>
            <Helmet>
                <title>Vendedores · EducadoraGC</title>
            </Helmet>

            <SellerDatatable onNew={() => form.open()} onEdit={form.open} onDelete={deletion.open} />

            {/* Remounted on every open so the form starts from the chosen seller's data. */}
            <SellerFormDialog key={form.key} visible={form.visible} seller={form.item} onHide={form.close} />

            <DeleteDialog
                deleteObjectDialog={deletion.visible}
                hideDeleteDialog={deletion.close}
                hideDeleteObjectDialog={deletion.close}
                deleteObject={confirmDelete}
                loading={deleteSeller.isPending}
                title="Excluir vendedor?"
                message={
                    <>
                        <strong>{deletion.item?.name}</strong> será removido da lista. Esta ação não pode ser desfeita.
                    </>
                }
            />
        </>
    );
}

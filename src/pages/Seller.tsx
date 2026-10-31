import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import SellerDatatable from '../components/seller/SellerDatatable';
import SellerFormDialog from '../components/seller/SellerFormDialog';
import DeleteDialog from '../components/dialog/DeleteDialog';
import { useToast } from '../components/ui/toast/ToastProvider';
import { useSellerDelete } from '../hooks/seller/useSellerDelete';
import type { Seller } from '../types';

export default function SellerPage() {
    const toast = useToast();
    const deleteSeller = useSellerDelete();
    const [form, setForm] = useState<{ visible: boolean; seller: Seller | null; key: number }>({
        visible: false,
        seller: null,
        key: 0,
    });
    // The seller stays set while the dialog closes, so its name doesn't vanish mid-animation.
    const [sellerToDelete, setSellerToDelete] = useState<Seller | null>(null);
    const [deleteVisible, setDeleteVisible] = useState(false);

    // A new key remounts the form, so it starts from the chosen seller's data.
    const openForm = (seller: Seller | null) => setForm((f) => ({ visible: true, seller, key: f.key + 1 }));
    const closeForm = () => setForm((f) => ({ ...f, visible: false }));

    const askDelete = (seller: Seller) => {
        setSellerToDelete(seller);
        setDeleteVisible(true);
    };
    const closeDelete = () => setDeleteVisible(false);

    const confirmDelete = () => {
        if (!sellerToDelete) return;
        deleteSeller.mutate(sellerToDelete.id, {
            onSuccess: () => {
                closeDelete();
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

            <SellerDatatable onNew={() => openForm(null)} onEdit={openForm} onDelete={askDelete} />

            <SellerFormDialog key={form.key} visible={form.visible} seller={form.seller} onHide={closeForm} />

            <DeleteDialog
                deleteObjectDialog={deleteVisible}
                hideDeleteDialog={closeDelete}
                hideDeleteObjectDialog={closeDelete}
                deleteObject={confirmDelete}
                loading={deleteSeller.isPending}
                title="Excluir vendedor?"
                message={
                    <>
                        <strong>{sellerToDelete?.name}</strong> será removido da lista. Esta ação não pode ser desfeita.
                    </>
                }
            />
        </>
    );
}

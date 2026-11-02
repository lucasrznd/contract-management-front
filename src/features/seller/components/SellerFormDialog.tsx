import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/shared/components/ui/Modal';
import FormField from '@/shared/components/ui/FormField';
import { useToast } from '@/shared/components/ui/toast/ToastProvider';
import { PhoneIcon, UserIcon } from '@/shared/components/icons';
import ImageUploadField from '@/shared/components/ui/ImageUploadField';
import { useSellerCreate, useSellerUpdate } from '../service/seller.service';
import { clearPhoneNumber, formatCode, maskPhone } from '@/shared/helpers/stringUtils.helper';
import { textFieldProps } from '@/shared/helpers/form.helper';
import { sellerFormSchema, type SellerFormFields } from '../schema/SellerFormSchema';
import type { Seller, SellerFormValues } from '../types/seller.types';
import styles from './SellerFormDialog.module.css';

interface SellerFormDialogProps {
    visible: boolean;
    onHide: () => void;
    /** Seller being edited; null to register a new one. */
    seller: Seller | null;
}

/** Remount it (change its `key`) for each seller so the form starts from that seller's data. */
export default function SellerFormDialog({ visible, onHide, seller }: SellerFormDialogProps) {
    const titleId = useId();
    const toast = useToast();
    const { mutate: createSeller, isPending: isCreating } = useSellerCreate();
    const { mutate: updateSeller, isPending: isUpdating } = useSellerUpdate();
    const isEditing = seller !== null;

    const form = useForm<SellerFormFields>({
        resolver: zodResolver(sellerFormSchema),
        // Errors show up after leaving the field or trying to save, not while typing for the first time.
        mode: 'onTouched',
        defaultValues: {
            name: seller?.name ?? '',
            phoneNumber: seller ? maskPhone(seller.phoneNumber) : '',
        },
    });
    const { errors } = form.formState;

    const onSubmit = (values: SellerFormFields) => {
        const data: SellerFormValues = {
            id: seller?.id,
            name: values.name.trim(),
            phoneNumber: clearPhoneNumber(values.phoneNumber),
            image: values.image,
        };

        if (isEditing) {
            updateSeller(
                { id: seller.id, data },
                {
                    onSuccess: () => {
                        toast.success('Alterações salvas');
                        onHide();
                    },
                },
            );
            return;
        }
        createSeller(
            { data },
            {
                onSuccess: () => {
                    toast.success('Vendedor cadastrado');
                    onHide();
                },
            },
        );
    };

    const name = form.watch('name');
    const image = form.watch('image');
    const nameError = errors.name?.message;
    const phoneError = errors.phoneNumber?.message;

    return (
        <Modal visible={visible} onHide={onHide} labelledBy={titleId}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <ModalHeader
                    id={titleId}
                    title={isEditing ? 'Editar vendedor' : 'Novo vendedor'}
                    subtitle={isEditing ? `Código ${formatCode(seller.id)}` : 'Preencha os dados para cadastrar.'}
                    onClose={onHide}
                />

                <ModalBody>
                    <ImageUploadField
                        title="Foto do vendedor"
                        name={name}
                        id={seller?.id}
                        currentUrl={seller?.urlImage}
                        file={image ?? null}
                        onFileChange={(file) => form.setValue('image', file ?? undefined)}
                    />

                    <div className={styles.fields}>
                        <FormField id="seller-name" label="Nome" required icon={<UserIcon />} error={nameError}>
                            <InputText
                                {...textFieldProps(form, 'name', 'seller-name')}
                                placeholder="Nome completo"
                                autoComplete="off"
                            />
                        </FormField>

                        <FormField
                            id="seller-phone"
                            label="Telefone"
                            required
                            icon={<PhoneIcon strokeWidth={1.9} />}
                            error={phoneError}
                            hint="Celular ou fixo, com DDD."
                        >
                            <InputText
                                {...textFieldProps(form, 'phoneNumber', 'seller-phone', { mask: maskPhone })}
                                inputMode="tel"
                                placeholder="(99) 9 9999-9999"
                                className={styles.phone}
                                aria-describedby={phoneError ? 'seller-phone-error' : 'seller-phone-hint'}
                            />
                        </FormField>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button type="button" label="Cancelar" outlined onClick={onHide} />
                    <Button
                        type="submit"
                        label={isEditing ? 'Salvar alterações' : 'Cadastrar vendedor'}
                        loading={isCreating || isUpdating}
                    />
                </ModalFooter>
            </form>
        </Modal>
    );
}

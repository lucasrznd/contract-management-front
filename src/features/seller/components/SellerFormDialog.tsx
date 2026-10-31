import { useId, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { isAxiosError } from 'axios';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/shared/components/ui/Modal';
import FormField from '@/shared/components/ui/FormField';
import { useToast } from '@/shared/components/ui/toast/ToastProvider';
import { PhoneIcon, UserIcon } from '@/shared/components/icons';
import SellerPhotoField from './SellerPhotoField';
import {
    useSellerPost,
    useSellerPut,
    isSellerPhotoUploadEnabled,
    useSellerPhotoUpload,
} from '../service/seller.service';
import { clearPhoneNumber, formatCode, maskPhone } from '@/shared/helpers/stringUtils.helper';
import { errorMessageFormatter } from '@/shared/helpers/messageFormatter.helper';
import type { Seller, SellerFormValues } from '../types/seller.types';
import styles from './SellerFormDialog.module.css';

const validationSchema = Yup.object({
    name: Yup.string().trim().required('Informe o nome do vendedor.').min(3, 'O nome precisa ter pelo menos 3 letras.'),
    phoneNumber: Yup.string()
        .required('Informe o telefone.')
        .test(
            'phone',
            'Telefone inválido. Use (DD) 9 9999-9999.',
            (value) => clearPhoneNumber(value ?? '').length >= 10,
        ),
});

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
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const createSeller = useSellerPost();
    const updateSeller = useSellerPut();
    const uploadPhoto = useSellerPhotoUpload();
    const isEditing = seller !== null;

    const formik = useFormik<SellerFormValues>({
        initialValues: {
            id: seller?.id,
            name: seller?.name ?? '',
            phoneNumber: seller ? maskPhone(seller.phoneNumber) : '',
            urlImage: seller?.urlImage ?? '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const urlImage =
                    isSellerPhotoUploadEnabled && photoFile
                        ? await uploadPhoto.mutateAsync(photoFile)
                        : values.urlImage;
                const data: SellerFormValues = {
                    ...values,
                    name: values.name.trim(),
                    phoneNumber: clearPhoneNumber(values.phoneNumber ?? ''),
                    urlImage,
                };

                if (isEditing) {
                    await updateSeller.mutateAsync(data);
                    toast.success('Alterações salvas');
                } else {
                    await createSeller.mutateAsync(data);
                    toast.success('Vendedor cadastrado');
                }
                onHide();
            } catch (err) {
                const apiMessage = isAxiosError(err) ? errorMessageFormatter(err.response?.data?.message) : undefined;
                toast.error(apiMessage ?? 'Não foi possível salvar o vendedor.');
            }
        },
    });

    // Errors show up after leaving the field or trying to save, not while typing for the first time.
    const errorOf = (field: 'name' | 'phoneNumber') =>
        (formik.touched[field] || formik.submitCount > 0) && formik.errors[field];

    const nameError = errorOf('name');
    const phoneError = errorOf('phoneNumber');

    return (
        <Modal visible={visible} onHide={onHide} labelledBy={titleId}>
            <form onSubmit={formik.handleSubmit} noValidate>
                <ModalHeader
                    id={titleId}
                    title={isEditing ? 'Editar vendedor' : 'Novo vendedor'}
                    subtitle={isEditing ? `Código ${formatCode(seller.id)}` : 'Preencha os dados para cadastrar.'}
                    onClose={onHide}
                />

                <ModalBody>
                    <SellerPhotoField
                        name={formik.values.name}
                        sellerId={seller?.id}
                        file={photoFile}
                        onFileChange={setPhotoFile}
                        url={formik.values.urlImage}
                        onUrlChange={(url) => formik.setFieldValue('urlImage', url)}
                    />

                    <div className={styles.fields}>
                        <FormField id="seller-name" label="Nome" required icon={<UserIcon />} error={nameError}>
                            <InputText
                                id="seller-name"
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Nome completo"
                                autoComplete="off"
                                invalid={!!nameError}
                                aria-invalid={!!nameError}
                                aria-describedby={nameError ? 'seller-name-error' : undefined}
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
                                id="seller-phone"
                                name="phoneNumber"
                                inputMode="tel"
                                value={formik.values.phoneNumber}
                                onChange={(e) => formik.setFieldValue('phoneNumber', maskPhone(e.target.value))}
                                onBlur={formik.handleBlur}
                                placeholder="(99) 9 9999-9999"
                                className={styles.phone}
                                invalid={!!phoneError}
                                aria-invalid={!!phoneError}
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
                        loading={formik.isSubmitting}
                    />
                </ModalFooter>
            </form>
        </Modal>
    );
}

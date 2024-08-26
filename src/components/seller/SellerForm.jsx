import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { errorMsg, successMsg } from "../../functions/ToastMessage";
import { useFormik } from 'formik';
import { useSellerPost } from "../../hooks/seller/useSellerPost";
import { useSellerPut } from "../../hooks/seller/useSellerPut";
import { clearPhoneNumber } from "../../functions/StringUtils";
import { errorMessageFormatter } from "../../functions/MessageFormatter";
import SellerDatatable from "./SellerDatatable";
import { Avatar } from "primereact/avatar";
import ImageDialog from "../dialog/ImageDialog";

export default function SellerForm(props) {
    const [visibleDialog, setVisibleDialog] = useState(false);
    const [imageVisible, setImageVisible] = useState(false);
    const toast = useRef(null);
    const { mutate: mutatePost, isSuccess } = useSellerPost();
    const { mutate: mutatePut } = useSellerPut();

    const formik = useFormik({
        initialValues: {
            id: undefined,
            name: '',
            phoneNumber: undefined,
            urlImage: '',
        },
        validate: (data) => {
            let errors = {};
            
            if (!data.name) {
                errors.name = 'Nome é obrigatório.';
            }

            if (!data.phoneNumber) {
                errors.phoneNumber = 'Telefone é obrigatório.';
            }

            return errors;
        },
        onSubmit: async (values, actions) => {
            const data = values;
            data.phoneNumber = clearPhoneNumber(data.phoneNumber);

            await postSeller(data, actions);
        },
    });

    async function postSeller(data, actions) {
        try {
            if (data.id !== undefined) {
                await mutatePut(data, {
                    onError: (err) => {
                        errorMsg(toast, err.message);
                    },
                    onSuccess: () => {
                        closeDialogForm();
                        actions.resetForm();
                        successMsg(toast, 'Vendedor salvo com sucesso.');
                    },
                });
            } else {
                await mutatePost(data, {
                    onError: (err) => {
                        console.log(err.response.data);
                        errorMsg(toast, errorMessageFormatter(err.response.data.message));
                    },
                    onSuccess: () => {
                        closeDialogForm();
                        actions.resetForm();
                        successMsg(toast, 'Vendedor salvo com sucesso.');
                    },
                });
            }
        } catch (err) {
            errorMsg(toast, 'Ocorreu um erro inesperado.');
        }
    }

    useEffect(() => {
        closeDialogForm();
    }, [isSuccess]);

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);

    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    function newSeller() {
        formik.resetForm();
        formik.setFieldValue('id', undefined);
        formik.setFieldValue('name', '');
        formik.setFieldValue('phoneNumber', undefined);
        formik.setFieldValue('urlImage', '');
        setVisibleDialog(true);
    }

    const closeDialogForm = () => {
        setVisibleDialog(false);
    }

    const sellerDetails = (seller) => {
        formik.resetForm();
        formik.setFieldValue('id', seller.id);
        formik.setFieldValue('name', seller.name);
        formik.setFieldValue('phoneNumber', seller.phoneNumber);
        formik.setFieldValue('urlImage', seller.urlImage);
        setVisibleDialog(true);
    };

    const closeDialog = () => {
        setVisibleDialog(false);
    }

    const startContent = (
        <React.Fragment>
            <Button icon="pi pi-plus-circle" label='Novo' onClick={newSeller} />
        </React.Fragment>
    );

    const modalFooter = (
        <div>
            <Button label="Salvar" type="submit" icon="pi pi-check" onClick={formik.handleSubmit} autoFocus />
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={closeDialog} />
        </div>
    );

    const openImageDialog = () => {
        formik.values.urlImage !== '' ? setImageVisible(true) : setImageVisible(false);
    }

    const closeImageDialog = () => {
        setImageVisible(false);
    }

    return (
        <div>
            <Toast ref={toast} />

            <SellerDatatable startContent={startContent} sellerDetails={sellerDetails} toast={toast} />

            <Dialog header="Detalhes do Vendedor" visible={visibleDialog} style={{ width: '40vw', minWidth: "40vw" }} breakpoints={{ '1200px': '65vw', '641px': '70vw' }} onHide={() => setVisibleDialog(false)}
                footer={modalFooter} draggable={false}>
                <div className="card p-fluid">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="field flex align-items-center justify-content-center">
                            <Avatar icon='pi pi-user' image={formik.values.urlImage} onClick={openImageDialog} size="xlarge" className="mr-2 shadow-4" shape="circle" />
                            <ImageDialog visible={imageVisible} onHide={closeImageDialog} header="Imagem do Vendedor" src={formik.values.urlImage} />
                        </div>

                        <div className="field">
                            <label htmlFor='name' style={{ marginBottom: '0.5rem' }}>Nome:</label>
                            <div className="p-inputgroup flex-1">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-user"></i>
                                </span>
                                <InputText
                                    id="name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    className={isFormFieldValid('name') ? "p-invalid uppercase" : "uppercase"} />
                            </div>
                            {getFormErrorMessage('name')}
                        </div>

                        <div className="field">
                            <label htmlFor='phoneNumber' style={{ marginBottom: '0.5rem' }}>Telefone:</label>
                            <div className="p-inputgroup flex-1">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-phone"></i>
                                </span>
                                <InputMask
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formik.values.phoneNumber}
                                    onChange={formik.handleChange}
                                    mask="(99) 9 9999-9999"
                                    placeholder="(99) 9 9999-9999"
                                    className={isFormFieldValid('phoneNumber') ? "p-invalid uppercase" : "uppercase"} />
                            </div>
                            {getFormErrorMessage('phoneNumber')}
                        </div>

                        <div className="field">
                            <label htmlFor='urlImage' style={{ marginBottom: '0.5rem' }}>Imagem:</label>
                            <div className="p-inputgroup flex-1">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-image"></i>
                                </span>
                                <InputText
                                    id="urlImage"
                                    name="urlImage"
                                    value={formik.values.urlImage}
                                    onChange={formik.handleChange} />
                            </div>
                        </div>
                    </form>
                </div>
            </Dialog>
        </div>
    )
}
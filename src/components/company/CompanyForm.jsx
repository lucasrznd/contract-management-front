import React, { useEffect, useRef, useState } from "react";
import CompanyDatatable from "./CompanyDatatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { errorMsg, successMsg } from "../../functions/ToastMessage";
import { useFormik } from 'formik';
import { useCompanyPost } from "../../hooks/company/useCompanyPost";
import { useCompanyPut } from "../../hooks/company/useCompanyPut";
import { InputNumber } from "primereact/inputnumber";
import { clearPhoneNumber, clearRegistrationNumber } from "../../functions/StringUtils";
import { errorMessageFormatter } from "../../functions/MessageFormatter";
import axios from "axios";

export default function CompanyForm(props) {
    const [visibleDialog, setVisibleDialog] = useState(false);
    const toast = useRef(null);
    const { mutate: mutatePost, isSuccess } = useCompanyPost();
    const { mutate: mutatePut } = useCompanyPut();

    const formik = useFormik({
        initialValues: {
            id: undefined,
            businessName: '',
            tradeName: '',
            registrationNumber: undefined,
            stateRegistration: undefined,
            phoneNumber: undefined,
            email: '',
            streetName: '',
            avenueName: '',
            number: undefined,
            city: '',
            state: '',
            zipCode: undefined
        },
        validate: (data) => {
            let errors = {};

            if (!data.businessName) {
                errors.businessName = 'Razão Social é obrigatória.';
            }

            if (!data.tradeName) {
                errors.tradeName = 'Nome Fantasia é obrigatório.';
            }

            if (!data.registrationNumber) {
                errors.registrationNumber = 'CNPJ é obrigatório.';
            }

            if (!data.phoneNumber) {
                errors.phoneNumber = 'Telefone é obrigatório.';
            }

            if (!data.streetName) {
                errors.streetName = 'Rua é obrigatória.';
            }

            if (!data.avenueName) {
                errors.avenueName = 'Bairro é obrigatório.';
            }

            if (!data.number) {
                errors.number = 'Número é obrigatório.';
            }

            if (!data.city) {
                errors.city = 'Cidade é obrigatória.';
            }

            if (!data.state) {
                errors.state = 'Estado é obrigatório.';
            }

            if (!data.zipCode) {
                errors.zipCode = 'CEP é obrigatório.';
            }

            return errors;
        },
        onSubmit: async (values, actions) => {
            const data = values;
            data.registrationNumber = clearRegistrationNumber(data.registrationNumber);
            data.phoneNumber = clearPhoneNumber(data.phoneNumber);

            await postCompany(data, actions);
        },
    });

    async function postCompany(data, actions) {
        try {
            if (data.id !== undefined) {
                await mutatePut(data, {
                    onError: (err) => {
                        errorMsg(toast, err.message);
                    },
                    onSuccess: () => {
                        closeDialogForm();
                        actions.resetForm();
                        successMsg(toast, 'Empresa salva com sucesso.');
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
                        successMsg(toast, 'Empresa salva com sucesso.');
                    },
                });
            }
        } catch (err) {
            errorMsg(toast, 'Ocorreu um erro inesperado.');
        }
    }

    const onChangeZipCode = async (e) => {
        formik.setFieldValue('zipCode', e);

        // Remove zipCode's special characters and do a request to viacep API
        var cleanZipCode = e.replace(/[^\d]/g, "");
        if (cleanZipCode.length === 8) {
            try {
                const response = await axios.get('https://viacep.com.br/ws/' + cleanZipCode + '/json/');

                if (response.data.erro === 'true') {
                    errorMsg(toast, 'CEP inválido.');
                    return;
                }
                formik.setFieldValue('state', response.data.uf);
                formik.setFieldValue('city', response.data.localidade);
            } catch (error) {
                errorMsg(toast, 'Erro de conexão com o servidor.');
            }
        }

        if (formik.values.zipCode === '') {
            formik.setFieldValue('state', '');
            formik.setFieldValue('city', '');
        }
    }

    useEffect(() => {
        closeDialogForm();
    }, [isSuccess]);

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);

    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    function newCompany() {
        formik.resetForm();
        formik.setFieldValue('id', undefined);
        formik.setFieldValue('businessName', '');
        formik.setFieldValue('tradeName', '');
        formik.setFieldValue('registrationNumber', undefined);
        formik.setFieldValue('stateRegistration', '');
        formik.setFieldValue('phoneNumber', undefined);
        formik.setFieldValue('email', '');
        formik.setFieldValue('streetName', '');
        formik.setFieldValue('avenueName', '');
        formik.setFieldValue('number', undefined);
        formik.setFieldValue('city', '');
        formik.setFieldValue('state', '');
        formik.setFieldValue('zipCode', undefined);
        setVisibleDialog(true);
    }

    const closeDialogForm = () => {
        setVisibleDialog(false);
    }

    const companyDetails = (company) => {
        formik.resetForm();
        formik.setFieldValue('id', company.id);
        formik.setFieldValue('businessName', company.businessName);
        formik.setFieldValue('tradeName', company.tradeName);
        formik.setFieldValue('registrationNumber', company.registrationNumber);
        formik.setFieldValue('stateRegistration', company.stateRegistration === null ? undefined : company.stateRegistration);
        formik.setFieldValue('phoneNumber', company.phoneNumber);
        formik.setFieldValue('email', company.email);
        formik.setFieldValue('streetName', company.streetName);
        formik.setFieldValue('avenueName', company.avenueName);
        formik.setFieldValue('number', company.number);
        formik.setFieldValue('city', company.city);
        formik.setFieldValue('state', company.state);
        formik.setFieldValue('zipCode', company.zipCode);
        setVisibleDialog(true);
    };

    const closeDialog = () => {
        setVisibleDialog(false);
    }

    const startContent = (
        <React.Fragment>
            <Button icon="pi pi-plus-circle" label='Novo' onClick={newCompany} />
        </React.Fragment>
    );

    const modalFooter = (
        <div>
            <Button label="Salvar" type="submit" icon="pi pi-check" onClick={formik.handleSubmit} autoFocus />
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={closeDialog} />
        </div>
    );

    return (
        <div>
            <Toast ref={toast} />

            <CompanyDatatable startContent={startContent} companyDetails={companyDetails} toast={toast} />

            <Dialog header="Detalhes da Empresa" visible={visibleDialog} style={{ width: '45vw', minWidth: "45vw" }} breakpoints={{ '1200px': '65vw', '641px': '70vw' }} onHide={() => setVisibleDialog(false)}
                footer={modalFooter} draggable={false}>
                <div className="card p-fluid">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="field">
                            <label htmlFor='businessName' style={{ marginBottom: '0.5rem' }}>Razão Social:</label>
                            <div className="p-inputgroup flex-1">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-building"></i>
                                </span>
                                <InputText
                                    id="businessName"
                                    name="businessName"
                                    value={formik.values.businessName}
                                    onChange={formik.handleChange}
                                    className={isFormFieldValid('businessName') ? "p-invalid uppercase" : "uppercase"}
                                />
                            </div>
                            {getFormErrorMessage('businessName')}
                        </div>

                        <div className="field">
                            <label htmlFor='tradeName' style={{ marginBottom: '0.5rem' }}>Nome Fantasia:</label>
                            <div className="p-inputgroup flex-1">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-building"></i>
                                </span>
                                <InputText
                                    id="tradeName"
                                    name="tradeName"
                                    value={formik.values.tradeName}
                                    onChange={formik.handleChange}
                                    className={isFormFieldValid('tradeName') ? "p-invalid uppercase" : "uppercase"}
                                />
                            </div>
                            {getFormErrorMessage('tradeName')}
                        </div>

                        <div className="p-fluid formgrid grid">
                            <div className="field col-12 md:col-6">
                                <label htmlFor='registrationNumber' style={{ marginBottom: '0.5rem' }}>CNPJ:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-building"></i>
                                    </span>
                                    <InputMask
                                        id="registrationNumber"
                                        name="registrationNumber"
                                        value={formik.values.registrationNumber}
                                        onChange={formik.handleChange}
                                        mask="99.999.999/9999-99"
                                        placeholder="99.999.999/0001-99"
                                        className={isFormFieldValid('registrationNumber') ? "p-invalid uppercase" : "uppercase"}
                                    />
                                </div>
                                {getFormErrorMessage('registrationNumber')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='stateRegistration' style={{ marginBottom: '0.5rem' }}>Inscrição Estadual:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-building"></i>
                                    </span>
                                    <InputText
                                        id="stateRegistration"
                                        name="stateRegistration"
                                        value={formik.values.stateRegistration}
                                        onChange={formik.handleChange}
                                        maxLength={15} />
                                </div>
                            </div>
                        </div>

                        <div className="p-fluid formgrid grid">
                            <div className="field col-12 md:col-6">
                                <label htmlFor='phoneNumber' style={{ marginBottom: '0.5rem' }}>Telefone:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-phone"></i>
                                    </span>
                                    <InputMask
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formik.values.phoneNumber}
                                        onChange={formik.handleChange}
                                        mask="(99) 9 9999-9999"
                                        placeholder="(43) 9 9999-9999"
                                        className={isFormFieldValid('phoneNumber') ? "p-invalid uppercase" : "uppercase"}
                                    />
                                </div>
                                {getFormErrorMessage('phoneNumber')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='email' style={{ marginBottom: '0.5rem' }}>Email:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-envelope"></i>
                                    </span>
                                    <InputText
                                        id="email"
                                        name="email"
                                        value={formik.values.email}
                                        onChange={formik.handleChange} />
                                </div>
                            </div>

                            <div className="field col-12 mb-1">
                                <h2 className="text-primary">Endereço</h2>
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='streetName' style={{ marginBottom: '0.5rem' }}>Rua:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-map-marker"></i>
                                    </span>
                                    <InputText
                                        id="streetName"
                                        name="streetName"
                                        value={formik.values.streetName}
                                        onChange={formik.handleChange}
                                        className={isFormFieldValid('streetName') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('streetName')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='avenueName' style={{ marginBottom: '0.5rem' }}>Bairro:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-map-marker"></i>
                                    </span>
                                    <InputText
                                        id="avenueName"
                                        name="avenueName"
                                        value={formik.values.avenueName}
                                        onChange={formik.handleChange}
                                        className={isFormFieldValid('avenueName') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('avenueName')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='number' style={{ marginBottom: '0.5rem' }}>Número:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-map-marker"></i>
                                    </span>
                                    <InputNumber
                                        id="number"
                                        name="number"
                                        value={formik.values.number}
                                        onValueChange={formik.handleChange}
                                        useGrouping={false}
                                        className={isFormFieldValid('number') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('number')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='zipCode' style={{ marginBottom: '0.5rem' }}>CEP:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-map-marker"></i>
                                    </span>
                                    <InputMask
                                        id="zipCode"
                                        name="zipCode"
                                        value={formik.values.zipCode}
                                        onChange={(e) => onChangeZipCode(e.value)}
                                        mask="99999-999"
                                        placeholder="86400-000"
                                        className={isFormFieldValid('zipCode') ? "p-invalid uppercase" : "uppercase"}
                                    />
                                </div>
                                {getFormErrorMessage('zipCode')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='state' style={{ marginBottom: '0.5rem' }}>Estado:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-map-marker"></i>
                                    </span>
                                    <InputText
                                        id="state"
                                        name="state"
                                        value={formik.values.state}
                                        onChange={formik.handleChange}
                                        disabled
                                        className={isFormFieldValid('state') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('state')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='city' style={{ marginBottom: '0.5rem' }}>Cidade:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-map-marker"></i>
                                    </span>
                                    <InputText
                                        id="city"
                                        name="city"
                                        value={formik.values.city}
                                        onChange={formik.handleChange}
                                        disabled
                                        className={isFormFieldValid('city') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('city')}
                            </div>
                        </div>
                    </form>
                </div>
            </Dialog>
        </div>
    )
}
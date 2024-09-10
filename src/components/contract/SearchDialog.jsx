import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { useFormik } from 'formik';
import { infoMsg, warnMsg } from "../../functions/ToastMessage";
import { useEffect, useRef, useState } from "react";
import { useContractList } from "../../hooks/contract/useContractList"
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";

export default function SearchDialog(props) {
    const toast = useRef(null);

    const formik = useFormik({
        initialValues: {
            startDate: '',
            endDate: '',
            clientCompany: {},
            seller: {},
        },
        validate: (data) => {
            let errors = {};

            if (!data.startDate) {
                errors.startDate = 'Data de Início é obrigatória.';
            }

            if (!data.endDate) {
                errors.endDate = 'Data de Término é obrigatória.';
            }

            return errors;
        },
        onSubmit: async (values, actions) => {
            const data = values;

            setQueryParams({ ...queryParams, startDate: new Date(formik.values.startDate).toISOString().split('T')[0] });
            setQueryParams({ ...queryParams, endDate: new Date(formik.values.endDate).toISOString().split('T')[1] });
            setQueryParams({ ...queryParams, companyId: data.clientCompany.id });
            setQueryParams({ ...queryParams, sellerId: data.seller.id });

            props.setContractList(contractList);
            props.closeSearchDialog();

            contractList.length === 0 ? warnMsg(toast, 'Nenhum contrato encontrado.') : infoMsg(toast, 'Busca realizada com sucesso. Contratos: ' + contractList.length);
        },
    });

    const isValidDate = (dateString) => {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    };

    const [queryParams, setQueryParams] = useState({
        startDate: formik.values.startDate === '' || !isValidDate(formik.values.startDate) ? new Date().toISOString().split('T')[0] : new Date(formik.values.startDate).toISOString().split('T')[0],
        endDate: formik.values.endDate === '' || !isValidDate(formik.values.endDate) ? new Date().toISOString().split('T')[0] : new Date(formik.values.endDate).toISOString().split('T')[0],
        companyId: formik.values.clientCompany.id,
        sellerId: formik.values.seller.id
    });

    useEffect(() => {
        setQueryParams({
            startDate: formik.values.startDate === '' || !isValidDate(formik.values.startDate) ? new Date().toISOString().split('T')[0] : new Date(formik.values.startDate).toISOString().split('T')[0],
            endDate: formik.values.endDate === '' || !isValidDate(formik.values.endDate) ? new Date().toISOString().split('T')[0] : new Date(formik.values.endDate).toISOString().split('T')[0],
            companyId: formik.values.clientCompany.id,
            sellerId: formik.values.seller.id
        });
    }, [formik.values.startDate, formik.values.endDate, formik.values.clientCompany, formik.values.seller]);

    const { data: contractList } = useContractList(queryParams);

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);

    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const modalFooter = (
        <div>
            <Button label="Buscar" type="submit" icon="pi pi-check" onClick={formik.handleSubmit} autoFocus />
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={props.closeSearchDialog} />
        </div>
    );

    return <>
        <Toast ref={toast} />

        <Dialog header="Buscar Contrato" visible={props.searchVisible} style={{ width: '40vw', minWidth: "40vw" }} breakpoints={{ '1000px': '65vw', '641px': '70vw' }} onHide={() => props.closeSearchDialog(false)}
            footer={modalFooter} draggable={false}>
            <div className="card p-fluid">
                <form onSubmit={formik.handleSubmit}>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor='startDate' style={{ marginBottom: '0.5rem' }}>Data de Início:</label>
                            <div className="p-inputgroup flex-1">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-calendar"></i>
                                </span>
                                <Calendar
                                    id="startDate"
                                    name="startDate"
                                    value={formik.values.startDate}
                                    onChange={(e) => formik.setFieldValue('startDate', new Date(e.value))}
                                    dateFormat="dd/mm/yy" locale="pt-BR"
                                    className={isFormFieldValid('startDate') ? "p-invalid uppercase" : "uppercase"} />
                            </div>
                            {getFormErrorMessage('startDate')}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor='endDate' style={{ marginBottom: '0.5rem' }}>Data de Término:</label>
                            <div className="p-inputgroup flex-1">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-calendar"></i>
                                </span>
                                <Calendar
                                    id="endDate"
                                    name="endDate"
                                    value={formik.values.endDate}
                                    onChange={(e) => formik.setFieldValue('endDate', new Date(e.value))}
                                    dateFormat="dd/mm/yy" locale="pt-BR"
                                    className={isFormFieldValid('endDate') ? "p-invalid uppercase" : "uppercase"} />
                            </div>
                            {getFormErrorMessage('endDate')}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor='clientCompany' style={{ marginBottom: '0.5rem' }}>Empresa:</label>
                            <div className="p-inputgroup flex-1">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-building"></i>
                                </span>
                                <AutoComplete
                                    id="clientCompany"
                                    name="clientCompany"
                                    inputId="id"
                                    value={formik.values.clientCompany}
                                    suggestions={props.companiesFilteredList}
                                    field="tradeName"
                                    completeMethod={props.companyCompleteMethod}
                                    onChange={(e) => formik.setFieldValue('clientCompany', e.value)}
                                    itemTemplate={(company) => company.tradeName.toUpperCase()}
                                    selectedItemTemplate={(company) => company.tradeName.toUpperCase()}
                                    onBlur={formik.handleBlur}
                                    className={isFormFieldValid('clientCompany') ? "p-invalid uppercase" : "uppercase"} />
                            </div>
                            {getFormErrorMessage('clientCompany')}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor='seller' style={{ marginBottom: '0.5rem' }}>Vendedor</label>
                            <div className="p-inputgroup flex-1">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-user"></i>
                                </span>
                                <Dropdown
                                    id="seller"
                                    name="seller"
                                    value={formik.values.seller}
                                    onChange={formik.handleChange}
                                    options={props.sellersList} optionLabel="name"
                                    itemTemplate={(seller) => seller.name.toUpperCase()}
                                    placeholder="SELECIONE" filter
                                    emptyMessage="Nenhum vendedor encontrado"
                                    className={isFormFieldValid('seller') ? "p-invalid uppercase" : "uppercase"} />
                            </div>
                            {getFormErrorMessage('seller')}
                        </div>
                    </div>
                </form>
            </div>
        </Dialog>

    </>
}
import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputMask } from "primereact/inputmask";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { errorMsg, successMsg } from "../../functions/ToastMessage";
import { InputNumber } from "primereact/inputnumber";
import { parseDate } from "../../functions/StringUtils";
import { errorMessageFormatter } from "../../functions/MessageFormatter";
import { useFormik } from 'formik';
import { useContractPost } from "../../hooks/contract/useContractPost";
import { useContractPut } from "../../hooks/contract/useContractPut";
import ContractDatatable from "../contract/ContractDatatable";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { AutoComplete } from "primereact/autocomplete";
import { useCompanyFindAll } from "../../hooks/company/useCompanyFindAll";
import { useSellerFindAll } from "../../hooks/seller/useSellerFindAll";

export default function ContractForm() {
    const [visibleDialog, setVisibleDialog] = useState(false);
    const toast = useRef(null);
    const { mutate: mutatePost, isSuccess } = useContractPost();
    const { mutate: mutatePut } = useContractPut();
    const { data: companiesData, isError: isErrorFindingCompanies } = useCompanyFindAll();
    const [companiesList, setCompaniesList] = useState([]);
    const [companiesFilteredList, setcompaniesFilteredList] = useState([]);
    const { data: sellersData } = useSellerFindAll();
    const [sellersList, setSellersList] = useState([]);
    const newspaperParticipationTimes = ["5 MINUTOS", "10 MINUTOS"];
    const paymentMethods = ["BOLETO", "PIX"];

    const formik = useFormik({
        initialValues: {
            id: undefined,
            clientCompany: undefined,
            seller: '',
            advertisingOrder: undefined,
            quantitySpotDay: undefined,
            spotDuration: undefined,
            startDate: undefined,
            endDate: undefined,
            monthlyPrice: undefined,
            flashQuantity: undefined,
            newspaperParticipation: '',
            paymentMethod: '',
            paymentDueDay: undefined,
            observation: ''
        },
        validate: (data) => {
            let errors = {};

            if (!data.clientCompany) {
                errors.clientCompany = 'Empresa é obrigatória';
            }

            if (!data.seller) {
                errors.seller = 'Vendedor é obrigatório';
            }

            if (!data.advertisingOrder) {
                errors.advertisingOrder = 'Ordem de Propaganda é obrigatória';
            }

            if (data.quantitySpotDay === null) {
                errors.quantitySpotDay = 'Quantidade de Spots/Dia é obrigatório';
            }

            if (!data.spotDuration) {
                errors.spotDuration = 'Tempo do Spot é obrigatório';
            }

            if (!data.startDate) {
                errors.startDate = 'Data de Início é obrigatória';
            }

            if (!data.endDate) {
                errors.endDate = 'Data de Término é obrigatória';
            }

            if (!data.monthlyPrice) {
                errors.monthlyPrice = 'Preço Mensal é obrigatório';
            }

            if (data.flashQuantity === null) {
                errors.flashQuantity = 'Quantidade de Flash é obrigatória';
            }

            if (!data.paymentMethod) {
                errors.paymentMethod = 'Método de Pagamento é obrigatório';
            }

            if (!data.paymentDueDay) {
                errors.paymentDueDay = 'Dia de Pagamento é obrigatório';
            }

            return errors;
        },
        onSubmit: async (values, actions) => {
            const data = values;

            await postContract(data, actions);
        }
    });

    async function postContract(data, actions) {
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

    const closeDialogForm = () => {
        setVisibleDialog(false);
    }

    useEffect(() => {
        closeDialogForm();
    }, [isSuccess]);

    useEffect(() => {
        if (companiesData !== undefined) {
            setCompaniesList(companiesData);
        }
    }, [companiesData]);

    useEffect(() => {
        if (isErrorFindingCompanies) {
            errorMsg(toast, 'Erro ao econtrar empresas.');
        }
    }, [isErrorFindingCompanies]);

    useEffect(() => {
        if (sellersData !== undefined) {
            setSellersList(sellersData);
        }
    }, [sellersData]);

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name]);

    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>;
    };

    const companyCompleteMethod = (ev) => {
        if (companiesList !== undefined) {
            const filterSuggestions = companiesList.filter(e =>
                e.tradeName.toUpperCase().includes(ev.query.toUpperCase())
            );
            setcompaniesFilteredList(filterSuggestions);
        }
    };

    function findCompanyInList(name) {
        const companyFound = companiesList.filter(e => e.tradeName === name).at(0);
        return companyFound;
    }

    function findSellerInList(name) {
        const sellerFound = sellersList.filter(e => e.name === name).at(0);
        return sellerFound;
    }

    function newContract() {
        formik.resetForm();
        formik.setFieldValue('id', undefined);
        formik.setFieldValue('clientCompany', undefined);
        formik.setFieldValue('seller', '');
        formik.setFieldValue('advertisingOrder', undefined);
        formik.setFieldValue('quantitySpotDay', undefined);
        formik.setFieldValue('spotDuration', undefined);
        formik.setFieldValue('startDate', undefined);
        formik.setFieldValue('endDate', undefined);
        formik.setFieldValue('monthlyPrice', undefined);
        formik.setFieldValue('flashQuantity', undefined);
        formik.setFieldValue('newspaperParticipation', '');
        formik.setFieldValue('paymentMethod', '');
        formik.setFieldValue('paymentDueDay', undefined);
        formik.setFieldValue('observation', '');
        setVisibleDialog(true);
    }

    const contractDetails = (contract) => {
        formik.resetForm();
        formik.setFieldValue('id', contract.id);
        formik.setFieldValue('clientCompany', findCompanyInList(contract.companyTradeName));
        formik.setFieldValue('seller', findSellerInList(contract.sellerName));
        formik.setFieldValue('advertisingOrder', contract.advertisingOrder);
        formik.setFieldValue('quantitySpotDay', contract.quantitySpotDay);
        formik.setFieldValue('spotDuration', Number(contract.spotDuration).toFixed(2));
        formik.setFieldValue('startDate', parseDate(contract.startDate));
        formik.setFieldValue('endDate', parseDate(contract.endDate));
        formik.setFieldValue('monthlyPrice', parseFloat(contract.monthlyPriceFmt.substring(3)));
        formik.setFieldValue('flashQuantity', contract.flashQuantity);
        formik.setFieldValue('newspaperParticipation', contract.newspaperParticipation);
        formik.setFieldValue('paymentMethod', contract.paymentMethod);
        formik.setFieldValue('paymentDueDay', contract.paymentDueDay);
        formik.setFieldValue('observation', contract.observation);
        setVisibleDialog(true);
    }

    const startContent = (
        <React.Fragment>
            <Button icon="pi pi-plus-circle" label='Novo' onClick={newContract} />
        </React.Fragment>
    );

    const modalFooter = (
        <div>
            <Button label="Salvar" type="submit" icon="pi pi-check" onClick={formik.handleSubmit} autoFocus />
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={closeDialogForm} />
        </div>
    );

    return (
        <div>
            <Toast ref={toast} />

            <ContractDatatable startContent={startContent} contractDetails={contractDetails} toast={toast} />

            <Dialog header="Detalhes do Contrato" visible={visibleDialog} style={{ width: '45vw', minWidth: "45vw" }} breakpoints={{ '1200px': '65vw', '641px': '70vw' }} onHide={() => setVisibleDialog(false)}
                footer={modalFooter} draggable={false}>
                <div className="card p-fluid">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="p-fluid formgrid grid">
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
                                        suggestions={companiesFilteredList}
                                        field="tradeName"
                                        completeMethod={companyCompleteMethod}
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
                                        options={sellersList} optionLabel="name"
                                        placeholder="SELECIONE" filter
                                        className={isFormFieldValid('seller') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('seller')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='quantitySpotDay' style={{ marginBottom: '0.5rem' }}>Quantidade Spot/Dia:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-chevron-up"></i>
                                    </span>
                                    <InputNumber
                                        id="quantitySpotDay"
                                        name="quantitySpotDay"
                                        value={formik.values.quantitySpotDay}
                                        onValueChange={formik.handleChange}
                                        useGrouping={false}
                                        mode="decimal" showButtons min={0} max={100}
                                        className={isFormFieldValid('quantitySpotDay') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('quantitySpotDay')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='spotDuration' style={{ marginBottom: '0.5rem' }}>Tempo do Spot:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-stopwatch"></i>
                                    </span>
                                    <InputMask
                                        id="spotDuration"
                                        name="spotDuration"
                                        value={formik.values.spotDuration}
                                        onChange={formik.handleChange}
                                        mask="9.99"
                                        placeholder="0.30"
                                        className={isFormFieldValid('spotDuration') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('spotDuration')}
                            </div>

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
                                <label htmlFor='flashQuantity' style={{ marginBottom: '0.5rem' }}>Quantidade Flash:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-chevron-up"></i>
                                    </span>
                                    <InputNumber
                                        id="flashQuantity"
                                        name="flashQuantity"
                                        value={formik.values.flashQuantity}
                                        onValueChange={formik.handleChange}
                                        useGrouping={false}
                                        mode="decimal" showButtons min={0} max={10}
                                        className={isFormFieldValid('flashQuantity') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('flashQuantity')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='newspaperParticipation' style={{ marginBottom: '0.5rem' }}>Participação no Jornal</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-clock"></i>
                                    </span>
                                    <Dropdown
                                        id="newspaperParticipation"
                                        name="newspaperParticipation"
                                        value={formik.values.newspaperParticipation}
                                        onChange={formik.handleChange}
                                        options={newspaperParticipationTimes}
                                        showClear placeholder="Duração"
                                        className={isFormFieldValid('newspaperParticipation') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('newspaperParticipation')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='monthlyPrice' style={{ marginBottom: '0.5rem' }}>Preço Mensal:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-dollar"></i>
                                    </span>
                                    <InputNumber
                                        id="monthlyPrice"
                                        name="monthlyPrice"
                                        value={formik.values.monthlyPrice}
                                        onValueChange={formik.handleChange}
                                        mode="currency" currency="BRL" locale="pt-BR"
                                        placeholder="R$ 500,00"
                                        className={isFormFieldValid('monthlyPrice') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('monthlyPrice')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='paymentMethod' style={{ marginBottom: '0.5rem' }}>Forma de Pagamento</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-wallet"></i>
                                    </span>
                                    <Dropdown
                                        id="paymentMethod"
                                        name="paymentMethod"
                                        value={formik.values.paymentMethod}
                                        onChange={formik.handleChange}
                                        options={paymentMethods}
                                        showClear
                                        className={isFormFieldValid('paymentMethod') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('paymentMethod')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='paymentDueDay' style={{ marginBottom: '0.5rem' }}>Dia de Vencimento:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-calendar"></i>
                                    </span>
                                    <InputNumber
                                        id="paymentDueDay"
                                        name="paymentDueDay"
                                        value={formik.values.paymentDueDay}
                                        onValueChange={formik.handleChange}
                                        useGrouping={false}
                                        mode="decimal" showButtons min={1} max={31}
                                        placeholder="Dia 10"
                                        className={isFormFieldValid('paymentDueDay') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('paymentDueDay')}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor='advertisingOrder' style={{ marginBottom: '0.5rem' }}>Ordem de Propaganda:</label>
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-flag"></i>
                                    </span>
                                    <InputNumber
                                        id="advertisingOrder"
                                        name="advertisingOrder"
                                        value={formik.values.advertisingOrder}
                                        onValueChange={formik.handleChange}
                                        useGrouping={false}
                                        className={isFormFieldValid('advertisingOrder') ? "p-invalid uppercase" : "uppercase"} />
                                </div>
                                {getFormErrorMessage('advertisingOrder')}
                            </div>

                            <div className="field col-12 md:col-12">
                                <label htmlFor='observation' style={{ marginBottom: '0.5rem' }}>Observação:</label>
                                <div className="p-inputgroup flex-1">
                                    <InputTextarea
                                        id="observation"
                                        name="observation"
                                        autoResize
                                        value={formik.values.observation}
                                        onChange={formik.handleChange}
                                        rows={5} cols={30} />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}
import { AutoComplete, type AutoCompleteChangeEvent, type AutoCompleteCompleteEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { useFormik } from 'formik';
import { errorMsg, infoMsg, warnMsg } from "../../functions/ToastMessage";
import { useRef, useState } from "react";
import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { TabPanel, TabView } from "primereact/tabview";
import axios from "axios";
import { isValidDate } from "../../functions/StringUtils";
import type { FormEvent } from "primereact/ts-helpers";
import type { Company, Contract, ContractFindParams, ContractListParams, Seller } from "../../types";

interface SearchDialogProps {
    searchVisible: boolean;
    closeSearchDialog: () => void;
    companiesFilteredList: Company[];
    companyCompleteMethod: (event: AutoCompleteCompleteEvent) => void;
    sellersList: Seller[];
    contractList?: Contract[];
    setContractList: (contracts: Contract[]) => void;
}

interface CompanySellerSearch {
    clientCompany: Partial<Company>;
    seller: Partial<Seller>;
}

interface DateRangeSearch extends CompanySellerSearch {
    startDate: Date | '';
    endDate: Date | '';
}

export default function SearchDialog(props: SearchDialogProps) {
    const toast = useRef<Toast>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [queryParams, setQueryParams] = useState<ContractFindParams>({
        companyId: undefined,
        sellerId: undefined
    });

    const formik1 = useFormik<CompanySellerSearch>({
        initialValues: {
            clientCompany: {},
            seller: {},
        },
        validate: (data) => {
            let errors: Partial<Record<keyof CompanySellerSearch, string>> = {};

            if (!data.clientCompany.id) {
                errors.clientCompany = 'Empresa é obrigatória.';
            }

            if (!data.seller.id) {
                errors.seller = 'Vendedor é obrigatório.';
            }

            return errors;
        },
        onSubmit: async () => {
            const listSize = await findContracts();

            if (listSize === 0) {
                warnMsg(toast, 'Nenhum contrato encontrado.');
                return;
            }

            infoMsg(toast, 'Busca realizada com sucesso. Contratos: ' + listSize);
            props.closeSearchDialog();
        },
    });

    const formik = useFormik<DateRangeSearch>({
        initialValues: {
            startDate: '',
            endDate: '',
            clientCompany: {},
            seller: {},
        },
        validate: (data) => {
            let errors: Partial<Record<keyof DateRangeSearch, string>> = {};

            if (!data.startDate) {
                errors.startDate = 'Data de Início é obrigatória.';
            }

            if (!data.endDate) {
                errors.endDate = 'Data de Término é obrigatória.';
            }

            return errors;
        },
        onSubmit: async () => {
            const listSize = await listContracts();

            if (listSize === 0) {
                warnMsg(toast, 'Nenhum contrato encontrado.');
                return;
            }

            infoMsg(toast, 'Busca realizada com sucesso. Contratos: ' + listSize);
            props.closeSearchDialog();
        },
    });

    const [dateQueryParams, setDateQueryParams] = useState<ContractListParams>({
        startDate: formik.values.startDate === '' || !isValidDate(formik.values.startDate) ? new Date().toISOString().split('T')[0] : new Date(formik.values.startDate).toISOString().split('T')[0],
        endDate: formik.values.endDate === '' || !isValidDate(formik.values.endDate) ? new Date().toISOString().split('T')[0] : new Date(formik.values.endDate).toISOString().split('T')[0],
        companyId: undefined,
        sellerId: undefined
    });

    async function findContracts() {
        try {
            const response = await axios.get<Contract[]>(import.meta.env.VITE_API_BASE_URL + '/contracts/find', {
                params: queryParams
            });
            props.setContractList(response.data);
            const listSize = response.data.length;
            return listSize;
        } catch (error) {
            errorMsg(toast, 'Ocorreu um erro ao buscar contrato.');
        }
    }

    async function listContracts() {
        try {
            const response = await axios.get<Contract[]>(import.meta.env.VITE_API_BASE_URL + '/contracts/list', {
                params: dateQueryParams
            });
            props.setContractList(response.data);
            const listSize = response.data.length;
            return listSize;
        } catch (error) {
            errorMsg(toast, 'Ocorreu um erro ao buscar contrato.');
        }
    }

    const isForm1FieldValid = (name: keyof CompanySellerSearch) => !!(formik1.touched[name] && formik1.errors[name]);

    const getForm1ErrorMessage = (name: keyof CompanySellerSearch) => {
        return isForm1FieldValid(name) && <small className="p-error">{formik1.errors[name] as string}</small>;
    };

    const isFormFieldValid = (name: keyof DateRangeSearch) => !!(formik.touched[name] && formik.errors[name]);

    const getFormErrorMessage = (name: keyof DateRangeSearch) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name] as string}</small>;
    };

    const onClickSearch = () => {
        if (activeIndex === 0) {
            formik1.handleSubmit();
            return;
        }
        formik.handleSubmit();
    }

    const onChangeCompanyForm1 = (e: AutoCompleteChangeEvent) => {
        formik1.setFieldValue('clientCompany', e.value);
        setQueryParams({ ...queryParams, companyId: e.value.id });
    }

    const onChangeSellerForm1 = (e: DropdownChangeEvent) => {
        formik1.setFieldValue('seller', e.value);
        setQueryParams({ ...queryParams, sellerId: e.value.id });
    }

    const onChangeStartDate = (e: FormEvent<Date>) => {
        formik.setFieldValue('startDate', e.value);
        setDateQueryParams({ ...dateQueryParams, startDate: formik.values.startDate === '' || !isValidDate(formik.values.startDate) ? new Date().toISOString().split('T')[0] : new Date(formik.values.startDate).toISOString().split('T')[0] });
    }

    const onChangeEndDate = (e: FormEvent<Date>) => {
        formik.setFieldValue('endDate', e.value);
        setDateQueryParams({ ...dateQueryParams, endDate: formik.values.endDate === '' || !isValidDate(formik.values.endDate) ? new Date().toISOString().split('T')[0] : new Date(formik.values.endDate).toISOString().split('T')[0] });
    }

    const onChangeCompany = (e: AutoCompleteChangeEvent) => {
        formik.setFieldValue('clientCompany', e.value);
        setDateQueryParams({ ...dateQueryParams, companyId: e.value.id });
    }

    const onChangeSeller = (e: DropdownChangeEvent) => {
        formik.setFieldValue('seller', e.value);
        setDateQueryParams({ ...dateQueryParams, sellerId: e.value.id });
    }

    const modalFooter = (
        <div>
            <Button label="Buscar" type="submit" icon="pi pi-check" onClick={onClickSearch} autoFocus />
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={props.closeSearchDialog} />
        </div>
    );

    return <>
        <Toast ref={toast} />

        <Dialog header="Buscar Contrato" visible={props.searchVisible} style={{ width: '40vw', minWidth: "40vw" }} breakpoints={{ '1000px': '65vw', '641px': '70vw' }} onHide={() => props.closeSearchDialog()}
            footer={modalFooter} draggable={false}>
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Vendedor/Empresa">
                    <form>
                        <div className="card p-fluid">
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
                                            value={formik1.values.clientCompany}
                                            suggestions={props.companiesFilteredList}
                                            field="tradeName"
                                            completeMethod={props.companyCompleteMethod}
                                            onChange={onChangeCompanyForm1}
                                            itemTemplate={(company: Company) => company.tradeName.toUpperCase()}
                                            selectedItemTemplate={(company: Company) => company.tradeName.toUpperCase()}
                                            onBlur={formik1.handleBlur}
                                            className={isForm1FieldValid('clientCompany') ? "p-invalid uppercase" : "uppercase"} />
                                    </div>
                                    {getForm1ErrorMessage('clientCompany')}
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
                                            value={formik1.values.seller}
                                            onChange={onChangeSellerForm1}
                                            options={props.sellersList} optionLabel="name"
                                            itemTemplate={(seller: Seller) => seller.name.toUpperCase()}
                                            placeholder="SELECIONE" filter
                                            emptyMessage="Nenhum vendedor encontrado"
                                            className={isForm1FieldValid('seller') ? "p-invalid uppercase" : "uppercase"} />
                                    </div>
                                    {getForm1ErrorMessage('seller')}
                                </div>
                            </div>
                        </div>
                    </form>
                </TabPanel>
                <TabPanel header="Data Inicial/Data Final">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="card p-fluid">
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
                                            value={formik.values.startDate || null}
                                            onChange={onChangeStartDate}
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
                                            value={formik.values.endDate || null}
                                            onChange={onChangeEndDate}
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
                                            onChange={onChangeCompany}
                                            itemTemplate={(company: Company) => company.tradeName.toUpperCase()}
                                            selectedItemTemplate={(company: Company) => company.tradeName.toUpperCase()}
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
                                            onChange={onChangeSeller}
                                            options={props.sellersList} optionLabel="name"
                                            itemTemplate={(seller: Seller) => seller.name.toUpperCase()}
                                            placeholder="SELECIONE" filter
                                            emptyMessage="Nenhum vendedor encontrado"
                                            className={isFormFieldValid('seller') ? "p-invalid uppercase" : "uppercase"} />
                                    </div>
                                    {getFormErrorMessage('seller')}
                                </div>
                            </div>
                        </div>
                    </form>
                </TabPanel>
            </TabView>
        </Dialog >

    </>
}
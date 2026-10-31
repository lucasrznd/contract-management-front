import { useEffect, useId } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { isAxiosError } from 'axios';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ui/Modal';
import FormField from '../ui/FormField';
import { FormGrid, FormSection, FormWide } from '../ui/FormLayout';
import CompanyPicker from '../company/CompanyPicker';
import SellerPicker from '../seller/SellerPicker';
import { useToast } from '../ui/toast/ToastProvider';
import {
    BuildingIcon,
    CalendarIcon,
    ClockIcon,
    FlagIcon,
    HashIcon,
    MegaphoneIcon,
    MoneyIcon,
    RadioIcon,
    UserIcon,
    WalletIcon,
} from '../icons';
import { useContractPost } from '../../hooks/contract/useContractPost';
import { useContractPut } from '../../hooks/contract/useContractPut';
import { useCompanyFindAll } from '../../hooks/company/useCompanyFindAll';
import { useSellerFindAll } from '../../hooks/seller/useSellerFindAll';
import { formatCode, parseDate, parseMoney } from '../../functions/StringUtils';
import { errorMessageFormatter } from '../../functions/MessageFormatter';
import { fieldError } from '../../functions/formik';
import '../../functions/locale';
import type { Company, Contract, ContractFormValues, PaymentMethod, Seller } from '../../types';

interface ContractFields {
    clientCompany: Company | null;
    seller: Seller | null;
    advertisingOrder: string;
    quantitySpotDay: number | null;
    spotDuration: string;
    testimonialQuantity: number | null;
    testimonialDuration: string;
    flashQuantity: number | null;
    newspaperParticipation: string;
    startDate: Date | null;
    endDate: Date | null;
    monthlyPrice: number | null;
    paymentMethod: PaymentMethod | '';
    paymentDueDay: number | null;
    observation: string;
}

const newspaperParticipationTimes = ['5 MINUTOS', '10 MINUTOS', '15 MINUTOS'];
const paymentMethods: { label: string; value: PaymentMethod }[] = [
    { label: 'Boleto', value: 'BOLETO' },
    { label: 'Pix', value: 'PIX' },
];

const requiredCount = (message: string) => Yup.number().nullable().required(message).min(0, 'Use 0 ou mais.');
const duration = (message: string) =>
    Yup.string()
        .required(message)
        .matches(/^\d\.\d\d$/, 'Use minutos e segundos, ex.: 0.30.');

const validationSchema = Yup.object({
    clientCompany: Yup.object().nullable().required('Selecione a empresa.'),
    seller: Yup.object().nullable().required('Selecione o vendedor.'),
    advertisingOrder: Yup.string().trim().required('Informe a ordem de propaganda.'),
    quantitySpotDay: requiredCount('Informe a quantidade de spots por dia.'),
    spotDuration: duration('Informe o tempo do spot.'),
    testimonialQuantity: requiredCount('Informe a quantidade de testemunhais.'),
    testimonialDuration: duration('Informe o tempo do testemunhal.'),
    flashQuantity: requiredCount('Informe a quantidade de flashes.'),
    startDate: Yup.date().nullable().required('Informe a data de início.'),
    endDate: Yup.date()
        .nullable()
        .required('Informe a data de término.')
        .when('startDate', ([startDate], schema) =>
            startDate ? schema.min(startDate, 'O término deve ser depois do início.') : schema,
        ),
    monthlyPrice: Yup.number().nullable().required('Informe o preço mensal.').positive('Informe o preço mensal.'),
    paymentMethod: Yup.string().required('Selecione a forma de pagamento.'),
    paymentDueDay: Yup.number().nullable().required('Informe o dia de vencimento.'),
});

function toFields(contract: Contract | null, companies: Company[], sellers: Seller[]): ContractFields {
    return {
        // The API returns names only, so the records are looked up in the loaded lists.
        clientCompany: companies.find((c) => c.tradeName === contract?.companyTradeName) ?? null,
        seller: sellers.find((s) => s.name === contract?.sellerName) ?? null,
        advertisingOrder: contract?.advertisingOrder ?? '',
        quantitySpotDay: contract?.quantitySpotDay ?? null,
        spotDuration: contract ? Number(contract.spotDuration).toFixed(2) : '',
        testimonialQuantity: contract?.testimonialQuantity ?? null,
        testimonialDuration: contract ? Number(contract.testimonialDuration).toFixed(2) : '',
        flashQuantity: contract?.flashQuantity ?? null,
        newspaperParticipation: contract?.newspaperParticipation ?? '',
        startDate: contract ? parseDate(contract.startDate) : null,
        endDate: contract ? parseDate(contract.endDate) : null,
        monthlyPrice: contract ? parseMoney(contract.monthlyPriceFmt) : null,
        paymentMethod: contract?.paymentMethod ?? '',
        paymentDueDay: contract?.paymentDueDay ?? null,
        observation: contract?.observation ?? '',
    };
}

function toPayload(fields: ContractFields, id?: number): ContractFormValues {
    return {
        id,
        clientCompany: fields.clientCompany ?? undefined,
        seller: fields.seller ?? '',
        advertisingOrder: fields.advertisingOrder.trim(),
        quantitySpotDay: fields.quantitySpotDay,
        spotDuration: fields.spotDuration,
        testimonialQuantity: fields.testimonialQuantity,
        testimonialDuration: fields.testimonialDuration,
        flashQuantity: fields.flashQuantity,
        newspaperParticipation: fields.newspaperParticipation ?? '',
        startDate: fields.startDate ?? undefined,
        endDate: fields.endDate ?? undefined,
        monthlyPrice: fields.monthlyPrice,
        paymentMethod: fields.paymentMethod,
        paymentDueDay: fields.paymentDueDay,
        observation: fields.observation,
    };
}

interface ContractFormDialogProps {
    visible: boolean;
    onHide: () => void;
    /** Contract being edited; null to register a new one. */
    contract: Contract | null;
}

/** Remount it (change its `key`) for each contract so the form starts from that contract's data. */
export default function ContractFormDialog({ visible, onHide, contract }: ContractFormDialogProps) {
    const titleId = useId();
    const toast = useToast();
    const createContract = useContractPost();
    const updateContract = useContractPut();
    const { data: companiesData } = useCompanyFindAll();
    const { data: sellersData } = useSellerFindAll();
    const companies = Array.isArray(companiesData) ? companiesData : [];
    const sellers = Array.isArray(sellersData) ? sellersData : [];
    const isEditing = contract !== null;

    const formik = useFormik<ContractFields>({
        initialValues: toFields(contract, companies, sellers),
        validationSchema,
        onSubmit: async (fields) => {
            try {
                if (isEditing) {
                    await updateContract.mutateAsync(toPayload(fields, contract.id));
                    toast.success('Alterações salvas');
                } else {
                    await createContract.mutateAsync(toPayload(fields));
                    toast.success('Contrato cadastrado');
                }
                onHide();
            } catch (err) {
                const apiMessage = isAxiosError(err) ? errorMessageFormatter(err.response?.data?.message) : undefined;
                toast.error(apiMessage ?? 'Não foi possível salvar o contrato.');
            }
        },
    });

    // When editing before the company/seller lists have loaded, fill them in once they arrive.
    const { setFieldValue, values } = formik;
    useEffect(() => {
        if (!contract) return;
        if (!values.clientCompany && companies.length) {
            const company = companies.find((c) => c.tradeName === contract.companyTradeName);
            if (company) setFieldValue('clientCompany', company);
        }
        if (!values.seller && sellers.length) {
            const seller = sellers.find((s) => s.name === contract.sellerName);
            if (seller) setFieldValue('seller', seller);
        }
        // Only reacts to the lists arriving.
    }, [companies.length, sellers.length]);

    const error = (name: keyof ContractFields) => fieldError(formik, name);
    const invalidProps = (name: keyof ContractFields, id: string) => ({
        invalid: !!error(name),
        'aria-invalid': !!error(name),
        'aria-describedby': error(name) ? `${id}-error` : undefined,
    });
    const numberProps = (name: keyof ContractFields, id: string) => ({
        inputId: id,
        name,
        value: formik.values[name] as number | null,
        onValueChange: (e: { value?: number | null }) => formik.setFieldValue(name, e.value ?? null),
        onBlur: () => formik.setFieldTouched(name, true),
        useGrouping: false,
        ...invalidProps(name, id),
    });

    return (
        <Modal visible={visible} onHide={onHide} labelledBy={titleId} width={760} position="center">
            <form onSubmit={formik.handleSubmit} noValidate>
                <ModalHeader
                    id={titleId}
                    title={isEditing ? 'Editar contrato' : 'Novo contrato'}
                    subtitle={isEditing ? `Código ${formatCode(contract.id)}` : 'Preencha os dados para cadastrar.'}
                    onClose={onHide}
                />

                <ModalBody>
                    <FormSection title="Cliente">
                        <FormGrid>
                            <FormField
                                id="contract-company"
                                label="Empresa"
                                required
                                icon={<BuildingIcon />}
                                error={error('clientCompany')}
                            >
                                <CompanyPicker
                                    inputId="contract-company"
                                    value={formik.values.clientCompany}
                                    onChange={(company) => formik.setFieldValue('clientCompany', company)}
                                    onBlur={() => formik.setFieldTouched('clientCompany', true)}
                                    {...invalidProps('clientCompany', 'contract-company')}
                                />
                            </FormField>
                            <FormField
                                id="contract-seller"
                                label="Vendedor"
                                required
                                icon={<UserIcon />}
                                error={error('seller')}
                            >
                                <SellerPicker
                                    inputId="contract-seller"
                                    value={formik.values.seller}
                                    onChange={(seller) => formik.setFieldValue('seller', seller)}
                                    onBlur={() => formik.setFieldTouched('seller', true)}
                                    {...invalidProps('seller', 'contract-seller')}
                                />
                            </FormField>
                            <FormField
                                id="contract-advertisingOrder"
                                label="Ordem de propaganda"
                                required
                                icon={<FlagIcon />}
                                error={error('advertisingOrder')}
                            >
                                <InputText
                                    id="contract-advertisingOrder"
                                    name="advertisingOrder"
                                    value={formik.values.advertisingOrder}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    {...invalidProps('advertisingOrder', 'contract-advertisingOrder')}
                                />
                            </FormField>
                        </FormGrid>
                    </FormSection>

                    <FormSection title="Veiculação">
                        <FormGrid>
                            <FormField
                                id="contract-quantitySpotDay"
                                label="Spots por dia"
                                required
                                icon={<RadioIcon />}
                                error={error('quantitySpotDay')}
                            >
                                <InputNumber
                                    {...numberProps('quantitySpotDay', 'contract-quantitySpotDay')}
                                    min={0}
                                    max={100}
                                />
                            </FormField>
                            <FormField
                                id="contract-spotDuration"
                                label="Tempo do spot"
                                required
                                icon={<ClockIcon />}
                                error={error('spotDuration')}
                                hint="Minutos e segundos, ex.: 0.30."
                            >
                                <InputMask
                                    id="contract-spotDuration"
                                    name="spotDuration"
                                    value={formik.values.spotDuration}
                                    onChange={(e) => formik.setFieldValue('spotDuration', e.value ?? '')}
                                    onBlur={formik.handleBlur}
                                    mask="9.99"
                                    placeholder="0.30"
                                    {...invalidProps('spotDuration', 'contract-spotDuration')}
                                />
                            </FormField>
                            <FormField
                                id="contract-testimonialQuantity"
                                label="Testemunhais"
                                required
                                icon={<MegaphoneIcon />}
                                error={error('testimonialQuantity')}
                            >
                                <InputNumber
                                    {...numberProps('testimonialQuantity', 'contract-testimonialQuantity')}
                                    min={0}
                                    max={100}
                                />
                            </FormField>
                            <FormField
                                id="contract-testimonialDuration"
                                label="Tempo do testemunhal"
                                required
                                icon={<ClockIcon />}
                                error={error('testimonialDuration')}
                                hint="Minutos e segundos, ex.: 1.00."
                            >
                                <InputMask
                                    id="contract-testimonialDuration"
                                    name="testimonialDuration"
                                    value={formik.values.testimonialDuration}
                                    onChange={(e) => formik.setFieldValue('testimonialDuration', e.value ?? '')}
                                    onBlur={formik.handleBlur}
                                    mask="9.99"
                                    placeholder="0.30"
                                    {...invalidProps('testimonialDuration', 'contract-testimonialDuration')}
                                />
                            </FormField>
                            <FormField
                                id="contract-flashQuantity"
                                label="Flashes"
                                required
                                icon={<HashIcon />}
                                error={error('flashQuantity')}
                            >
                                <InputNumber
                                    {...numberProps('flashQuantity', 'contract-flashQuantity')}
                                    min={0}
                                    max={10}
                                />
                            </FormField>
                            <FormField
                                id="contract-newspaperParticipation"
                                label="Participação no jornal"
                                icon={<RadioIcon />}
                            >
                                <Dropdown
                                    inputId="contract-newspaperParticipation"
                                    value={formik.values.newspaperParticipation || null}
                                    options={newspaperParticipationTimes}
                                    showClear
                                    placeholder="Não participa"
                                    onChange={(e) => formik.setFieldValue('newspaperParticipation', e.value ?? '')}
                                />
                            </FormField>
                        </FormGrid>
                    </FormSection>

                    <FormSection title="Vigência e pagamento">
                        <FormGrid>
                            <FormField
                                id="contract-startDate"
                                label="Início"
                                required
                                icon={<CalendarIcon />}
                                error={error('startDate')}
                            >
                                <Calendar
                                    inputId="contract-startDate"
                                    value={formik.values.startDate}
                                    onChange={(e) => formik.setFieldValue('startDate', e.value ?? null)}
                                    onBlur={() => formik.setFieldTouched('startDate', true)}
                                    dateFormat="dd/mm/yy"
                                    locale="pt-BR"
                                    placeholder="dd/mm/aaaa"
                                    {...invalidProps('startDate', 'contract-startDate')}
                                />
                            </FormField>
                            <FormField
                                id="contract-endDate"
                                label="Término"
                                required
                                icon={<CalendarIcon />}
                                error={error('endDate')}
                            >
                                <Calendar
                                    inputId="contract-endDate"
                                    value={formik.values.endDate}
                                    onChange={(e) => formik.setFieldValue('endDate', e.value ?? null)}
                                    onBlur={() => formik.setFieldTouched('endDate', true)}
                                    dateFormat="dd/mm/yy"
                                    locale="pt-BR"
                                    placeholder="dd/mm/aaaa"
                                    minDate={formik.values.startDate ?? undefined}
                                    {...invalidProps('endDate', 'contract-endDate')}
                                />
                            </FormField>
                            <FormField
                                id="contract-monthlyPrice"
                                label="Preço mensal"
                                required
                                icon={<MoneyIcon />}
                                error={error('monthlyPrice')}
                            >
                                <InputNumber
                                    {...numberProps('monthlyPrice', 'contract-monthlyPrice')}
                                    useGrouping
                                    mode="currency"
                                    currency="BRL"
                                    locale="pt-BR"
                                    placeholder="R$ 500,00"
                                />
                            </FormField>
                            <FormField
                                id="contract-paymentMethod"
                                label="Forma de pagamento"
                                required
                                icon={<WalletIcon />}
                                error={error('paymentMethod')}
                            >
                                <Dropdown
                                    inputId="contract-paymentMethod"
                                    value={formik.values.paymentMethod || null}
                                    options={paymentMethods}
                                    placeholder="Selecione"
                                    onChange={(e) => formik.setFieldValue('paymentMethod', e.value ?? '')}
                                    onBlur={() => formik.setFieldTouched('paymentMethod', true)}
                                    {...invalidProps('paymentMethod', 'contract-paymentMethod')}
                                />
                            </FormField>
                            <FormField
                                id="contract-paymentDueDay"
                                label="Dia de vencimento"
                                required
                                icon={<CalendarIcon />}
                                error={error('paymentDueDay')}
                            >
                                <InputNumber
                                    {...numberProps('paymentDueDay', 'contract-paymentDueDay')}
                                    min={1}
                                    max={31}
                                    placeholder="10"
                                />
                            </FormField>
                        </FormGrid>
                    </FormSection>

                    <FormSection title="Observações">
                        <FormWide>
                            <FormField id="contract-observation" label="Observação">
                                <InputTextarea
                                    id="contract-observation"
                                    name="observation"
                                    value={formik.values.observation}
                                    onChange={formik.handleChange}
                                    autoResize
                                    rows={3}
                                    placeholder="Opcional"
                                />
                            </FormField>
                        </FormWide>
                    </FormSection>
                </ModalBody>

                <ModalFooter>
                    <Button type="button" label="Cancelar" outlined onClick={onHide} />
                    <Button
                        type="submit"
                        label={isEditing ? 'Salvar alterações' : 'Cadastrar contrato'}
                        loading={formik.isSubmitting}
                    />
                </ModalFooter>
            </form>
        </Modal>
    );
}

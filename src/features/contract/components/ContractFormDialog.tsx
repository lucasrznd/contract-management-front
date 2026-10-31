import { useEffect, useId } from 'react';
import { Controller, useForm, type ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/shared/components/ui/Modal';
import FormField from '@/shared/components/ui/FormField';
import { FormGrid, FormSection, FormWide } from '@/shared/components/ui/FormLayout';
import CompanyPicker from '@/features/company/components/CompanyPicker';
import SellerPicker from '@/features/seller/components/SellerPicker';
import { useToast } from '@/shared/components/ui/toast/ToastProvider';
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
} from '@/shared/components/icons';
import { useContractCreate, useContractUpdate } from '../service/contract.service';
import { useCompanyFindAll } from '@/features/company/service/company.service';
import { useSellerFindAll } from '@/features/seller/service/seller.service';
import { formatCode, parseDate, parseMoney } from '@/shared/helpers/stringUtils.helper';
import { invalidProps, textFieldProps } from '@/shared/helpers/form.helper';
import { contractFormSchema, type ContractFormData, type ContractFormFields } from '../schema/ContractFormSchema';
import '@/shared/config/locale';
import type { Contract, ContractFormValues, PaymentMethod } from '../types/contract.types';

const newspaperParticipationTimes = ['5 MINUTOS', '10 MINUTOS', '15 MINUTOS'];
const paymentMethods: { label: string; value: PaymentMethod }[] = [
    { label: 'Boleto', value: 'BOLETO' },
    { label: 'Pix', value: 'PIX' },
];

type NumberField = 'quantitySpotDay' | 'testimonialQuantity' | 'flashQuantity' | 'monthlyPrice' | 'paymentDueDay';

function toPayload(fields: ContractFormData, id?: number): ContractFormValues {
    return {
        id,
        clientCompany: fields.clientCompany,
        seller: fields.seller,
        advertisingOrder: fields.advertisingOrder.trim(),
        quantitySpotDay: fields.quantitySpotDay,
        spotDuration: fields.spotDuration,
        testimonialQuantity: fields.testimonialQuantity,
        testimonialDuration: fields.testimonialDuration,
        flashQuantity: fields.flashQuantity,
        newspaperParticipation: fields.newspaperParticipation,
        startDate: fields.startDate,
        endDate: fields.endDate,
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
    const { mutate: createContract, isPending: isCreating } = useContractCreate();
    const { mutate: updateContract, isPending: isUpdating } = useContractUpdate();
    const { data: companiesData } = useCompanyFindAll();
    const { data: sellersData } = useSellerFindAll();
    const companies = Array.isArray(companiesData) ? companiesData : [];
    const sellers = Array.isArray(sellersData) ? sellersData : [];
    const isEditing = contract !== null;

    const form = useForm<ContractFormFields, unknown, ContractFormData>({
        resolver: zodResolver(contractFormSchema),
        // Errors show up after leaving the field or trying to save, not while typing for the first time.
        mode: 'onTouched',
        defaultValues: {
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
        },
    });
    const { control, formState, getValues, setValue } = form;
    const { errors } = formState;

    const onSubmit = (fields: ContractFormData) => {
        if (isEditing) {
            updateContract(
                { id: contract.id, data: toPayload(fields, contract.id) },
                {
                    onSuccess: () => {
                        toast.success('Alterações salvas');
                        onHide();
                    },
                },
            );
            return;
        }
        createContract(
            { data: toPayload(fields) },
            {
                onSuccess: () => {
                    toast.success('Contrato cadastrado');
                    onHide();
                },
            },
        );
    };

    // When editing before the company/seller lists have loaded, fill them in once they arrive.
    useEffect(() => {
        if (!contract) return;
        if (!getValues('clientCompany') && companies.length) {
            const company = companies.find((c) => c.tradeName === contract.companyTradeName);
            if (company) setValue('clientCompany', company);
        }
        if (!getValues('seller') && sellers.length) {
            const seller = sellers.find((s) => s.name === contract.sellerName);
            if (seller) setValue('seller', seller);
        }
        // Only reacts to the lists arriving.
    }, [companies.length, sellers.length]);

    const startDate = form.watch('startDate');
    const error = (name: keyof ContractFormFields) => errors[name]?.message;
    const numberProps = (field: ControllerRenderProps<ContractFormFields, NumberField>, id: string) => ({
        inputId: id,
        inputRef: field.ref,
        name: field.name,
        value: field.value,
        onValueChange: (e: { value?: number | null }) => field.onChange(e.value ?? null),
        onBlur: field.onBlur,
        useGrouping: false,
        ...invalidProps(error(field.name), id),
    });

    return (
        <Modal visible={visible} onHide={onHide} labelledBy={titleId} width={760} position="center">
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
                                <Controller
                                    control={control}
                                    name="clientCompany"
                                    render={({ field }) => (
                                        <CompanyPicker
                                            inputId="contract-company"
                                            value={field.value}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            {...invalidProps(error('clientCompany'), 'contract-company')}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField
                                id="contract-seller"
                                label="Vendedor"
                                required
                                icon={<UserIcon />}
                                error={error('seller')}
                            >
                                <Controller
                                    control={control}
                                    name="seller"
                                    render={({ field }) => (
                                        <SellerPicker
                                            inputId="contract-seller"
                                            value={field.value}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            {...invalidProps(error('seller'), 'contract-seller')}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField
                                id="contract-advertisingOrder"
                                label="Ordem de propaganda"
                                required
                                icon={<FlagIcon />}
                                error={error('advertisingOrder')}
                            >
                                <InputText {...textFieldProps(form, 'advertisingOrder', 'contract-advertisingOrder')} />
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
                                <Controller
                                    control={control}
                                    name="quantitySpotDay"
                                    render={({ field }) => (
                                        <InputNumber
                                            {...numberProps(field, 'contract-quantitySpotDay')}
                                            min={0}
                                            max={100}
                                        />
                                    )}
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
                                <Controller
                                    control={control}
                                    name="spotDuration"
                                    render={({ field }) => (
                                        <InputMask
                                            id="contract-spotDuration"
                                            name={field.name}
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.value ?? '')}
                                            onBlur={field.onBlur}
                                            mask="9.99"
                                            placeholder="0.30"
                                            {...invalidProps(error('spotDuration'), 'contract-spotDuration')}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField
                                id="contract-testimonialQuantity"
                                label="Testemunhais"
                                required
                                icon={<MegaphoneIcon />}
                                error={error('testimonialQuantity')}
                            >
                                <Controller
                                    control={control}
                                    name="testimonialQuantity"
                                    render={({ field }) => (
                                        <InputNumber
                                            {...numberProps(field, 'contract-testimonialQuantity')}
                                            min={0}
                                            max={100}
                                        />
                                    )}
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
                                <Controller
                                    control={control}
                                    name="testimonialDuration"
                                    render={({ field }) => (
                                        <InputMask
                                            id="contract-testimonialDuration"
                                            name={field.name}
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.value ?? '')}
                                            onBlur={field.onBlur}
                                            mask="9.99"
                                            placeholder="0.30"
                                            {...invalidProps(
                                                error('testimonialDuration'),
                                                'contract-testimonialDuration',
                                            )}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField
                                id="contract-flashQuantity"
                                label="Flashes"
                                required
                                icon={<HashIcon />}
                                error={error('flashQuantity')}
                            >
                                <Controller
                                    control={control}
                                    name="flashQuantity"
                                    render={({ field }) => (
                                        <InputNumber
                                            {...numberProps(field, 'contract-flashQuantity')}
                                            min={0}
                                            max={10}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField
                                id="contract-newspaperParticipation"
                                label="Participação no jornal"
                                icon={<RadioIcon />}
                            >
                                <Controller
                                    control={control}
                                    name="newspaperParticipation"
                                    render={({ field }) => (
                                        <Dropdown
                                            inputId="contract-newspaperParticipation"
                                            value={field.value || null}
                                            options={newspaperParticipationTimes}
                                            showClear
                                            placeholder="Não participa"
                                            onChange={(e) => field.onChange(e.value ?? '')}
                                        />
                                    )}
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
                                <Controller
                                    control={control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <Calendar
                                            inputId="contract-startDate"
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.value ?? null)}
                                            onBlur={field.onBlur}
                                            dateFormat="dd/mm/yy"
                                            locale="pt-BR"
                                            placeholder="dd/mm/aaaa"
                                            {...invalidProps(error('startDate'), 'contract-startDate')}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField
                                id="contract-endDate"
                                label="Término"
                                required
                                icon={<CalendarIcon />}
                                error={error('endDate')}
                            >
                                <Controller
                                    control={control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <Calendar
                                            inputId="contract-endDate"
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.value ?? null)}
                                            onBlur={field.onBlur}
                                            dateFormat="dd/mm/yy"
                                            locale="pt-BR"
                                            placeholder="dd/mm/aaaa"
                                            minDate={startDate ?? undefined}
                                            {...invalidProps(error('endDate'), 'contract-endDate')}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField
                                id="contract-monthlyPrice"
                                label="Preço mensal"
                                required
                                icon={<MoneyIcon />}
                                error={error('monthlyPrice')}
                            >
                                <Controller
                                    control={control}
                                    name="monthlyPrice"
                                    render={({ field }) => (
                                        <InputNumber
                                            {...numberProps(field, 'contract-monthlyPrice')}
                                            useGrouping
                                            mode="currency"
                                            currency="BRL"
                                            locale="pt-BR"
                                            placeholder="R$ 500,00"
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField
                                id="contract-paymentMethod"
                                label="Forma de pagamento"
                                required
                                icon={<WalletIcon />}
                                error={error('paymentMethod')}
                            >
                                <Controller
                                    control={control}
                                    name="paymentMethod"
                                    render={({ field }) => (
                                        <Dropdown
                                            inputId="contract-paymentMethod"
                                            value={field.value || null}
                                            options={paymentMethods}
                                            placeholder="Selecione"
                                            onChange={(e) => field.onChange(e.value ?? '')}
                                            onBlur={field.onBlur}
                                            {...invalidProps(error('paymentMethod'), 'contract-paymentMethod')}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField
                                id="contract-paymentDueDay"
                                label="Dia de vencimento"
                                required
                                icon={<CalendarIcon />}
                                error={error('paymentDueDay')}
                            >
                                <Controller
                                    control={control}
                                    name="paymentDueDay"
                                    render={({ field }) => (
                                        <InputNumber
                                            {...numberProps(field, 'contract-paymentDueDay')}
                                            min={1}
                                            max={31}
                                            placeholder="10"
                                        />
                                    )}
                                />
                            </FormField>
                        </FormGrid>
                    </FormSection>

                    <FormSection title="Observações">
                        <FormWide>
                            <FormField id="contract-observation" label="Observação">
                                <InputTextarea
                                    id="contract-observation"
                                    {...form.register('observation')}
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
                        loading={isCreating || isUpdating}
                    />
                </ModalFooter>
            </form>
        </Modal>
    );
}

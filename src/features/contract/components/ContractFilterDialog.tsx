import { useId } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/shared/components/ui/Modal';
import FormField from '@/shared/components/ui/FormField';
import { FormGrid } from '@/shared/components/ui/FormLayout';
import SegmentedControl from '@/shared/components/ui/SegmentedControl';
import CompanyPicker from '@/features/company/components/CompanyPicker';
import SellerPicker from '@/features/seller/components/SellerPicker';
import { BuildingIcon, CalendarIcon, UserIcon } from '@/shared/components/icons';
import { toIsoDate } from '@/shared/helpers/stringUtils.helper';
import { fieldError } from '@/shared/helpers/formik.helper';
import '@/shared/config/locale';
import type { ContractFilter } from '../types/contract.types';
import type { Company } from '@/features/company/types/company.types';
import type { Seller } from '@/features/seller/types/seller.types';

type Mode = ContractFilter['kind'];

interface FilterFields {
    mode: Mode;
    company: Company | null;
    seller: Seller | null;
    startDate: Date | null;
    endDate: Date | null;
}

const validationSchema = Yup.object({
    mode: Yup.string(),
    company: Yup.object()
        .nullable()
        .when('mode', ([mode], schema) =>
            mode === 'company-seller' ? schema.required('Selecione a empresa.') : schema,
        ),
    seller: Yup.object()
        .nullable()
        .when('mode', ([mode], schema) =>
            mode === 'company-seller' ? schema.required('Selecione o vendedor.') : schema,
        ),
    startDate: Yup.date()
        .nullable()
        .when('mode', ([mode], schema) => (mode === 'period' ? schema.required('Informe a data inicial.') : schema)),
    endDate: Yup.date()
        .nullable()
        .when(['mode', 'startDate'], ([mode, startDate], schema) => {
            if (mode !== 'period') return schema;
            const required = schema.required('Informe a data final.');
            return startDate ? required.min(startDate, 'A data final deve ser depois da inicial.') : required;
        }),
});

function toFilter({ mode, company, seller, startDate, endDate }: FilterFields): ContractFilter {
    if (mode === 'company-seller') {
        return {
            kind: mode,
            label: `${company!.tradeName} · ${seller!.name}`,
            params: { companyId: company!.id, sellerId: seller!.id },
        };
    }
    const period = `${startDate!.toLocaleDateString('pt-BR')} – ${endDate!.toLocaleDateString('pt-BR')}`;
    return {
        kind: mode,
        label: [period, company?.tradeName, seller?.name].filter(Boolean).join(' · '),
        params: {
            startDate: toIsoDate(startDate!),
            endDate: toIsoDate(endDate!),
            companyId: company?.id,
            sellerId: seller?.id,
        },
    };
}

interface ContractFilterDialogProps {
    visible: boolean;
    onHide: () => void;
    onApply: (filter: ContractFilter) => void;
}

export default function ContractFilterDialog({ visible, onHide, onApply }: ContractFilterDialogProps) {
    const titleId = useId();
    const formik = useFormik<FilterFields>({
        initialValues: { mode: 'company-seller', company: null, seller: null, startDate: null, endDate: null },
        validationSchema,
        onSubmit: (fields) => {
            onApply(toFilter(fields));
            onHide();
        },
    });

    const isPeriod = formik.values.mode === 'period';
    const error = (name: keyof FilterFields) => fieldError(formik, name);
    const describedBy = (name: keyof FilterFields, id: string) => ({
        invalid: !!error(name),
        'aria-describedby': error(name) ? `${id}-error` : undefined,
    });

    const companyField = (
        <FormField
            id="filter-company"
            label="Empresa"
            required={!isPeriod}
            icon={<BuildingIcon />}
            error={error('company')}
        >
            <CompanyPicker
                inputId="filter-company"
                value={formik.values.company}
                onChange={(company) => formik.setFieldValue('company', company)}
                onBlur={() => formik.setFieldTouched('company', true)}
                {...describedBy('company', 'filter-company')}
            />
        </FormField>
    );

    const sellerField = (
        <FormField id="filter-seller" label="Vendedor" required={!isPeriod} icon={<UserIcon />} error={error('seller')}>
            <SellerPicker
                inputId="filter-seller"
                value={formik.values.seller}
                onChange={(seller) => formik.setFieldValue('seller', seller)}
                onBlur={() => formik.setFieldTouched('seller', true)}
                showClear={isPeriod}
                {...describedBy('seller', 'filter-seller')}
            />
        </FormField>
    );

    return (
        <Modal visible={visible} onHide={onHide} labelledBy={titleId}>
            <form onSubmit={formik.handleSubmit} noValidate>
                <ModalHeader
                    id={titleId}
                    title="Filtrar contratos"
                    subtitle="Busque por empresa e vendedor ou por período."
                    onClose={onHide}
                />

                <ModalBody>
                    <SegmentedControl<Mode>
                        aria-label="Tipo de filtro"
                        value={formik.values.mode}
                        onChange={(mode) => {
                            formik.setFieldValue('mode', mode);
                            formik.setTouched({});
                        }}
                        options={[
                            { value: 'company-seller', label: 'Empresa e vendedor' },
                            { value: 'period', label: 'Período' },
                        ]}
                    />

                    <FormGrid>
                        {isPeriod && (
                            <>
                                <FormField
                                    id="filter-startDate"
                                    label="De"
                                    required
                                    icon={<CalendarIcon />}
                                    error={error('startDate')}
                                >
                                    <Calendar
                                        inputId="filter-startDate"
                                        value={formik.values.startDate}
                                        onChange={(e) => formik.setFieldValue('startDate', e.value ?? null)}
                                        dateFormat="dd/mm/yy"
                                        locale="pt-BR"
                                        placeholder="dd/mm/aaaa"
                                        {...describedBy('startDate', 'filter-startDate')}
                                    />
                                </FormField>
                                <FormField
                                    id="filter-endDate"
                                    label="Até"
                                    required
                                    icon={<CalendarIcon />}
                                    error={error('endDate')}
                                >
                                    <Calendar
                                        inputId="filter-endDate"
                                        value={formik.values.endDate}
                                        onChange={(e) => formik.setFieldValue('endDate', e.value ?? null)}
                                        dateFormat="dd/mm/yy"
                                        locale="pt-BR"
                                        placeholder="dd/mm/aaaa"
                                        minDate={formik.values.startDate ?? undefined}
                                        {...describedBy('endDate', 'filter-endDate')}
                                    />
                                </FormField>
                            </>
                        )}
                        {companyField}
                        {sellerField}
                    </FormGrid>
                </ModalBody>

                <ModalFooter>
                    <Button type="button" label="Cancelar" outlined onClick={onHide} />
                    <Button type="submit" label="Aplicar filtro" />
                </ModalFooter>
            </form>
        </Modal>
    );
}

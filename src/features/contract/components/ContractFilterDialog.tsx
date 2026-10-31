import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { invalidProps } from '@/shared/helpers/form.helper';
import { contractFilterSchema, type ContractFilterFields } from '../schema/ContractFilterSchema';
import '@/shared/config/locale';
import type { ContractFilter } from '../types/contract.types';

type Mode = ContractFilter['kind'];

function toFilter({ mode, company, seller, startDate, endDate }: ContractFilterFields): ContractFilter {
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
    const form = useForm<ContractFilterFields>({
        resolver: zodResolver(contractFilterSchema),
        // Errors show up after leaving the field or trying to apply, not while picking for the first time.
        mode: 'onTouched',
        defaultValues: { mode: 'company-seller', company: null, seller: null, startDate: null, endDate: null },
    });
    const { control, formState } = form;

    const onSubmit = (fields: ContractFilterFields) => {
        onApply(toFilter(fields));
        onHide();
    };

    const mode = form.watch('mode');
    const startDate = form.watch('startDate');
    const isPeriod = mode === 'period';
    const error = (name: keyof ContractFilterFields) => formState.errors[name]?.message;

    const companyField = (
        <FormField
            id="filter-company"
            label="Empresa"
            required={!isPeriod}
            icon={<BuildingIcon />}
            error={error('company')}
        >
            <Controller
                control={control}
                name="company"
                render={({ field }) => (
                    <CompanyPicker
                        inputId="filter-company"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        {...invalidProps(error('company'), 'filter-company')}
                    />
                )}
            />
        </FormField>
    );

    const sellerField = (
        <FormField id="filter-seller" label="Vendedor" required={!isPeriod} icon={<UserIcon />} error={error('seller')}>
            <Controller
                control={control}
                name="seller"
                render={({ field }) => (
                    <SellerPicker
                        inputId="filter-seller"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        showClear={isPeriod}
                        {...invalidProps(error('seller'), 'filter-seller')}
                    />
                )}
            />
        </FormField>
    );

    return (
        <Modal visible={visible} onHide={onHide} labelledBy={titleId}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <ModalHeader
                    id={titleId}
                    title="Filtrar contratos"
                    subtitle="Busque por empresa e vendedor ou por período."
                    onClose={onHide}
                />

                <ModalBody>
                    <SegmentedControl<Mode>
                        aria-label="Tipo de filtro"
                        value={mode}
                        // Switching modes starts the new fields without errors.
                        onChange={(mode) => form.reset({ ...form.getValues(), mode })}
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
                                    <Controller
                                        control={control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <Calendar
                                                inputId="filter-startDate"
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.value ?? null)}
                                                onBlur={field.onBlur}
                                                dateFormat="dd/mm/yy"
                                                locale="pt-BR"
                                                placeholder="dd/mm/aaaa"
                                                {...invalidProps(error('startDate'), 'filter-startDate')}
                                            />
                                        )}
                                    />
                                </FormField>
                                <FormField
                                    id="filter-endDate"
                                    label="Até"
                                    required
                                    icon={<CalendarIcon />}
                                    error={error('endDate')}
                                >
                                    <Controller
                                        control={control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <Calendar
                                                inputId="filter-endDate"
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.value ?? null)}
                                                onBlur={field.onBlur}
                                                dateFormat="dd/mm/yy"
                                                locale="pt-BR"
                                                placeholder="dd/mm/aaaa"
                                                minDate={startDate ?? undefined}
                                                {...invalidProps(error('endDate'), 'filter-endDate')}
                                            />
                                        )}
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

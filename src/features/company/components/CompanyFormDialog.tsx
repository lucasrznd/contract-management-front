import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/shared/components/ui/Modal';
import FormField from '@/shared/components/ui/FormField';
import { FormGrid, FormSection, FormWide } from '@/shared/components/ui/FormLayout';
import { useToast } from '@/shared/components/ui/toast/ToastProvider';
import {
    BuildingIcon,
    HashIcon,
    IdCardIcon,
    MailIcon,
    MapPinIcon,
    PhoneIcon,
    UserIcon,
} from '@/shared/components/icons';
import { useCompanyCreate, useCompanyUpdate } from '../service/company.service';
import { formatCode, maskCnpj, maskCpf, maskPhone, maskZipCode, onlyDigits } from '@/shared/helpers/stringUtils.helper';
import { fetchAddressByZipCode } from '@/shared/api/viaCep.service';
import { textFieldProps } from '@/shared/helpers/form.helper';
import { companyFormSchema, type CompanyFormFields } from '../schema/CompanyFormSchema';
import type { Company, CompanyFormValues } from '../types/company.types';

function toPayload(fields: CompanyFormFields, id?: number): CompanyFormValues {
    return {
        id,
        businessName: fields.businessName.trim(),
        tradeName: fields.tradeName.trim(),
        registrationNumber: onlyDigits(fields.registrationNumber),
        cpf: onlyDigits(fields.cpf) || undefined,
        stateRegistration: fields.stateRegistration.trim() || undefined,
        phoneNumber: onlyDigits(fields.phoneNumber),
        email: fields.email.trim(),
        zipCode: fields.zipCode,
        streetName: fields.streetName.trim(),
        number: Number(fields.number),
        avenueName: fields.avenueName.trim(),
        city: fields.city.trim(),
        state: fields.state.trim().toUpperCase(),
    };
}

interface CompanyFormDialogProps {
    visible: boolean;
    onHide: () => void;
    /** Company being edited; null to register a new one. */
    company: Company | null;
}

/** Remount it (change its `key`) for each company so the form starts from that company's data. */
export default function CompanyFormDialog({ visible, onHide, company }: CompanyFormDialogProps) {
    const titleId = useId();
    const toast = useToast();
    const { mutate: createCompany, isPending: isCreating } = useCompanyCreate();
    const { mutate: updateCompany, isPending: isUpdating } = useCompanyUpdate();
    const [zipCodeStatus, setZipCodeStatus] = useState<'idle' | 'loading' | 'not-found' | 'failed'>('idle');
    const isEditing = company !== null;

    const form = useForm<CompanyFormFields>({
        resolver: zodResolver(companyFormSchema),
        // Errors show up after leaving the field or trying to save, not while typing for the first time.
        mode: 'onTouched',
        defaultValues: {
            businessName: company?.businessName ?? '',
            tradeName: company?.tradeName ?? '',
            registrationNumber: maskCnpj(company?.registrationNumber ?? ''),
            cpf: maskCpf(company?.cpf ?? ''),
            stateRegistration: company?.stateRegistration ?? '',
            phoneNumber: maskPhone(company?.phoneNumber ?? ''),
            email: company?.email ?? '',
            zipCode: maskZipCode(company?.zipCode ?? ''),
            streetName: company?.streetName ?? '',
            number: company ? String(company.number) : '',
            avenueName: company?.avenueName ?? '',
            city: company?.city ?? '',
            state: company?.state ?? '',
        },
    });
    const { errors } = form.formState;

    const onSubmit = (fields: CompanyFormFields) => {
        if (isEditing) {
            updateCompany(
                { id: company.id, data: toPayload(fields, company.id) },
                {
                    onSuccess: () => {
                        toast.success('Alterações salvas');
                        onHide();
                    },
                },
            );
            return;
        }
        createCompany(
            { data: toPayload(fields) },
            {
                onSuccess: () => {
                    toast.success('Empresa cadastrada');
                    onHide();
                },
            },
        );
    };

    const field = (name: keyof CompanyFormFields, options?: Parameters<typeof textFieldProps>[3]) =>
        textFieldProps(form, name, `company-${name}`, options);
    const error = (name: keyof CompanyFormFields) => errors[name]?.message;

    // Filled-in fields are revalidated only if they were showing an error.
    const fill = (name: keyof CompanyFormFields, value: string) =>
        form.setValue(name, value, { shouldValidate: !!form.getFieldState(name).error });

    // Typing a complete CEP fills in the address (street and district only when still empty).
    const lookUpZipCode = async (zipCode: string) => {
        if (onlyDigits(zipCode).length !== 8) {
            setZipCodeStatus('idle');
            return;
        }

        setZipCodeStatus('loading');
        try {
            const address = await fetchAddressByZipCode(zipCode);
            if (!address) {
                setZipCodeStatus('not-found');
                return;
            }
            setZipCodeStatus('idle');
            fill('city', address.city);
            fill('state', address.state);
            if (!form.getValues('streetName')) fill('streetName', address.street);
            if (!form.getValues('avenueName')) fill('avenueName', address.district);
        } catch {
            setZipCodeStatus('failed');
        }
    };

    const zipCodeHint = {
        idle: 'A cidade e o estado são preenchidos pelo CEP.',
        loading: 'Buscando endereço…',
        'not-found': 'CEP não encontrado. Preencha o endereço manualmente.',
        failed: 'Não foi possível consultar o CEP. Preencha o endereço manualmente.',
    }[zipCodeStatus];

    return (
        <Modal visible={visible} onHide={onHide} labelledBy={titleId} width={720} position="center">
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <ModalHeader
                    id={titleId}
                    title={isEditing ? 'Editar empresa' : 'Nova empresa'}
                    subtitle={isEditing ? `Código ${formatCode(company.id)}` : 'Preencha os dados para cadastrar.'}
                    onClose={onHide}
                />

                <ModalBody>
                    <FormSection title="Dados da empresa">
                        <FormGrid>
                            <FormField
                                id="company-tradeName"
                                label="Nome fantasia"
                                required
                                icon={<BuildingIcon />}
                                error={error('tradeName')}
                            >
                                <InputText {...field('tradeName')} placeholder="Como a empresa é conhecida" />
                            </FormField>
                            <FormField
                                id="company-businessName"
                                label="Razão social"
                                required
                                icon={<BuildingIcon />}
                                error={error('businessName')}
                            >
                                <InputText {...field('businessName')} placeholder="Nome registrado" />
                            </FormField>
                            <FormField
                                id="company-registrationNumber"
                                label="CNPJ"
                                required
                                icon={<IdCardIcon />}
                                error={error('registrationNumber')}
                            >
                                <InputText
                                    {...field('registrationNumber', { mask: maskCnpj })}
                                    inputMode="numeric"
                                    placeholder="99.999.999/0001-99"
                                />
                            </FormField>
                            <FormField
                                id="company-stateRegistration"
                                label="Inscrição estadual"
                                icon={<HashIcon />}
                                error={error('stateRegistration')}
                            >
                                <InputText {...field('stateRegistration')} maxLength={15} placeholder="Opcional" />
                            </FormField>
                            <FormField
                                id="company-cpf"
                                label="CPF do responsável"
                                icon={<UserIcon />}
                                error={error('cpf')}
                                hint="Opcional."
                            >
                                <InputText
                                    {...field('cpf', { mask: maskCpf })}
                                    inputMode="numeric"
                                    placeholder="999.999.999-99"
                                />
                            </FormField>
                        </FormGrid>
                    </FormSection>

                    <FormSection title="Contato">
                        <FormGrid>
                            <FormField
                                id="company-phoneNumber"
                                label="Telefone"
                                required
                                icon={<PhoneIcon strokeWidth={1.9} />}
                                error={error('phoneNumber')}
                                hint="Celular ou fixo, com DDD."
                            >
                                <InputText
                                    {...field('phoneNumber', { mask: maskPhone })}
                                    inputMode="tel"
                                    placeholder="(99) 9 9999-9999"
                                />
                            </FormField>
                            <FormField id="company-email" label="E-mail" icon={<MailIcon />} error={error('email')}>
                                <InputText {...field('email')} type="email" placeholder="contato@empresa.com.br" />
                            </FormField>
                        </FormGrid>
                    </FormSection>

                    <FormSection title="Endereço">
                        <FormGrid>
                            <FormField
                                id="company-zipCode"
                                label="CEP"
                                required
                                icon={<MapPinIcon />}
                                error={error('zipCode')}
                                hint={zipCodeHint}
                            >
                                <InputText
                                    {...field('zipCode', { mask: maskZipCode, onChange: lookUpZipCode })}
                                    inputMode="numeric"
                                    placeholder="86400-000"
                                />
                            </FormField>
                            <div />
                            <FormWide>
                                <FormField
                                    id="company-streetName"
                                    label="Rua"
                                    required
                                    icon={<MapPinIcon />}
                                    error={error('streetName')}
                                >
                                    <InputText {...field('streetName')} />
                                </FormField>
                            </FormWide>
                            <FormField
                                id="company-number"
                                label="Número"
                                required
                                icon={<HashIcon />}
                                error={error('number')}
                            >
                                <InputText {...field('number', { mask: onlyDigits })} inputMode="numeric" />
                            </FormField>
                            <FormField
                                id="company-avenueName"
                                label="Bairro"
                                required
                                icon={<MapPinIcon />}
                                error={error('avenueName')}
                            >
                                <InputText {...field('avenueName')} />
                            </FormField>
                            <FormField
                                id="company-city"
                                label="Cidade"
                                required
                                icon={<MapPinIcon />}
                                error={error('city')}
                            >
                                <InputText {...field('city')} />
                            </FormField>
                            <FormField
                                id="company-state"
                                label="Estado"
                                required
                                icon={<MapPinIcon />}
                                error={error('state')}
                            >
                                <InputText
                                    {...field('state', { mask: (value) => value.toUpperCase() })}
                                    maxLength={2}
                                    placeholder="PR"
                                />
                            </FormField>
                        </FormGrid>
                    </FormSection>
                </ModalBody>

                <ModalFooter>
                    <Button type="button" label="Cancelar" outlined onClick={onHide} />
                    <Button
                        type="submit"
                        label={isEditing ? 'Salvar alterações' : 'Cadastrar empresa'}
                        loading={isCreating || isUpdating}
                    />
                </ModalFooter>
            </form>
        </Modal>
    );
}

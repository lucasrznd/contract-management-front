import { useId, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { isAxiosError } from 'axios';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ui/Modal';
import FormField from '../ui/FormField';
import { FormGrid, FormSection, FormWide } from '../ui/FormLayout';
import { useToast } from '../ui/toast/ToastProvider';
import { BuildingIcon, HashIcon, IdCardIcon, MailIcon, MapPinIcon, PhoneIcon, UserIcon } from '../icons';
import { useCompanyPost } from '../../hooks/company/useCompanyPost';
import { useCompanyPut } from '../../hooks/company/useCompanyPut';
import { formatCode, maskCnpj, maskCpf, maskPhone, maskZipCode, onlyDigits } from '../../functions/StringUtils';
import { errorMessageFormatter } from '../../functions/MessageFormatter';
import { fetchAddressByZipCode } from '../../functions/viaCep';
import { fieldError, textFieldProps } from '../../functions/formik';
import type { Company, CompanyFormValues } from '../../types';

/** What the inputs hold: masked text, converted to the API's shape on submit. */
interface CompanyFields {
    businessName: string;
    tradeName: string;
    registrationNumber: string;
    cpf: string;
    stateRegistration: string;
    phoneNumber: string;
    email: string;
    zipCode: string;
    streetName: string;
    number: string;
    avenueName: string;
    city: string;
    state: string;
}

const digitsAtLeast = (min: number) => (value?: string) => onlyDigits(value ?? '').length >= min;

const validationSchema = Yup.object({
    businessName: Yup.string().trim().required('Informe a razão social.'),
    tradeName: Yup.string().trim().required('Informe o nome fantasia.'),
    registrationNumber: Yup.string()
        .required('Informe o CNPJ.')
        .test('cnpj', 'CNPJ incompleto. Use 99.999.999/9999-99.', digitsAtLeast(14)),
    cpf: Yup.string().test('cpf', 'CPF incompleto. Use 999.999.999-99.', (value) => !value || digitsAtLeast(11)(value)),
    phoneNumber: Yup.string()
        .required('Informe o telefone.')
        .test('phone', 'Telefone inválido. Use (DD) 9 9999-9999.', digitsAtLeast(10)),
    email: Yup.string().trim().email('E-mail inválido.'),
    zipCode: Yup.string().required('Informe o CEP.').test('cep', 'CEP incompleto. Use 99999-999.', digitsAtLeast(8)),
    streetName: Yup.string().trim().required('Informe a rua.'),
    number: Yup.string().required('Informe o número.'),
    avenueName: Yup.string().trim().required('Informe o bairro.'),
    city: Yup.string().trim().required('Informe a cidade.'),
    state: Yup.string().trim().required('Informe o estado.').length(2, 'Use a sigla do estado (ex.: PR).'),
});

function toFields(company: Company | null): CompanyFields {
    return {
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
    };
}

function toPayload(fields: CompanyFields, id?: number): CompanyFormValues {
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
    const createCompany = useCompanyPost();
    const updateCompany = useCompanyPut();
    const [zipCodeStatus, setZipCodeStatus] = useState<'idle' | 'loading' | 'not-found' | 'failed'>('idle');
    const isEditing = company !== null;

    const formik = useFormik<CompanyFields>({
        initialValues: toFields(company),
        validationSchema,
        onSubmit: async (fields) => {
            try {
                if (isEditing) {
                    await updateCompany.mutateAsync(toPayload(fields, company.id));
                    toast.success('Alterações salvas');
                } else {
                    await createCompany.mutateAsync(toPayload(fields));
                    toast.success('Empresa cadastrada');
                }
                onHide();
            } catch (err) {
                const apiMessage = isAxiosError(err) ? errorMessageFormatter(err.response?.data?.message) : undefined;
                toast.error(apiMessage ?? 'Não foi possível salvar a empresa.');
            }
        },
    });

    const field = (name: keyof CompanyFields) => textFieldProps(formik, name, `company-${name}`);
    const error = (name: keyof CompanyFields) => fieldError(formik, name);

    // Typing a complete CEP fills in the address (street and district only when still empty).
    const changeZipCode = async (value: string) => {
        const zipCode = maskZipCode(value);
        await formik.setFieldValue('zipCode', zipCode);
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
            formik.setValues((fields) => ({
                ...fields,
                zipCode,
                city: address.city,
                state: address.state,
                streetName: fields.streetName || address.street,
                avenueName: fields.avenueName || address.district,
            }));
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
            <form onSubmit={formik.handleSubmit} noValidate>
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
                                    {...field('registrationNumber')}
                                    inputMode="numeric"
                                    placeholder="99.999.999/0001-99"
                                    onChange={(e) =>
                                        formik.setFieldValue('registrationNumber', maskCnpj(e.target.value))
                                    }
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
                                    {...field('cpf')}
                                    inputMode="numeric"
                                    placeholder="999.999.999-99"
                                    onChange={(e) => formik.setFieldValue('cpf', maskCpf(e.target.value))}
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
                                    {...field('phoneNumber')}
                                    inputMode="tel"
                                    placeholder="(99) 9 9999-9999"
                                    onChange={(e) => formik.setFieldValue('phoneNumber', maskPhone(e.target.value))}
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
                                    {...field('zipCode')}
                                    inputMode="numeric"
                                    placeholder="86400-000"
                                    onChange={(e) => changeZipCode(e.target.value)}
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
                                <InputText
                                    {...field('number')}
                                    inputMode="numeric"
                                    onChange={(e) => formik.setFieldValue('number', onlyDigits(e.target.value))}
                                />
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
                                    {...field('state')}
                                    maxLength={2}
                                    placeholder="PR"
                                    onChange={(e) => formik.setFieldValue('state', e.target.value.toUpperCase())}
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
                        loading={formik.isSubmitting}
                    />
                </ModalFooter>
            </form>
        </Modal>
    );
}

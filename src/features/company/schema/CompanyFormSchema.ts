import { z } from 'zod';
import { onlyDigits } from '@/shared/helpers/stringUtils.helper';

const required = (message: string) => z.string().trim().min(1, message);
const digitsAtLeast = (min: number) => (value: string) => onlyDigits(value).length >= min;

/** What the inputs hold: masked text, converted to the API's shape on submit. */
export const companyFormSchema = z.object({
    businessName: required('Informe a razão social.'),
    tradeName: required('Informe o nome fantasia.'),
    registrationNumber: required('Informe o CNPJ.').refine(
        digitsAtLeast(14),
        'CNPJ incompleto. Use 99.999.999/9999-99.',
    ),
    cpf: z.string().refine((value) => !value || digitsAtLeast(11)(value), 'CPF incompleto. Use 999.999.999-99.'),
    stateRegistration: z.string(),
    phoneNumber: required('Informe o telefone.').refine(digitsAtLeast(10), 'Telefone inválido. Use (DD) 9 9999-9999.'),
    email: z
        .string()
        .trim()
        .refine((value) => !value || z.email().safeParse(value).success, 'E-mail inválido.'),
    zipCode: required('Informe o CEP.').refine(digitsAtLeast(8), 'CEP incompleto. Use 99999-999.'),
    streetName: required('Informe a rua.'),
    number: required('Informe o número.'),
    avenueName: required('Informe o bairro.'),
    city: required('Informe a cidade.'),
    state: required('Informe o estado.').length(2, 'Use a sigla do estado (ex.: PR).'),
});

export type CompanyFormFields = z.infer<typeof companyFormSchema>;

import { z } from 'zod';
import type { Company } from '@/features/company/types/company.types';
import type { Seller } from '@/features/seller/types/seller.types';

const requiredRecord = <T>(message: string) =>
    z
        .custom<T>()
        .nullable()
        .refine((value) => value !== null, message);
const requiredCount = (message: string) =>
    z
        .number()
        .min(0, 'Use 0 ou mais.')
        .nullable()
        .refine((value) => value !== null, message);
const duration = (message: string) =>
    z
        .string()
        .min(1, message)
        .regex(/^\d\.\d\d$/, 'Use minutos e segundos, ex.: 0.30.');
const requiredDate = (message: string) =>
    z
        .date()
        .nullable()
        .refine((value) => value !== null, message);

export const contractFormSchema = z
    .object({
        clientCompany: requiredRecord<Company>('Selecione a empresa.'),
        seller: requiredRecord<Seller>('Selecione o vendedor.'),
        advertisingOrder: z.string().trim().min(1, 'Informe a ordem de propaganda.'),
        quantitySpotDay: requiredCount('Informe a quantidade de spots por dia.'),
        spotDuration: duration('Informe o tempo do spot.'),
        testimonialQuantity: requiredCount('Informe a quantidade de testemunhais.'),
        testimonialDuration: duration('Informe o tempo do testemunhal.'),
        flashQuantity: requiredCount('Informe a quantidade de flashes.'),
        newspaperParticipation: z.string(),
        startDate: requiredDate('Informe a data de início.'),
        endDate: requiredDate('Informe a data de término.'),
        monthlyPrice: z
            .number()
            .nullable()
            .refine((value) => value !== null && value > 0, 'Informe o preço mensal.'),
        paymentMethod: z
            .union([z.enum(['BOLETO', 'PIX']), z.literal('')])
            .refine((value) => value !== '', 'Selecione a forma de pagamento.'),
        paymentDueDay: z
            .number()
            .nullable()
            .refine((value) => value !== null, 'Informe o dia de vencimento.'),
        observation: z.string(),
    })
    .refine(({ startDate, endDate }) => !startDate || !endDate || endDate >= startDate, {
        path: ['endDate'],
        message: 'O término deve ser depois do início.',
        // Runs even while other fields are still invalid.
        when: () => true,
    });

/** What the inputs hold; empty fields are null or ''. */
export type ContractFormFields = z.input<typeof contractFormSchema>;
/** What a valid form submits: the required fields are no longer null. */
export type ContractFormData = z.output<typeof contractFormSchema>;

import { z } from 'zod';
import { clearPhoneNumber } from '@/shared/helpers/stringUtils.helper';

export const sellerFormSchema = z.object({
    name: z.string().trim().min(1, 'Informe o nome do vendedor.').min(3, 'O nome precisa ter pelo menos 3 letras.'),
    phoneNumber: z
        .string()
        .min(1, 'Informe o telefone.')
        .refine((value) => clearPhoneNumber(value).length >= 10, 'Telefone inválido. Use (DD) 9 9999-9999.'),
    urlImage: z.string(),
});

export type SellerFormFields = z.infer<typeof sellerFormSchema>;

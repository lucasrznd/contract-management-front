import { z } from 'zod';
import type { Company } from '@/features/company/types/company.types';
import type { Seller } from '@/features/seller/types/seller.types';

/** Company and seller are required when filtering by them; both dates when filtering by period. */
export const contractFilterSchema = z
    .object({
        mode: z.enum(['company-seller', 'period']),
        company: z.custom<Company>().nullable(),
        seller: z.custom<Seller>().nullable(),
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
    })
    .superRefine(({ mode, company, seller, startDate, endDate }, ctx) => {
        const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });

        if (mode === 'company-seller') {
            if (!company) issue('company', 'Selecione a empresa.');
            if (!seller) issue('seller', 'Selecione o vendedor.');
            return;
        }
        if (!startDate) issue('startDate', 'Informe a data inicial.');
        if (!endDate) issue('endDate', 'Informe a data final.');
        else if (startDate && endDate < startDate) issue('endDate', 'A data final deve ser depois da inicial.');
    });

export type ContractFilterFields = z.infer<typeof contractFilterSchema>;

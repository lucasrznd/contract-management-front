import type { Company } from '@/features/company/types/company.types';
import type { Seller } from '@/features/seller/types/seller.types';

// Mirrors the response DTOs of contract-management-api.

export type PaymentMethod = 'BOLETO' | 'PIX';

export interface Contract {
    id: number;
    companyTradeName: string;
    sellerName: string;
    sellerImageUrl: string;
    advertisingOrder: string;
    spotDuration: number;
    quantitySpotDay: number;
    testimonialDuration: number;
    testimonialQuantity: number;
    /** yyyy-MM-dd */
    startDate: string;
    /** yyyy-MM-dd */
    endDate: string;
    monthlyPriceFmt: string;
    flashQuantity: number;
    newspaperParticipation: string;
    paymentMethod: PaymentMethod;
    paymentDueDay: number;
    observation: string;
    token: string | null;
    pdfPath: string | null;
}

/** Document returned by /contracts/get-doc (digital signature provider). */
export interface DigitalDocument {
    original_file: string;
    status: string;
    signers: {
        name: string;
        sign_url: string;
    }[];
}

export interface ContractFormValues {
    id?: number;
    clientCompany?: Company;
    seller: Seller | '';
    advertisingOrder?: string;
    quantitySpotDay?: number | null;
    spotDuration?: string;
    testimonialDuration?: string;
    testimonialQuantity?: number | null;
    startDate?: Date;
    endDate?: Date;
    monthlyPrice?: number | null;
    flashQuantity?: number | null;
    newspaperParticipation: string;
    paymentMethod: PaymentMethod | '';
    paymentDueDay?: number | null;
    observation: string;
}

export interface ContractListParams {
    startDate: string;
    endDate: string;
    companyId?: number;
    sellerId?: number;
}

export interface ContractFindParams {
    companyId?: number;
    sellerId?: number;
}

/** Advanced search from the filter dialog; `label` describes it on screen. */
export type ContractFilter =
    | { kind: 'company-seller'; label: string; params: Required<ContractFindParams> }
    | { kind: 'period'; label: string; params: ContractListParams };

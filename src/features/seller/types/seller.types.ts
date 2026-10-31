// Mirrors the response DTOs of contract-management-api.

export interface Seller {
    id: number;
    name: string;
    phoneNumber: string;
    urlImage: string;
}

export interface SellerFormValues {
    id?: number;
    name: string;
    phoneNumber?: string;
    urlImage: string;
}

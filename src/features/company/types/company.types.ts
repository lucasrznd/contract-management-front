// Mirrors the response DTOs of contract-management-api.

export interface Company {
    id: number;
    businessName: string;
    tradeName: string;
    registrationNumber: string;
    cpf: string | null;
    stateRegistration: string | null;
    phoneNumber: string;
    email: string;
    streetName: string;
    avenueName: string;
    number: number;
    city: string;
    state: string;
    zipCode: string;
    /** Pre-signed URL, valid for 1h: only for showing the image, never sent back. */
    urlImage: string | null;
}

export interface CompanyFormValues {
    id?: number;
    businessName: string;
    tradeName: string;
    registrationNumber?: string;
    cpf?: string;
    stateRegistration?: string;
    phoneNumber?: string;
    email: string;
    streetName: string;
    avenueName: string;
    number?: number | null;
    city: string;
    state: string;
    zipCode?: string;
    /** Left out on update to keep the current image. */
    image?: File;
}

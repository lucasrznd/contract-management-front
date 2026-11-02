// Mirrors the response DTOs of contract-management-api.

export interface Seller {
    id: number;
    name: string;
    phoneNumber: string;
    /** Pre-signed URL, valid for 1h: only for showing the image, never sent back. */
    urlImage: string | null;
}

export interface SellerFormValues {
    id?: number;
    name: string;
    phoneNumber?: string;
    /** Left out on update to keep the current image. */
    image?: File;
}

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

// TODO: confirm the endpoint and response shape once contract-management-api implements photo uploads.
const API_URL = import.meta.env.VITE_API_BASE_URL + '/sellers/photo';

export const isSellerPhotoUploadEnabled = import.meta.env.VITE_SELLER_PHOTO_UPLOAD === 'true';

/** Uploads the photo and returns the signed URL to store in the seller's `urlImage`. */
const uploadPhoto = async (file: File) => {
    const body = new FormData();
    body.append('file', file);
    const response = await axios.post<{ url: string }>(API_URL, body);
    return response.data.url;
};

export function useSellerPhotoUpload() {
    return useMutation({ mutationFn: uploadPhoto });
}

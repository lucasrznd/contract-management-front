import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, REFETCH_INTERVAL } from '@/shared/api/api';
import type { Seller, SellerFormValues } from '../types/seller.types';

export const isSellerPhotoUploadEnabled = import.meta.env.VITE_SELLER_PHOTO_UPLOAD === 'true';

const sellerKeys = {
    all: ['sellers'] as const,
};

const findAll = async () => {
    const response = await api.get<Seller[]>('/sellers');
    return response.data;
};

const create = async (data: SellerFormValues) => {
    const response = await api.post<Seller>('/sellers', data);
    return response.data;
};

const update = (data: SellerFormValues) => api.put(`/sellers/${data.id}`, data);

const remove = (id: number) => api.delete(`/sellers/${id}`);

/** Uploads the photo and returns the signed URL to store in the seller's `urlImage`. */
// TODO: confirm the endpoint and response shape once contract-management-api implements photo uploads.
const uploadPhoto = async (file: File) => {
    const body = new FormData();
    body.append('file', file);
    const response = await api.post<{ url: string }>('/sellers/photo', body);
    return response.data.url;
};

export function useSellerFindAll() {
    return useQuery({ queryKey: sellerKeys.all, queryFn: findAll, refetchInterval: REFETCH_INTERVAL });
}

export function useSellerPost() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: create, onSuccess: () => queryClient.invalidateQueries() });
}

export function useSellerPut() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: update, onSuccess: () => queryClient.invalidateQueries() });
}

export function useSellerDelete() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: remove, onSuccess: () => queryClient.invalidateQueries() });
}

export function useSellerPhotoUpload() {
    return useMutation({ mutationFn: uploadPhoto });
}

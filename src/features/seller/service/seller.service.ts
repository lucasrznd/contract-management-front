import { api, REFETCH_INTERVAL } from '@/shared/api/api';
import { useApiMutation, useApiQuery } from '@/shared/api/api.service';
import type { Seller, SellerFormValues } from '../types/seller.types';

export const isSellerPhotoUploadEnabled = import.meta.env.VITE_SELLER_PHOTO_UPLOAD === 'true';

const sellerKeys = {
    all: ['sellers'] as const,
};

const findAll = async () => {
    const response = await api.get<Seller[]>('/sellers');
    return response.data;
};

const create = async ({ data }: { data: SellerFormValues }) => {
    const response = await api.post<Seller>('/sellers', data);
    return response.data;
};

const update = ({ id, data }: { id: number; data: SellerFormValues }) => api.put(`/sellers/${id}`, data);

const remove = ({ id }: { id: number }) => api.delete(`/sellers/${id}`);

/** Uploads the photo and returns the signed URL to store in the seller's `urlImage`. */
// TODO: confirm the endpoint and response shape once contract-management-api implements photo uploads.
const uploadPhoto = async ({ file }: { file: File }) => {
    const body = new FormData();
    body.append('file', file);
    const response = await api.post<{ url: string }>('/sellers/photo', body);
    return response.data.url;
};

export function useSellerFindAll() {
    return useApiQuery({
        queryKey: sellerKeys.all,
        queryFn: findAll,
        refetchInterval: REFETCH_INTERVAL,
        errorMessage: 'Não foi possível carregar os vendedores.',
    });
}

export function useSellerCreate() {
    return useApiMutation({ mutationFn: create, errorMessage: 'Não foi possível cadastrar o vendedor.' });
}

export function useSellerUpdate() {
    return useApiMutation({ mutationFn: update, errorMessage: 'Não foi possível salvar as alterações do vendedor.' });
}

export function useSellerDelete() {
    return useApiMutation({ mutationFn: remove, errorMessage: 'Não foi possível excluir o vendedor.' });
}

export function useSellerPhotoUpload() {
    return useApiMutation({
        mutationFn: uploadPhoto,
        invalidateQueries: false,
        errorMessage: 'Não foi possível enviar a foto do vendedor.',
    });
}

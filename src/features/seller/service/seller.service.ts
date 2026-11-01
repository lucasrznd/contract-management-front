import { keepPreviousData } from '@tanstack/react-query';
import { api, REFETCH_INTERVAL } from '@/shared/api/api';
import { useApiFetch, useApiMutation, useApiQuery } from '@/shared/api/api.service';
import { isPage, maskedNumberAsDigits, toPageParams } from '@/shared/api/pagination';
import type { Page, PageRequest } from '@/shared/types/api.types';
import type { Seller, SellerFormValues } from '../types/seller.types';

export const isSellerPhotoUploadEnabled = import.meta.env.VITE_SELLER_PHOTO_UPLOAD === 'true';

const sellerKeys = {
    list: (request: PageRequest) => ['sellers', 'list', request] as const,
    search: (text: string) => ['sellers', 'search', text] as const,
};

const findAll = async (request: PageRequest) => {
    const response = await api.get<Page<Seller>>('/sellers', {
        params: toPageParams({ ...request, text: maskedNumberAsDigits(request.text) }),
    });
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

/** A page of sellers; the previous page stays on screen while the next one loads. */
export function useSellerFindAll(request: PageRequest = {}, { enabled = true } = {}) {
    return useApiQuery({
        queryKey: sellerKeys.list(request),
        queryFn: () => findAll(request),
        enabled,
        placeholderData: keepPreviousData,
        refetchInterval: REFETCH_INTERVAL,
        errorMessage: 'Não foi possível carregar os vendedores.',
    });
}

/** How many matches a type-ahead field lists. */
const SEARCH_SIZE = 20;

/** Sellers matching the text, by name, for type-ahead fields. Recent answers come from the cache. */
export function useSellerSearch() {
    return useApiFetch((text: string) => {
        const request: PageRequest = { text, size: SEARCH_SIZE, sort: { field: 'name', direction: 'asc' } };
        return {
            queryKey: sellerKeys.search(text),
            queryFn: async () => {
                const data = await findAll(request);
                return isPage<Seller>(data) ? data.content : [];
            },
            staleTime: 30_000,
        };
    }, 'Não foi possível buscar os vendedores.');
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

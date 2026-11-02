import { keepPreviousData } from '@tanstack/react-query';
import { api, REFETCH_INTERVAL } from '@/shared/api/api';
import { useApiFetch, useApiMutation, useApiQuery } from '@/shared/api/api.service';
import { isPage, maskedNumberAsDigits, toPageParams } from '@/shared/api/pagination';
import { toFormData } from '@/shared/api/formData';
import type { Page, PageRequest } from '@/shared/types/api.types';
import type { Company, CompanyFormValues } from '../types/company.types';

const companyKeys = {
    list: (request: PageRequest) => ['companies', 'list', request] as const,
    search: (text: string) => ['companies', 'search', text] as const,
    count: ['companiesQuantity'] as const,
};

const findAll = async (request: PageRequest) => {
    const response = await api.get<Page<Company>>('/companies', {
        params: toPageParams({ ...request, text: maskedNumberAsDigits(request.text) }),
    });
    return response.data;
};

const count = async () => {
    const response = await api.get<number>('/companies/count');
    return response.data;
};

const create = async ({ data }: { data: CompanyFormValues }) => {
    const response = await api.post<Company>('/companies', toFormData(data));
    return response.data;
};

const update = ({ id, data }: { id: number; data: CompanyFormValues }) => api.put(`/companies/${id}`, toFormData(data));

const remove = ({ id }: { id: number }) => api.delete(`/companies/${id}`);

/** A page of companies; the previous page stays on screen while the next one loads. */
export function useCompanyFindAll(request: PageRequest = {}, { enabled = true } = {}) {
    return useApiQuery({
        queryKey: companyKeys.list(request),
        queryFn: () => findAll(request),
        enabled,
        placeholderData: keepPreviousData,
        refetchInterval: REFETCH_INTERVAL,
        errorMessage: 'Não foi possível carregar as empresas.',
    });
}

export function useCompanyCount() {
    return useApiQuery({
        queryKey: companyKeys.count,
        queryFn: count,
        refetchInterval: REFETCH_INTERVAL,
        errorMessage: 'Não foi possível carregar o total de empresas.',
    });
}

/** How many matches a type-ahead field lists. */
const SEARCH_SIZE = 20;

/** Companies matching the text, by trade name, for type-ahead fields. Recent answers come from the cache. */
export function useCompanySearch() {
    return useApiFetch((text: string) => {
        const request: PageRequest = { text, size: SEARCH_SIZE, sort: { field: 'tradeName', direction: 'asc' } };
        return {
            queryKey: companyKeys.search(text),
            queryFn: async () => {
                const data = await findAll(request);
                return isPage<Company>(data) ? data.content : [];
            },
            staleTime: 30_000,
        };
    }, 'Não foi possível buscar as empresas.');
}

export function useCompanyCreate() {
    return useApiMutation({ mutationFn: create, errorMessage: 'Não foi possível cadastrar a empresa.' });
}

export function useCompanyUpdate() {
    return useApiMutation({ mutationFn: update, errorMessage: 'Não foi possível salvar as alterações da empresa.' });
}

export function useCompanyDelete() {
    return useApiMutation({ mutationFn: remove, errorMessage: 'Não foi possível excluir a empresa.' });
}

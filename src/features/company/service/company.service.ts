import { keepPreviousData } from '@tanstack/react-query';
import { api, REFETCH_INTERVAL } from '@/shared/api/api';
import { useApiMutation, useApiQuery } from '@/shared/api/api.service';
import { maskedNumberAsDigits, toPageParams } from '@/shared/api/pagination';
import type { Page, PageRequest } from '@/shared/types/api.types';
import type { Company, CompanyFormValues } from '../types/company.types';

const companyKeys = {
    list: (request: PageRequest) => ['companies', 'list', request] as const,
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
    const response = await api.post<Company>('/companies', data);
    return response.data;
};

const update = ({ id, data }: { id: number; data: CompanyFormValues }) => api.put(`/companies/${id}`, data);

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

export function useCompanyCreate() {
    return useApiMutation({ mutationFn: create, errorMessage: 'Não foi possível cadastrar a empresa.' });
}

export function useCompanyUpdate() {
    return useApiMutation({ mutationFn: update, errorMessage: 'Não foi possível salvar as alterações da empresa.' });
}

export function useCompanyDelete() {
    return useApiMutation({ mutationFn: remove, errorMessage: 'Não foi possível excluir a empresa.' });
}

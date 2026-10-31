import { api, REFETCH_INTERVAL } from '@/shared/api/api';
import { useApiMutation, useApiQuery } from '@/shared/api/api.service';
import type { Company, CompanyFormValues } from '../types/company.types';

const companyKeys = {
    all: ['companies'] as const,
    count: ['companiesQuantity'] as const,
};

const findAll = async () => {
    const response = await api.get<Company[]>('/companies');
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

export function useCompanyFindAll() {
    return useApiQuery({
        queryKey: companyKeys.all,
        queryFn: findAll,
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

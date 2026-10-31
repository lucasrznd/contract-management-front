import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, REFETCH_INTERVAL } from '@/shared/api/api';
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

const create = async (data: CompanyFormValues) => {
    const response = await api.post<Company>('/companies', data);
    return response.data;
};

const update = (data: CompanyFormValues) => api.put(`/companies/${data.id}`, data);

const remove = (id: number) => api.delete(`/companies/${id}`);

export function useCompanyFindAll() {
    return useQuery({ queryKey: companyKeys.all, queryFn: findAll, refetchInterval: REFETCH_INTERVAL });
}

export function useCompanyCount() {
    return useQuery({ queryKey: companyKeys.count, queryFn: count, refetchInterval: REFETCH_INTERVAL });
}

export function useCompanyPost() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: create, onSuccess: () => queryClient.invalidateQueries() });
}

export function useCompanyPut() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: update, onSuccess: () => queryClient.invalidateQueries() });
}

export function useCompanyDelete() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: remove, onSuccess: () => queryClient.invalidateQueries() });
}

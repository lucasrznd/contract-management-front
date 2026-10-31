import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, REFETCH_INTERVAL } from '@/shared/api/api';
import type { Contract, ContractFilter, ContractFormValues, DigitalDocument } from '../types/contract.types';

const contractKeys = {
    all: ['contracts'] as const,
    filter: (filter: ContractFilter | null) => ['contracts', 'filter', filter?.kind, filter?.params] as const,
    digitalDoc: (token: string | null | undefined) => ['contracts', 'digital-doc', token] as const,
    count: ['contractsQuantity'] as const,
    expiring: ['expiringContracts'] as const,
    lastFive: ['lastContracts'] as const,
    estimatedRevenue: ['estimatedRevenue'] as const,
};

const findAll = async () => {
    const response = await api.get<Contract[]>('/contracts');
    return response.data;
};

const filter = async (filter: ContractFilter) => {
    const path = filter.kind === 'company-seller' ? '/contracts/find' : '/contracts/list';
    const response = await api.get<Contract[]>(path, { params: filter.params });
    return response.data;
};

const count = async () => {
    const response = await api.get<number>('/contracts/count');
    return response.data;
};

const expiring = async () => {
    const response = await api.get<Contract[]>('/contracts/expiration-next-week');
    return response.data;
};

const lastFive = async () => {
    const response = await api.get<Contract[]>('/contracts/last-5');
    return response.data;
};

const totalEstimatedRevenue = async () => {
    const response = await api.get<string>('/contracts/total-estimated-revenue');
    return response.data;
};

const digitalDoc = async (token: string) => {
    const response = await api.get<DigitalDocument>('/contracts/get-doc', { params: { token } });
    return response.data;
};

const create = async (data: ContractFormValues) => {
    const response = await api.post<Contract>('/contracts', data);
    return response.data;
};

const update = (data: ContractFormValues) => api.put(`/contracts/${data.id}`, data);

const remove = (id: number) => api.delete(`/contracts/${id}`);

const createDigitalDoc = (data: Pick<Contract, 'id'>) => api.put(`/contracts/${data.id}/create-doc`);

const downloadPdf = async (data: Pick<Contract, 'id'>) => {
    const response = await api.get(`/contracts/${data.id}/pdf`, { responseType: 'blob' });

    const fileURL = window.URL.createObjectURL(new Blob([response.data]));
    const fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.setAttribute('download', `CONTRATO_${data.id}.pdf`);
    document.body.appendChild(fileLink);
    fileLink.click();
    fileLink.remove();
};

export function useContractFindAll() {
    return useQuery({ queryKey: contractKeys.all, queryFn: findAll, refetchInterval: REFETCH_INTERVAL });
}

/** Contracts matching the filter. Mutations invalidate every query, so the list stays fresh after edits. */
export function useContractFilter(contractFilter: ContractFilter | null) {
    return useQuery({
        queryKey: contractKeys.filter(contractFilter),
        queryFn: () => filter(contractFilter!),
        enabled: contractFilter !== null,
    });
}

export function useContractCount() {
    return useQuery({ queryKey: contractKeys.count, queryFn: count, refetchInterval: REFETCH_INTERVAL });
}

export function useContractExpiring() {
    return useQuery({ queryKey: contractKeys.expiring, queryFn: expiring, refetchInterval: REFETCH_INTERVAL });
}

export function useContractLastFive() {
    return useQuery({ queryKey: contractKeys.lastFive, queryFn: lastFive, refetchInterval: REFETCH_INTERVAL });
}

export function useTotalEstimatedRevenue() {
    return useQuery({
        queryKey: contractKeys.estimatedRevenue,
        queryFn: totalEstimatedRevenue,
        refetchInterval: REFETCH_INTERVAL,
    });
}

/** Signature status of a contract sent to the digital signature provider. */
export function useContractDigitalDoc(token: string | null | undefined, enabled: boolean) {
    return useQuery({
        queryKey: contractKeys.digitalDoc(token),
        queryFn: () => digitalDoc(token!),
        enabled: enabled && !!token,
    });
}

export function useContractPost() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: create, onSuccess: () => queryClient.invalidateQueries() });
}

export function useContractPut() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: update, onSuccess: () => queryClient.invalidateQueries() });
}

export function useContractDelete() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: remove, onSuccess: () => queryClient.invalidateQueries() });
}

export function useContractCreateDigitalDoc() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: createDigitalDoc, onSuccess: () => queryClient.invalidateQueries() });
}

export function useFetchContractPdf() {
    return useMutation({ mutationFn: downloadPdf });
}

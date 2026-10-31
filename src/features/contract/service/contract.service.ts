import { api, REFETCH_INTERVAL } from '@/shared/api/api';
import { useApiMutation, useApiQuery } from '@/shared/api/api.service';
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

const create = async ({ data }: { data: ContractFormValues }) => {
    const response = await api.post<Contract>('/contracts', data);
    return response.data;
};

const update = ({ id, data }: { id: number; data: ContractFormValues }) => api.put(`/contracts/${id}`, data);

const remove = ({ id }: { id: number }) => api.delete(`/contracts/${id}`);

const createDigitalDoc = ({ id }: { id: number }) => api.put(`/contracts/${id}/create-doc`);

const downloadPdf = async ({ id }: { id: number }) => {
    const response = await api.get(`/contracts/${id}/pdf`, { responseType: 'blob' });

    const fileURL = window.URL.createObjectURL(new Blob([response.data]));
    const fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.setAttribute('download', `CONTRATO_${id}.pdf`);
    document.body.appendChild(fileLink);
    fileLink.click();
    fileLink.remove();
};

export function useContractFindAll() {
    return useApiQuery({
        queryKey: contractKeys.all,
        queryFn: findAll,
        refetchInterval: REFETCH_INTERVAL,
        errorMessage: 'Não foi possível carregar os contratos.',
    });
}

/** Contracts matching the filter. Mutations invalidate every query, so the list stays fresh after edits. */
export function useContractFilter(contractFilter: ContractFilter | null) {
    return useApiQuery({
        queryKey: contractKeys.filter(contractFilter),
        queryFn: () => filter(contractFilter!),
        enabled: contractFilter !== null,
        errorMessage: 'Não foi possível filtrar os contratos.',
    });
}

export function useContractCount() {
    return useApiQuery({
        queryKey: contractKeys.count,
        queryFn: count,
        refetchInterval: REFETCH_INTERVAL,
        errorMessage: 'Não foi possível carregar o total de contratos.',
    });
}

export function useContractExpiring() {
    return useApiQuery({
        queryKey: contractKeys.expiring,
        queryFn: expiring,
        refetchInterval: REFETCH_INTERVAL,
        errorMessage: 'Não foi possível carregar os contratos próximos do vencimento.',
    });
}

export function useContractLastFive() {
    return useApiQuery({
        queryKey: contractKeys.lastFive,
        queryFn: lastFive,
        refetchInterval: REFETCH_INTERVAL,
        errorMessage: 'Não foi possível carregar os últimos contratos.',
    });
}

export function useTotalEstimatedRevenue() {
    return useApiQuery({
        queryKey: contractKeys.estimatedRevenue,
        queryFn: totalEstimatedRevenue,
        refetchInterval: REFETCH_INTERVAL,
        errorMessage: 'Não foi possível carregar a receita estimada.',
    });
}

/** Signature status of a contract sent to the digital signature provider. */
export function useContractDigitalDoc(token: string | null | undefined, enabled: boolean) {
    return useApiQuery({
        queryKey: contractKeys.digitalDoc(token),
        queryFn: () => digitalDoc(token!),
        enabled: enabled && !!token,
        errorMessage: 'Não foi possível consultar a assinatura do contrato.',
    });
}

export function useContractCreate() {
    return useApiMutation({ mutationFn: create, errorMessage: 'Não foi possível cadastrar o contrato.' });
}

export function useContractUpdate() {
    return useApiMutation({ mutationFn: update, errorMessage: 'Não foi possível salvar as alterações do contrato.' });
}

export function useContractDelete() {
    return useApiMutation({ mutationFn: remove, errorMessage: 'Não foi possível excluir o contrato.' });
}

export function useContractCreateDigitalDoc() {
    return useApiMutation({
        mutationFn: createDigitalDoc,
        errorMessage: 'Não foi possível enviar o contrato para assinatura digital.',
    });
}

export function useContractDownloadPdf() {
    return useApiMutation({
        mutationFn: downloadPdf,
        invalidateQueries: false,
        errorMessage: 'Não foi possível gerar o PDF do contrato.',
    });
}

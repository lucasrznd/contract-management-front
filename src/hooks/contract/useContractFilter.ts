import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { Contract, ContractFindParams, ContractListParams } from '../../types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/contracts';

/** Advanced search from the filter dialog; `label` describes it on screen. */
export type ContractFilter =
    | { kind: 'company-seller'; label: string; params: Required<ContractFindParams> }
    | { kind: 'period'; label: string; params: ContractListParams };

const fetchData = async (filter: ContractFilter) => {
    const path = filter.kind === 'company-seller' ? '/find' : '/list';
    const response = await axios.get<Contract[]>(API_URL + path, { params: filter.params });
    return response.data;
};

/** Contracts matching the filter. Mutations invalidate every query, so the list stays fresh after edits. */
export function useContractFilter(filter: ContractFilter | null) {
    return useQuery({
        queryFn: () => fetchData(filter!),
        queryKey: ['contracts', 'filter', filter?.kind, filter?.params],
        enabled: filter !== null,
    });
}

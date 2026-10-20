import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { Contract, ContractListParams } from '../../types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/contracts/list';

const fetchData = async (params: ContractListParams) => {
    const response = await axios.get<Contract[]>(API_URL, { params });
    return response.data;
};

export function useContractList(params: ContractListParams) {
    const query = useQuery({
        queryFn: () => fetchData(params),
        queryKey: ['filteredContracts', params],
        refetchInterval: 60 * 5 * 1000,
    });

    return query;
}

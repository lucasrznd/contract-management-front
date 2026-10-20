import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { Company } from '../../types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/companies';

const fetchData = async () => {
    const response = await axios.get<Company[]>(API_URL);
    return response.data;
};

export function useCompanyFindAll() {
    const query = useQuery({
        queryFn: fetchData,
        queryKey: ['companies'],
        refetchInterval: 60 * 5 * 1000,
    });

    return query;
}

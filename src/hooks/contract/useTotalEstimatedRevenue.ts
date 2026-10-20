import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/contracts/total-estimated-revenue';

const fetchData = async () => {
    const response = await axios.get<string>(API_URL);
    return response.data;
};

export function useTotalEstimatedRevenue() {
    const query = useQuery({
        queryFn: fetchData,
        queryKey: ['estimatedRevenue'],
        refetchInterval: 60 * 5 * 1000,
    });

    return query;
}

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/companies/count';

const fetchData = async () => {
    const response = await axios.get<number>(API_URL);
    return response.data;
};

export function useCompanyCount() {
    const query = useQuery({
        queryFn: fetchData,
        queryKey: ['companiesQuantity'],
        refetchInterval: 60 * 5 * 1000,
    });

    return query;
}

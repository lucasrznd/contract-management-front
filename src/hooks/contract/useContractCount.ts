import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/contracts/count';

const fetchData = async () => {
    const response = await axios.get<number>(API_URL);
    return response.data;
}

export function useContractCount() {
    const query = useQuery({
        queryFn: fetchData,
        queryKey: ['contractsQuantity'],
        refetchInterval: 60 * 5 * 1000
    });

    return query;
}
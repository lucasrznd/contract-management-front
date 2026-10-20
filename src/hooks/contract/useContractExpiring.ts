import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { Contract } from "../../types";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/contracts/expiration-next-week';

const fetchData = async () => {
    const response = await axios.get<Contract[]>(API_URL);
    return response.data;
}

export function useContractExpiring() {
    const query = useQuery({
        queryFn: fetchData,
        queryKey: ['expiringContracts'],
        refetchInterval: 60 * 5 * 1000
    });

    return query;
}
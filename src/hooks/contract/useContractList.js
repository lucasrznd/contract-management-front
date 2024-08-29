import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/contracts/list';

const fetchData = async (params) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
}

export function useContractList(params) {
    const query = useQuery({
        queryFn: () => fetchData(params),
        queryKey: ['filteredContracts', params],
        refetchInterval: 60 * 5 * 1000
    });

    return query;
}
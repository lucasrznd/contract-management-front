import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/contracts';

const fetchData = async () => {
    const response = await axios.get(API_URL);
    return response.data;
}

export function useContractFindAll() {
    const query = useQuery({
        queryFn: fetchData,
        queryKey: ['contracts'],
        refetchInterval: 60 * 5 * 1000
    });

    return query;
}
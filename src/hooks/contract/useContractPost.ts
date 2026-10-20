import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Contract, ContractFormValues } from "../../types";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/contracts';

const postData = async (data: ContractFormValues) => {
    const response = await axios.post<Contract>(API_URL, data);
    return response.data;
}

export function useContractPost() {
    const queryClient = useQueryClient();

    const mutate = useMutation({
        mutationFn: postData,
        onSuccess: () => {
            queryClient.invalidateQueries();
        }
    });

    return mutate;
}
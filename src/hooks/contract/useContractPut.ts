import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { ContractFormValues } from "../../types";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/contracts/';

const putData = async (data: ContractFormValues) => {
    return await axios.put(API_URL + data.id, data);
}

export function useContractPut() {
    const queryClient = useQueryClient();

    const mutate = useMutation({
        mutationFn: putData,
        onSuccess: () => {
            queryClient.invalidateQueries();
        }
    });

    return mutate;
}
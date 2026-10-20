import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Contract } from "../../types";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/contracts/';

const putData = async (data: Pick<Contract, 'id'>) => {
    return await axios.put(API_URL + data.id + "/create-doc");
}

export function useContractCreateDigitalDoc() {
    const queryClient = useQueryClient();

    const mutate = useMutation({
        mutationFn: putData,
        onSuccess: () => {
            queryClient.invalidateQueries();
        }
    });

    return mutate;
}
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { SellerFormValues } from "../../types";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/sellers/';

const putData = async (data: SellerFormValues) => {
    return await axios.put(API_URL + data.id, data);
}

export function useSellerPut() {
    const queryClient = useQueryClient();

    const mutate = useMutation({
        mutationFn: putData,
        onSuccess: () => {
            queryClient.invalidateQueries();
        }
    });

    return mutate;
}
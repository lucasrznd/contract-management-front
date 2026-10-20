import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { CompanyFormValues } from "../../types";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/companies/';

const putData = async (data: CompanyFormValues) => {
    return await axios.put(API_URL + data.id, data);
}

export function useCompanyPut() {
    const queryClient = useQueryClient();

    const mutate = useMutation({
        mutationFn: putData,
        onSuccess: () => {
            queryClient.invalidateQueries();
        }
    });

    return mutate;
}
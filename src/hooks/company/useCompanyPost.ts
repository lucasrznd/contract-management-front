import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Company, CompanyFormValues } from "../../types";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/companies';

const postData = async (data: CompanyFormValues) => {
    const response = await axios.post<Company>(API_URL, data);
    return response.data;
}

export function useCompanyPost() {
    const queryClient = useQueryClient();

    const mutate = useMutation({
        mutationFn: postData,
        onSuccess: () => {
            queryClient.invalidateQueries();
        }
    });

    return mutate;
}
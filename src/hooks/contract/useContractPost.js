import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/contracts';

const postData = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
}

export function useContractPost() {
    const queryClient = useQueryClient();

    const mutate = useMutation({
        mutationFn: postData,
        onSuccess: () => {
            queryClient.invalidateQueries(['postContract']);
        }
    });

    return mutate;
}
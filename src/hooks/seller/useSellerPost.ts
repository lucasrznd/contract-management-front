import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Seller, SellerFormValues } from '../../types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/sellers';

const postData = async (data: SellerFormValues) => {
    const response = await axios.post<Seller>(API_URL, data);
    return response.data;
};

export function useSellerPost() {
    const queryClient = useQueryClient();

    const mutate = useMutation({
        mutationFn: postData,
        onSuccess: () => {
            queryClient.invalidateQueries();
        },
    });

    return mutate;
}

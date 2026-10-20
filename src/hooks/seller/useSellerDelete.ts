import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/sellers/';

const deleteData = async (id: number) => {
    return await axios.delete(API_URL + id);
}

export function useSellerDelete() {
    const queryClient = useQueryClient();

    const mutatePut = useMutation({
        mutationFn: deleteData, onSuccess: () => {
            queryClient.invalidateQueries();
        },
    },
    );

    return mutatePut;
}
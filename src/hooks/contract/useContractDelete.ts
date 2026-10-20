import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/contracts/';

const deleteData = async (id: number) => {
    return await axios.delete(API_URL + id);
}

export function useContractDelete() {
    const queryClient = useQueryClient();

    const mutatePut = useMutation({
        mutationFn: deleteData, onSuccess: () => {
            queryClient.invalidateQueries();
        },
    },
    );

    return mutatePut;
}
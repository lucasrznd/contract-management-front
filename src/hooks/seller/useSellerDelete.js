import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/sellers/';

const deleteData = async (id) => {
    return await axios.delete(API_URL + id, id);
}

export function useSellerDelete() {
    const queryClient = useQueryClient();

    const mutatePut = useMutation({
        mutationFn: deleteData, onSuccess: () => {
            queryClient.invalidateQueries(['deleteSeller']);
        },
    },
    );

    return mutatePut;
}
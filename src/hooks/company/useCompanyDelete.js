import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/companies/';

const deleteData = async (id) => {
    return await axios.delete(API_URL + id, id);
}

export function useCompanyDelete() {
    const queryClient = useQueryClient();

    const mutatePut = useMutation({
        mutationFn: deleteData, onSuccess: () => {
            queryClient.invalidateQueries(['deleteCompany']);
        },
    },
    );

    return mutatePut;
}
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/contracts/';

const putData = async (data) => {
    return await axios.put(API_URL + data.id + "/create-doc");
}

export function useContractCreateDigitalDoc() {
    const queryClient = useQueryClient();

    const mutate = useMutation({
        mutationFn: putData,
        onSuccess: () => {
            queryClient.invalidateQueries(['digitalContract']);
        }
    });

    return mutate;
}
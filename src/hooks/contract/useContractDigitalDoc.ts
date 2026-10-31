import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import type { DigitalDocument } from '../../types';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/contracts/get-doc';

const fetchData = async (token: string) => {
    const response = await axios.get<DigitalDocument>(API_URL, { params: { token } });
    return response.data;
};

/** Signature status of a contract sent to the digital signature provider. */
export function useContractDigitalDoc(token: string | null | undefined, enabled: boolean) {
    return useQuery({
        queryFn: () => fetchData(token!),
        queryKey: ['contracts', 'digital-doc', token],
        enabled: enabled && !!token,
    });
}

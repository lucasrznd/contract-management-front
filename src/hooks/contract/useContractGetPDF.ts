import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import type { Contract } from "../../types";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/contracts/';

const pdfData = async (data: Pick<Contract, 'id'>) => {
     const response = await axios.get(API_URL + data.id + '/pdf', {
        responseType: 'blob'
     });

    const fileURL = window.URL.createObjectURL(new Blob([response.data]));
    const fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.setAttribute('download', `CONTRATO_${data.id}.pdf`);
    document.body.appendChild(fileLink);
    fileLink.click();
    fileLink.remove();
}

export function useFetchContractPdf() {
    return useMutation({
        mutationFn: (contractId: Pick<Contract, 'id'>) => pdfData(contractId)
    });
};
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/contracts/';

const pdfData = async (data) => {
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
        mutationFn: (contractId) => pdfData(contractId)
    });
};
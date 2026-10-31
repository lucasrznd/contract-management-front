import axios from 'axios';

export interface ZipCodeAddress {
    street: string;
    district: string;
    city: string;
    state: string;
}

/** Looks a CEP up on ViaCEP. Resolves null when the CEP doesn't exist. */
export async function fetchAddressByZipCode(zipCode: string): Promise<ZipCodeAddress | null> {
    const response = await axios.get<{
        erro?: boolean | string;
        logradouro: string;
        bairro: string;
        localidade: string;
        uf: string;
    }>(`https://viacep.com.br/ws/${zipCode.replace(/\D/g, '')}/json/`);

    const { erro, logradouro, bairro, localidade, uf } = response.data;
    if (erro) return null;
    return { street: logradouro, district: bairro, city: localidade, state: uf };
}

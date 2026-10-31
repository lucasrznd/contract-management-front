import type { Company } from '../types';

export function clearPhoneNumber(number: string) {
    const formattedNumber = number.replace(/\D/g, '');
    return formattedNumber;
}

export function clearRegistrationNumber(registrationNumber: string) {
    const registrationNumberFmt = registrationNumber.replace(/[^\w\s]/gi, '');
    return registrationNumberFmt;
}

export function formatPhoneNumberDt<K extends string>(rowData: Record<K, string>, columnName: K) {
    const cleanNumber = rowData[columnName].replace(/\D/g, '');

    if (cleanNumber.length < 10) {
        return rowData[columnName];
    }

    const areaCode = cleanNumber.substring(0, 2);
    const part1 = cleanNumber.substring(2, 3);
    const part2 = cleanNumber.substring(3, 7);
    const part3 = cleanNumber.substring(7, 11);

    const formattedNumber = `(${areaCode}) ${part1} ${part2}-${part3}`;
    return formattedNumber;
}

export function formatRegistrationNumberDt<K extends string>(rowData: Record<K, string>, columnName: K) {
    const registrationNumberFmt = rowData[columnName].replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return registrationNumberFmt;
}

export function buildEncodedStringAddress(rowData: Pick<Company, 'streetName' | 'number' | 'avenueName' | 'zipCode'>) {
    const addressString =
        rowData.streetName + ', ' + rowData.number + ', ' + rowData.avenueName + ', ' + rowData.zipCode;
    const encodedAddress = encodeURI(addressString);

    return encodedAddress;
}

export function dateFormatDt<K extends string>(
    rowData: Record<K, string | null | undefined> | null | undefined,
    columnName: K,
) {
    if (rowData && rowData[columnName]) {
        const [year, month, day] = rowData[columnName].split('-').map(Number);
        const data = new Date(year, month - 1, day);
        return data.toLocaleDateString('pt-BR');
    }
    return '';
}

export function parseDate(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    // month is 0-based in JavaScript Date, so we subtract 1 from month
    return new Date(year, month - 1, day);
}

export function dateNow() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
}

export function daysBetweenEndDate(endDate: string) {
    return Math.round((new Date(endDate).getTime() - new Date(dateNow()).getTime()) / (1000 * 60 * 60 * 24));
}

export function isValidDate(dateString: string | Date) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
}

export function replacePdfPath(pdfPath: string | null) {
    if (pdfPath !== null) {
        const pdfUrl = pdfPath.replace(/\\\\/g, 'http://').replace(/\\/g, '/');
        return pdfUrl;
    }

    return null;
}

/** Masks as you type: (19) 9 9381-8293 for mobiles (11 digits), (19) 3381-8293 for landlines (10). */
export function maskPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;

    const areaCode = `(${digits.slice(0, 2)}) `;
    const rest = digits.slice(2);
    if (digits.length === 11) return `${areaCode}${rest[0]} ${rest.slice(1, 5)}-${rest.slice(5)}`;
    if (rest.length <= 4) return areaCode + rest;
    return `${areaCode}${rest.slice(0, 4)}-${rest.slice(4)}`;
}

/** Record ids are shown zero-padded: 7 → "007". */
export function formatCode(id: number) {
    return String(id).padStart(3, '0');
}

/** First letters of the first and last names: "Ana Paula Moreira" → "AM". */
export function initials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Lowercase without accents, so "jose" matches "José". */
export function normalizeSearch(value: string) {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

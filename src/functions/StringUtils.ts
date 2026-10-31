import type { Company } from '../types';

export function clearPhoneNumber(number: string) {
    const formattedNumber = number.replace(/\D/g, '');
    return formattedNumber;
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

/** Masks digits as you type following `pattern`, where 9 is a digit: ("12345678", "99999-999") → "12345-678". */
export function maskPattern(value: string, pattern: string) {
    const digits = value.replace(/\D/g, '');
    let masked = '';
    let next = 0;
    for (const char of pattern) {
        if (next >= digits.length) break;
        masked += char === '9' ? digits[next++] : char;
    }
    return masked;
}

export const maskCnpj = (value: string) => maskPattern(value, '99.999.999/9999-99');
export const maskCpf = (value: string) => maskPattern(value, '999.999.999-99');
export const maskZipCode = (value: string) => maskPattern(value, '99999-999');

export const onlyDigits = (value: string) => value.replace(/\D/g, '');

/** Reads a price the API formatted as text ("R$ 1.500,00" or "R$1500.00") back into a number. */
export function parseMoney(formatted: string) {
    const value = formatted.replace(/[^\d,.-]/g, '');
    const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
    const number = parseFloat(normalized);
    return Number.isNaN(number) ? null : number;
}

/** Date → "yyyy-MM-dd" in local time (toISOString would shift it to UTC). */
export function toIsoDate(date: Date) {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${mm}-${dd}`;
}

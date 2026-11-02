type FormDataValue = string | number | File | null | undefined;

/** Multipart body for the endpoints that take files; empty values are left out, as JSON did with `undefined`. */
export function toFormData(values: object): FormData {
    const body = new FormData();
    for (const [key, value] of Object.entries(values) as [string, FormDataValue][]) {
        if (value === undefined || value === null || value === '') continue;
        body.append(key, value instanceof File ? value : String(value));
    }
    return body;
}

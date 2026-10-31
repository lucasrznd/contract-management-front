import type { ChangeEvent } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

/** Marks an input invalid and points it at the error message FormField renders for `id`. */
export function invalidProps(error: string | undefined, id: string) {
    return {
        invalid: !!error,
        'aria-invalid': !!error,
        'aria-describedby': error ? `${id}-error` : undefined,
    };
}

interface TextFieldOptions {
    /** Formats the value as you type, e.g. maskPhone. */
    mask?: (value: string) => string;
    /** Called with the (masked) value after the field is updated. */
    onChange?: (value: string) => void;
}

/** Props binding a text input to a field, with the ids FormField uses for its error and hint. */
export function textFieldProps<T extends FieldValues>(
    form: UseFormReturn<T>,
    name: Path<T>,
    id: string,
    { mask, onChange }: TextFieldOptions = {},
) {
    const error = form.formState.errors[name]?.message;
    const field = form.register(name, {
        onChange: onChange && ((e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)),
    });
    return {
        ...field,
        id,
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
            if (mask) e.target.value = mask(e.target.value);
            return field.onChange(e);
        },
        ...invalidProps(typeof error === 'string' ? error : undefined, id),
    };
}

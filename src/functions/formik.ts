import type { FormikProps } from 'formik';

type FormState<T> = Pick<
    FormikProps<T>,
    'values' | 'errors' | 'touched' | 'submitCount' | 'handleChange' | 'handleBlur'
>;

/** The field's error once it was left or the form was submitted; not while typing for the first time. */
export function fieldError<T>(formik: FormState<T>, name: keyof T & string): string | undefined {
    const error = formik.errors[name];
    return (formik.touched[name] || formik.submitCount > 0) && typeof error === 'string' ? error : undefined;
}

/** Props binding a text input to a string field, with the ids FormField uses for its error and hint. */
export function textFieldProps<T>(formik: FormState<T>, name: keyof T & string, id: string) {
    const error = fieldError(formik, name);
    return {
        id,
        name,
        value: String(formik.values[name] ?? ''),
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
        invalid: !!error,
        'aria-invalid': !!error,
        'aria-describedby': error ? `${id}-error` : undefined,
    };
}

import { AutoComplete } from 'primereact/autocomplete';
import { useCompanySearch } from '../service/company.service';
import { useSuggestions } from '@/shared/hooks/useSuggestions';
import type { Company } from '../types/company.types';

interface CompanyPickerProps {
    inputId: string;
    value: Company | null;
    onChange: (company: Company | null) => void;
    onBlur?: () => void;
    invalid?: boolean;
    'aria-describedby'?: string;
}

/** Type-ahead over the registered companies, searched by the API. */
export default function CompanyPicker({ value, onChange, ...props }: CompanyPickerProps) {
    const suggestions = useSuggestions(useCompanySearch());

    return (
        <AutoComplete
            {...props}
            {...suggestions}
            value={value}
            field="tradeName"
            forceSelection
            onChange={(e) => onChange(typeof e.value === 'object' && e.value ? e.value : null)}
            placeholder="Busque pelo nome, CNPJ ou cidade"
            emptyMessage="Nenhuma empresa encontrada"
            showEmptyMessage
            aria-invalid={props.invalid}
        />
    );
}

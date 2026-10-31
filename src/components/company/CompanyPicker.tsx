import { useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { useCompanyFindAll } from '../../hooks/company/useCompanyFindAll';
import { normalizeSearch } from '../../functions/StringUtils';
import type { Company } from '../../types';

interface CompanyPickerProps {
    inputId: string;
    value: Company | null;
    onChange: (company: Company | null) => void;
    onBlur?: () => void;
    invalid?: boolean;
    'aria-describedby'?: string;
}

/** Type-ahead over the registered companies, by trade name. */
export default function CompanyPicker({ value, onChange, ...props }: CompanyPickerProps) {
    const { data } = useCompanyFindAll();
    const companies = Array.isArray(data) ? data : [];
    const [suggestions, setSuggestions] = useState<Company[]>([]);

    return (
        <AutoComplete
            {...props}
            value={value}
            suggestions={suggestions}
            field="tradeName"
            forceSelection
            completeMethod={(e) =>
                setSuggestions(companies.filter((c) => normalizeSearch(c.tradeName).includes(normalizeSearch(e.query))))
            }
            onChange={(e) => onChange(typeof e.value === 'object' && e.value ? e.value : null)}
            placeholder="Busque pelo nome fantasia"
            aria-invalid={props.invalid}
        />
    );
}

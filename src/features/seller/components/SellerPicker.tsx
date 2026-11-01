import { AutoComplete } from 'primereact/autocomplete';
import UserAvatar from '@/shared/components/ui/UserAvatar';
import { useSellerSearch } from '../service/seller.service';
import { useSuggestions } from '@/shared/hooks/useSuggestions';
import type { Seller } from '../types/seller.types';

interface SellerPickerProps {
    inputId: string;
    value: Seller | null;
    onChange: (seller: Seller | null) => void;
    onBlur?: () => void;
    invalid?: boolean;
    'aria-describedby'?: string;
}

/** Type-ahead over the registered sellers, with photo, searched by the API. The button lists the first ones. */
export default function SellerPicker({ value, onChange, ...props }: SellerPickerProps) {
    const suggestions = useSuggestions(useSellerSearch());

    return (
        <AutoComplete
            {...props}
            {...suggestions}
            value={value}
            field="name"
            dropdown
            dropdownAriaLabel="Listar vendedores"
            forceSelection
            itemTemplate={(seller: Seller) => (
                <div className="flex align-items-center gap-2">
                    <UserAvatar name={seller.name} id={seller.id} src={seller.urlImage} size={24} />
                    {seller.name}
                </div>
            )}
            onChange={(e) => onChange(typeof e.value === 'object' && e.value ? e.value : null)}
            placeholder="Busque pelo nome"
            emptyMessage="Nenhum vendedor encontrado"
            showEmptyMessage
            aria-invalid={props.invalid}
        />
    );
}

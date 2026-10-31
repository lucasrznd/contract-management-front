import { Dropdown } from 'primereact/dropdown';
import UserAvatar from '../ui/UserAvatar';
import { useSellerFindAll } from '../../hooks/seller/useSellerFindAll';
import type { Seller } from '../../types';

interface SellerPickerProps {
    inputId: string;
    value: Seller | null;
    onChange: (seller: Seller | null) => void;
    onBlur?: () => void;
    invalid?: boolean;
    'aria-describedby'?: string;
    /** Lets the field be emptied (for optional filters). */
    showClear?: boolean;
}

/** Dropdown of the registered sellers, with photo and a search box. */
export default function SellerPicker({ value, onChange, ...props }: SellerPickerProps) {
    const { data } = useSellerFindAll();
    const sellers = Array.isArray(data) ? data : [];

    return (
        <Dropdown
            {...props}
            value={value}
            options={sellers}
            optionLabel="name"
            dataKey="id"
            filter
            filterPlaceholder="Buscar vendedor"
            emptyFilterMessage="Nenhum vendedor encontrado"
            emptyMessage="Nenhum vendedor cadastrado"
            placeholder="Selecione"
            itemTemplate={(seller: Seller) => (
                <div className="flex align-items-center gap-2">
                    <UserAvatar name={seller.name} id={seller.id} src={seller.urlImage} size={24} />
                    {seller.name}
                </div>
            )}
            onChange={(e) => onChange(e.value ?? null)}
            aria-invalid={props.invalid}
        />
    );
}

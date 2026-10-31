import { InputText } from 'primereact/inputtext';
import { CloseIcon, SearchIcon } from '../icons';
import styles from './SearchInput.module.css';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    'aria-label'?: string;
}

export default function SearchInput({ value, onChange, placeholder, 'aria-label': ariaLabel }: SearchInputProps) {
    return (
        <div className={styles.wrapper}>
            <SearchIcon className={styles.icon} />
            <InputText
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={ariaLabel ?? placeholder}
                className={styles.input}
            />
            {value && (
                <button type="button" className={styles.clear} onClick={() => onChange('')} aria-label="Limpar busca">
                    <CloseIcon size={14} />
                </button>
            )}
        </div>
    );
}

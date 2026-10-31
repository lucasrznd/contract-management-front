import type { ReactNode } from 'react';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import EmptyState from './EmptyState';
import { CloudOffIcon, SearchIcon } from '../icons';
import styles from './ListContent.module.css';

interface ListContentProps {
    isLoading: boolean;
    /** Request failed, or the API answered something that isn't a list. */
    isError: boolean;
    total: number;
    /** Rows left after the search. */
    visible: number;
    search: string;
    onClearSearch: () => void;
    /** e.g. "os vendedores", for "Não foi possível carregar os vendedores." */
    errorSubject: string;
    /** Shown when nothing is registered yet. */
    empty: { icon: ReactNode; title: string; description: string; action?: ReactNode };
    /** e.g. "Confira a grafia ou busque pelo telefone ou código." */
    noResultsHint: string;
    children: ReactNode;
}

/** Renders the list (children) or the loading, error, empty or no-results state in its place. */
export default function ListContent(props: ListContentProps) {
    if (props.isLoading) {
        return (
            <div className={styles.loading}>
                <ProgressSpinner />
            </div>
        );
    }

    if (props.isError) {
        return (
            <EmptyState
                tone="danger"
                icon={<CloudOffIcon size={26} />}
                title="Erro de conexão com servidor."
                description={`Não foi possível carregar ${props.errorSubject}. Tente novamente em alguns instantes.`}
            />
        );
    }

    if (!props.total) {
        return <EmptyState {...props.empty} />;
    }

    if (!props.visible) {
        return (
            <EmptyState
                tone="neutral"
                icon={<SearchIcon size={22} strokeWidth={1.9} />}
                title={props.search ? `Nenhum resultado para “${props.search}”` : 'Nenhum resultado'}
                description={props.noResultsHint}
                action={
                    <Button
                        label="Limpar busca"
                        outlined
                        className={styles.clearSearch}
                        onClick={props.onClearSearch}
                    />
                }
            />
        );
    }

    return <>{props.children}</>;
}

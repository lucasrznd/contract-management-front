export function errorMessageFormatter(message?: string): string | undefined {
    if (message === 'Exception in validation attributes') {
        return 'Erro no servidor ao validar campos.';
    }
}

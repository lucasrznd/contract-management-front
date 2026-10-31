import { parseDate } from './StringUtils';
import type { Contract } from '../types';

export type ContractStatus =
    | { kind: 'upcoming'; label: string }
    | { kind: 'active'; label: string }
    | { kind: 'expiring'; label: string }
    | { kind: 'ended'; label: string };

const DAY = 24 * 60 * 60 * 1000;

/** Where the contract is in its term, compared with `today`. Contracts ending within 30 days are "expiring". */
export function contractStatus(contract: Pick<Contract, 'startDate' | 'endDate'>, today = new Date()): ContractStatus {
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = parseDate(contract.startDate);
    const end = parseDate(contract.endDate);

    if (end < midnight) return { kind: 'ended', label: 'Encerrado' };
    if (start > midnight) return { kind: 'upcoming', label: 'A iniciar' };

    const daysLeft = Math.round((end.getTime() - midnight.getTime()) / DAY);
    if (daysLeft === 0) return { kind: 'expiring', label: 'Vence hoje' };
    if (daysLeft <= 30) return { kind: 'expiring', label: `Vence em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}` };
    return { kind: 'active', label: 'Vigente' };
}

/** "yyyy-MM-dd" → "dd/MM/yyyy". */
export function formatDate(isoDate: string) {
    return parseDate(isoDate).toLocaleDateString('pt-BR');
}

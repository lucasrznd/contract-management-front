import { expect, test } from 'vitest';
import { contractStatus } from './contract';

const today = new Date(2026, 9, 31); // 31/10/2026

test.each([
    ['2026-11-01', '2027-10-31', 'A iniciar'],
    ['2026-01-01', '2027-01-31', 'Vigente'],
    ['2026-01-01', '2026-11-15', 'Vence em 15 dias'],
    ['2026-01-01', '2026-11-01', 'Vence em 1 dia'],
    ['2026-01-01', '2026-10-31', 'Vence hoje'],
    ['2025-01-01', '2026-10-30', 'Encerrado'],
])('%s – %s is %j', (startDate, endDate, label) => {
    expect(contractStatus({ startDate, endDate }, today).label).toBe(label);
});

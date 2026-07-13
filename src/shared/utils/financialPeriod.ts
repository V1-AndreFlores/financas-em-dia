import { toIsoDate } from './date';

export interface FinancialPeriod {
  start: string;
  end: string;
  label: string;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getFinancialPeriod(
  referenceDate: Date,
  startDay: number,
): FinancialPeriod {
  const safeStartDay = Math.min(28, Math.max(1, startDay));
  const referenceYear = referenceDate.getFullYear();
  const referenceMonth = referenceDate.getMonth();
  const startsThisMonth = referenceDate.getDate() >= safeStartDay;

  const start = startsThisMonth
    ? new Date(referenceYear, referenceMonth, safeStartDay)
    : new Date(referenceYear, referenceMonth - 1, safeStartDay);

  const nextStart = new Date(start.getFullYear(), start.getMonth() + 1, safeStartDay);
  const end = addDays(nextStart, -1);

  const label = `${new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(start)} a ${new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(end)}`;

  return {
    start: toIsoDate(start),
    end: toIsoDate(end),
    label,
  };
}

export function isDateInPeriod(
  isoDate: string,
  period: Pick<FinancialPeriod, 'start' | 'end'>,
): boolean {
  return isoDate >= period.start && isoDate <= period.end;
}

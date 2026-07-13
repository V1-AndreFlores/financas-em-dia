export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(amountInCents / 100);
}

export function formatCurrencyInput(amountInCents: number): string {
  return (amountInCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function currencyInputToCents(value: string): number {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return 0;
  }

  return Number.parseInt(digits, 10);
}

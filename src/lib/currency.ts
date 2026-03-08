const localeByCurrency: Record<string, string> = {
  BRL: "pt-BR",
  EUR: "pt-PT",
  USD: "en-US",
};

export function formatCurrency(value: number, currencyCode = "EUR", locale?: string): string {
  const resolvedLocale = locale ?? localeByCurrency[currencyCode] ?? "en-US";

  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatInstallment(value: number, currencyCode = "EUR", parts = 3): string {
  return formatCurrency(value / parts, currencyCode);
}
export const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
});

export function formatCurrency(value: number) {
  return money.format(value);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'N/A';
  }

  const timestampMatch = value.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2})-(\d{2})-(\d{2})$/);
  const parsedValue = timestampMatch
    ? `${timestampMatch[3]}-${timestampMatch[2]}-${timestampMatch[1]}T${timestampMatch[4]}:${timestampMatch[5]}:${timestampMatch[6]}`
    : value;

  return new Date(parsedValue).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export function clampText(value: string, max = 24) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}...`;
}
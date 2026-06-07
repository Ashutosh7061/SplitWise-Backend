import { formatCurrency } from '../utils/format';

type StatCardProps = {
  label: string;
  value: number | string;
  hint?: string;
  tone?: 'accent' | 'success' | 'warning' | 'neutral';
  valueType?: 'number' | 'currency';
};

export function StatCard({ label, value, hint, tone = 'neutral', valueType = 'number' }: StatCardProps) {
  const formattedValue =
    typeof value === 'number'
      ? valueType === 'currency'
        ? formatCurrency(value)
        : value.toLocaleString('en-IN')
      : value;

  return (
    <article className={`stat-card tone-${tone}`}>
      <p>{label}</p>
      <strong>{formattedValue}</strong>
      {hint ? <span>{hint}</span> : null}
    </article>
  );
}
export function formatNaira(value: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactNairaMinorUnits(value: number): string {
  const naira = Math.abs(value) / 100;
  if (naira < 1_000_000_000) return formatNaira(value / 100);
  const unit = naira >= 1_000_000_000_000 ? 1_000_000_000_000 : 1_000_000_000;
  const suffix = unit === 1_000_000_000_000 ? 'tn' : 'bn';
  const rounded = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 2 }).format(naira / unit);
  return `≈${value < 0 ? '-' : ''}₦${rounded}${suffix}`;
}

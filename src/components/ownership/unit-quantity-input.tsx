import { useState } from 'react';

type UnitQuantityInputProps = Readonly<{
  quantity: number;
  minimum: number;
  maximum: number;
  onQuantityChange: (quantity: number) => void;
  compact?: boolean;
  disabled?: boolean;
}>;

export function UnitQuantityInput({
  quantity,
  minimum,
  maximum,
  onQuantityChange,
  compact = false,
  disabled = false,
}: UnitQuantityInputProps): React.JSX.Element {
  const [draft, setDraft] = useState<string | null>(null);

  const updateDraft = (value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setDraft(value);
    const parsed = Number(value);
    if (value !== '' && Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum)
      onQuantityChange(parsed);
  };

  const commit = () => {
    if (draft !== null && draft !== '') {
      const parsed = Number(draft);
      if (Number.isSafeInteger(parsed))
        onQuantityChange(Math.min(maximum, Math.max(minimum, parsed)));
    }
    setDraft(null);
  };

  return (
    <label className="relative flex items-center">
      <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-brand">Type units</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Number of units"
        title={`Type a number from ${minimum} to ${maximum}`}
        disabled={disabled}
        value={draft ?? String(quantity)}
        onChange={(event) => updateDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
        className={`${compact ? 'w-16 text-sm' : 'w-20 text-xl'} h-10 rounded-lg border-2 border-brand/45 bg-brand/[0.04] px-2 text-center font-semibold tabular-nums shadow-sm outline-none transition hover:border-brand focus:border-brand focus:bg-background focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50`}
      />
    </label>
  );
}

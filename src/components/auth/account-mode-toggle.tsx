'use client';

import { cn } from '@/lib/utils';

export type AccountMode = 'sign-in' | 'sign-up';

type AccountModeToggleProps = Readonly<{
  mode: AccountMode;
  onChange: (mode: AccountMode) => void;
}>;

const modes = [
  { value: 'sign-up', label: 'Create account' },
  { value: 'sign-in', label: 'Sign in' },
] as const satisfies readonly Readonly<{ value: AccountMode; label: string }>[];

export function AccountModeToggle({ mode, onChange }: AccountModeToggleProps): React.JSX.Element {
  return (
    <div className="mt-6 grid w-full grid-cols-2 rounded-xl border bg-surface p-1">
      {modes.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={mode === value}
          className={cn(
            'h-10 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            mode === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

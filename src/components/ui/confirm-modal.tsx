'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type ConfirmModalProps = Readonly<{
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'default' | 'danger';
  isConfirming?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}>;

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  tone = 'default',
  isConfirming = false,
  onClose,
  onConfirm,
  children,
}: ConfirmModalProps): React.JSX.Element | null {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-5 backdrop-blur-sm"
    >
      <section className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 id="confirm-title" className="font-sans text-xl font-semibold">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Close confirmation"
          >
            <X className="size-4" />
          </button>
        </div>
        {children && <div className="mt-5">{children}</div>}
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-brand-foreground ${tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand hover:brightness-110'}`}
          >
            {isConfirming ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

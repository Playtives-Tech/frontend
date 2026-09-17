'use client';

import { LogOut, Wrench } from 'lucide-react';

export function MaintenanceOverlay({
  message,
  onSignOut,
}: Readonly<{ message: string; onSignOut: () => void }>): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-5 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="maintenance-title"
        className="w-full max-w-md rounded-2xl border bg-background p-6 text-center shadow-2xl sm:p-8"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-amber-500/10 text-amber-600">
          <Wrench className="size-7" />
        </span>
        <h1 id="maintenance-title" className="mt-5 text-xl font-semibold">
          We’re currently undergoing maintenance
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Please check back shortly. Your account and data remain secure.
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition hover:bg-muted"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </section>
    </div>
  );
}

import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingSpinnerProps = Readonly<{
  className?: string;
  label?: string;
}>;

export function LoadingSpinner({
  className,
  label = 'Loading',
}: LoadingSpinnerProps): React.JSX.Element {
  return (
    <span className="inline-flex items-center justify-center" role="status" aria-label={label}>
      <LoaderCircle className={cn('size-4 animate-spin', className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

type ButtonLoadingContentProps = Readonly<{
  loading: boolean;
  loadingLabel?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}>;

export function ButtonLoadingContent({
  loading,
  loadingLabel = 'Working',
  children,
  icon,
}: ButtonLoadingContentProps): React.JSX.Element {
  if (loading) {
    return (
      <>
        <LoadingSpinner className="size-4" label={loadingLabel} />
        <span>{loadingLabel}</span>
      </>
    );
  }

  return (
    <>
      {children}
      {icon}
    </>
  );
}

type PageLoadingStateProps = Readonly<{
  label?: string;
  description?: string;
}>;

export function PageLoadingState({
  label = 'Loading',
  description = 'Preparing your Playtives workspace.',
}: PageLoadingStateProps): React.JSX.Element {
  return (
    <main className="grid min-h-[calc(100dvh-3.5rem)] place-items-center px-5 py-10">
      <div className="flex flex-col items-center text-center">
        <span className="relative grid size-16 place-items-center rounded-3xl bg-brand/10 text-brand">
          <span className="absolute inset-0 animate-ping rounded-3xl bg-brand/10" />
          <LoadingSpinner className="relative size-7" label={label} />
        </span>
        <h1 className="mt-5 font-sans text-lg font-bold tracking-normal">{label}</h1>
        <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </main>
  );
}

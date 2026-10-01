'use client';
import { useEffect } from 'react';

type ErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function ErrorPage({ error, reset }: ErrorPageProps): React.JSX.Element {
  useEffect(() => {
    console.error('Application render error:', error);
  }, [error]);

  return (
    <main className="container grid min-h-screen place-items-center">
      <section className="text-center">
        <p className="text-sm font-semibold text-brand">Something went wrong</p>
        <h1 className="mt-2 font-sans text-3xl font-semibold">Please try again.</h1>
        {process.env.NODE_ENV === 'development' && (
          <div className="mx-auto mt-4 max-w-xl rounded-lg border border-red-200 bg-red-50 p-4 text-left text-sm text-red-800">
            <p className="font-semibold">Development error details</p>
            <pre className="mt-2 whitespace-pre-wrap break-words font-mono">{error.message}</pre>
            {error.digest && <p className="mt-2 text-xs">Digest: {error.digest}</p>}
          </div>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground"
        >
          Retry
        </button>
      </section>
    </main>
  );
}

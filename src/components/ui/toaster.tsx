'use client';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
export function Toaster(): React.JSX.Element {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="top-center"
      closeButton={false}
      toastOptions={{
        classNames: {
          toast: '!rounded-2xl !border !bg-background !text-foreground !shadow-xl',
          success:
            '!border-emerald-500/35 !bg-emerald-50 !text-emerald-950 dark:!bg-emerald-950/40 dark:!text-emerald-50',
          error:
            '!border-red-500/35 !bg-red-50 !text-red-950 dark:!bg-red-950/40 dark:!text-red-50',
          info:
            '!border-sky-500/35 !bg-sky-50 !text-sky-950 dark:!bg-sky-950/40 dark:!text-sky-50',
          title: '!font-semibold',
          description: '!text-muted-foreground',
        },
      }}
    />
  );
}

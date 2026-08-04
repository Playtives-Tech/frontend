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
          toast: '!rounded-2xl !border-brand !bg-brand !text-brand-foreground !shadow-xl',
          title: '!text-brand-foreground',
          description: '!text-brand-foreground/80',
        },
      }}
    />
  );
}

import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Sora } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AppProviders } from '@/components/providers/app-providers';
import { AppShell } from '@/components/navigation/app-shell';

import '@/styles/globals.css';

const sans = Sora({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const heading = Cormorant_Garamond({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: { default: 'Playtives', template: '%s | Playtives' },
  description: 'A thoughtful place for play and connection.',
  openGraph: {
    type: 'website',
    title: 'Playtives',
    description: 'A thoughtful place for play and connection.',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${heading.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProviders>
            <AppShell>{children}</AppShell>
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}

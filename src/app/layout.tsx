import type { Metadata } from 'next';
import Script from 'next/script';
import { Instrument_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/theme/Provider';
import { SessionProvider } from 'next-auth/react';

const instrumentSans = Instrument_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Perplexica - Chat with the internet',
  description:
    'Perplexica is an AI powered chatbot that is connected to the internet.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://cdn.plot.ly/plotly-3.0.1.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={cn('h-full dark:bg-neutral-900', instrumentSans.className)}
      >
        <ThemeProvider>
          <SessionProvider>
            <Sidebar>{children}</Sidebar>
            <Toaster
              toastOptions={{
                unstyled: true,
                classNames: {
                  toast:
                    'bg-light-primary dark:bg-dark-secondary dark:text-white/70 text-black-70 rounded-lg p-4 flex flex-row items-center space-x-2',
                },
              }}
            />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

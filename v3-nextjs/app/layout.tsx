import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import GlobalTotal from './components/GlobalTotal';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'YuCCA Blog',
  description: 'A Next.js blog demo — server-rendered content with shared like counts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity">
              YuCCA Blog
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Total likes:</span>
              <span className="font-semibold text-foreground" data-testid="global-total-wrapper">
                <GlobalTotal />
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t py-6 text-center text-xs text-muted-foreground">
          Built with Next.js &amp; shadcn/ui — v3-nextjs demo
        </footer>
      </body>
    </html>
  );
}

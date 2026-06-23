import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

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
      <body className="min-h-full flex flex-col">
        <header className="border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">YuCCA Blog</h1>
          <span className="text-sm text-zinc-500">
            Total likes: <span data-testid="global-total">0</span>
          </span>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

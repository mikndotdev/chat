import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import './globals.css';

const hsr = localFont({ src: '../assets/fonts/HSR.woff2' });

export const metadata: Metadata = {
  title: 'MD Chat',
  description: 'The GPT Wrapper for your AI',
};

interface LocaleLayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LocaleLayoutProps) {
  return (
    <html className={hsr.className} data-theme="flat">
      <body>
        {children}
        <Toaster position={'top-center'} richColors />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { ServiceWorkerRegistrar } from '@/components/providers/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'AZLab — Creative Design Studio',
  description: 'Professional creative design tool for social media, typography, and graphic design.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <ServiceWorkerRegistrar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

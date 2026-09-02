import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoMotion - Live Vehicle Service Operations Dashboard',
  description: 'Production-grade real-time SaaS operations dashboard for vehicle service dispatches, mechanics telemetry, and revenue analytics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

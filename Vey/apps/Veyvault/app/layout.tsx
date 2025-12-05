import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Veyvault - Cloud Address Vault',
  description: 'Securely manage your addresses with end-to-end encryption',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

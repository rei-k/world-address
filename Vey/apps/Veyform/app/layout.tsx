import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Veyform Dashboard',
  description: 'Manage your Veyform integrations, API keys, and webhooks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

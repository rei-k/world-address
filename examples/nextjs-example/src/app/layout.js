import './globals.css';

export const metadata = {
  title: 'Next.js Address Form - @vey/core Example',
  description: 'Address validation with Next.js App Router and @vey/core SDK',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

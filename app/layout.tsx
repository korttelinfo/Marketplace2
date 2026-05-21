import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kortteli - Naapuruston keikkamartketpaikka',
  description: 'Etsi, tarjoa ja hallitse pieniä keikkoja oman naapuruston sisällä. Puhtaasti paikallinen, selkeä ja luotettava tapa tehdä arjesta kevyempää.',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

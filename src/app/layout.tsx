import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/context/UserContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Corica Talent Quantum',
  description: 'Système de Gestion des Performances',
  themeColor: '#F26322',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="light">
      <body className={`${inter.className} antialiased min-h-screen bg-[#F4F6F9] text-[#374151]`}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}


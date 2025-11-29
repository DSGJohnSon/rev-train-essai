import { Inter } from 'next/font/google';
import PublicHeader from '@/components/public/public-header';
import PublicFooter from '@/components/public/public-footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Révision Ferroviaire - Entraînement',
  description:
    'Entraînez-vous avec nos quiz et sessions de révision pour réussir vos examens ferroviaires',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
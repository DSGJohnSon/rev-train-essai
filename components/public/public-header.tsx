'use client';

import Link from 'next/link';
import { FaTrainTram } from 'react-icons/fa6';
import { usePathname } from 'next/navigation';
import PseudonymHeader from '@/components/public/pseudonym-header';
import ThemeToggle from '@/components/public/theme-toggle';

export default function PublicHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo et titre */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <FaTrainTram className="h-6 w-6 text-primary-foreground"/>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none">Regio-Revision</span>
            <span className="text-xs text-muted-foreground">Entraînement aux habilitations</span>
          </div>
        </Link>

        {/* Actions utilisateur */}
        <div className="flex items-center gap-2">
          <PseudonymHeader autoOpen={isHomePage} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
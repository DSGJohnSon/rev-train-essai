'use client';

import { Heart, Settings } from 'lucide-react';
import { FaTrainTram } from "react-icons/fa6";
import Link from 'next/link';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex flex-col items-center justify-between gap-4 py-6 px-4 md:h-16 md:flex-row md:py-0 md:px-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
          <p className="text-center text-xs leading-loose text-muted-foreground md:text-left">
            © {currentYear} Florkowski Frédérick. Tous droits réservés. Les données sont fournies à titre informatif et ne constituent pas un avis juridique.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Développé avec</span>
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <FaTrainTram className="h-4 w-4"/>
            <span>par Frédérick Florkowski avec <Link href="https://app.kilo.ai" target='_blank' className='underline'>Kilo Code</Link></span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-3 w-3" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
'use client';

import { Heart } from 'lucide-react';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex flex-col items-center justify-between gap-4 py-6 px-4 md:h-16 md:flex-row md:py-0 md:px-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {currentYear} Révision Ferroviaire. Tous droits réservés.
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Développé avec</span>
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          <span>par Kilo Code</span>
        </div>
      </div>
    </footer>
  );
}
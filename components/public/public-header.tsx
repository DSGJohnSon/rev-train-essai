'use client';

import Link from 'next/link';
import { Settings, Train } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo et titre */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Train className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none">Révision Ferroviaire</span>
            <span className="text-xs text-muted-foreground">Entraînement</span>
          </div>
        </Link>

        {/* Lien vers le backoffice */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Administration</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
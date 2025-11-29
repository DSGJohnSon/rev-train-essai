'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, FileQuestion, FolderTree, Tags, LogOut, Train } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Questions',
    href: '/questions',
    icon: FileQuestion,
  },
  {
    name: 'Catégories',
    href: '/categories',
    icon: FolderTree,
  },
  {
    name: 'Types de catégories',
    href: '/category-types',
    icon: Tags,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Déconnexion réussie');
        router.push('/login');
        router.refresh();
      } else {
        toast.error('Erreur lors de la déconnexion');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <div className="flex h-full flex-col gap-y-5 bg-slate-900 px-6 pb-4">
      {/* Logo et titre */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Train className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {process.env.NEXT_PUBLIC_APP_NAME || 'Revision Ferroviaire'}
          </span>
          <span className="text-xs text-slate-400">Backoffice</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors',
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-primary' : 'text-slate-400 group-hover:text-white'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}

          {/* Bouton de déconnexion en bas */}
          <li className="mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start gap-x-3 text-slate-400 hover:bg-slate-800/50 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
              Déconnexion
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
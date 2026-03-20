'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LEVELS } from '@/constants/roles';
import {
  LayoutDashboard,
  Ticket,
  CheckCircle,
  Users,
  UserCircle,
  Dices,
  ScrollText,
  Settings,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, minLevel: 2 },
  { name: 'Tickets en attente', href: '/tickets/pending', icon: Ticket, minLevel: 1 },
  { name: 'Tickets validés', href: '/tickets/validated', icon: CheckCircle, minLevel: 1 },
  { name: 'Lotos', href: '/lotteries', icon: Dices, minLevel: 3 },
  { name: 'Clients', href: '/clients', icon: UserCircle, minLevel: 2 },
  { name: 'Utilisateurs', href: '/users', icon: Users, minLevel: 2 },
  { name: 'Journal', href: '/audit-logs', icon: ScrollText, minLevel: 2 },
  { name: 'Configuration', href: '/settings', icon: Settings, minLevel: 3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const userLevel = ROLE_LEVELS[user.role];

  return (
    <aside className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">LotoTrading</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation
          .filter((item) => userLevel >= item.minLevel)
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="mb-3 text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-gray-400 text-xs">{user.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

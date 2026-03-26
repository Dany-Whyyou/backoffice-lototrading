'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LEVELS, ROLE_LABELS } from '@/constants/roles';
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
  ShieldCheck,
  Clock,
  CreditCard,
  Ban,
  Rss,
  PieChart,
} from 'lucide-react';

const navigation = [
  // Dashboard - everyone
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, minLevel: 1, section: 'Tableau de bord' },
  // Tickets - referent (2) and above
  { name: 'Tickets en attente', href: '/tickets/pending', icon: Ticket, minLevel: 2, section: 'Gestion' },
  { name: 'Tickets en cours', href: '/tickets/processing', icon: Clock, minLevel: 2, section: 'Gestion' },
  { name: 'Tickets valides', href: '/tickets/validated', icon: CheckCircle, minLevel: 2, section: 'Gestion' },
  { name: 'Tickets annules', href: '/tickets/cancelled', icon: Ban, minLevel: 3, section: 'Gestion' },
  // KYC, Transactions - supervisor (3) and above
  { name: 'KYC en attente', href: '/kyc', icon: ShieldCheck, minLevel: 3, section: 'Gestion' },
  { name: 'Transactions', href: '/payments', icon: CreditCard, minLevel: 3, section: 'Gestion' },
  // Clients - commercial (1) sees own, supervisor (3)+ sees all
  { name: 'Clients', href: '/clients', icon: UserCircle, minLevel: 1, section: 'Gestion' },
  // Administration - admin (4) and above
  { name: 'Lotos', href: '/lotteries', icon: Dices, minLevel: 4, section: 'Administration' },
  { name: 'Flux RSS', href: '/rss-feeds', icon: Rss, minLevel: 4, section: 'Administration' },
  { name: 'Utilisateurs', href: '/users', icon: Users, minLevel: 3, section: 'Administration' },
  { name: 'Matrice', href: '/matrix', icon: PieChart, minLevel: 4, section: 'Administration' },
  { name: 'Journal', href: '/audit-logs', icon: ScrollText, minLevel: 3, section: 'Administration' },
  { name: 'Configuration', href: '/settings', icon: Settings, minLevel: 4, section: 'Administration' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const userLevel = ROLE_LEVELS[user.role];
  const filteredNav = navigation.filter((item) => userLevel >= item.minLevel);

  // Group items by section
  let lastSection = '';

  return (
    <aside className="flex h-screen w-64 flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/5">
        <img src="/logo.png" alt="LotoTrading" className="h-8 w-8 rounded-lg object-contain" />
        <div>
          <h1 className="text-lg font-bold tracking-tight leading-tight">LotoTrading</h1>
          <p className="text-[9px] italic text-gray-500 text-right -mt-0.5">by JLM6.net</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {filteredNav.map((item) => {
          const showSectionHeader = item.section !== lastSection;
          lastSection = item.section;

          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <div key={item.name}>
              {showSectionHeader && (
                <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500 first:pt-0">
                  {item.section}
                </p>
              )}
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white/10 text-white border-l-2 border-blue-500 ml-0 pl-[10px]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent ml-0 pl-[10px]'
                )}
              >
                <item.icon className={cn('h-[18px] w-[18px]', isActive ? 'text-blue-400' : '')} />
                {item.name}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-4">
        <div className="mb-3 px-1">
          <p className="text-sm font-medium text-gray-200">{user.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{ROLE_LABELS[user.role]}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-all hover:bg-white/5 hover:text-gray-200"
        >
          <LogOut className="h-4 w-4" />
          Deconnexion
        </button>
      </div>
    </aside>
  );
}

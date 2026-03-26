'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { ROLE_LABELS } from '@/constants/roles';
import { RefreshCw, Users, ChevronRight } from 'lucide-react';
import type { User } from '@/types/user';
import type { Role } from '@/types/user';

const ROLE_BADGE_COLORS: Record<Role, string> = {
  super_admin: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  admin: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  supervisor: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  referent: 'bg-green-50 text-green-700 ring-green-600/20',
  commercial: 'bg-orange-50 text-orange-700 ring-orange-600/20',
};

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/admin/users').then((res) => res.data.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <Header
        title="Gestion des utilisateurs"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:shadow active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <Button onClick={() => router.push('/users/create')}>Nouvel utilisateur</Button>
          </div>
        }
      />
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-400">Chargement...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Users className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">Aucun utilisateur</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Nom</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Role</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Statut</th>
                  <th className="px-3 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u: User) => (
                  <tr
                    key={u.id}
                    onClick={() => router.push(`/users/${u.id}`)}
                    className="cursor-pointer transition-all hover:bg-gray-50/80 border-l-2 border-l-transparent hover:border-l-blue-500"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ' +
                        ROLE_BADGE_COLORS[u.role]
                      }>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={
                        u.is_active
                          ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'
                          : 'inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20'
                      }>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-3 py-4"><ChevronRight className="h-4 w-4 text-gray-300" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

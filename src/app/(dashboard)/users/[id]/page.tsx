'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants/roles';
import type { User } from '@/types/user';
import { CheckCircle, Activity, Shield, ArrowLeft } from 'lucide-react';

interface AuditLogEntry {
  id: number;
  action: string;
  target_type: string | null;
  target_id: number | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

interface UserDetail {
  user: User;
  stats: {
    validated_tickets: number;
    total_actions: number;
  };
  recent_logs: AuditLogEntry[];
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/admin/users/${id}`).then((res) => res.data as UserDetail),
  });

  const handleToggleStatus = async () => {
    await api.put(`/admin/users/${id}/toggle-status`);
    queryClient.invalidateQueries({ queryKey: ['user', id] });
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const handleResetPassword = async () => {
    if (!confirm('Reinitialiser le mot de passe de cet utilisateur ?')) return;
    const res = await api.post(`/admin/users/${id}/reset-password`);
    setTempPassword(res.data.temporary_password);
  };

  if (isLoading || !data) {
    return (
      <>
        <Header title="Detail utilisateur" />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-400">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  const { user, stats, recent_logs } = data;

  return (
    <>
      <Header
        title={user.name}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <Button variant="secondary" onClick={handleResetPassword}>
              Reinitialiser mot de passe
            </Button>
            <Button
              variant={user.is_active ? 'danger' : 'primary'}
              onClick={handleToggleStatus}
            >
              {user.is_active ? 'Desactiver' : 'Activer'}
            </Button>
          </div>
        }
      />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Temp password alert */}
        {tempPassword && (
          <div className="rounded-xl bg-yellow-50 ring-1 ring-yellow-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-yellow-800 mb-1">Nouveau mot de passe temporaire</p>
            <p className="font-mono text-lg text-yellow-900 select-all bg-yellow-100 rounded-lg px-3 py-2 mt-2">{tempPassword}</p>
            <p className="text-xs text-yellow-600 mt-2">Copiez-le maintenant, il ne sera plus affiche.</p>
          </div>
        )}

        {/* User info */}
        <div className="rounded-xl bg-white ring-1 ring-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Informations</h3>
            <span className={
              user.is_active
                ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'
                : 'inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20'
            }>
              {user.is_active ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Nom</p>
              <p className="font-medium text-gray-900">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Role</p>
              <p className="font-medium text-gray-900">{ROLE_LABELS[user.role]}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Cree le</p>
              <p className="font-medium text-gray-900">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-green-50 p-5 ring-1 ring-green-200 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-500">Tickets valides</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.validated_tickets}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-5 ring-1 ring-blue-200 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-500">Actions totales</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.total_actions}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-5 ring-1 ring-indigo-200 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-indigo-600" />
              <p className="text-xs text-gray-500">Role</p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>

        {/* Recent audit logs */}
        <div className="rounded-xl bg-white ring-1 ring-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Journal d&apos;activite</h3>
            <button
              onClick={() => router.push(`/audit-logs?admin_id=${id}`)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Voir tout
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recent_logs.length > 0 ? recent_logs.map((log) => (
              <div key={log.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{log.action.replace(/\./g, ' > ')}</p>
                  {log.target_type && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {log.target_type.split('\\').pop()} #{log.target_id}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{formatDate(log.created_at)}</p>
                  {log.ip_address && <p className="text-xs text-gray-300 mt-0.5">{log.ip_address}</p>}
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Aucune activite</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

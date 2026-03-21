'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants/roles';
import type { User } from '@/types/user';
import { CheckCircle, Activity, Shield } from 'lucide-react';

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
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const router = useRouter();

  const loadUser = () => {
    setLoading(true);
    api.get(`/admin/users/${id}`).then((res) => {
      setData(res.data);
      setLoading(false);
    });
  };

  useEffect(() => { loadUser(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleStatus = async () => {
    await api.put(`/admin/users/${id}/toggle-status`);
    loadUser();
  };

  const handleResetPassword = async () => {
    if (!confirm('Réinitialiser le mot de passe de cet utilisateur ?')) return;
    const res = await api.post(`/admin/users/${id}/reset-password`);
    setTempPassword(res.data.temporary_password);
  };

  if (loading || !data) {
    return (
      <>
        <Header title="Détail utilisateur" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
            <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">&larr; Retour</button>
            <Button variant="secondary" onClick={handleResetPassword}>
              Réinitialiser mot de passe
            </Button>
            <Button
              variant={user.is_active ? 'danger' : 'primary'}
              onClick={handleToggleStatus}
            >
              {user.is_active ? 'Désactiver' : 'Activer'}
            </Button>
          </div>
        }
      />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Temp password alert */}
        {tempPassword && (
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm font-semibold text-yellow-800 mb-1">Nouveau mot de passe temporaire</p>
            <p className="font-mono text-lg text-yellow-900 select-all">{tempPassword}</p>
            <p className="text-xs text-yellow-600 mt-1">Copiez-le maintenant, il ne sera plus affiché.</p>
          </div>
        )}

        {/* User info */}
        <div className="rounded-xl bg-white border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Informations</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {user.is_active ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Nom</p>
              <p className="font-medium text-gray-900">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-400">Rôle</p>
              <p className="font-medium text-gray-900">{ROLE_LABELS[user.role]}</p>
            </div>
            <div>
              <p className="text-gray-400">Créé le</p>
              <p className="font-medium text-gray-900">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-green-50 p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-500">Tickets validés</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.validated_tickets}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-500">Actions totales</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.total_actions}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-indigo-600" />
              <p className="text-xs text-gray-500">Rôle</p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>

        {/* Recent audit logs */}
        <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Journal d&apos;activité</h3>
            <button
              onClick={() => router.push(`/audit-logs?admin_id=${id}`)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Voir tout
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recent_logs.length > 0 ? recent_logs.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{log.action.replace(/\./g, ' › ')}</p>
                  {log.target_type && (
                    <p className="text-xs text-gray-400">
                      {log.target_type.split('\\').pop()} #{log.target_id}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{formatDate(log.created_at)}</p>
                  {log.ip_address && <p className="text-xs text-gray-300">{log.ip_address}</p>}
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Aucune activité</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

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
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LEVELS } from '@/constants/roles';
import { CheckCircle, Activity, Shield, ArrowLeft, ShieldCheck, ImageIcon, Loader2 } from 'lucide-react';

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

  const { user: currentUser } = useAuth();
  const [kycLoading, setKycLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/admin/users/${id}`).then((res) => res.data as UserDetail),
  });

  const handleToggleStatus = async () => {
    await api.put(`/admin/users/${id}/toggle-status`);
    queryClient.invalidateQueries({ queryKey: ['user', id] });
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const handleApproveKyc = async () => {
    if (!confirm('Approuver le KYC de cet utilisateur ?')) return;
    setKycLoading(true);
    try {
      await api.put(`/admin/users/${id}/review-kyc`, { action: 'approve' });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    } finally {
      setKycLoading(false);
    }
  };

  const handleRejectKyc = async () => {
    const reason = prompt('Raison du refus :');
    if (!reason) return;
    setKycLoading(true);
    try {
      await api.put(`/admin/users/${id}/review-kyc`, { action: 'reject', reason });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    } finally {
      setKycLoading(false);
    }
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

        {/* KYC Section - only for referent/commercial and if current user can review */}
        {(user.role === 'referent' || user.role === 'commercial') && currentUser && ROLE_LEVELS[currentUser.role] >= 3 && (
          <div className="rounded-xl bg-white ring-1 ring-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gray-400" />
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verification KYC</h3>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                user.kyc_status === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                user.kyc_status === 'under_review' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                user.kyc_status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                'bg-gray-50 text-gray-500 ring-gray-200'
              }`}>
                {user.kyc_status === 'approved' ? 'Approuve' :
                 user.kyc_status === 'under_review' ? 'En attente' :
                 user.kyc_status === 'rejected' ? 'Rejete' :
                 user.kyc_status === 'pending_kyc' ? 'Non soumis' : user.kyc_status ?? 'N/A'}
              </span>
            </div>

            {/* Documents */}
            {(user.kyc_document_path || user.kyc_selfie_path) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-gray-400 text-xs mb-2">Piece d&apos;identite</p>
                  {user.kyc_document_path ? (
                    <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                      <a href={`https://loto-trading.project-preview.ovh/${user.kyc_document_path}`} target="_blank" rel="noopener noreferrer" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://loto-trading.project-preview.ovh/${user.kyc_document_path}`}
                          alt="Document KYC"
                          className="w-full h-auto max-h-72 object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-gray-200 bg-gray-50 text-gray-400">
                      <div className="text-center">
                        <ImageIcon className="h-6 w-6 mx-auto mb-1.5" />
                        <p className="text-xs">Aucun document</p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-2">Selfie</p>
                  {user.kyc_selfie_path ? (
                    <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                      <a href={`https://loto-trading.project-preview.ovh/${user.kyc_selfie_path}`} target="_blank" rel="noopener noreferrer" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://loto-trading.project-preview.ovh/${user.kyc_selfie_path}`}
                          alt="Selfie KYC"
                          className="w-full h-auto max-h-72 object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-gray-200 bg-gray-50 text-gray-400">
                      <div className="text-center">
                        <ImageIcon className="h-6 w-6 mx-auto mb-1.5" />
                        <p className="text-xs">Aucun selfie</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approve / Reject buttons */}
            {user.kyc_status === 'under_review' && (
              <div className="flex gap-3">
                <Button onClick={handleApproveKyc} disabled={kycLoading}>
                  {kycLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Approuver
                </Button>
                <Button variant="danger" onClick={handleRejectKyc} disabled={kycLoading}>
                  Rejeter
                </Button>
              </div>
            )}

            {user.kyc_status === 'approved' && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 ring-1 ring-inset ring-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-700">KYC approuve</p>
              </div>
            )}

            {user.kyc_status === 'rejected' && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 ring-1 ring-inset ring-red-200">
                <ShieldCheck className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">KYC rejete</p>
              </div>
            )}
          </div>
        )}

        {/* Referral code for commercials */}
        {user.role === 'commercial' && user.referral_code && (
          <div className="rounded-xl bg-indigo-50 ring-1 ring-indigo-200 p-5 shadow-sm">
            <p className="text-xs text-indigo-500 mb-1">Code de parrainage</p>
            <p className="text-2xl font-bold text-indigo-700 font-mono tracking-wider">{user.referral_code}</p>
          </div>
        )}

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

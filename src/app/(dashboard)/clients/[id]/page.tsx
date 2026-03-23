'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { KYC_STATUS_LABELS, KYC_STATUS_COLORS, KYC_REJECTION_REASONS } from '@/constants/kycStatus';
import type { Client } from '@/types/client';
import type { TicketRequest } from '@/types/ticket';
import {
  Ticket, CheckCircle, Clock, XCircle, ArrowLeft, ChevronRight,
  ShieldCheck, ShieldX, FileText, ImageIcon, Ban,
} from 'lucide-react';

interface ClientDetail {
  client: Client;
  stats: {
    total_tickets: number;
    pending_tickets: number;
    validated_tickets: number;
    cancelled_tickets: number;
  };
}

function getDocumentUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://loto-trading.project-preview.ovh';
  return `${base}/${path}`;
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [kycLoading, setKycLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => api.get(`/admin/clients/${id}`).then((res) => res.data as ClientDetail),
  });

  const handleToggleStatus = async () => {
    await api.put(`/admin/clients/${id}/toggle-status`);
    queryClient.invalidateQueries({ queryKey: ['client', id] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  };

  const handleKycReview = async (action: 'approve' | 'reject', reason?: string) => {
    setKycLoading(true);
    try {
      await api.put(`/admin/clients/${id}/review-kyc`, { action, reason });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', 'pending-kyc'] });
      setShowRejectForm(false);
      setSelectedReason('');
      setCustomReason('');
    } finally {
      setKycLoading(false);
    }
  };

  const handleSuspend = async () => {
    setKycLoading(true);
    try {
      await api.put(`/admin/clients/${id}/review-kyc`, { action: 'reject', reason: 'Compte suspendu par un administrateur' });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', 'pending-kyc'] });
    } finally {
      setKycLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <>
        <Header title="Detail client" />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-400">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  const { client, stats } = data;
  const tickets = client.ticket_requests as unknown as TicketRequest[] | undefined;

  const statCards = [
    { label: 'Total tickets', value: stats.total_tickets, icon: Ticket, color: 'text-gray-600', bg: 'bg-gray-50', ring: 'ring-gray-200' },
    { label: 'En attente', value: stats.pending_tickets, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
    { label: 'Valides', value: stats.validated_tickets, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-200' },
    { label: 'Annules', value: stats.cancelled_tickets, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-200' },
  ];

  const rejectionReason = selectedReason === '__custom__' ? customReason : selectedReason;

  return (
    <>
      <Header
        title={`${client.first_name} ${client.last_name}`}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <Button variant="secondary" onClick={() => router.push(`/clients/${id}/edit`)}>Modifier</Button>
            <Button
              variant={client.is_active ? 'danger' : 'primary'}
              onClick={handleToggleStatus}
            >
              {client.is_active ? 'Desactiver' : 'Activer'}
            </Button>
          </div>
        }
      />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Client info */}
        <div className="rounded-xl bg-white ring-1 ring-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Informations</h3>
            <span className={
              client.is_active
                ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'
                : 'inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20'
            }>
              {client.is_active ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Prenom</p>
              <p className="font-medium text-gray-900">{client.first_name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Nom</p>
              <p className="font-medium text-gray-900">{client.last_name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Telephone</p>
              <p className="font-medium text-gray-900">{client.country_code} {client.phone}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Email</p>
              <p className="font-medium text-gray-900">{client.email ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Inscrit le</p>
              <p className="font-medium text-gray-900">{formatDate(client.created_at)}</p>
            </div>
          </div>
        </div>

        {/* KYC Section */}
        <div className="rounded-xl bg-white ring-1 ring-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gray-400" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verification KYC</h3>
            </div>
            <span className={
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ' +
              (KYC_STATUS_COLORS[client.kyc_status] || 'bg-gray-100 text-gray-700 ring-gray-600/20')
            }>
              {KYC_STATUS_LABELS[client.kyc_status] || client.kyc_status}
            </span>
          </div>

          {/* Document info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Type de document</p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                <FileText className="h-3.5 w-3.5 text-gray-400" />
                {client.kyc_document_type ?? 'Non fourni'}
              </div>
            </div>
            {client.kyc_reviewed_at && (
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Examine le</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(client.kyc_reviewed_at)}</p>
              </div>
            )}
            {client.kyc_reviewer && (
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Examine par</p>
                <p className="text-sm font-medium text-gray-900">{client.kyc_reviewer.name}</p>
              </div>
            )}
          </div>

          {/* Document image */}
          {client.kyc_document_path && (
            <div className="mb-5">
              <p className="text-gray-400 text-xs mb-2">Document soumis</p>
              <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 max-w-md">
                <a
                  href={getDocumentUrl(client.kyc_document_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getDocumentUrl(client.kyc_document_path)}
                    alt="Document KYC"
                    className="w-full h-auto max-h-96 object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling;
                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                    }}
                  />
                  <div className="hidden items-center justify-center h-48 text-gray-400">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-xs">Impossible de charger le document</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          )}

          {!client.kyc_document_path && (
            <div className="mb-5 flex items-center justify-center h-32 rounded-lg border border-dashed border-gray-200 bg-gray-50 text-gray-400">
              <div className="text-center">
                <ImageIcon className="h-6 w-6 mx-auto mb-1.5" />
                <p className="text-xs">Aucun document soumis</p>
              </div>
            </div>
          )}

          {/* Approved status info */}
          {client.kyc_status === 'approved' && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 ring-1 ring-inset ring-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">
                KYC approuve
                {client.kyc_reviewer && <span> par <strong>{client.kyc_reviewer.name}</strong></span>}
                {client.kyc_reviewed_at && <span> le {formatDate(client.kyc_reviewed_at)}</span>}
              </p>
            </div>
          )}

          {/* Rejected status info */}
          {client.kyc_status === 'rejected' && (
            <div className="rounded-lg bg-red-50 px-4 py-3 ring-1 ring-inset ring-red-200">
              <div className="flex items-center gap-2 mb-1">
                <ShieldX className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-700">KYC refuse</p>
              </div>
              {client.kyc_rejection_reason && (
                <p className="text-sm text-red-600 ml-6">Raison : {client.kyc_rejection_reason}</p>
              )}
              {client.kyc_reviewer && (
                <p className="text-xs text-red-500 ml-6 mt-1">
                  Par {client.kyc_reviewer.name}
                  {client.kyc_reviewed_at && <span> le {formatDate(client.kyc_reviewed_at)}</span>}
                </p>
              )}
            </div>
          )}

          {/* Suspended status info */}
          {client.kyc_status === 'suspended' && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 ring-1 ring-inset ring-red-200">
              <Ban className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">Compte suspendu</p>
            </div>
          )}

          {/* Action buttons for under_review */}
          {client.kyc_status === 'under_review' && !showRejectForm && (
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => handleKycReview('approve')}
                disabled={kycLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Approuver
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={kycLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Refuser
              </button>
            </div>
          )}

          {/* Reject form */}
          {client.kyc_status === 'under_review' && showRejectForm && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50/50 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-red-700">Motif du refus</h4>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
              >
                <option value="">Choisir un motif...</option>
                {KYC_REJECTION_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
                <option value="__custom__">Autre (saisie libre)</option>
              </select>
              {selectedReason === '__custom__' && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Saisissez le motif du refus..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none"
                />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleKycReview('reject', rejectionReason)}
                  disabled={kycLoading || !rejectionReason}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Confirmer le refus
                </button>
                <button
                  onClick={() => { setShowRejectForm(false); setSelectedReason(''); setCustomReason(''); }}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Suspend button for approved clients */}
          {client.kyc_status === 'approved' && (
            <div className="mt-4">
              <button
                onClick={handleSuspend}
                disabled={kycLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-all hover:bg-red-50 active:scale-95 disabled:opacity-50"
              >
                <Ban className="h-4 w-4" />
                Suspendre
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className={`rounded-xl ${card.bg} p-4 ring-1 ${card.ring} hover:shadow-sm transition-shadow`}>
              <div className="flex items-center gap-2 mb-1">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Recent tickets */}
        <div className="rounded-xl bg-white ring-1 ring-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Derniers tickets</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {tickets && tickets.length > 0 ? tickets.map((t: TicketRequest) => (
              <div
                key={t.id}
                onClick={() => router.push(`/tickets/${t.id}`)}
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer transition-all hover:bg-gray-50/80 border-l-2 border-l-transparent hover:border-l-blue-500"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-gray-400">#{t.id}</span>
                  <p className="text-sm text-gray-900">{t.lottery?.name ?? 'Loto'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={t.status} />
                  <span className="text-xs text-gray-400">{formatDate(t.created_at)}</span>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Aucun ticket</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

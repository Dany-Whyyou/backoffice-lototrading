'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import type { TicketRequest } from '@/types/ticket';

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [actionLoading, setActionLoading] = useState(false);
  const [officialNumber, setOfficialNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showValidateForm, setShowValidateForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.get(`/admin/ticket-requests/${id}`).then((res) => res.data as TicketRequest),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
  };

  const handleProcess = async () => {
    setActionLoading(true);
    try {
      await api.put(`/admin/ticket-requests/${id}/process`);
      invalidateAll();
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  const handleValidate = async () => {
    if (!officialNumber.trim()) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/ticket-requests/${id}/validate`, {
        official_ticket_number: officialNumber,
        notes: notes || undefined,
      });
      invalidateAll();
      setShowValidateForm(false);
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await api.put(`/admin/ticket-requests/${id}/cancel`, {
        reason: cancelReason || undefined,
      });
      invalidateAll();
      setShowCancelForm(false);
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  if (isLoading || !ticket) {
    return (
      <>
        <Header title="Detail du ticket" />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-400">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={`Ticket #${ticket.id}`}
        actions={
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        }
      />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Status + Actions */}
        <div className="rounded-xl bg-white ring-1 ring-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={ticket.status} />
              <span className="text-sm text-gray-400">Cree le {formatDate(ticket.created_at)}</span>
            </div>
            <div className="flex gap-2">
              {ticket.status === 'pending' && (
                <>
                  <Button onClick={handleProcess} disabled={actionLoading}>
                    Prendre en charge
                  </Button>
                  <Button variant="danger" onClick={() => setShowCancelForm(true)} disabled={actionLoading}>
                    Annuler
                  </Button>
                </>
              )}
              {ticket.status === 'processing' && (
                <>
                  <Button onClick={() => setShowValidateForm(true)} disabled={actionLoading}>
                    Valider le ticket
                  </Button>
                  <Button variant="danger" onClick={() => setShowCancelForm(true)} disabled={actionLoading}>
                    Annuler
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Validate form */}
          {showValidateForm && (
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-5 mb-4 space-y-3">
              <h4 className="text-sm font-semibold text-green-800">Valider ce ticket</h4>
              <input
                type="text"
                placeholder="Numero du ticket officiel *"
                value={officialNumber}
                onChange={(e) => setOfficialNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
              <textarea
                placeholder="Notes (optionnel)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                rows={2}
              />
              <div className="flex gap-2">
                <Button onClick={handleValidate} disabled={actionLoading || !officialNumber.trim()}>
                  Confirmer la validation
                </Button>
                <Button variant="ghost" onClick={() => setShowValidateForm(false)}>Annuler</Button>
              </div>
            </div>
          )}

          {/* Cancel form */}
          {showCancelForm && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 mb-4 space-y-3">
              <h4 className="text-sm font-semibold text-red-800">Annuler ce ticket</h4>
              <textarea
                placeholder="Raison de l'annulation (optionnel)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                rows={2}
              />
              <div className="flex gap-2">
                <Button variant="danger" onClick={handleCancel} disabled={actionLoading}>
                  Confirmer l&apos;annulation
                </Button>
                <Button variant="ghost" onClick={() => setShowCancelForm(false)}>Retour</Button>
              </div>
            </div>
          )}

          {/* Validated ticket info */}
          {ticket.status === 'validated' && ticket.validated_ticket && (
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs">&#10003;</span>
                <h4 className="text-sm font-semibold text-green-800">Ticket valide</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">N. officiel</p>
                  <p className="font-bold text-green-800 text-lg">{ticket.validated_ticket.official_ticket_number}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Valide le</p>
                  <p className="font-medium text-gray-900">{formatDate(ticket.validated_ticket.validated_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Operateur</p>
                  <p className="font-medium text-gray-900">{ticket.validated_ticket.operator?.name ?? '-'}</p>
                </div>
                {ticket.validated_ticket.notes && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-gray-900">{ticket.validated_ticket.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancelled info */}
          {ticket.status === 'cancelled' && ticket.notes && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 mb-4">
              <h4 className="text-sm font-semibold text-red-800 mb-1">Raison de l&apos;annulation</h4>
              <p className="text-sm text-red-700">{ticket.notes}</p>
            </div>
          )}
        </div>

        {/* Client info */}
        {ticket.client && (
          <div className="rounded-xl bg-white ring-1 ring-gray-100 p-6 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Client</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Nom</p>
                <p className="font-medium text-gray-900">{ticket.client.first_name} {ticket.client.last_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Telephone</p>
                <p className="font-medium text-gray-900">{ticket.client.country_code} {ticket.client.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Email</p>
                <p className="font-medium text-gray-900">{ticket.client.email ?? '-'}</p>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => router.push(`/clients/${ticket.client_id}`)}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Voir le profil
                  <ArrowLeft className="h-3 w-3 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lottery + Selections */}
        <div className="rounded-xl bg-white ring-1 ring-gray-100 p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            {ticket.lottery?.name ?? 'Loto'}
          </h3>
          {ticket.lottery?.description && (
            <p className="text-xs text-gray-400 mb-4">{ticket.lottery.description}</p>
          )}

          {ticket.selections?.map((sel, i) => (
            <div key={sel.id} className="mb-4 last:mb-0">
              {(ticket.selections?.length ?? 0) > 1 && (
                <p className="text-xs font-medium text-gray-500 mb-2">Grille {i + 1}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {sel.main_numbers.map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm shadow-sm shadow-blue-200"
                  >
                    {n}
                  </span>
                ))}
                {sel.bonus_numbers?.map((n) => (
                  <span
                    key={`b-${n}`}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-white font-bold text-sm shadow-sm shadow-yellow-200"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

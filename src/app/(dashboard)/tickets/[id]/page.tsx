'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { TicketRequest } from '@/types/ticket';

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<TicketRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [officialNumber, setOfficialNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showValidateForm, setShowValidateForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const router = useRouter();

  const loadTicket = () => {
    setLoading(true);
    api.get(`/admin/ticket-requests/${id}`).then((res) => {
      setTicket(res.data);
      setLoading(false);
    });
  };

  useEffect(() => { loadTicket(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProcess = async () => {
    setActionLoading(true);
    try {
      await api.put(`/admin/ticket-requests/${id}/process`);
      loadTicket();
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
      loadTicket();
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
      loadTicket();
      setShowCancelForm(false);
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  if (loading || !ticket) {
    return (
      <>
        <Header title="Détail du ticket" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={`Ticket #${ticket.id}`}
        actions={
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">
            &larr; Retour
          </button>
        }
      />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Status + Actions */}
        <div className="rounded-xl bg-white border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={ticket.status} />
              <span className="text-sm text-gray-400">Créé le {formatDate(ticket.created_at)}</span>
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
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-4 space-y-3">
              <h4 className="text-sm font-semibold text-green-800">Valider ce ticket</h4>
              <input
                type="text"
                placeholder="Numéro du ticket officiel *"
                value={officialNumber}
                onChange={(e) => setOfficialNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />
              <textarea
                placeholder="Notes (optionnel)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
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
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4 space-y-3">
              <h4 className="text-sm font-semibold text-red-800">Annuler ce ticket</h4>
              <textarea
                placeholder="Raison de l'annulation (optionnel)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
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
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600 text-lg">&#10003;</span>
                <h4 className="text-sm font-semibold text-green-800">Ticket validé</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">N° officiel</p>
                  <p className="font-bold text-green-800 text-lg">{ticket.validated_ticket.official_ticket_number}</p>
                </div>
                <div>
                  <p className="text-gray-500">Validé le</p>
                  <p className="font-medium text-gray-900">{formatDate(ticket.validated_ticket.validated_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Opérateur</p>
                  <p className="font-medium text-gray-900">{ticket.validated_ticket.operator?.name ?? '-'}</p>
                </div>
                {ticket.validated_ticket.notes && (
                  <div>
                    <p className="text-gray-500">Notes</p>
                    <p className="text-gray-900">{ticket.validated_ticket.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancelled info */}
          {ticket.status === 'cancelled' && ticket.notes && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4">
              <h4 className="text-sm font-semibold text-red-800 mb-1">Raison de l&apos;annulation</h4>
              <p className="text-sm text-red-700">{ticket.notes}</p>
            </div>
          )}
        </div>

        {/* Client info */}
        {ticket.client && (
          <div className="rounded-xl bg-white border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Client</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Nom</p>
                <p className="font-medium text-gray-900">{ticket.client.first_name} {ticket.client.last_name}</p>
              </div>
              <div>
                <p className="text-gray-400">Téléphone</p>
                <p className="font-medium text-gray-900">{ticket.client.country_code} {ticket.client.phone}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="font-medium text-gray-900">{ticket.client.email ?? '-'}</p>
              </div>
              <div>
                <button
                  onClick={() => router.push(`/clients/${ticket.client_id}`)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Voir le profil &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lottery + Selections */}
        <div className="rounded-xl bg-white border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {ticket.lottery?.name ?? 'Loto'}
          </h3>
          {ticket.lottery?.description && (
            <p className="text-xs text-gray-400 mb-4">{ticket.lottery.description}</p>
          )}

          {ticket.selections?.map((sel, i) => (
            <div key={sel.id} className="mb-4 last:mb-0">
              {(ticket.selections?.length ?? 0) > 1 && (
                <p className="text-xs text-gray-400 mb-2">Grille {i + 1}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {sel.main_numbers.map((n) => (
                  <span key={n} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm">
                    {n}
                  </span>
                ))}
                {sel.bonus_numbers?.map((n) => (
                  <span key={`b-${n}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-white font-bold text-sm">
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

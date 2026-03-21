'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Client } from '@/types/client';
import type { TicketRequest } from '@/types/ticket';
import { Ticket, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ClientDetail {
  client: Client;
  stats: {
    total_tickets: number;
    pending_tickets: number;
    validated_tickets: number;
    cancelled_tickets: number;
  };
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get(`/admin/clients/${id}`).then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, [id]);

  const handleToggleStatus = async () => {
    await api.put(`/admin/clients/${id}/toggle-status`);
    api.get(`/admin/clients/${id}`).then((res) => setData(res.data));
  };

  if (loading || !data) {
    return (
      <>
        <Header title="Détail client" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </>
    );
  }

  const { client, stats } = data;
  const tickets = client.ticket_requests as unknown as TicketRequest[] | undefined;

  const statCards = [
    { label: 'Total tickets', value: stats.total_tickets, icon: Ticket, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'En attente', value: stats.pending_tickets, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Validés', value: stats.validated_tickets, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Annulés', value: stats.cancelled_tickets, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <>
      <Header
        title={`${client.first_name} ${client.last_name}`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">&larr; Retour</button>
            <Button variant="secondary" onClick={() => router.push(`/clients/${id}/edit`)}>Modifier</Button>
            <Button
              variant={client.is_active ? 'danger' : 'primary'}
              onClick={handleToggleStatus}
            >
              {client.is_active ? 'Désactiver' : 'Activer'}
            </Button>
          </div>
        }
      />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Client info */}
        <div className="rounded-xl bg-white border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Informations</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${client.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {client.is_active ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Prénom</p>
              <p className="font-medium text-gray-900">{client.first_name}</p>
            </div>
            <div>
              <p className="text-gray-400">Nom</p>
              <p className="font-medium text-gray-900">{client.last_name}</p>
            </div>
            <div>
              <p className="text-gray-400">Téléphone</p>
              <p className="font-medium text-gray-900">{client.country_code} {client.phone}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-medium text-gray-900">{client.email ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-400">Inscrit le</p>
              <p className="font-medium text-gray-900">{formatDate(client.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className={`rounded-xl ${card.bg} p-4 border border-gray-100`}>
              <div className="flex items-center gap-2 mb-1">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Recent tickets */}
        <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Derniers tickets</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {tickets && tickets.length > 0 ? tickets.map((t: TicketRequest) => (
              <div
                key={t.id}
                onClick={() => router.push(`/tickets/${t.id}`)}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-gray-400">#{t.id}</span>
                  <p className="text-sm text-gray-900">{t.lottery?.name ?? 'Loto'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={t.status} />
                  <span className="text-xs text-gray-400">{formatDate(t.created_at)}</span>
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

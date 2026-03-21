'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/ui/StatusBadge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Ticket, Users, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import type { TicketRequest } from '@/types/ticket';

interface DashboardData {
  pending_tickets: number;
  processing_tickets: number;
  validated_today: number;
  cancelled_today: number;
  total_tickets: number;
  total_validated: number;
  active_clients: number;
  total_clients: number;
  new_clients_today: number;
  recent_tickets: TicketRequest[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const router = useRouter();

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </>
    );
  }

  const statCards = [
    { label: 'En attente', value: data.pending_tickets, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', iconBg: 'bg-yellow-100' },
    { label: 'En traitement', value: data.processing_tickets, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', iconBg: 'bg-blue-100' },
    { label: "Validés aujourd'hui", value: data.validated_today, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', iconBg: 'bg-green-100' },
    { label: 'Total validés', value: data.total_validated, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', iconBg: 'bg-indigo-100' },
    { label: 'Clients actifs', value: data.active_clients, icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50', iconBg: 'bg-cyan-100' },
    { label: 'Total tickets', value: data.total_tickets, icon: Ticket, color: 'text-gray-600', bg: 'bg-gray-50', iconBg: 'bg-gray-100' },
  ];

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <div key={card.label} className={`rounded-xl ${card.bg} p-5 border border-gray-100 hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className={`mt-1 text-3xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                <div className={`rounded-xl ${card.iconBg} p-3`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nouveaux clients aujourd&apos;hui</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{data.new_clients_today}</p>
          </div>
          <div className="rounded-xl bg-white p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Annulés aujourd&apos;hui</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{data.cancelled_today}</p>
          </div>
          <div className="rounded-xl bg-white p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total clients</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{data.total_clients}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Derniers tickets</h3>
            <button onClick={() => router.push('/tickets/pending')} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Voir tout
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recent_tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => router.push(`/tickets/${ticket.id}`)}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ticket.client ? `${ticket.client.first_name} ${ticket.client.last_name}` : '-'}
                    </p>
                    <p className="text-xs text-gray-400">{ticket.lottery?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs text-gray-400">{formatDate(ticket.created_at)}</span>
                </div>
              </div>
            ))}
            {data.recent_tickets.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Aucun ticket récent</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/ui/StatusBadge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { RefreshCw, CheckCircle, ChevronRight } from 'lucide-react';
import type { TicketRequest } from '@/types/ticket';

export default function ValidatedTicketsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', 'validated'],
    queryFn: () => api.get('/admin/validated-tickets').then((res) => res.data.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <Header
        title="Tickets valides"
        actions={
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['tickets', 'validated'] })}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:shadow active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
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
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <CheckCircle className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">Aucun ticket valide</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">ID</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Client</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Loto</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">N. Ticket officiel</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Operateur</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Statut</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Valide le</th>
                  <th className="px-3 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map((t: TicketRequest) => (
                  <tr
                    key={t.id}
                    onClick={() => router.push(`/tickets/${t.id}`)}
                    className="cursor-pointer transition-all hover:bg-gray-50/80 border-l-2 border-l-transparent hover:border-l-green-500"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-400">#{t.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {t.client ? `${t.client.first_name} ${t.client.last_name}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.lottery?.name ?? '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                        {t.validated_ticket?.official_ticket_number ?? '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.validated_ticket?.operator?.name ?? '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {t.validated_ticket?.validated_at ? formatDate(t.validated_ticket.validated_at) : '-'}
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

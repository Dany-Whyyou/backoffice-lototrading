'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Table from '@/components/ui/Table';
import StatusBadge from '@/components/ui/StatusBadge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { TicketRequest } from '@/types/ticket';

export default function PendingTicketsPage() {
  const [tickets, setTickets] = useState<TicketRequest[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.get('/admin/ticket-requests?status=pending').then((res) => setTickets(res.data.data));
  }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'client',
      label: 'Client',
      render: (t: TicketRequest) =>
        t.client ? `${t.client.first_name} ${t.client.last_name}` : '-',
    },
    {
      key: 'lottery',
      label: 'Loto',
      render: (t: TicketRequest) => t.lottery?.name ?? '-',
    },
    {
      key: 'selections',
      label: 'Grilles',
      render: (t: TicketRequest) => t.selections?.length ?? 0,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (t: TicketRequest) => <StatusBadge status={t.status} />,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (t: TicketRequest) => formatDate(t.created_at),
    },
  ];

  return (
    <>
      <Header title="Tickets en attente" />
      <div className="p-6">
        <Table columns={columns} data={tickets} onRowClick={(t) => router.push(`/tickets/${t.id}`)} />
      </div>
    </>
  );
}

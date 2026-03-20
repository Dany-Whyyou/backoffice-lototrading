'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Table from '@/components/ui/Table';
import StatusBadge from '@/components/ui/StatusBadge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { TicketRequest } from '@/types/ticket';

export default function ValidatedTicketsPage() {
  const [tickets, setTickets] = useState<TicketRequest[]>([]);

  useEffect(() => {
    api.get('/admin/validated-tickets').then((res) => setTickets(res.data.data));
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
      key: 'official_number',
      label: 'N° Ticket officiel',
      render: (t: TicketRequest) => t.validated_ticket?.official_ticket_number ?? '-',
    },
    {
      key: 'operator',
      label: 'Opérateur',
      render: (t: TicketRequest) => t.validated_ticket?.operator?.name ?? '-',
    },
    {
      key: 'status',
      label: 'Statut',
      render: (t: TicketRequest) => <StatusBadge status={t.status} />,
    },
    {
      key: 'validated_at',
      label: 'Validé le',
      render: (t: TicketRequest) =>
        t.validated_ticket?.validated_at ? formatDate(t.validated_ticket.validated_at) : '-',
    },
  ];

  return (
    <>
      <Header title="Tickets validés" />
      <div className="p-6">
        <Table columns={columns} data={tickets} />
      </div>
    </>
  );
}

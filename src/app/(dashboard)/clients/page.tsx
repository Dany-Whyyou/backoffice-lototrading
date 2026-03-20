'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Table from '@/components/ui/Table';
import api from '@/lib/api';
import type { Client } from '@/types/client';
import { formatDate } from '@/lib/utils';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    api.get('/admin/clients', { params: { search: search || undefined } })
      .then((res) => setClients(res.data.data));
  }, [search]);

  const columns = [
    {
      key: 'name',
      label: 'Nom',
      render: (c: Client) => `${c.first_name} ${c.last_name}`,
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone', render: (c: Client) => c.phone ?? '-' },
    {
      key: 'ticket_requests_count',
      label: 'Tickets',
      render: (c: Client) => c.ticket_requests_count ?? 0,
    },
    {
      key: 'is_active',
      label: 'Statut',
      render: (c: Client) => (
        <span className={c.is_active ? 'text-green-600' : 'text-red-600'}>
          {c.is_active ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Inscrit le',
      render: (c: Client) => formatDate(c.created_at),
    },
  ];

  return (
    <>
      <Header title="Gestion des clients" />
      <div className="p-6 space-y-4">
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Table columns={columns} data={clients} onRowClick={(c) => router.push(`/clients/${c.id}`)} />
      </div>
    </>
  );
}

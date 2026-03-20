'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import api from '@/lib/api';

interface DashboardData {
  pending_tickets: number;
  validated_today: number;
  active_clients: number;
  total_clients: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data));
  }, []);

  const cards = data
    ? [
        { label: 'Tickets en attente', value: data.pending_tickets, color: 'text-yellow-600' },
        { label: 'Validés aujourd\'hui', value: data.validated_today, color: 'text-green-600' },
        { label: 'Clients actifs', value: data.active_clients, color: 'text-blue-600' },
        { label: 'Total clients', value: data.total_clients, color: 'text-gray-600' },
      ]
    : [];

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className={`mt-2 text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

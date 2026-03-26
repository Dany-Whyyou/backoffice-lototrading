'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, RefreshCw, UserCircle, ChevronRight } from 'lucide-react';
import { KYC_STATUS_LABELS, KYC_STATUS_COLORS } from '@/constants/kycStatus';
import type { Client } from '@/types/client';

export default function ClientsPage() {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inputValue]);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', debouncedSearch],
    queryFn: () =>
      api
        .get('/admin/clients', { params: { search: debouncedSearch || undefined } })
        .then((res) => res.data.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <Header
        title="Gestion des clients"
        actions={
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['clients'] })}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:shadow active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        }
      />
      <div className="p-6 space-y-5">
        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, telephone, email..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-400">Chargement...</p>
            </div>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <UserCircle className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">
              {debouncedSearch ? 'Aucun client trouve' : 'Aucun client'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Nom</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Telephone</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tickets</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Code</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">KYC</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Statut</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Inscrit le</th>
                  <th className="px-3 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((c: Client) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/clients/${c.id}`)}
                    className="cursor-pointer transition-all hover:bg-gray-50/80 border-l-2 border-l-transparent hover:border-l-blue-500"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.country_code} {c.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.email ?? '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                        {c.ticket_requests_count ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      {(c as unknown as { referral_code_used?: string }).referral_code_used ?? '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ' +
                        (KYC_STATUS_COLORS[c.kyc_status] || 'bg-gray-100 text-gray-700 ring-gray-600/20')
                      }>
                        {KYC_STATUS_LABELS[c.kyc_status] || c.kyc_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={
                        c.is_active
                          ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'
                          : 'inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20'
                      }>
                        {c.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(c.created_at)}</td>
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

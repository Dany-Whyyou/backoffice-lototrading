'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ShieldCheck, ChevronRight, FileText } from 'lucide-react';
import { KYC_STATUS_LABELS, KYC_STATUS_COLORS } from '@/constants/kycStatus';
import type { Client } from '@/types/client';

export default function PendingKycPage() {
  const router = useRouter();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', 'pending-kyc'],
    queryFn: () => api.get('/admin/clients/pending-kyc').then(res => res.data.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <Header title="KYC en attente de vérification" />
      <div className="p-6 space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-400">Chargement...</p>
            </div>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ShieldCheck className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">Aucune demande KYC en attente</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Nom</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Telephone</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Type de document</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Statut KYC</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Soumis le</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Action</th>
                  <th className="px-3 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((c: Client) => (
                  <tr
                    key={c.id}
                    className="transition-all hover:bg-gray-50/80 border-l-2 border-l-transparent hover:border-l-yellow-500"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.country_code} {c.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        {c.kyc_document_type ?? '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ' +
                        (KYC_STATUS_COLORS[c.kyc_status] || 'bg-gray-100 text-gray-700 ring-gray-600/20')
                      }>
                        {KYC_STATUS_LABELS[c.kyc_status] || c.kyc_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(c.created_at)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/clients/${c.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-700 ring-1 ring-inset ring-yellow-600/20 transition-all hover:bg-yellow-100 hover:shadow-sm active:scale-95"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Examiner
                      </button>
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

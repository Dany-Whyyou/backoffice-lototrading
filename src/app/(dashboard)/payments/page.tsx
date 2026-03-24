'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { RefreshCw, TrendingUp, Clock, XCircle, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Payment {
  id: number;
  client_id: number;
  ticket_request_id: number | null;
  amount: string;
  currency: string;
  payment_method: string;
  payment_status: string;
  transaction_id: string | null;
  paypal_order_id: string | null;
  created_at: string;
  client?: { id: number; first_name: string; last_name: string; phone: string };
  ticket_request?: { id: number; lottery?: { name: string } } | null;
}

interface PaymentStats {
  total_revenue: string;
  today_revenue: string;
  total_transactions: number;
  today_transactions: number;
  pending_count: number;
  failed_count: number;
  by_method: { payment_method: string; count: number; total: string }[];
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: 'Reussi', bg: 'bg-green-50', text: 'text-green-700' },
  pending: { label: 'En attente', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  failed: { label: 'Echoue', bg: 'bg-red-50', text: 'text-red-700' },
  refunded: { label: 'Rembourse', bg: 'bg-gray-50', text: 'text-gray-700' },
};

const METHOD_LABELS: Record<string, string> = {
  paypal: 'PayPal',
  airtel_money: 'Airtel Money',
  visa: 'Carte Visa',
};

function formatAmount(amount: string | number, currency: string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  return `${formatted} ${currency === 'XAF' ? 'FCFA' : currency}`;
}

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: () => api.get('/admin/payments/stats').then((res) => res.data as PaymentStats),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', statusFilter, methodFilter, page],
    queryFn: () => api.get('/admin/payments', {
      params: {
        status: statusFilter || undefined,
        method: methodFilter || undefined,
        page,
      },
    }).then((res) => res.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const payments: Payment[] = paymentsData?.data ?? [];
  const lastPage = paymentsData?.last_page ?? 1;

  return (
    <>
      <Header
        title="Transactions"
        actions={
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['payments'] });
              queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:shadow active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        }
      />
      <div className="p-6 space-y-6">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-green-50 p-5 ring-1 ring-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Revenu total</p>
                  <p className="mt-1 text-2xl font-bold text-green-700">{formatAmount(stats.total_revenue, 'XAF')}</p>
                </div>
                <div className="rounded-xl bg-green-100 p-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-blue-50 p-5 ring-1 ring-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Aujourd&apos;hui</p>
                  <p className="mt-1 text-2xl font-bold text-blue-700">{formatAmount(stats.today_revenue, 'XAF')}</p>
                  <p className="text-xs text-blue-500 mt-0.5">{stats.today_transactions} transaction(s)</p>
                </div>
                <div className="rounded-xl bg-blue-100 p-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-yellow-50 p-5 ring-1 ring-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">En attente</p>
                  <p className="mt-1 text-2xl font-bold text-yellow-700">{stats.pending_count}</p>
                </div>
                <div className="rounded-xl bg-yellow-100 p-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-red-50 p-5 ring-1 ring-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Echoues</p>
                  <p className="mt-1 text-2xl font-bold text-red-700">{stats.failed_count}</p>
                </div>
                <div className="rounded-xl bg-red-100 p-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="completed">Reussi</option>
            <option value="pending">En attente</option>
            <option value="failed">Echoue</option>
            <option value="refunded">Rembourse</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tous les moyens</option>
            <option value="paypal">PayPal</option>
            <option value="airtel_money">Airtel Money</option>
            <option value="visa">Carte Visa</option>
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-400">Chargement...</p>
            </div>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <CreditCard className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">Aucune transaction</p>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">ID</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Client</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Loto</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Montant</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Moyen</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Statut</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Transaction</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p) => {
                    const statusConf = STATUS_CONFIG[p.payment_status] ?? STATUS_CONFIG.pending;
                    return (
                      <tr key={p.id} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-5 py-4 text-sm font-mono text-gray-400">#{p.id}</td>
                        <td className="px-5 py-4 text-sm">
                          {p.client ? (
                            <div>
                              <p className="font-medium text-gray-900">{p.client.first_name} {p.client.last_name}</p>
                              <p className="text-xs text-gray-400">{p.client.phone}</p>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {p.ticket_request?.lottery?.name ?? '-'}
                          {p.ticket_request && (
                            <span className="text-xs text-gray-400 ml-1">#{p.ticket_request.id}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                          {formatAmount(p.amount, p.currency)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                            {METHOD_LABELS[p.payment_method] ?? p.payment_method}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            statusConf.bg,
                            statusConf.text,
                          )}>
                            {statusConf.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-mono text-gray-400 max-w-[140px] truncate">
                          {p.transaction_id ?? p.paypal_order_id ?? '-'}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400">{formatDate(p.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Precedent
                </button>
                <span className="text-sm text-gray-500">Page {page} / {lastPage}</span>
                <button
                  onClick={() => setPage(Math.min(lastPage, page + 1))}
                  disabled={page >= lastPage}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  Suivant <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

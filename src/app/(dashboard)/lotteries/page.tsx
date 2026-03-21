'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { RefreshCw, Dices, ChevronRight } from 'lucide-react';
import type { Lottery } from '@/types/lottery';

export default function LotteriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: lotteries = [], isLoading } = useQuery({
    queryKey: ['lotteries'],
    queryFn: () => api.get('/admin/lotteries').then((res) => res.data.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <Header
        title="Gestion des lotos"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['lotteries'] })}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:shadow active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <Button onClick={() => router.push('/lotteries/create')}>Nouveau loto</Button>
          </div>
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
        ) : lotteries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Dices className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">Aucun loto configure</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lotteries.map((l: Lottery) => (
              <div
                key={l.id}
                onClick={() => router.push(`/lotteries/${l.id}`)}
                className="group relative cursor-pointer rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-gray-200 active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Dices className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{l.name}</h3>
                      <p className="text-xs text-gray-400 font-mono">{l.slug}</p>
                    </div>
                  </div>
                  <span className={
                    l.is_active
                      ? 'inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'
                      : 'inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20'
                  }>
                    {l.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {l.rule && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 font-medium ring-1 ring-inset ring-gray-200">
                      {l.rule.main_numbers_count} n. ({l.rule.main_numbers_min}-{l.rule.main_numbers_max})
                    </span>
                    {l.rule.bonus_numbers_count ? (
                      <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                        + {l.rule.bonus_numbers_count} bonus
                      </span>
                    ) : null}
                  </div>
                )}
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

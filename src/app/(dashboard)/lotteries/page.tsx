'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import type { Lottery } from '@/types/lottery';

export default function LotteriesPage() {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.get('/admin/lotteries').then((res) => setLotteries(res.data.data));
  }, []);

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'is_active',
      label: 'Statut',
      render: (l: Lottery) => (
        <span className={l.is_active ? 'text-green-600' : 'text-red-600'}>
          {l.is_active ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'rule',
      label: 'Config',
      render: (l: Lottery) =>
        l.rule
          ? `${l.rule.main_numbers_count} n° (${l.rule.main_numbers_min}-${l.rule.main_numbers_max})${l.rule.bonus_numbers_count ? ` + ${l.rule.bonus_numbers_count} bonus` : ''}`
          : '-',
    },
  ];

  return (
    <>
      <Header
        title="Gestion des lotos"
        actions={<Button onClick={() => router.push('/lotteries/create')}>Nouveau loto</Button>}
      />
      <div className="p-6">
        <Table columns={columns} data={lotteries} onRowClick={(l) => router.push(`/lotteries/${l.id}`)} />
      </div>
    </>
  );
}

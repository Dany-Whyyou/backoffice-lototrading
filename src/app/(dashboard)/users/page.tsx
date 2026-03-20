'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { ROLE_LABELS } from '@/constants/roles';
import type { User } from '@/types/user';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.get('/admin/users').then((res) => setUsers(res.data.data));
  }, []);

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Rôle',
      render: (u: User) => ROLE_LABELS[u.role],
    },
    {
      key: 'is_active',
      label: 'Statut',
      render: (u: User) => (
        <span className={u.is_active ? 'text-green-600' : 'text-red-600'}>
          {u.is_active ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
  ];

  return (
    <>
      <Header
        title="Gestion des utilisateurs"
        actions={<Button onClick={() => router.push('/users/create')}>Nouvel utilisateur</Button>}
      />
      <div className="p-6">
        <Table columns={columns} data={users} onRowClick={(u) => router.push(`/users/${u.id}`)} />
      </div>
    </>
  );
}

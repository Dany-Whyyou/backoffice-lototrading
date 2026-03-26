'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { getManageableRoles, ROLE_LABELS } from '@/constants/roles';

export default function CreateUserPage() {
  const [form, setForm] = useState({ name: '', email: '', role: 'referent' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const manageableRoles = user ? getManageableRoles(user.role) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/admin/users', form);
      setTempPassword(res.data.temporary_password);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Erreur lors de la création');
    }
    setSaving(false);
  };

  return (
    <>
      <Header
        title="Nouvel utilisateur"
        actions={
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">&larr; Retour</button>
        }
      />
      <div className="p-6 max-w-xl">
        {tempPassword ? (
          <div className="rounded-xl bg-white border border-gray-100 p-6 space-y-4">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800 mb-1">Utilisateur créé avec succès</p>
            </div>
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-1">Mot de passe temporaire</p>
              <p className="font-mono text-lg text-yellow-900 select-all">{tempPassword}</p>
              <p className="text-xs text-yellow-600 mt-1">Copiez-le maintenant et transmettez-le à l&apos;utilisateur.</p>
            </div>
            <Button onClick={() => router.push('/users')}>Retour à la liste</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl bg-white border border-gray-100 p-6 space-y-4">
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              >
                {manageableRoles.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-gray-400">Un mot de passe temporaire sera généré automatiquement.</p>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Création...' : 'Créer l\'utilisateur'}
              </Button>
              <Button variant="ghost" type="button" onClick={() => router.back()}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

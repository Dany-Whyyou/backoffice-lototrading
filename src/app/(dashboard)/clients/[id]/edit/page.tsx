'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

export default function ClientEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState({ first_name: '', last_name: '', country_code: '+241', phone: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    api.get(`/admin/clients/${id}`).then((res) => {
      const c = res.data.client ?? res.data;
      setForm({
        first_name: c.first_name,
        last_name: c.last_name,
        country_code: c.country_code || '+241',
        phone: c.phone,
        email: c.email || '',
      });
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/admin/clients/${id}`, {
        ...form,
        email: form.email || null,
      });
      setSuccess('Client mis à jour avec succès');
      setTimeout(() => router.push(`/clients/${id}`), 1000);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Erreur lors de la mise à jour');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <>
        <Header title="Modifier le client" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Modifier le client"
        actions={
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">&larr; Retour</button>
        }
      />
      <div className="p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="rounded-xl bg-white border border-gray-100 p-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indicatif</label>
              <input
                type="text"
                value={form.country_code}
                onChange={(e) => setForm({ ...form, country_code: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (optionnel)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </div>

          <p className="text-xs text-gray-400">
            La modification du numéro de téléphone constitue une migration de compte. Cette action est réservée aux administrateurs.
          </p>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button variant="ghost" type="button" onClick={() => router.back()}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

export default function CreateLotteryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    is_active: true,
    rules: {
      main_numbers_count: 5,
      main_numbers_min: 1,
      main_numbers_max: 50,
      bonus_numbers_count: 0,
      bonus_numbers_min: 1,
      bonus_numbers_max: 12,
      price: '',
      currency: 'XAF',
      draw_days: [] as number[],
      cutoff_hour: 17,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/admin/lotteries', {
        name: form.name,
        description: form.description || undefined,
        is_active: form.is_active,
        rules: {
          ...form.rules,
          price: form.rules.price ? parseFloat(form.rules.price) : null,
          bonus_numbers_count: form.rules.bonus_numbers_count || null,
          bonus_numbers_min: form.rules.bonus_numbers_count ? form.rules.bonus_numbers_min : null,
          bonus_numbers_max: form.rules.bonus_numbers_count ? form.rules.bonus_numbers_max : null,
        },
      });
      router.push('/lotteries');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Erreur lors de la creation');
    } finally {
      setSaving(false);
    }
  };

  const updateRules = (key: string, value: string | number | number[]) => {
    setForm({ ...form, rules: { ...form.rules, [key]: value } });
  };

  return (
    <>
      <Header
        title="Nouveau loto"
        actions={
          <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
        }
      />
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="rounded-xl bg-white p-6 ring-1 ring-gray-100 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Informations generales</h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nom du loto</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded border-gray-300" />
              <label htmlFor="active" className="text-sm text-gray-700">Actif</label>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 ring-1 ring-gray-100 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Regles du jeu</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Numeros principaux</label>
                <input type="number" required min={1} value={form.rules.main_numbers_count}
                  onChange={(e) => updateRules('main_numbers_count', parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Min</label>
                <input type="number" required min={1} value={form.rules.main_numbers_min}
                  onChange={(e) => updateRules('main_numbers_min', parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Max</label>
                <input type="number" required min={1} value={form.rules.main_numbers_max}
                  onChange={(e) => updateRules('main_numbers_max', parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Numeros bonus</label>
                <input type="number" min={0} value={form.rules.bonus_numbers_count}
                  onChange={(e) => updateRules('bonus_numbers_count', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              {form.rules.bonus_numbers_count > 0 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bonus min</label>
                    <input type="number" min={1} value={form.rules.bonus_numbers_min}
                      onChange={(e) => updateRules('bonus_numbers_min', parseInt(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bonus max</label>
                    <input type="number" min={1} value={form.rules.bonus_numbers_max}
                      onChange={(e) => updateRules('bonus_numbers_max', parseInt(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 ring-1 ring-gray-100 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Tarification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Prix par grille (FCFA)</label>
                <div className="relative">
                  <input type="number" min={0} step="1" value={form.rules.price}
                    onChange={(e) => updateRules('price', e.target.value)}
                    placeholder="Ex: 1500"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-16 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">FCFA</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Devise</label>
                <select value={form.rules.currency} onChange={(e) => updateRules('currency', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="XAF">XAF (FCFA)</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 ring-1 ring-gray-100 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Jours de tirage</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { day: 1, label: 'Lundi' },
                { day: 2, label: 'Mardi' },
                { day: 3, label: 'Mercredi' },
                { day: 4, label: 'Jeudi' },
                { day: 5, label: 'Vendredi' },
                { day: 6, label: 'Samedi' },
                { day: 7, label: 'Dimanche' },
              ].map(({ day, label }) => {
                const selected = form.rules.draw_days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const days = selected
                        ? form.rules.draw_days.filter((d: number) => d !== day)
                        : [...form.rules.draw_days, day].sort();
                      setForm({ ...form, rules: { ...form.rules, draw_days: days } });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="max-w-xs">
              <label className="block text-xs font-medium text-gray-500 mb-1">Heure limite d&apos;inscription (jour de tirage)</label>
              <select
                value={form.rules.cutoff_hour}
                onChange={(e) => updateRules('cutoff_hour', parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Creation...' : 'Creer le loto'}
          </Button>
        </form>
      </div>
    </>
  );
}

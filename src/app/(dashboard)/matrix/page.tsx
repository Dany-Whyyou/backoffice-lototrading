'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { PieChart, Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface MatrixMember {
  name: string;
  percentage: number;
  amount: number;
}

interface MatrixGroup {
  name: string;
  members: MatrixMember[];
  group_total_pct: number;
  group_total_amount: number;
}

interface CalculatedMatrix {
  ticket_price_xof: number;
  euro_price_xof: number;
  profit_per_ticket: number;
  groups: MatrixGroup[];
  total_percentage: number;
}

interface MatrixEntry {
  lottery: { id: number; name: string; rule?: { price: string; currency: string } };
  matrix: { id: number; euro_price_xof: string; distribution: Record<string, Record<string, number> | number> } | null;
  calculated: CalculatedMatrix | null;
  can_edit: boolean;
}

export default function MatrixPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editingLottery, setEditingLottery] = useState<number | null>(null);
  const [euroPrice, setEuroPrice] = useState('');
  const [distribution, setDistribution] = useState<Record<string, Record<string, number>>>({});
  const [saving, setSaving] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['profit-matrix'],
    queryFn: () => api.get('/admin/profit-matrix').then((res) => res.data as MatrixEntry[]),
  });

  const startEdit = (entry: MatrixEntry) => {
    setEditingLottery(entry.lottery.id);
    setEuroPrice(entry.matrix?.euro_price_xof ?? '');
    // Convert distribution to editable format
    const dist: Record<string, Record<string, number>> = {};
    if (entry.matrix?.distribution) {
      for (const [group, members] of Object.entries(entry.matrix.distribution)) {
        if (typeof members === 'object' && members !== null) {
          dist[group] = members as Record<string, number>;
        } else {
          dist[group] = { [group]: members as number };
        }
      }
    }
    setDistribution(dist);
  };

  const handleSave = async (lotteryId: number) => {
    setSaving(true);
    try {
      // Convert distribution back: if group has single member with same name, store as flat value
      const cleanDist: Record<string, Record<string, number> | number> = {};
      for (const [group, members] of Object.entries(distribution)) {
        const keys = Object.keys(members);
        if (keys.length === 1 && keys[0] === group) {
          cleanDist[group] = members[group];
        } else {
          cleanDist[group] = members;
        }
      }

      await api.post('/admin/profit-matrix', {
        lottery_id: lotteryId,
        euro_price_xof: parseFloat(euroPrice),
        distribution: cleanDist,
      });
      queryClient.invalidateQueries({ queryKey: ['profit-matrix'] });
      setEditingLottery(null);
    } finally {
      setSaving(false);
    }
  };

  const addGroup = () => {
    const name = prompt('Nom du groupe :');
    if (!name) return;
    setDistribution({ ...distribution, [name]: {} });
  };

  const removeGroup = (group: string) => {
    const d = { ...distribution };
    delete d[group];
    setDistribution(d);
  };

  const addMember = (group: string) => {
    const name = prompt('Nom du protagoniste :');
    if (!name) return;
    setDistribution({
      ...distribution,
      [group]: { ...distribution[group], [name]: 0 },
    });
  };

  const removeMember = (group: string, member: string) => {
    const g = { ...distribution[group] };
    delete g[member];
    setDistribution({ ...distribution, [group]: g });
  };

  const updatePct = (group: string, member: string, value: string) => {
    setDistribution({
      ...distribution,
      [group]: { ...distribution[group], [member]: parseFloat(value) || 0 },
    });
  };

  const totalPct = Object.values(distribution).reduce((sum, g) =>
    sum + Object.values(g).reduce((s, v) => s + v, 0), 0
  );

  const canEdit = user?.role === 'super_admin';

  return (
    <>
      <Header title="Matrice de repartition" />
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : entries.map((entry) => {
          const isEditing = editingLottery === entry.lottery.id;
          const calc = entry.calculated;
          const ticketPrice = parseFloat(entry.lottery.rule?.price ?? '0');

          return (
            <div key={entry.lottery.id} className="rounded-xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
                <div className="flex items-center gap-3">
                  <PieChart className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{entry.lottery.name}</h3>
                    <p className="text-xs text-gray-400">Prix ticket : {ticketPrice.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canEdit && !isEditing && (
                    <Button size="sm" variant="secondary" onClick={() => startEdit(entry)}>
                      Modifier
                    </Button>
                  )}
                  {isEditing && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setEditingLottery(null)}>Annuler</Button>
                      <Button size="sm" onClick={() => handleSave(entry.lottery.id)} disabled={saving}>
                        {saving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        <Save className="h-3 w-3 mr-1" /> Enregistrer
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6">
                {isEditing ? (
                  /* ========= EDIT MODE ========= */
                  <div className="space-y-5">
                    <div className="max-w-xs">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Prix du ticket en euro (XOF)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={euroPrice}
                        onChange={(e) => setEuroPrice(e.target.value)}
                        placeholder="Ex: 1640"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                      {euroPrice && (
                        <p className="text-xs text-green-600 mt-1">
                          Benefice : {(ticketPrice - parseFloat(euroPrice || '0')).toLocaleString('fr-FR')} FCFA
                        </p>
                      )}
                    </div>

                    {/* Groups */}
                    {Object.entries(distribution).map(([group, members]) => (
                      <div key={group} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900">{group}</h4>
                          <div className="flex gap-1">
                            <button onClick={() => addMember(group)} className="text-xs text-blue-600 hover:text-blue-800">
                              <Plus className="h-3 w-3 inline" /> Ajouter
                            </button>
                            <button onClick={() => removeGroup(group)} className="text-xs text-red-500 hover:text-red-700 ml-2">
                              <Trash2 className="h-3 w-3 inline" />
                            </button>
                          </div>
                        </div>
                        {Object.entries(members).map(([name, pct]) => (
                          <div key={name} className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-700 w-40 truncate">{name}</span>
                            <input
                              type="number"
                              step="0.00001"
                              value={pct}
                              onChange={(e) => updatePct(group, name, e.target.value)}
                              className="w-32 rounded border border-gray-300 px-2 py-1 text-sm text-right"
                            />
                            <span className="text-xs text-gray-400">%</span>
                            {euroPrice && (
                              <span className="text-xs text-green-600 font-medium">
                                {((ticketPrice - parseFloat(euroPrice || '0')) * pct / 100).toFixed(2)} FCFA
                              </span>
                            )}
                            <button onClick={() => removeMember(group, name)} className="text-gray-300 hover:text-red-500">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}

                    <button onClick={addGroup} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                      <Plus className="h-4 w-4" /> Ajouter un groupe
                    </button>

                    {/* Total */}
                    <div className={`rounded-lg p-3 text-sm font-semibold ${Math.abs(totalPct - 100) < 0.01 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      Total : {totalPct.toFixed(5)}% {Math.abs(totalPct - 100) < 0.01 ? '✓' : `(${totalPct < 100 ? 'manque' : 'depasse'} ${Math.abs(100 - totalPct).toFixed(5)}%)`}
                    </div>
                  </div>
                ) : calc ? (
                  /* ========= VIEW MODE ========= */
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <p className="text-[10px] text-blue-500 uppercase font-medium">Prix ticket</p>
                        <p className="text-lg font-bold text-blue-700">{calc.ticket_price_xof.toLocaleString('fr-FR')}</p>
                        <p className="text-[10px] text-blue-400">FCFA</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-medium">Cout Euro</p>
                        <p className="text-lg font-bold text-gray-700">{calc.euro_price_xof.toLocaleString('fr-FR')}</p>
                        <p className="text-[10px] text-gray-400">FCFA</p>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3 text-center">
                        <p className="text-[10px] text-green-500 uppercase font-medium">Benefice</p>
                        <p className="text-lg font-bold text-green-700">{calc.profit_per_ticket.toLocaleString('fr-FR')}</p>
                        <p className="text-[10px] text-green-400">FCFA / ticket</p>
                      </div>
                    </div>

                    {/* Groups */}
                    {calc.groups.map((group) => (
                      <div key={group.name} className="rounded-lg border border-gray-100 overflow-hidden">
                        <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{group.name}</h4>
                          <span className="text-xs text-gray-400">
                            {group.group_total_pct.toFixed(2)}% &mdash; {group.group_total_amount.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {group.members.map((member) => (
                            <div key={member.name} className="px-4 py-2.5 flex items-center justify-between">
                              <span className="text-sm text-gray-700">{member.name}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400 w-20 text-right">{member.percentage.toFixed(5)}%</span>
                                <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                                  {member.amount.toLocaleString('fr-FR')} FCFA
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Total check */}
                    <div className={`rounded-lg p-3 text-center text-sm font-semibold ${
                      Math.abs(calc.total_percentage - 100) < 0.01 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      Total reparti : {calc.total_percentage.toFixed(5)}%
                    </div>
                  </div>
                ) : (
                  /* ========= NO DATA ========= */
                  <div className="text-center py-8 text-gray-400">
                    <PieChart className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Aucune matrice configuree pour ce jeu</p>
                    {canEdit && (
                      <Button size="sm" className="mt-3" onClick={() => startEdit(entry)}>
                        Configurer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

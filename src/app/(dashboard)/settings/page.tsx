'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import type { AppConfig } from '@/types/config';

export default function SettingsPage() {
  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [newConfig, setNewConfig] = useState({ key: '', value: '', type: 'string', description: '' });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    api.get('/admin/configs').then((res) => setConfigs(res.data));
  };

  const handleSave = async (config: AppConfig) => {
    await api.put(`/admin/configs/${config.id}`, { value: editValue });
    setEditing(null);
    loadConfigs();
  };

  const handleAdd = async () => {
    await api.post('/admin/configs', newConfig);
    setAdding(false);
    setNewConfig({ key: '', value: '', type: 'string', description: '' });
    loadConfigs();
  };

  const handleDelete = async (config: AppConfig) => {
    if (!confirm(`Supprimer la configuration "${config.key}" ?`)) return;
    await api.delete(`/admin/configs/${config.id}`);
    loadConfigs();
  };

  return (
    <>
      <Header
        title="Configuration"
        actions={<Button onClick={() => setAdding(true)}>Ajouter</Button>}
      />
      <div className="p-6 space-y-4">
        {adding && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <h3 className="font-medium text-sm text-gray-700">Nouvelle configuration</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Cle"
                value={newConfig.key}
                onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <select
                value={newConfig.type}
                onChange={(e) => setNewConfig({ ...newConfig, type: e.target.value })}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="string">Texte</option>
                <option value="url">URL</option>
                <option value="phone">Telephone</option>
                <option value="email">Email</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <textarea
              placeholder="Valeur"
              value={newConfig.value}
              onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              rows={newConfig.type === 'json' ? 4 : 1}
            />
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={newConfig.description}
              onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd}>Enregistrer</Button>
              <button onClick={() => setAdding(false)} className="text-sm text-gray-500 hover:text-gray-700">
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {configs.map((config) => (
            <div
              key={config.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-900">{config.key}</span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {config.type}
                    </span>
                  </div>
                  {config.description && (
                    <p className="mt-1 text-xs text-gray-500">{config.description}</p>
                  )}

                  {editing === config.id ? (
                    <div className="mt-2 flex gap-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm font-mono"
                        rows={config.type === 'json' ? 4 : 1}
                      />
                      <div className="flex flex-col gap-1">
                        <Button onClick={() => handleSave(config)}>OK</Button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-700 font-mono whitespace-pre-wrap break-all">
                      {config.value}
                    </p>
                  )}
                </div>

                {editing !== config.id && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditing(config.id);
                        setEditValue(config.value);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(config)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

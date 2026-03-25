'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Rss, Trash2, Plus, ExternalLink, Loader2 } from 'lucide-react';

interface RssFeed {
  id: number;
  name: string;
  url: string;
  is_active: boolean;
  created_at: string;
}

export default function RssFeedsPage() {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [savingFeed, setSavingFeed] = useState(false);
  const [newFeed, setNewFeed] = useState({ name: '', url: '' });
  const [maxNews, setMaxNews] = useState('');
  const [savingMax, setSavingMax] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: feeds = [], isLoading } = useQuery({
    queryKey: ['rss-feeds'],
    queryFn: () => api.get('/admin/rss-feeds').then((res) => res.data as RssFeed[]),
  });

  const { data: configs } = useQuery({
    queryKey: ['configs'],
    queryFn: () => api.get('/admin/configs').then((res) => res.data),
  });

  const currentMax = (configs as { key: string; value: string }[] | undefined)
    ?.find((c) => c.key === 'max_news_slider')?.value ?? '10';

  const handleAdd = async () => {
    if (!newFeed.name || !newFeed.url || savingFeed) return;
    setSavingFeed(true);
    try {
      await api.post('/admin/rss-feeds', { ...newFeed, is_active: true });
      setAdding(false);
      setNewFeed({ name: '', url: '' });
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    } finally {
      setSavingFeed(false);
    }
  };

  const handleToggle = async (feed: RssFeed) => {
    if (loadingId) return;
    setLoadingId(feed.id);
    try {
      await api.put(`/admin/rss-feeds/${feed.id}`, { is_active: !feed.is_active });
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (feed: RssFeed) => {
    if (deletingId) return;
    if (!confirm(`Supprimer le flux "${feed.name}" ?`)) return;
    setDeletingId(feed.id);
    try {
      await api.delete(`/admin/rss-feeds/${feed.id}`);
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveMax = async () => {
    if (!maxNews || savingMax) return;
    setSavingMax(true);
    try {
      const existing = (configs as { id: number; key: string }[] | undefined)
        ?.find((c) => c.key === 'max_news_slider');
      if (existing) {
        await api.put(`/admin/configs/${existing.id}`, { value: maxNews });
      } else {
        await api.post('/admin/configs', {
          key: 'max_news_slider',
          value: maxNews,
          type: 'string',
          description: 'Nombre max de news dans le slider',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['configs'] });
    } finally {
      setSavingMax(false);
    }
  };

  return (
    <>
      <Header
        title="Flux RSS"
        actions={
          <Button onClick={() => setAdding(true)} disabled={adding}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter un flux
          </Button>
        }
      />
      <div className="p-6 space-y-6">
        {/* Max news config */}
        <div className="rounded-xl bg-white p-5 ring-1 ring-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Configuration du slider</h3>
          <div className="flex items-end gap-3">
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre max de news dans le slider</label>
              <select
                value={maxNews || currentMax}
                onChange={(e) => setMaxNews(e.target.value)}
                disabled={savingMax}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </div>
            <Button onClick={handleSaveMax} disabled={savingMax} size="sm">
              {savingMax && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              {savingMax ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>

        {/* Add form */}
        {adding && (
          <div className="rounded-xl bg-white p-5 ring-1 ring-blue-200 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Nouveau flux RSS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nom (ex: BBC Afrique)"
                value={newFeed.name}
                onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                disabled={savingFeed}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
              <input
                type="url"
                placeholder="URL du flux RSS"
                value={newFeed.url}
                onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
                disabled={savingFeed}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={savingFeed} size="sm">
                {savingFeed && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                {savingFeed ? 'Ajout...' : 'Ajouter'}
              </Button>
              <button onClick={() => setAdding(false)} disabled={savingFeed} className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50">Annuler</button>
            </div>
          </div>
        )}

        {/* Feeds list */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : feeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Rss className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm">Aucun flux RSS configure</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feeds.map((feed) => {
              const isToggling = loadingId === feed.id;
              const isDeleting = deletingId === feed.id;
              const isBusy = isToggling || isDeleting;

              return (
                <div
                  key={feed.id}
                  className={`rounded-xl bg-white p-4 ring-1 ring-gray-100 flex items-center gap-4 transition-all hover:shadow-sm ${isBusy ? 'opacity-60' : ''}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${feed.is_active ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                    {isToggling ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rss className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{feed.name}</p>
                      <span className={feed.is_active
                        ? 'inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20'
                        : 'inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500 ring-1 ring-inset ring-gray-200'
                      }>
                        {feed.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{feed.url}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">Ajoute le {formatDate(feed.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={feed.url} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleToggle(feed)}
                      disabled={isBusy}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        feed.is_active
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {isToggling ? 'Chargement...' : (feed.is_active ? 'Desactiver' : 'Activer')}
                    </button>
                    <button
                      onClick={() => handleDelete(feed)}
                      disabled={isBusy}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

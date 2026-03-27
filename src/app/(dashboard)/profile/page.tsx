'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { ROLE_LABELS } from '@/constants/roles';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types/user';
import { User as UserIcon, Lock, Shield, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/admin/me').then((res) => res.data.user as User),
  });

  const [name, setName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Init name when data loads
  if (data && !name) {
    setName(data.name);
  }

  const handleUpdateName = async () => {
    if (!name.trim()) return;
    setNameLoading(true);
    setNameSuccess(false);
    try {
      await api.put('/admin/profile', { name: name.trim() });
      // Update stored user
      const stored = localStorage.getItem('admin_user');
      if (stored) {
        const user = JSON.parse(stored);
        user.name = name.trim();
        localStorage.setItem('admin_user', JSON.stringify(user));
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess(false);

    if (newPwd.length < 8) {
      setPwdError('Le nouveau mot de passe doit contenir au moins 8 caracteres.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('Les mots de passe ne correspondent pas.');
      return;
    }

    setPwdLoading(true);
    try {
      await api.post('/admin/change-password', {
        current_password: currentPwd,
        new_password: newPwd,
        new_password_confirmation: confirmPwd,
      });
      setPwdSuccess(true);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
      setPwdError(msg?.errors?.current_password?.[0] || msg?.message || 'Erreur lors du changement.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <>
        <Header title="Mon profil" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Mon profil" />
      <div className="p-6 space-y-6 max-w-2xl">
        {/* User info card */}
        <div className="rounded-xl bg-white ring-1 ring-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {data.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{data.name}</h2>
              <p className="text-sm text-gray-500">{data.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="h-3 w-3 text-indigo-500" />
                <span className="text-xs text-indigo-600 font-medium">{ROLE_LABELS[data.role]}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Email</p>
              <p className="font-medium text-gray-900">{data.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Membre depuis</p>
              <p className="font-medium text-gray-900">{formatDate(data.created_at)}</p>
            </div>
            {data.referral_code && (
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Code parrainage</p>
                <p className="font-mono font-bold text-indigo-600 text-lg tracking-wider">{data.referral_code}</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit name */}
        <div className="rounded-xl bg-white ring-1 ring-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Modifier mon nom</h3>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Button onClick={handleUpdateName} disabled={nameLoading || name === data.name}>
              {nameLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : nameSuccess ? <CheckCircle className="h-4 w-4" /> : 'Enregistrer'}
            </Button>
          </div>
          {nameSuccess && <p className="text-xs text-green-600 mt-2">Nom mis a jour !</p>}
        </div>

        {/* Change password */}
        <div className="rounded-xl bg-white ring-1 ring-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Changer mon mot de passe</h3>
          </div>

          {pwdError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 mb-4">{pwdError}</div>
          )}
          {pwdSuccess && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 mb-4">Mot de passe modifie avec succes !</div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" disabled={pwdLoading} className="w-full">
              {pwdLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {pwdLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

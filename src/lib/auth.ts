import type { User } from '@/types/user';
import api from './api';

export async function login(email: string, password: string): Promise<{ user: User; token: string; kyc_required: boolean; kyc_status: string | null }> {
  const { data } = await api.post('/admin/login', { email, password });
  localStorage.setItem('admin_token', data.token);
  localStorage.setItem('admin_user', JSON.stringify(data.user));
  localStorage.setItem('admin_kyc_required', data.kyc_required ? '1' : '0');
  localStorage.setItem('admin_kyc_status', data.kyc_status ?? '');
  return data;
}

export function getKycRequired(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('admin_kyc_required') === '1';
}

export function getKycStatus(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_kyc_status') || null;
}

export function logout(): void {
  api.post('/admin/logout').catch(() => {});
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('admin_user');
  return stored ? JSON.parse(stored) : null;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

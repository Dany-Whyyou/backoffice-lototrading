'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/user';
import { getStoredUser, getToken, logout as authLogout } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
    } else if (!token) {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    router.push('/login');
  }, [router]);

  return { user, loading, logout };
}

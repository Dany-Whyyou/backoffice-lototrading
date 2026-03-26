'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { getKycRequired, getKycStatus } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const kycRequired = getKycRequired();
      const kycStatus = getKycStatus();

      // Redirect to KYC page if required and not approved
      if (kycRequired && kycStatus !== 'approved' && kycStatus !== 'under_review') {
        router.push('/admin-kyc');
      }
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
    </div>
  );
}

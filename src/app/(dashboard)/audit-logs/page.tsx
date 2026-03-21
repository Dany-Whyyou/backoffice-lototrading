'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ScrollText } from 'lucide-react';

interface AuditLog {
  id: number;
  admin_id: number | null;
  client_id: number | null;
  action: string;
  target_type: string | null;
  target_id: number | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  admin?: { id: number; name: string } | null;
  client?: { id: number; first_name: string; last_name: string } | null;
}

const actionColors: Record<string, string> = {
  'ticket_request.created': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'ticket_request.processing': 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  'ticket_request.validated': 'bg-green-50 text-green-700 ring-green-600/20',
  'ticket_request.cancelled': 'bg-red-50 text-red-700 ring-red-600/20',
  'client.registered': 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  'client.status_toggled': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'client.updated': 'bg-purple-50 text-purple-700 ring-purple-600/20',
  'user.created': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  'user.updated': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  'user.status_toggled': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'user.password_reset': 'bg-red-50 text-red-700 ring-red-600/20',
  'config.created': 'bg-gray-50 text-gray-700 ring-gray-600/20',
  'config.updated': 'bg-gray-50 text-gray-700 ring-gray-600/20',
  'config.deleted': 'bg-red-50 text-red-700 ring-red-600/20',
};

export default function AuditLogsPage() {
  const searchParams = useSearchParams();
  const adminId = searchParams.get('admin_id');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', adminId],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (adminId) params.admin_id = adminId;
      return api.get('/admin/audit-logs', { params }).then((res) => res.data.data as AuditLog[]);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <Header title={adminId ? "Journal d'activite (filtre)" : "Journal d'activite"} />
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-400">Chargement...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ScrollText className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">Aucune entree</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white ring-1 ring-gray-100 overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-50">
              {logs.map((log) => (
                <div key={log.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ' +
                      (actionColors[log.action] || 'bg-gray-50 text-gray-700 ring-gray-600/20')
                    }>
                      {log.action.replace(/\./g, ' > ')}
                    </span>
                    <div>
                      {log.admin && (
                        <p className="text-sm font-medium text-gray-900">{log.admin.name}</p>
                      )}
                      {log.client && (
                        <p className="text-sm font-medium text-gray-900">{log.client.first_name} {log.client.last_name}</p>
                      )}
                      {log.target_type && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {log.target_type.split('\\').pop()} #{log.target_id}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{formatDate(log.created_at)}</p>
                    {log.ip_address && <p className="text-xs text-gray-300 mt-0.5">{log.ip_address}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

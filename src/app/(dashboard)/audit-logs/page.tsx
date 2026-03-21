'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

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

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const adminId = searchParams.get('admin_id');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (adminId) params.admin_id = adminId;
    api.get('/admin/audit-logs', { params }).then((res) => {
      setLogs(res.data.data);
      setLoading(false);
    });
  }, [adminId]);

  const actionColors: Record<string, string> = {
    'ticket_request.created': 'bg-blue-100 text-blue-700',
    'ticket_request.processing': 'bg-yellow-100 text-yellow-700',
    'ticket_request.validated': 'bg-green-100 text-green-700',
    'ticket_request.cancelled': 'bg-red-100 text-red-700',
    'client.registered': 'bg-cyan-100 text-cyan-700',
    'client.status_toggled': 'bg-orange-100 text-orange-700',
    'client.updated': 'bg-purple-100 text-purple-700',
    'user.created': 'bg-indigo-100 text-indigo-700',
    'user.updated': 'bg-indigo-100 text-indigo-700',
    'user.status_toggled': 'bg-orange-100 text-orange-700',
    'user.password_reset': 'bg-red-100 text-red-700',
    'config.created': 'bg-gray-100 text-gray-700',
    'config.updated': 'bg-gray-100 text-gray-700',
    'config.deleted': 'bg-red-100 text-red-700',
  };

  return (
    <>
      <Header title={adminId ? 'Journal d\'activité (filtré)' : 'Journal d\'activité'} />
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {log.action.replace(/\./g, ' › ')}
                    </span>
                    <div>
                      {log.admin && (
                        <p className="text-sm text-gray-900">{log.admin.name}</p>
                      )}
                      {log.client && (
                        <p className="text-sm text-gray-900">{log.client.first_name} {log.client.last_name}</p>
                      )}
                      {log.target_type && (
                        <p className="text-xs text-gray-400">
                          {log.target_type.split('\\').pop()} #{log.target_id}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{formatDate(log.created_at)}</p>
                    {log.ip_address && <p className="text-xs text-gray-300">{log.ip_address}</p>}
                  </div>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-sm text-gray-400">Aucune entrée</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

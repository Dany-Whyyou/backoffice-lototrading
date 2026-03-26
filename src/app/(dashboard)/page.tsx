'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/ui/StatusBadge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Ticket, Users, CheckCircle, Clock, TrendingUp, AlertCircle,
  ChevronRight, ShieldCheck, CreditCard, Copy, Target, Trophy,
} from 'lucide-react';
import type { TicketRequest } from '@/types/ticket';

function StatCard({ label, value, icon: Icon, color, bg, ring }: {
  label: string; value: number | string; icon: React.ElementType;
  color: string; bg: string; ring: string;
}) {
  return (
    <div className={`rounded-xl ${bg} p-5 ring-1 ${ring} hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`rounded-xl bg-white/50 p-3`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// =================== ADMIN DASHBOARD ===================
function AdminDashboard({ data }: { data: Record<string, unknown> }) {
  const router = useRouter();
  const tickets = (data.recent_tickets ?? []) as TicketRequest[];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="En attente" value={data.pending_tickets as number} icon={Clock} color="text-yellow-600" bg="bg-yellow-50" ring="ring-yellow-200" />
        <StatCard label="En traitement" value={data.processing_tickets as number} icon={AlertCircle} color="text-blue-600" bg="bg-blue-50" ring="ring-blue-200" />
        <StatCard label="Valides aujourd'hui" value={data.validated_today as number} icon={CheckCircle} color="text-green-600" bg="bg-green-50" ring="ring-green-200" />
        <StatCard label="Total valides" value={data.total_validated as number} icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-50" ring="ring-indigo-200" />
        <StatCard label="Clients actifs" value={data.active_clients as number} icon={Users} color="text-cyan-600" bg="bg-cyan-50" ring="ring-cyan-200" />
        <StatCard label="KYC en attente" value={data.pending_kyc as number ?? 0} icon={ShieldCheck} color="text-purple-600" bg="bg-purple-50" ring="ring-purple-200" />
        <StatCard label="Revenu total" value={`${Number(data.total_revenue ?? 0).toLocaleString('fr-FR')} FCFA`} icon={CreditCard} color="text-green-700" bg="bg-green-50" ring="ring-green-200" />
        <StatCard label="Revenu aujourd'hui" value={`${Number(data.today_revenue ?? 0).toLocaleString('fr-FR')} FCFA`} icon={TrendingUp} color="text-blue-700" bg="bg-blue-50" ring="ring-blue-200" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 ring-1 ring-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nouveaux clients aujourd&apos;hui</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{data.new_clients_today as number}</p>
        </div>
        <div className="rounded-xl bg-white p-5 ring-1 ring-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Annules aujourd&apos;hui</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{data.cancelled_today as number}</p>
        </div>
        <div className="rounded-xl bg-white p-5 ring-1 ring-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total clients</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{data.total_clients as number}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white ring-1 ring-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Derniers tickets</h3>
          <button onClick={() => router.push('/tickets/pending')} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
            Voir tout <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {tickets.map((ticket) => (
            <div key={ticket.id} onClick={() => router.push(`/tickets/${ticket.id}`)}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50/80 border-l-2 border-l-transparent hover:border-l-blue-500">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{ticket.client ? `${ticket.client.first_name} ${ticket.client.last_name}` : '-'}</p>
                  <p className="text-xs text-gray-400">{ticket.lottery?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={ticket.status} />
                <span className="text-xs text-gray-400">{formatDate(ticket.created_at)}</span>
              </div>
            </div>
          ))}
          {tickets.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">Aucun ticket recent</div>}
        </div>
      </div>
    </div>
  );
}

// =================== REFERENT DASHBOARD ===================
function ReferentDashboard({ data }: { data: Record<string, unknown> }) {
  const router = useRouter();
  const tickets = (data.assigned_tickets ?? []) as TicketRequest[];
  const remaining = data.remaining_quota as number;
  const maxPerHour = data.max_per_hour as number;

  return (
    <div className="p-6 space-y-6">
      {/* Quota bar */}
      <div className="rounded-xl bg-white p-5 ring-1 ring-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-900">Quota horaire</p>
          <p className="text-sm text-gray-500">{data.validated_last_hour as number} / {maxPerHour}</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${remaining <= 3 ? 'bg-red-500' : remaining <= 10 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, ((data.validated_last_hour as number) / maxPerHour) * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">{remaining} validation(s) restante(s) cette heure</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tickets assignes" value={data.assigned_pending as number} icon={Clock} color="text-yellow-600" bg="bg-yellow-50" ring="ring-yellow-200" />
        <StatCard label="En cours" value={data.my_processing as number} icon={AlertCircle} color="text-blue-600" bg="bg-blue-50" ring="ring-blue-200" />
        <StatCard label="Valides aujourd'hui" value={data.my_validated_today as number} icon={CheckCircle} color="text-green-600" bg="bg-green-50" ring="ring-green-200" />
        <StatCard label="Total valides" value={data.my_total_validated as number} icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-50" ring="ring-indigo-200" />
      </div>

      {/* Assigned tickets */}
      <div className="rounded-xl bg-white ring-1 ring-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Mes tickets a traiter</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {tickets.map((ticket) => (
            <div key={ticket.id} onClick={() => router.push(`/tickets/${ticket.id}`)}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50/80 border-l-2 border-l-transparent hover:border-l-yellow-500">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{ticket.client ? `${ticket.client.first_name} ${ticket.client.last_name}` : '-'}</p>
                  <p className="text-xs text-gray-400">{ticket.lottery?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={ticket.status} />
                <span className="text-xs text-gray-400">{formatDate(ticket.created_at)}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            </div>
          ))}
          {tickets.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">Aucun ticket a traiter pour le moment</div>}
        </div>
      </div>
    </div>
  );
}

// =================== COMMERCIAL DASHBOARD ===================
function CommercialDashboard({ data }: { data: Record<string, unknown> }) {
  const referralCode = data.referral_code as string;
  const earnings = data.earnings as { tier_earnings: number; ticket_earnings: number; total: number };
  const progress = data.progress as { current_tier: number; next_tier_at: number; progress_to_next: number; remaining: number };
  const tierConfig = data.tier_config as { users_per_tier: number; bonus_per_tier: number; per_ticket_bonus: number };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Referral code */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <p className="text-sm font-medium text-blue-200">Votre code de parrainage</p>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-3xl font-bold tracking-wider font-mono">{referralCode || 'Non attribue'}</p>
          {referralCode && (
            <button onClick={copyCode} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <Copy className="h-5 w-5" />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-blue-200">Partagez ce code avec vos prospects pour les inscrire</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clients comptes" value={data.total_clients as number} icon={Users} color="text-blue-600" bg="bg-blue-50" ring="ring-blue-200" />
        <StatCard label="Clients actifs" value={data.active_clients as number} icon={CheckCircle} color="text-green-600" bg="bg-green-50" ring="ring-green-200" />
        <StatCard label="Nouveaux ce mois" value={data.new_clients_month as number} icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-50" ring="ring-indigo-200" />
        <StatCard label="Tickets joues" value={data.total_tickets_played as number} icon={Ticket} color="text-purple-600" bg="bg-purple-50" ring="ring-purple-200" />
      </div>

      {/* Tier milestones */}
      <div className="rounded-xl bg-white p-5 ring-1 ring-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <Target className="h-5 w-5 text-indigo-600" />
          <p className="text-sm font-semibold text-gray-900">Vos paliers</p>
          <span className="ml-auto text-xs text-gray-400">{data.total_clients as number} client(s) au total</span>
        </div>

        {/* Visual milestones */}
        <div className="space-y-3">
          {Array.from({ length: Math.max(5, progress.current_tier + 3) }, (_, i) => {
            const tierNum = i + 1;
            const target = tierNum * tierConfig.users_per_tier;
            const totalClients = data.total_clients as number;
            const isCompleted = totalClients >= target;
            const isCurrent = !isCompleted && totalClients >= (tierNum - 1) * tierConfig.users_per_tier;
            const progressPct = isCurrent
              ? Math.round(((totalClients % tierConfig.users_per_tier) / tierConfig.users_per_tier) * 100)
              : isCompleted ? 100 : 0;

            return (
              <div key={tierNum} className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                isCompleted ? 'bg-green-50 ring-1 ring-green-200' :
                isCurrent ? 'bg-indigo-50 ring-1 ring-indigo-200' :
                'bg-gray-50'
              }`}>
                {/* Icon */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-indigo-500 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">{tierNum}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${
                      isCompleted ? 'text-green-700' :
                      isCurrent ? 'text-indigo-700' :
                      'text-gray-400'
                    }`}>
                      Palier {tierNum} — {target} clients
                    </p>
                    <span className={`text-sm font-bold ${
                      isCompleted ? 'text-green-600' :
                      isCurrent ? 'text-indigo-600' :
                      'text-gray-300'
                    }`}>
                      {tierConfig.bonus_per_tier.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  {isCurrent && (
                    <div className="mt-1.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-indigo-500">{progressPct}%</span>
                        <span className="text-[10px] text-indigo-500">
                          encore {target - totalClients} client(s)
                        </span>
                      </div>
                      <div className="w-full bg-indigo-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                  )}

                  {isCompleted && (
                    <p className="text-[10px] text-green-500 mt-0.5">Palier atteint !</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Earnings */}
      <div className="rounded-xl bg-white p-5 ring-1 ring-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <p className="text-sm font-semibold text-gray-900">Vos gains</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Paliers</p>
            <p className="text-xl font-bold text-gray-900">{earnings.tier_earnings.toLocaleString('fr-FR')}</p>
            <p className="text-[10px] text-gray-400">FCFA</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Tickets</p>
            <p className="text-xl font-bold text-gray-900">{earnings.ticket_earnings.toLocaleString('fr-FR')}</p>
            <p className="text-[10px] text-gray-400">FCFA</p>
          </div>
          <div className="text-center rounded-lg bg-green-50 py-2">
            <p className="text-xs text-green-600 font-medium">Total</p>
            <p className="text-xl font-bold text-green-700">{earnings.total.toLocaleString('fr-FR')}</p>
            <p className="text-[10px] text-green-500">FCFA</p>
          </div>
        </div>
      </div>

      {/* Config info */}
      <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
        <p className="text-xs text-gray-500">
          <strong>Regles :</strong> {tierConfig.bonus_per_tier.toLocaleString('fr-FR')} FCFA tous les {tierConfig.users_per_tier} clients inscrits
          + {tierConfig.per_ticket_bonus} FCFA par ticket joue par vos clients
        </p>
      </div>
    </div>
  );
}

// =================== MAIN PAGE ===================
export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/admin/dashboard').then((res) => res.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  if (isLoading || !data) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-400">Chargement du dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  const dashboardType = data.dashboard_type as string;

  return (
    <>
      <Header title={
        dashboardType === 'referent' ? 'Mon espace referent' :
        dashboardType === 'commercial' ? 'Mon espace commercial' :
        'Dashboard'
      } />
      {dashboardType === 'referent' && <ReferentDashboard data={data} />}
      {dashboardType === 'commercial' && <CommercialDashboard data={data} />}
      {dashboardType === 'admin' && <AdminDashboard data={data} />}
    </>
  );
}

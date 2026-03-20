import type { TicketStatus } from '@/types/ticket';

export const STATUS_LABELS: Record<TicketStatus, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  processing: 'En cours',
  validated: 'Validé',
  cancelled: 'Annulé',
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  validated: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

import { STATUS_LABELS, STATUS_COLORS } from '@/constants/ticketStatus';
import type { TicketStatus } from '@/types/ticket';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

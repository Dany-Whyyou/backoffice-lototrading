import type { Client } from './client';
import type { Lottery } from './lottery';
import type { User } from './user';

export type TicketStatus = 'draft' | 'pending' | 'processing' | 'validated' | 'cancelled';

export interface TicketSelection {
  id: number;
  ticket_request_id: number;
  main_numbers: number[];
  bonus_numbers: number[] | null;
}

export interface ValidatedTicket {
  id: number;
  ticket_request_id: number;
  operator_id: number;
  official_ticket_number: string;
  ticket_image_path: string | null;
  validated_at: string;
  notes: string | null;
  operator?: User;
}

export interface TicketRequest {
  id: number;
  client_id: number;
  lottery_id: number;
  status: TicketStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  lottery?: Lottery;
  selections?: TicketSelection[];
  validated_ticket?: ValidatedTicket | null;
}

import type { TicketRequest } from './ticket';

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  country_code: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  ticket_requests_count?: number;
  ticket_requests?: TicketRequest[];
  created_at: string;
}

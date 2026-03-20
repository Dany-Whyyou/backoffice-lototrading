export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  ticket_requests_count?: number;
  created_at: string;
}

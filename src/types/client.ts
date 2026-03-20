export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  country_code: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  ticket_requests_count?: number;
  created_at: string;
}

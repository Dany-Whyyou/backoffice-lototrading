import type { TicketRequest } from './ticket';

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  country_code: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  kyc_status: 'pending_kyc' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  kyc_document_type?: string | null;
  kyc_document_path?: string | null;
  kyc_selfie_path?: string | null;
  kyc_rejection_reason?: string | null;
  kyc_reviewed_at?: string | null;
  kyc_reviewer?: { id: number; name: string } | null;
  ticket_requests_count?: number;
  ticket_requests?: TicketRequest[];
  created_at: string;
}

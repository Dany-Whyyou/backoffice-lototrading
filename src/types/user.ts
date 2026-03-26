export type Role = 'super_admin' | 'admin' | 'supervisor' | 'referent' | 'commercial';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_by: number | null;
  kyc_status?: string | null;
  kyc_document_path?: string | null;
  kyc_selfie_path?: string | null;
  referral_code?: string | null;
  max_tickets_per_hour?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: Role;
}

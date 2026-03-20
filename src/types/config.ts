export interface AppConfig {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'url' | 'phone' | 'email' | 'json';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface LotteryRule {
  id: number;
  lottery_id: number;
  main_numbers_count: number;
  main_numbers_min: number;
  main_numbers_max: number;
  bonus_numbers_count: number | null;
  bonus_numbers_min: number | null;
  bonus_numbers_max: number | null;
  price: string | null;
  currency: string;
  draw_days: number[] | null;
  cutoff_hour: number | null;
}

export interface Lottery {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  rule: LotteryRule | null;
  created_at: string;
}

export interface CreateLotteryPayload {
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  rules: Omit<LotteryRule, 'id' | 'lottery_id'>;
}

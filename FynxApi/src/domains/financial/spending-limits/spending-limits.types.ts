export interface SpendingLimit {
  id: string;
  category: string;
  limitAmount: number;
  currentSpent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'exceeded' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpendingLimitRequest {
  category: string;
  limitAmount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
}

export interface UpdateSpendingLimitRequest {
  category?: string;
  limitAmount?: number;
  period?: 'monthly' | 'weekly' | 'yearly';
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'exceeded' | 'paused';
}

export interface UpdateSpendingLimitProgressRequest {
  amount: number;
}
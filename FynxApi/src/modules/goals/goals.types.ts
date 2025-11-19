export interface SpendingGoal {
  id: string;
  title: string;
  goalType?: 'spending' | 'saving';
  category: string;
  targetAmount: number;
  currentAmount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'exceeded' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  goalId: string;
  progressPercentage: number;
  remainingAmount: number;
  daysRemaining: number;
  isOnTrack: boolean;
  projectedCompletion: string;
}

export interface GoalsData {
  spendingGoals: SpendingGoal[];
  budgets: Budget[];
  goalProgress: GoalProgress[];
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalBudgetAllocated: number;
  totalBudgetSpent: number;
}

export interface CreateSpendingGoalRequest {
  title: string;
  category: string;
  goalType?: 'spending' | 'saving';
  targetAmount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
  description?: string;
  userId?: number;
}

export interface UpdateSpendingGoalRequest {
  title?: string;
  goalType?: 'spending' | 'saving';
  category?: string;
  targetAmount?: number;
  period?: 'monthly' | 'weekly' | 'yearly';
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'completed' | 'paused';
  description?: string;
}

export interface CreateBudgetRequest {
  category: string;
  allocatedAmount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
  userId?: number;
}

export interface UpdateBudgetRequest {
  category?: string;
  allocatedAmount?: number;
  period?: 'monthly' | 'weekly' | 'yearly';
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'exceeded' | 'completed';
}
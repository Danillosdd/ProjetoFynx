import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

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
}

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await api.get<GoalsData>('/goals');
      return res;
    },
  });
}

export function useCreateSpendingGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSpendingGoalRequest) => api.post<SpendingGoal>('/goals/spending-goals', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; amount: number }) =>
      api.patch<SpendingGoal>(`/goals/spending-goals/${params.id}/progress`, { amount: params.amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useUpdateGoalProgressByTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; amount: number; transactionType: 'income' | 'expense' }) =>
      api.patch<SpendingGoal>(
        `/goals/spending-goals/${params.id}/progress-transaction`,
        { amount: params.amount, transactionType: params.transactionType }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
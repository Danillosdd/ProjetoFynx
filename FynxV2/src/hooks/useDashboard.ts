import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import type { DashboardData, Transaction } from '@/lib/types';

export function useDashboard() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/dashboard'),
    refetchOnWindowFocus: false,
    enabled: !!user?.id,
  });
  return query;
}

export function useTransactionHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.get<Transaction[]>('/dashboard/transactions'),
    refetchOnWindowFocus: false,
    enabled: !!user?.id,
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Transaction, 'id'>) => api.post<Transaction>('/dashboard/transactions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      api.delete<{ data: { id: number | string } }>(`/transactions/${id}?userId=1`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
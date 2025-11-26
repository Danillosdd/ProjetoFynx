// dashboard.types.ts

/**
 * @file Define as interfaces e tipos de dados para o módulo de dashboard.
 */

// Define a estrutura para uma única transação.
export interface Transaction {
  id: number;
  description: string;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'failed';
  amount: number;
  date: string;
  category: string;
}

// Define a estrutura para uma única transação recente a ser exibida no dashboard.
export interface RecentTransaction {
  id: number;
  description: string;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'failed';
  amount: number;
  date: string;
  category: string;
}

// Define a estrutura para os dados do overview do dashboard.
export interface OverviewData {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

// Define a estrutura para os dados de uma categoria de gastos.
export interface SpendingCategory {
  category: string;
  value: number;
}

// Define a estrutura para os dados de uma categoria de renda.
export interface IncomeCategory {
  category: string;
  value: number;
}

// Define a estrutura para os dados diários de renda e despesas.
export interface DailyData {
  day: string;
  date: string; // Data no formato YYYY-MM-DD
  income: number;
  expense: number;
}

// Define a estrutura para os dados mensais de renda e despesas.
export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

// Define a estrutura completa dos dados do dashboard.
export interface DashboardData {
  overview: OverviewData[];
  recentTransactions: RecentTransaction[];
  spendingByCategory: SpendingCategory[];
  incomeByCategory: IncomeCategory[];
  dailyPerformance: DailyData[];
  monthlyPerformance: MonthlyData[];
}
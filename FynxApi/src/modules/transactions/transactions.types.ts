export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  date: string;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'other';
  tags?: string[];
  location?: string;
  notes?: string;
  recurring?: {
    isRecurring: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
    nextDate?: string;
  };
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  spendingGoalId?: string;
  savingGoalId?: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  subcategories?: TransactionSubcategory[];
}

export interface TransactionSubcategory {
  id: string;
  name: string;
  categoryId: string;
  icon?: string;
}

export interface TransactionFilters {
  type?: 'income' | 'expense' | 'all';
  category?: string;
  subcategory?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  tags?: string[];
  search?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  averageTransaction: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
    net: number;
  }[];
}

export interface TransactionStats {
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  mostExpensiveTransaction: Transaction;
  mostFrequentCategory: string;
  paymentMethodBreakdown: {
    method: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
}

export interface CreateTransactionRequest {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  date: string;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'other';
  tags?: string[];
  location?: string;
  notes?: string;
  recurring?: {
    isRecurring: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
  };
  spendingGoalId?: string;
  savingGoalId?: string;
}

export interface UpdateTransactionRequest {
  type?: 'income' | 'expense';
  amount?: number;
  description?: string;
  category?: string;
  subcategory?: string;
  date?: string;
  paymentMethod?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'other';
  tags?: string[];
  location?: string;
  notes?: string;
  recurring?: {
    isRecurring: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
  };
}

export interface TransactionsData {
  transactions: Transaction[];
  summary: TransactionSummary;
  stats: TransactionStats;
  categories: TransactionCategory[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface BulkTransactionOperation {
  operation: 'delete' | 'update' | 'categorize';
  transactionIds: string[];
  updateData?: Partial<UpdateTransactionRequest>;
}

export interface TransactionImport {
  file: File;
  format: 'csv' | 'excel' | 'ofx';
  mapping: {
    date: string;
    description: string;
    amount: string;
    category?: string;
    type?: string;
  };
}
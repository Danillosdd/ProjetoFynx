// dashboard.service.ts

/**
 * @file Implementa a lógica de negócios para o módulo de dashboard.

 */

import type { Database } from 'sqlite3';
import { database } from '../../database/database.js';
import type {
  DashboardData,
  Transaction,
  OverviewData,
  SpendingCategory,
  IncomeCategory,
  DailyData,
  MonthlyData,
} from './dashboard.types.js';

// Database row interfaces
interface CategoryRow {
  category: string;
  total: number;
}

interface DailyRow {
  date: string;
  income: number;
  expense: number;
}

interface MonthlyRow {
  month_key: string;
  month_num: string | undefined;
  income: number;
  expense: number;
}

interface TransactionRow {
  id: number;
  description: string;
  type: string;
  amount: number;
  category: string;
  date: string;
}

/**
 * Formata um valor monetário para o padrão brasileiro (R$ 1.234,56).
 * @param {number} value - O valor a ser formatado.
 * @returns {string} O valor formatado.
 */
const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Formata um número para o padrão brasileiro (1.234,5).
 * @param {number} value - O valor a ser formatado.
 * @param {number} decimals - Número de casas decimais (padrão: 1).
 * @returns {string} O valor formatado.
 */
const formatNumber = (value: number, decimals: number = 1): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Calcula os dados do overview (Balanço Total, Renda Mensal, Despesas Mensais, Taxa de Poupança).
 * @param {number} userId - ID do usuário.
 * @returns {Promise<OverviewData[]>} Os dados calculados para o overview.
 */
const calculateOverview = async (userId: number): Promise<OverviewData[]> => {
  const db = database;
  
  // Calcula renda mensal do mês atual
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthlyIncomeResult = await db.get(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE user_id = ? AND type = 'income'
    AND strftime('%Y-%m', date) = ?
  `, [userId, currentMonth]);
  
  // Calcula despesas mensais do mês atual
  const monthlyExpensesResult = await db.get(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE user_id = ? AND type = 'expense'
    AND strftime('%Y-%m', date) = ?
  `, [userId, currentMonth]);
  
  // Calcula dados do mês anterior para comparação
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().slice(0, 7);
  
  const lastMonthIncomeResult = await db.get(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE user_id = ? AND type = 'income'
    AND strftime('%Y-%m', date) = ?
  `, [userId, lastMonthStr]);
  
  const lastMonthExpensesResult = await db.get(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE user_id = ? AND type = 'expense'
    AND strftime('%Y-%m', date) = ?
  `, [userId, lastMonthStr]);

  const monthlyIncome = monthlyIncomeResult?.total || 0;
  const monthlyExpenses = monthlyExpensesResult?.total || 0;
  const lastMonthIncome = lastMonthIncomeResult?.total || 0;
  const lastMonthExpenses = lastMonthExpensesResult?.total || 0;
  
  const totalBalance = monthlyIncome - monthlyExpenses;
  const lastMonthBalance = lastMonthIncome - lastMonthExpenses;
  const savingsRate = monthlyIncome > 0 ? (totalBalance / monthlyIncome) * 100 : 0;
  const lastMonthSavingsRate = lastMonthIncome > 0 ? (lastMonthBalance / lastMonthIncome) * 100 : 0;

  // Calcula mudanças percentuais
  const balanceChange = lastMonthBalance !== 0 ? ((totalBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100 : 0;
  const incomeChange = lastMonthIncome !== 0 ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
  const expensesChange = lastMonthExpenses !== 0 ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
  const savingsChange = savingsRate - lastMonthSavingsRate;

  return [
    { 
      title: "Balanço Mensal", 
      value: `R$ ${formatCurrency(totalBalance)}`, 
      change: `${balanceChange >= 0 ? '+' : ''}${formatNumber(balanceChange)}% vs mês passado`, 
      trend: balanceChange >= 0 ? 'up' : 'down' 
    },
    { 
      title: "Receita Total", 
      value: `R$ ${formatCurrency(monthlyIncome)}`, 
      change: `${incomeChange >= 0 ? '+' : ''}${formatNumber(incomeChange)}% vs mês passado`, 
      trend: incomeChange >= 0 ? 'up' : 'down' 
    },
    { 
      title: "Despesa Total", 
      value: `R$ ${formatCurrency(monthlyExpenses)}`, 
      change: `${expensesChange >= 0 ? '+' : ''}${formatNumber(expensesChange)}% vs mês passado`, 
      trend: expensesChange <= 0 ? 'up' : 'down' // Menos despesas é melhor
    },
    { 
      title: "Taxa de Poupança", 
      value: `${formatNumber(savingsRate)}%`, 
      change: `${savingsChange >= 0 ? '+' : ''}${formatNumber(savingsChange)}% vs mês passado`, 
      trend: savingsChange >= 0 ? 'up' : 'down' 
    },
  ];
};

/**
 * Agrupa as transações por categoria.
 * @param {number} userId - ID do usuário.
 * @returns {Promise<{ spendingByCategory: SpendingCategory[], incomeByCategory: IncomeCategory[] }>} As transações agrupadas.
 */
const getCategoryData = async (userId: number): Promise<{ spendingByCategory: SpendingCategory[], incomeByCategory: IncomeCategory[] }> => {
  const db = database;
  
  // Busca gastos por categoria do mês atual
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const spendingResults = await db.all(`
    SELECT category, SUM(amount) as total
    FROM transactions 
    WHERE user_id = ? AND type = 'expense'
    AND strftime('%Y-%m', date) = ?
    GROUP BY category
    ORDER BY total DESC
  `, [userId, currentMonth]);
  
  // Busca receitas por categoria do mês atual
  const incomeResults = await db.all(`
    SELECT category, SUM(amount) as total
    FROM transactions 
    WHERE user_id = ? AND type = 'income'
    AND strftime('%Y-%m', date) = ?
    GROUP BY category
    ORDER BY total DESC
  `, [userId, currentMonth]);

  const spendingByCategory: SpendingCategory[] = spendingResults.map((row: CategoryRow) => ({
    category: row.category,
    value: row.total
  }));
  
  const incomeByCategory: IncomeCategory[] = incomeResults.map((row: CategoryRow) => ({
    category: row.category,
    value: row.total
  }));

  return { spendingByCategory, incomeByCategory };
};

/**
 * Gera dados diários e mensais reais para os gráficos.
 * @param {number} userId - ID do usuário.
 * @returns {Promise<{ dailyPerformance: DailyData[], monthlyPerformance: MonthlyData[] }>} Os dados gerados.
 */
const getPerformanceData = async (userId: number): Promise<{ dailyPerformance: DailyData[], monthlyPerformance: MonthlyData[] }> => {
  const db = database;
  
  // Busca dados diários dos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
  
  const dailyResults = await db.all(`
    SELECT 
      date,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
    FROM transactions 
    WHERE user_id = ? AND date >= ?
    GROUP BY date
    ORDER BY date ASC
  `, [userId, thirtyDaysAgoStr]);
  
  // Preenche dias sem transações com valores zero
  const dailyPerformance: DailyData[] = [];
  for (let i = 0; i < 30; i++) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - (29 - i));
    const dateStr = currentDate.toISOString().split('T')[0] || '';
    
    const dayData = dailyResults.find(row => row.date === dateStr);
    dailyPerformance.push({
      day: `${currentDate.getDate()}`,
      date: dateStr,
      income: dayData?.income || 0,
      expense: dayData?.expense || 0,
    });
  }
  
  // Busca dados mensais dos últimos 3 meses
  const monthlyResults = await db.all(`
    SELECT 
      strftime('%Y-%m', date) as month_key,
      strftime('%m', date) as month_num,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
    FROM transactions 
    WHERE user_id = ? AND date >= date('now', '-3 months')
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month_key ASC
  `, [userId]);
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const monthlyPerformance: MonthlyData[] = monthlyResults.map((row: MonthlyRow) => ({
    month: row.month_num ? monthNames[parseInt(row.month_num) - 1] || 'N/A' : 'N/A',
    income: row.income,
    expense: row.expense
  }));

  return { dailyPerformance, monthlyPerformance };
};

/**
 * Busca transações recentes do usuário.
 * @param {number} userId - ID do usuário.
 * @param {number} limit - Número de transações a retornar.
 * @returns {Promise<Transaction[]>} As transações recentes.
 */
const getRecentTransactions = async (userId: number, limit: number = 6): Promise<Transaction[]> => {
  const db = database;
  
  const results = await db.all(`
    SELECT id, description, type, amount, date, category
    FROM transactions 
    WHERE user_id = ?
    ORDER BY date DESC, id DESC
    LIMIT ?
  `, [userId, limit]);
  
  return results.map((row: TransactionRow) => ({
    id: row.id,
    description: row.description,
    type: row.type as 'income' | 'expense',
    status: 'completed' as 'completed' | 'pending',
    amount: row.amount,
    date: row.date,
    category: row.category
  }));
};

/**
 * Busca todos os dados do dashboard.
 * @param {number} userId - ID do usuário.
 * @returns {Promise<DashboardData>} Os dados completos do dashboard.
 */
export const getDashboardData = async (userId: number): Promise<DashboardData> => {
  const overview = await calculateOverview(userId);
  const { spendingByCategory, incomeByCategory } = await getCategoryData(userId);
  const { dailyPerformance, monthlyPerformance } = await getPerformanceData(userId);
  const recentTransactions = await getRecentTransactions(userId);
  
  return {
    overview,
    recentTransactions,
    spendingByCategory,
    incomeByCategory,
    dailyPerformance,
    monthlyPerformance,
  };
};

/**
 * Adiciona uma nova transação.
 * @param {number} userId - ID do usuário.
 * @param {Omit<Transaction, 'id'>} transactionData - Os dados da nova transação.
 * @returns {Promise<Transaction>} A transação criada.
 */
export const addTransaction = async (userId: number, transactionData: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const db = database;
  
  const result = await db.run(`
    INSERT INTO transactions (user_id, description, type, amount, date, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [userId, transactionData.description, transactionData.type, 
      transactionData.amount, transactionData.date, transactionData.category]);
  
  const newTransaction: Transaction = {
    id: result.lastID!,
    ...transactionData,
  };
  
  return newTransaction;
};

/**
 * Retorna o histórico de transações do usuário.
 * @param {number} userId - ID do usuário.
 * @returns {Promise<Transaction[]>} O histórico de transações.
 */
export const getTransactionHistory = async (userId: number): Promise<Transaction[]> => {
  const db = database;
  
  const results = await db.all(`
    SELECT id, description, type, amount, date, category
    FROM transactions 
    WHERE user_id = ?
    ORDER BY date DESC, id DESC
  `, [userId]);
  
  return results.map((row: TransactionRow) => ({
    id: row.id,
    description: row.description,
    type: row.type as 'income' | 'expense',
    status: 'completed' as 'completed' | 'pending',
    amount: row.amount,
    date: row.date,
    category: row.category
  }));
};
import type {
  Transaction,
  TransactionCategory,
  TransactionFilters,
  TransactionSummary,
  TransactionStats,
  TransactionsData,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  BulkTransactionOperation
} from './transactions.types.js';
import { database } from '../../database/database.js';
import { GoalsService } from '../goals/goals.service.js';

export class TransactionsService {
  // Get all transactions with filters and pagination
  static async getTransactions(
    userId: number = 1,
    filters?: TransactionFilters,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<TransactionsData> {
    try {
      let sql = 'SELECT * FROM transactions WHERE user_id = ?';
      let params: any[] = [userId];

      // Apply filters
      if (filters) {
        if (filters.type && filters.type !== 'all') {
          sql += ' AND type = ?';
          params.push(filters.type);
        }
        if (filters.category) {
          sql += ' AND category = ?';
          params.push(filters.category);
        }
        if (filters.dateFrom) {
          sql += ' AND date >= ?';
          params.push(filters.dateFrom);
        }
        if (filters.dateTo) {
          sql += ' AND date <= ?';
          params.push(filters.dateTo);
        }
        if (filters.amountMin) {
          sql += ' AND amount >= ?';
          params.push(filters.amountMin);
        }
        if (filters.amountMax) {
          sql += ' AND amount <= ?';
          params.push(filters.amountMax);
        }
        if (filters.search) {
          sql += ' AND (description LIKE ? OR category LIKE ? OR notes LIKE ?)';
          const searchTerm = `%${filters.search}%`;
          params.push(searchTerm, searchTerm, searchTerm);
        }
      }

      // Count total records for pagination
      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
      const countResult = await database.get(countSql, params);
      const totalCount = countResult.count;

      // Add sorting and pagination
      const validSortFields = ['date', 'amount', 'description', 'category', 'type', 'created_at'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
      sql += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}, created_at DESC`;
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);

      const transactions = await database.all(sql, params);

      // Convert database results to Transaction objects
      const formattedTransactions: Transaction[] = transactions.map(this.formatTransactionFromDB);

      // Get all transactions for summary and stats (without pagination)
      const allTransactionsSql = 'SELECT * FROM transactions WHERE user_id = ?';
      const allTransactions = await database.all(allTransactionsSql, [userId]);
      const allFormattedTransactions = allTransactions.map(this.formatTransactionFromDB);

      const summary = await this.calculateSummary(allFormattedTransactions);
      const stats = await this.calculateStats(allFormattedTransactions);
      const categories = await this.getCategories();

      const totalPages = Math.ceil(totalCount / limit);

      return {
        transactions: formattedTransactions,
        summary,
        stats,
        categories,
        totalCount,
        currentPage: page,
        totalPages
      };
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw new Error('Erro ao buscar transações');
    }
  }

  // Get transaction by ID
  static async getTransactionById(id: string, userId: number = 1): Promise<Transaction | null> {
    try {
      const transaction = await database.get(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      return transaction ? this.formatTransactionFromDB(transaction) : null;
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      throw new Error('Erro ao buscar transação');
    }
  }

  // Create new transaction
  static async createTransaction(data: CreateTransactionRequest, userId: number = 1): Promise<Transaction> {
    // Make the insert + optional goal update atomic using a DB transaction
    try {
      await database.run('BEGIN TRANSACTION');

      const result = await database.run(
        `INSERT INTO transactions (
          user_id, amount, description, category, date, type, notes, spending_goal_id, saving_goal_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          data.amount,
          data.description,
          data.category,
          data.date,
          data.type,
          data.notes || null,
          data.spendingGoalId ? parseInt(data.spendingGoalId) : null,
          data.savingGoalId ? parseInt(data.savingGoalId) : null
        ]
      );

      const newTransaction = await database.get(
        'SELECT * FROM transactions WHERE id = ?',
        [result.lastID]
      );

      if (!newTransaction) {
        await database.run('ROLLBACK');
        throw new Error('Erro ao criar transação');
      }

      const formatted = this.formatTransactionFromDB(newTransaction);

      // If the transaction is linked to a spending goal, update goal progress
      if (newTransaction.spending_goal_id) {
        await GoalsService.updateGoalProgressByTransaction(newTransaction.spending_goal_id.toString(), formatted.amount, formatted.type);
      }

      // If the transaction is linked to a saving goal, update goal progress
      if (newTransaction.saving_goal_id) {
        await GoalsService.updateGoalProgressByTransaction(newTransaction.saving_goal_id.toString(), formatted.amount, formatted.type);
      }

      await database.run('COMMIT');
      return formatted;
    } catch (error) {
      try {
        await database.run('ROLLBACK');
      } catch (rbErr) {
        console.error('Erro durante ROLLBACK:', rbErr);
      }
      console.error('Erro ao criar transação (atomic):', error);
      throw new Error('Erro ao criar transação');
    }
  }

  // Update transaction
  static async updateTransaction(id: string, data: UpdateTransactionRequest, userId: number = 1): Promise<Transaction | null> {
    try {
      // Check if transaction exists
      const existingTransaction = await database.get(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!existingTransaction) {
        return null;
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.amount !== undefined) {
        updateFields.push('amount = ?');
        updateValues.push(data.amount);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }
      if (data.category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(data.category);
      }
      if (data.date !== undefined) {
        updateFields.push('date = ?');
        updateValues.push(data.date);
      }
      if (data.type !== undefined) {
        updateFields.push('type = ?');
        updateValues.push(data.type);
      }
      if (data.notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(data.notes);
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id, userId);

      const sql = `UPDATE transactions SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;

      await database.run(sql, updateValues);

      // Return updated transaction
      const updatedTransaction = await database.get(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      return updatedTransaction ? this.formatTransactionFromDB(updatedTransaction) : null;
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw new Error('Erro ao atualizar transação');
    }
  }

  // Delete transaction
  static async deleteTransaction(id: string, userId: number = 1): Promise<boolean> {
    try {
      const result = await database.run(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      throw new Error('Erro ao deletar transação');
    }
  }

  // Bulk operations
  static async bulkOperation(operation: BulkTransactionOperation, userId: number = 1): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const id of operation.transactionIds) {
      try {
        switch (operation.operation) {
          case 'delete':
            const deleteResult = await this.deleteTransaction(id, userId);
            if (deleteResult) success++;
            else failed++;
            break;

          case 'update':
            if (operation.updateData) {
              const updateResult = await this.updateTransaction(id, operation.updateData, userId);
              if (updateResult) success++;
              else failed++;
            } else {
              failed++;
            }
            break;

          case 'categorize':
            if (operation.updateData?.category) {
              const categorizeData: UpdateTransactionRequest = {
                category: operation.updateData.category
              };
              const categorizeResult = await this.updateTransaction(id, categorizeData, userId);
              if (categorizeResult) success++;
              else failed++;
            } else {
              failed++;
            }
            break;

          default:
            failed++;
        }
      } catch (error) {
        console.error(`Erro na operação bulk para transação ${id}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  // Get categories
  static async getCategories(): Promise<TransactionCategory[]> {
    try {
      const categories = await database.all('SELECT * FROM categories ORDER BY name');

      return categories.map(cat => ({
        id: cat.id.toString(),
        name: cat.name,
        type: cat.type as 'income' | 'expense',
        icon: cat.icon || '📊',
        color: cat.color || '#6B7280',
        subcategories: [] // Subcategorias podem ser implementadas posteriormente
      }));
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error('Erro ao buscar categorias');
    }
  }

  // Get transaction summary
  static async getTransactionsSummary(userId: number = 1): Promise<TransactionSummary> {
    try {
      const transactions = await database.all(
        'SELECT * FROM transactions WHERE user_id = ?',
        [userId]
      );

      const formattedTransactions = transactions.map(this.formatTransactionFromDB);
      return this.calculateSummary(formattedTransactions);
    } catch (error) {
      console.error('Erro ao calcular resumo:', error);
      throw new Error('Erro ao calcular resumo');
    }
  }

  // Get transaction stats
  static async getTransactionsStats(userId: number = 1): Promise<TransactionStats> {
    try {
      const transactions = await database.all(
        'SELECT * FROM transactions WHERE user_id = ?',
        [userId]
      );

      const formattedTransactions = transactions.map(this.formatTransactionFromDB);
      return this.calculateStats(formattedTransactions);
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      throw new Error('Erro ao calcular estatísticas');
    }
  }

  // Helper method to format database result to Transaction object
  private static formatTransactionFromDB(dbTransaction: any): Transaction {
    return {
      id: dbTransaction.id.toString(),
      userId: dbTransaction.user_id.toString(),
      type: dbTransaction.type,
      amount: parseFloat(dbTransaction.amount),
      description: dbTransaction.description,
      category: dbTransaction.category,
      date: dbTransaction.date,
      paymentMethod: 'credit_card', // Default value, can be added to DB later
      notes: dbTransaction.notes,
      spendingGoalId: dbTransaction.spending_goal_id ? dbTransaction.spending_goal_id.toString() : undefined,
      savingGoalId: dbTransaction.saving_goal_id ? dbTransaction.saving_goal_id.toString() : undefined,
      createdAt: dbTransaction.created_at,
      updatedAt: dbTransaction.updated_at
    };
  }

  // Calculate summary
  private static async calculateSummary(transactions: Transaction[]): Promise<TransactionSummary> {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netAmount = totalIncome - totalExpenses;
    const transactionCount = transactions.length;
    const averageTransaction = transactionCount > 0 ? (totalIncome + totalExpenses) / transactionCount : 0;

    // Category breakdown
    const categoryMap = new Map<string, { amount: number; count: number }>();
    transactions.forEach(t => {
      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      transactionCount: data.count
    }));

    // Monthly trend - simplified for now
    const monthlyTrend = [
      { month: '2025-01', income: totalIncome, expenses: totalExpenses, net: netAmount }
    ];

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      transactionCount,
      averageTransaction,
      categoryBreakdown,
      monthlyTrend
    };
  }

  // Calculate stats
  private static async calculateStats(transactions: Transaction[]): Promise<TransactionStats> {
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const dailyAverage = transactions.length > 0 ? totalAmount / 30 : 0;
    const weeklyAverage = dailyAverage * 7;
    const monthlyAverage = dailyAverage * 30;

    const mostExpensiveTransaction = transactions.reduce((max, t) =>
      t.amount > max.amount ? t : max, transactions[0] || {} as Transaction);

    // Most frequent category
    const categoryCount = new Map<string, number>();
    transactions.forEach(t => {
      categoryCount.set(t.category, (categoryCount.get(t.category) || 0) + 1);
    });
    const mostFrequentCategory = Array.from(categoryCount.entries())
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    // Payment method breakdown - simplified
    const paymentMethodBreakdown = [
      { method: 'credit_card', amount: totalAmount * 0.6, count: Math.floor(transactions.length * 0.6), percentage: 60 },
      { method: 'debit_card', amount: totalAmount * 0.3, count: Math.floor(transactions.length * 0.3), percentage: 30 },
      { method: 'cash', amount: totalAmount * 0.1, count: Math.floor(transactions.length * 0.1), percentage: 10 }
    ];

    return {
      dailyAverage,
      weeklyAverage,
      monthlyAverage,
      mostExpensiveTransaction,
      mostFrequentCategory,
      paymentMethodBreakdown
    };
  }
}
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
import { database } from '../../../infrastructure/database/database.js';
import { GoalsService } from '../goals/goals.service.js';
import { RankingService } from '../../gamification/ranking/ranking.service.js';

type SqlParam = string | number | null;

interface TransactionRow {
  id: number;
  user_id: number;
  type: string;
  amount: string;
  description: string;
  category: string;
  date: string;
  payment_method?: string;
  notes?: string;
  spending_goal_id?: number;
  saving_goal_id?: number;
  created_at: string;
  updated_at: string;
}

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
      let params: SqlParam[] = [userId];

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

      // Calculate totals (summary) using SQL aggregation
      const summarySql = sql.replace('SELECT *', `
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpenses
      `);
      const summaryResult = await database.get(summarySql, params);

      // Add sorting and pagination
      const validSortFields = ['date', 'amount', 'description', 'category', 'type', 'created_at'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
      let paginatedSql = sql + ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}, created_at DESC`;
      paginatedSql += ' LIMIT ? OFFSET ?';
      const paginatedParams = [...params, limit, (page - 1) * limit];

      const transactions = await database.all(paginatedSql, paginatedParams);

      // Convert database results to Transaction objects
      const formattedTransactions: Transaction[] = transactions.map(this.formatTransactionFromDB);

      const totalIncome = summaryResult.totalIncome || 0;
      const totalExpenses = summaryResult.totalExpenses || 0;
      const netAmount = totalIncome - totalExpenses;

      const summary: TransactionSummary = {
        totalIncome,
        totalExpenses,
        netAmount,
        transactionCount: totalCount,
        averageTransaction: totalCount > 0 ? (totalIncome + totalExpenses) / totalCount : 0,
        categoryBreakdown: [],
        monthlyTrend: []
      };

      const stats = await this.getTransactionsStats(userId);
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
    return database.withTransaction(async () => {
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
        throw new Error('Erro ao criar transação');
      }

      const formatted = this.formatTransactionFromDB(newTransaction);

      // Award "Novato" badge on first transaction
      const txCount = await database.get('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?', [userId]);
      if (txCount.count === 1) {
        await RankingService.awardBadge(userId, 'badge_novice');
      }

      // Check for "Cofrinho Cheio" milestone (Total Savings > 1000)
      const financials = await database.get(`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as savings
        FROM transactions WHERE user_id = ?
      `, [userId]);
      if (financials.savings >= 1000) {
        await RankingService.awardBadge(userId, 'badge_saver');
      }

      // If the transaction is linked to a spending goal, update goal progress
      if (newTransaction.spending_goal_id) {
        await GoalsService.updateGoalProgressByTransaction(newTransaction.spending_goal_id.toString(), formatted.amount, formatted.type);
      }

      // If the transaction is linked to a saving goal, update goal progress
      if (newTransaction.saving_goal_id) {
        await GoalsService.updateGoalProgressByTransaction(newTransaction.saving_goal_id.toString(), formatted.amount, formatted.type);
      }

      // Calculate ranking asynchronously to not block response
      RankingService.calculateScore(userId).catch(err => {
        console.error('Error calculating ranking after transaction:', err);
      });

      return formatted;
    });
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
      const updateValues: SqlParam[] = [];

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
      const summaryResult = await database.get(`
        SELECT 
          COUNT(*) as count,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpenses
        FROM transactions WHERE user_id = ?
      `, [userId]);

      const totalIncome = summaryResult.totalIncome || 0;
      const totalExpenses = summaryResult.totalExpenses || 0;
      const count = summaryResult.count || 0;

      return {
        totalIncome,
        totalExpenses: totalExpenses,
        netAmount: totalIncome - totalExpenses,
        transactionCount: count,
        averageTransaction: count > 0 ? (totalIncome + totalExpenses) / count : 0,
        categoryBreakdown: [],
        monthlyTrend: []
      };
    } catch (error) {
      console.error('Erro ao calcular resumo:', error);
      throw new Error('Erro ao calcular resumo');
    }
  }

  // Get transaction stats
  static async getTransactionsStats(userId: number = 1): Promise<TransactionStats> {
    try {
      const statsResult = await database.get(`
        SELECT 
          AVG(amount) as dailyAverage,
          MAX(amount) as maxAmount
        FROM transactions WHERE user_id = ?
      `, [userId]);

      // Simple implementation for now, can be expanded for full stats
      return {
          dailyAverage: statsResult.dailyAverage || 0,
          weeklyAverage: (statsResult.dailyAverage || 0) * 7,
          monthlyAverage: (statsResult.dailyAverage || 0) * 30,
          mostExpensiveTransaction: { amount: statsResult.maxAmount || 0 } as any,
          mostFrequentCategory: '',
          paymentMethodBreakdown: []
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      throw new Error('Erro ao calcular estatísticas');
    }
  }

  private static formatTransactionFromDB(dbTransaction: TransactionRow): Transaction {
    const transaction: Transaction = {
      id: dbTransaction.id.toString(),
      userId: dbTransaction.user_id.toString(),
      type: dbTransaction.type as 'income' | 'expense',
      amount: parseFloat(dbTransaction.amount),
      description: dbTransaction.description,
      category: dbTransaction.category,
      date: dbTransaction.date,
      createdAt: dbTransaction.created_at,
      updatedAt: dbTransaction.updated_at
    };

    if (dbTransaction.payment_method) {
      transaction.paymentMethod = dbTransaction.payment_method as 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix' | 'other';
    }
    if (dbTransaction.notes) {
      transaction.notes = dbTransaction.notes;
    }
    if (dbTransaction.spending_goal_id) {
      transaction.spendingGoalId = dbTransaction.spending_goal_id.toString();
    }
    if (dbTransaction.saving_goal_id) {
      transaction.savingGoalId = dbTransaction.saving_goal_id.toString();
    }

    return transaction;
  }
}
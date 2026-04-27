import { ITransactionRepository } from '../../domains/financial/repositories/transaction.repository.js';
import { Transaction, TransactionFilters } from '../../domains/financial/transactions/transactions.types.js';
import { database } from '../database/database.js';

export class SQLiteTransactionRepository implements ITransactionRepository {
  async findById(id: string, userId: number): Promise<Transaction | null> {
    const row = await database.get(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return row ? this.mapToDomain(row) : null;
  }

  async findAll(userId: number, filters?: TransactionFilters, page: number = 1, limit: number = 10): Promise<{ transactions: Transaction[], total: number }> {
    let sql = 'SELECT * FROM transactions WHERE user_id = ?';
    let params: any[] = [userId];

    if (filters?.type && filters.type !== 'all') {
      sql += ' AND type = ?';
      params.push(filters.type);
    }

    const countResult = await database.get(sql.replace('SELECT *', 'SELECT COUNT(*) as count'), params);
    
    sql += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const rows = await database.all(sql, params);
    return {
      transactions: rows.map(this.mapToDomain),
      total: countResult.count
    };
  }

  async save(data: any): Promise<Transaction> {
    const result = await database.run(
      `INSERT INTO transactions (
        user_id, amount, description, category, date, type, notes, spending_goal_id, saving_goal_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId, data.amount, data.description, data.category,
        data.date, data.type, data.notes || null,
        data.spendingGoalId || null, data.savingGoalId || null
      ]
    );

    const newRow = await database.get('SELECT * FROM transactions WHERE id = ?', [result.lastID]);
    return this.mapToDomain(newRow);
  }

  async delete(id: string, userId: number): Promise<boolean> {
    const result = await database.run(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.changes > 0;
  }

  async getSummary(userId: number): Promise<any> {
    return database.get(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpenses
      FROM transactions WHERE user_id = ?
    `, [userId]);
  }

  private mapToDomain(row: any): Transaction {
    return {
      id: row.id.toString(),
      userId: row.user_id.toString(),
      type: row.type,
      amount: parseFloat(row.amount),
      description: row.description,
      category: row.category,
      date: row.date,
      paymentMethod: row.payment_method,
      notes: row.notes,
      spendingGoalId: row.spending_goal_id?.toString(),
      savingGoalId: row.saving_goal_id?.toString(),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
